"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Clock,
  Crown,
  Flag,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TeamHelmetVisual } from "@/components/team/TeamHelmetVisual";
import {
  getCompletedGameById,
  type CompletedGame,
  type CompletedGameStats,
} from "@/lib/gameResults";
import { cn } from "@/lib/utils";
import {
  getTeamCardSrc,
  getTeamDisplayName,
  getTeamInitials,
  teamVisualAssets,
  type VisualTeam,
} from "@/lib/teamVisuals";

function AssetImage({
  src,
  alt,
  className,
  fallbackClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-dashed border-gold/20 bg-navy-secondary text-xs font-black uppercase tracking-widest text-gold/70",
          fallbackClassName,
          className
        )}
      >
        —
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}

function TeamHelmet({
  team,
  size = "md",
}: {
  team?: VisualTeam;
  size?: "sm" | "md" | "lg" | "xl" | "card";
}) {
  const shellClass =
    size === "card"
      ? "h-48 w-64"
      : size === "xl"
        ? "h-32 w-44"
        : size === "lg"
          ? "h-24 w-32"
          : size === "sm"
            ? "h-12 w-16"
            : "h-16 w-20";

  const visualSize =
    size === "card"
      ? "card"
      : size === "xl"
        ? "xl"
        : size === "lg"
          ? "lg"
          : size === "sm"
            ? "sm"
            : "md";

  return (
    <div className={cn("relative shrink-0 overflow-visible", shellClass)}>
      <TeamHelmetVisual team={team} size={visualSize} />
    </div>
  );
}

function TeamBadge({ team }: { team: CompletedGame["homeTeam"] }) {
  return (
    <div className="relative flex min-w-0 flex-col items-center overflow-hidden rounded-3xl border border-navy-border bg-navy-card/70 p-5 text-center shadow-xl">
      <AssetImage
        src={getTeamCardSrc(team)}
        alt={`${getTeamDisplayName(team)} card background`}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-12"
        fallbackClassName="hidden"
      />

      <div className="pointer-events-none absolute bottom-[-34px] right-[-28px] opacity-10">
        <TeamHelmetVisual team={team} size="card" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,197,66,0.14),transparent_38%),linear-gradient(180deg,rgba(11,26,42,0.62),rgba(11,26,42,0.96))]" />

      <div className="relative">
        <div className="flex justify-center">
          <TeamHelmet team={team} size="xl" />
        </div>

        <div className="mt-4 flex justify-center">
          <Badge variant="gold">{getTeamInitials(team)}</Badge>
        </div>

        <h2 className="mt-3 w-full break-words text-2xl font-black uppercase leading-tight text-white">
          {getTeamDisplayName(team)}
        </h2>

        <p className="mt-1 text-sm font-semibold text-text-muted">
          OVR {team.overallRating} · OFF {team.offensiveRating ?? "--"} · DEF{" "}
          {team.defensiveRating ?? "--"}
        </p>
      </div>
    </div>
  );
}

function StatRow({
  label,
  home,
  away,
}: {
  label: string;
  home: string | number;
  away: string | number;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr_80px] items-center gap-3 rounded-2xl border border-navy-border bg-navy-secondary/60 px-4 py-3">
      <p className="text-lg font-black tabular-nums text-white">{home}</p>
      <p className="text-center text-xs font-black uppercase tracking-widest text-text-muted">
        {label}
      </p>
      <p className="text-right text-lg font-black tabular-nums text-white">
        {away}
      </p>
    </div>
  );
}

function statsRows(homeStats: CompletedGameStats, awayStats: CompletedGameStats) {
  return [
    ["Total Yards", homeStats.totalYards, awayStats.totalYards],
    ["Passing Yards", homeStats.passingYards, awayStats.passingYards],
    ["Rushing Yards", homeStats.rushingYards, awayStats.rushingYards],
    ["First Downs", homeStats.firstDowns, awayStats.firstDowns],
    [
      "Third Down",
      `${homeStats.thirdDownConversions}/${homeStats.thirdDownAttempts}`,
      `${awayStats.thirdDownConversions}/${awayStats.thirdDownAttempts}`,
    ],
    [
      "Fourth Down",
      `${homeStats.fourthDownConversions}/${homeStats.fourthDownAttempts}`,
      `${awayStats.fourthDownConversions}/${awayStats.fourthDownAttempts}`,
    ],
    [
      "Red Zone",
      `${homeStats.redZoneScores}/${homeStats.redZoneAttempts}`,
      `${awayStats.redZoneScores}/${awayStats.redZoneAttempts}`,
    ],
    ["Turnovers", homeStats.turnovers, awayStats.turnovers],
    ["Sacks Made", homeStats.sacksMade, awayStats.sacksMade],
    ["Penalties", homeStats.penalties, awayStats.penalties],
    ["Penalty Yards", homeStats.penaltyYards, awayStats.penaltyYards],
    ["Time of Possession", homeStats.timeOfPossession, awayStats.timeOfPossession],
  ];
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "gold",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  tone?: "gold" | "success" | "danger" | "electric";
}) {
  const toneClass =
    tone === "success"
      ? "text-success bg-success/10 border-success/20"
      : tone === "danger"
        ? "text-danger bg-danger/10 border-danger/20"
        : tone === "electric"
          ? "text-electric bg-electric/10 border-electric/20"
          : "text-gold bg-gold/10 border-gold/20";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
      <AssetImage
        src={teamVisualAssets.backgrounds.stadiumFlare}
        alt={`${label} glow`}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
        fallbackClassName="hidden"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-text-muted">
            {label}
          </p>
          <p className="mt-2 break-words text-3xl font-black text-white">
            {value}
          </p>
        </div>

        <div className={`rounded-2xl border p-3 ${toneClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function WinnerPanel({
  game,
  winner,
}: {
  game: CompletedGame;
  winner: CompletedGame["homeTeam"] | null;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.18),transparent_38%),#101F33] p-5 shadow-xl">
      <AssetImage
        src={winner ? getTeamCardSrc(winner) : teamVisualAssets.backgrounds.field}
        alt="Final score background"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-16"
        fallbackClassName="hidden"
      />

      {winner ? (
        <div className="pointer-events-none absolute bottom-[-44px] right-8 hidden opacity-16 xl:block">
          <TeamHelmetVisual team={winner} size="card" />
        </div>
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,26,42,0.92),rgba(11,26,42,0.74),rgba(11,26,42,0.92))]" />

      <div className="relative grid grid-cols-1 gap-5 xl:grid-cols-[1fr_240px_1fr] xl:items-center">
        <TeamBadge team={game.homeTeam} />

        <div className="rounded-3xl border border-gold/30 bg-gold/10 p-5 text-center shadow-lg shadow-gold/10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
            Final Score
          </p>

          <div className="mt-4 flex items-center justify-center gap-4 whitespace-nowrap">
            <span className="text-5xl font-black tabular-nums text-white md:text-6xl">
              {game.homeScore}
            </span>
            <span className="text-3xl font-black text-gold">-</span>
            <span className="text-5xl font-black tabular-nums text-white md:text-6xl">
              {game.awayScore}
            </span>
          </div>

          <p className="mt-4 break-words text-sm font-black uppercase text-white">
            {winner ? `${getTeamDisplayName(winner)} Win` : "Draw"}
          </p>
        </div>

        <TeamBadge team={game.awayTeam} />
      </div>
    </section>
  );
}

export default function BoxScorePage() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get("game");

  const [mounted, setMounted] = useState(false);
  const [game, setGame] = useState<CompletedGame | undefined>();

  useEffect(() => {
    setMounted(true);
    setGame(getCompletedGameById(gameId));
  }, [gameId]);

  const winner = useMemo(() => {
    if (!game?.winnerTeamId) return null;
    if (game.winnerTeamId === game.homeTeam.id) return game.homeTeam;
    if (game.winnerTeamId === game.awayTeam.id) return game.awayTeam;
    return null;
  }, [game]);

  if (!mounted || !game) {
    return (
      <AppShell>
        <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden">
          <div className="h-56 rounded-3xl border border-navy-border bg-navy-card" />
          <div className="h-96 rounded-3xl border border-navy-border bg-navy-card" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden pb-12">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-navy-border bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.18),transparent_34%),linear-gradient(135deg,#0B1A2A,#101F33_55%,#16283A)] p-5 shadow-2xl md:p-6"
        >
          <AssetImage
            src={winner ? getTeamCardSrc(winner) : getTeamCardSrc(game.homeTeam)}
            alt="Box score command center"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
            fallbackClassName="hidden"
          />

          <AssetImage
            src={teamVisualAssets.backgrounds.commandCenter}
            alt="Box score command texture"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
            fallbackClassName="hidden"
          />

          <div className="pointer-events-none absolute bottom-[-44px] right-8 hidden opacity-18 xl:block">
            <TeamHelmetVisual team={winner ?? game.homeTeam} size="card" />
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,26,42,0.92),rgba(11,26,42,0.74),rgba(11,26,42,0.94))]" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="gold">
                  <Trophy className="mr-1 h-3 w-3" />
                  Final Box Score
                </Badge>

                <Badge variant="info">{game.matchType.toUpperCase()}</Badge>

                {game.wasSkipped ? (
                  <Badge variant="gold">Resolved / Skipped</Badge>
                ) : (
                  <Badge variant="success">Full Simulation</Badge>
                )}
              </div>

              <h1 className="break-words text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
                {game.homeTeam.nickname} vs {game.awayTeam.nickname}
              </h1>

              <p className="mt-2 text-sm leading-6 text-text-muted">
                Completed {new Date(game.date).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/game-history">
                <Button variant="secondary" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Game History
                </Button>
              </Link>

              <Link href="/challenge-hub">
                <Button variant="gold" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Play Again
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        <WinnerPanel game={game} winner={winner} />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Crown}
            label="MVP"
            value={game.mvp.name}
            tone="gold"
          />

          <MetricCard
            icon={Users}
            label="MVP Position"
            value={`${game.mvp.position} · OVR ${game.mvp.overallRating}`}
            tone="electric"
          />

          <MetricCard
            icon={Activity}
            label="Total Plays"
            value={game.totalPlays}
            tone="success"
          />

          <MetricCard
            icon={Flag}
            label="Crowns Won"
            value={game.crownsWon}
            tone={game.crownsWon > 0 ? "gold" : "electric"}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
            <AssetImage
              src={teamVisualAssets.backgrounds.stadiumFlare}
              alt="Stats glow"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-12"
              fallbackClassName="hidden"
            />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                    Team Comparison
                  </p>
                  <h2 className="mt-1 text-2xl font-black uppercase text-white">
                    Full Game Stats
                  </h2>
                </div>

                <BarChart3 className="h-7 w-7 text-gold" />
              </div>

              <div className="space-y-3">
                {statsRows(game.homeStats, game.awayStats).map(
                  ([label, home, away]) => (
                    <StatRow
                      key={String(label)}
                      label={String(label)}
                      home={home}
                      away={away}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          <aside className="min-w-0 space-y-6">
            <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-5 shadow-xl">
              <div className="pointer-events-none absolute bottom-[-20px] right-[-20px] opacity-14">
                <TeamHelmetVisual team={winner ?? game.homeTeam} size="card" />
              </div>

              <div className="relative">
                <Star className="mb-3 h-7 w-7 text-gold" />
                <p className="text-xs font-black uppercase tracking-widest text-gold">
                  Most Valuable Player
                </p>

                <h2 className="mt-2 break-words text-2xl font-black uppercase text-white">
                  {game.mvp.name}
                </h2>

                <p className="mt-1 text-sm text-text-muted">
                  {game.mvp.position} · OVR {game.mvp.overallRating}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-navy-border bg-navy-card/70 p-3 text-center">
                    <p className="text-xs font-black uppercase text-text-muted">
                      Pass
                    </p>
                    <p className="text-xl font-black text-white">
                      {game.mvp.passingYards ?? 0}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-navy-border bg-navy-card/70 p-3 text-center">
                    <p className="text-xs font-black uppercase text-text-muted">
                      TD
                    </p>
                    <p className="text-xl font-black text-white">
                      {game.mvp.touchdowns ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
              <Clock className="mb-3 h-7 w-7 text-gold" />
              <p className="text-xs font-black uppercase tracking-widest text-text-muted">
                Game Type
              </p>

              <h2 className="mt-2 text-2xl font-black uppercase text-white">
                {game.matchType}
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-muted">
                Stake: {game.stake} MVP · Platform fee: {game.platformFee} MVP ·
                Reward: {game.reward} MVP
              </p>
            </section>
          </aside>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
          <AssetImage
            src={teamVisualAssets.backgrounds.field}
            alt="Key plays field"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
            fallbackClassName="hidden"
          />

          <div className="relative">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                  Key Plays
                </p>
                <h2 className="mt-1 text-2xl font-black uppercase text-white">
                  Game-Changing Moments
                </h2>
              </div>

              <Zap className="h-7 w-7 text-gold" />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {game.keyPlays.length > 0 ? (
                game.keyPlays.map((play) => {
                  const team =
                    play.teamId === game.homeTeam.id
                      ? game.homeTeam
                      : game.awayTeam;

                  return (
                    <article
                      key={play.id}
                      className="relative overflow-hidden rounded-2xl border border-navy-border bg-navy-secondary/70 p-4 backdrop-blur"
                    >
                      <div className="pointer-events-none absolute bottom-[-16px] right-[-18px] opacity-10">
                        <TeamHelmetVisual team={team} size="lg" />
                      </div>

                      <div className="relative">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <Badge variant="gold">{play.label}</Badge>
                          <Badge variant="info">
                            Q{play.quarter} · {play.time}
                          </Badge>
                        </div>

                        <p className="break-words text-sm font-black uppercase text-white">
                          {team?.abbreviation ?? getTeamInitials(team)} ·{" "}
                          {play.yards} yards
                        </p>

                        <p className="mt-2 break-words text-sm leading-6 text-text-muted">
                          {play.description}
                        </p>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-navy-border bg-navy-secondary/40 p-6 text-center xl:col-span-2">
                  <p className="font-black uppercase text-white">
                    No key plays recorded
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
              Player Stats
            </p>
            <h2 className="mt-1 text-2xl font-black uppercase text-white">
              Top Performers
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="border-b border-navy-border bg-navy-secondary/80">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                    Player
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                    Team
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                    Pos
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                    Pass
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                    Rush
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                    Rec
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                    TD
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                    DEF
                  </th>
                </tr>
              </thead>

              <tbody>
                {game.playerStats.slice(0, 16).map((player) => {
                  const team =
                    player.teamId === game.homeTeam.id
                      ? game.homeTeam
                      : game.awayTeam;

                  return (
                    <tr
                      key={player.id}
                      className="border-b border-navy-border/70 transition hover:bg-navy-secondary/40"
                    >
                      <td className="px-4 py-4">
                        <p className="font-black uppercase text-white">
                          {player.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          OVR {player.overallRating}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <TeamHelmetVisual team={team} size="xs" />
                          <span className="font-black text-gold">
                            {team.abbreviation ?? getTeamInitials(team)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-bold text-text-muted">
                        {player.position}
                      </td>
                      <td className="px-4 py-4 font-bold text-text-muted">
                        {player.passingYards ?? 0}
                      </td>
                      <td className="px-4 py-4 font-bold text-text-muted">
                        {player.rushingYards ?? 0}
                      </td>
                      <td className="px-4 py-4 font-bold text-text-muted">
                        {player.receivingYards ?? 0}
                      </td>
                      <td className="px-4 py-4 font-bold text-text-muted">
                        {player.touchdowns ?? 0}
                      </td>
                      <td className="px-4 py-4 font-bold text-text-muted">
                        TKL {player.tackles ?? 0} · SCK {player.sacks ?? 0} · INT{" "}
                        {player.interceptions ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}