"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  CalendarClock,
  Crown,
  Eye,
  Filter,
  Shield,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  getCompletedGames,
  type CompletedGame,
  type CompletedGameType,
} from "@/lib/gameResults";

type HistoryFilter = "all" | CompletedGameType;

function TeamIdentity({ team }: { team: CompletedGame["homeTeam"] }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 text-sm font-black text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`,
        }}
      >
        {team.logoUrl ? (
          <img
            src={team.logoUrl}
            alt={team.name}
            className="h-full w-full rounded-2xl object-cover"
          />
        ) : (
          team.abbreviation
        )}
      </div>

      <div className="min-w-0">
        <p className="break-words text-sm font-black uppercase leading-tight text-white">
          {team.city} {team.nickname}
        </p>
        <p className="text-xs font-semibold text-text-muted">
          OVR {team.overallRating}
        </p>
      </div>
    </div>
  );
}

function GameHistoryCard({ game }: { game: CompletedGame }) {
  const winner =
    game.winnerTeamId === game.homeTeam.id
      ? game.homeTeam
      : game.winnerTeamId === game.awayTeam.id
        ? game.awayTeam
        : null;

  return (
    <article className="min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl transition hover:border-gold/40">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="gold">
              <Trophy className="mr-1 h-3 w-3" />
              Final
            </Badge>

            <Badge variant="info">{game.matchType.toUpperCase()}</Badge>

            {game.crownsWon > 0 ? (
              <Badge variant="gold">
                <Crown className="mr-1 h-3 w-3" />
                {game.crownsWon} Crowns Won
              </Badge>
            ) : (
              <Badge variant="info">No Crown Reward</Badge>
            )}

            {game.wasSkipped ? <Badge variant="gold">Resolved</Badge> : null}
          </div>

          <h2 className="break-words text-2xl font-black uppercase text-white">
            {game.homeTeam.nickname} vs {game.awayTeam.nickname}
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            {new Date(game.date).toLocaleString()} · MVP {game.mvp.name}
          </p>
        </div>

        <Link href={`/box-score?game=${game.id}`}>
          <Button variant="gold" className="w-full gap-2 xl:w-auto">
            <Eye className="h-4 w-4" />
            Open Box Score
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_160px_1fr] xl:items-center">
        <TeamIdentity team={game.homeTeam} />

        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-gold">
            Final Score
          </p>
          <div className="mt-2 flex items-center justify-center gap-3 whitespace-nowrap">
            <span className="text-3xl font-black tabular-nums text-white">
              {game.homeScore}
            </span>
            <span className="text-xl font-black text-gold">-</span>
            <span className="text-3xl font-black tabular-nums text-white">
              {game.awayScore}
            </span>
          </div>
        </div>

        <TeamIdentity team={game.awayTeam} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center">
          <BarChart3 className="mx-auto mb-2 h-4 w-4 text-gold" />
          <p className="text-xs font-black uppercase text-text-muted">Yards</p>
          <p className="text-sm font-black text-white">
            {game.homeStats.totalYards + game.awayStats.totalYards}
          </p>
        </div>

        <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center">
          <Users className="mx-auto mb-2 h-4 w-4 text-electric" />
          <p className="text-xs font-black uppercase text-text-muted">Plays</p>
          <p className="text-sm font-black text-white">{game.totalPlays}</p>
        </div>

        <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center">
          <Crown className="mx-auto mb-2 h-4 w-4 text-gold" />
          <p className="text-xs font-black uppercase text-text-muted">Reward</p>
          <p className="text-sm font-black text-white">{game.reward} MVP</p>
        </div>

        <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center">
          <Shield className="mx-auto mb-2 h-4 w-4 text-success" />
          <p className="text-xs font-black uppercase text-text-muted">Winner</p>
          <p className="text-sm font-black text-white">
            {winner?.abbreviation ?? "DRAW"}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function GameHistoryPage() {
  const [mounted, setMounted] = useState(false);
  const [games, setGames] = useState<CompletedGame[]>([]);
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);

    const refresh = () => {
      setGames(getCompletedGames());
    };

    refresh();

    window.addEventListener("storage", refresh);
    window.addEventListener("gmdl-storage-change", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("gmdl-storage-change", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase();

    return games.filter((game) => {
      const matchesType = filter === "all" || game.matchType === filter;

      const text = [
        game.homeTeam.city,
        game.homeTeam.nickname,
        game.awayTeam.city,
        game.awayTeam.nickname,
        game.mvp.name,
        game.matchType,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || text.includes(query);

      return matchesType && matchesSearch;
    });
  }, [filter, games, search]);

  const totalCrowns = games.reduce((sum, game) => sum + game.crownsWon, 0);
  const paidGames = games.filter((game) => game.matchType === "paid").length;
  const aiGames = games.filter((game) => game.matchType === "ai").length;

  if (!mounted) {
    return (
      <AppShell>
        <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden">
          <div className="h-44 rounded-3xl border border-navy-border bg-navy-card" />
          <div className="h-80 rounded-3xl border border-navy-border bg-navy-card" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden pb-12">
        <section className="overflow-hidden rounded-3xl border border-navy-border bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.18),transparent_34%),linear-gradient(135deg,#0B1A2A,#101F33_55%,#16283A)] p-5 shadow-2xl md:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="gold">
                  <CalendarClock className="mr-1 h-3 w-3" />
                  Game Archive
                </Badge>

                <Badge variant="info">{games.length} Completed Games</Badge>

                <Badge variant="gold">
                  <Crown className="mr-1 h-3 w-3" />
                  {totalCrowns} Crowns
                </Badge>
              </div>

              <h1 className="break-words text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
                Game History
              </h1>

              <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-text-muted md:text-base">
                All completed simulations appear here. New games are placed at
                the top, while older sample history remains below for demo data.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:max-w-[420px]">
              <Link href="/challenge-hub">
                <Button variant="gold" className="w-full gap-2">
                  <Zap className="h-4 w-4" />
                  Play Again
                </Button>
              </Link>

              <Link href="/dashboard">
                <Button variant="secondary" className="w-full gap-2">
                  <Shield className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
            <Trophy className="mb-3 h-6 w-6 text-gold" />
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Total Games
            </p>
            <p className="mt-2 text-4xl font-black text-white">{games.length}</p>
          </div>

          <div className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
            <Crown className="mb-3 h-6 w-6 text-gold" />
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Crowns
            </p>
            <p className="mt-2 text-4xl font-black text-white">{totalCrowns}</p>
          </div>

          <div className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
            <Activity className="mb-3 h-6 w-6 text-electric" />
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Paid
            </p>
            <p className="mt-2 text-4xl font-black text-white">{paidGames}</p>
          </div>

          <div className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
            <Users className="mb-3 h-6 w-6 text-success" />
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              AI Games
            </p>
            <p className="mt-2 text-4xl font-black text-white">{aiGames}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_260px]">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted">
                Search Games
              </p>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search team, MVP, match type..."
                className="w-full rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-gold/50"
              />
            </div>

            <div className="min-w-0">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted">
                Filter Type
              </p>
              <div className="relative">
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as HistoryFilter)}
                  className="w-full appearance-none rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-gold/50"
                >
                  <option value="all">All Games</option>
                  <option value="paid">Paid Games</option>
                  <option value="free">Free Games</option>
                  <option value="ai">AI Games</option>
                  <option value="pvp">PvP Games</option>
                </select>

                <Filter className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <GameHistoryCard key={game.id} game={game} />
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-navy-border bg-navy-card p-10 text-center shadow-xl">
              <Trophy className="mx-auto h-10 w-10 text-text-muted" />
              <h2 className="mt-4 text-2xl font-black uppercase text-white">
                No games found
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                Try changing your search or filter.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}