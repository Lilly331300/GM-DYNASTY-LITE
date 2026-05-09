"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Bot,
  Clock,
  Crown,
  Eye,
  MessageCircle,
  Radio,
  Shield,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TeamHelmetVisual } from "@/components/team/TeamHelmetVisual";
import {
  getActiveStoredGames,
  getTeamFromHub,
  toLiveHref,
  toPregameHref,
  type StoredGame,
} from "@/lib/gameHub";
import { defaultAiTeams } from "@/lib/defaultAiTeams";
import { cn } from "@/lib/utils";
import {
  getTeamCardSrc,
  getTeamDisplayName,
  getTeamInitials,
  teamVisualAssets,
  type VisualTeam,
} from "@/lib/teamVisuals";

type PublicSpectatorGame = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  status: "live";
  matchType: "ai" | "pvp";
  spectators: number;
  quarter: string;
  score: string;
  stake: number;
  startedAt: string;
};

type SpectatorPairing = {
  homeIndex: number;
  awayIndex: number;
  score: string;
  quarter: string;
  spectators: number;
  stake: number;
};

function buildSpectatorHref(game: PublicSpectatorGame) {
  return `/live-game?game=${game.id}&home=${game.homeTeamId}&away=${game.awayTeamId}&mode=${game.matchType}&spectator=1`;
}

function buildUserGameHref(game: StoredGame) {
  if (game.status === "live") return toLiveHref(game);
  return toPregameHref(game);
}

function getTeamOverall(team?: VisualTeam) {
  return Number(team?.overallRating ?? 0);
}

function getTeamOffense(team?: VisualTeam) {
  return Number(team?.offensiveRating ?? 0);
}

function getTeamDefense(team?: VisualTeam) {
  return Number(team?.defensiveRating ?? 0);
}

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

function TeamIdentity({
  team,
  align = "left",
  compact = false,
}: {
  team?: VisualTeam;
  align?: "left" | "right";
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3",
        align === "right" && "flex-row-reverse text-right"
      )}
    >
      <TeamHelmet team={team} size={compact ? "sm" : "md"} />

      <div className="min-w-0">
        <p className="break-words text-sm font-black uppercase leading-tight text-white">
          {getTeamDisplayName(team)}
        </p>

        <div
          className={cn(
            "mt-1 flex flex-wrap items-center gap-2",
            align === "right" && "justify-end"
          )}
        >
          <span className="text-xs font-semibold text-text-muted">
            OVR {getTeamOverall(team) || "--"}
          </span>

          <span className="rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-gold">
            {getTeamInitials(team)}
          </span>
        </div>
      </div>
    </div>
  );
}

function MatchupPanel({
  homeTeam,
  awayTeam,
  centerLabel,
  score,
}: {
  homeTeam?: VisualTeam;
  awayTeam?: VisualTeam;
  centerLabel: string;
  score?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_120px_1fr] xl:items-center">
      <div className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-secondary/55 p-4">
        <AssetImage
          src={getTeamCardSrc(homeTeam)}
          alt={`${getTeamDisplayName(homeTeam)} card`}
          className="pointer-events-none absolute right-0 top-0 h-full w-44 object-cover opacity-12"
          fallbackClassName="hidden"
        />

        {homeTeam ? (
          <div className="pointer-events-none absolute bottom-[-26px] right-[-24px] opacity-10">
            <TeamHelmetVisual team={homeTeam} size="card" />
          </div>
        ) : null}

        <div className="relative">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-text-muted">
            Home Team
          </p>
          <TeamIdentity team={homeTeam} />
        </div>
      </div>

      <div className="rounded-3xl border border-gold/30 bg-gold/10 p-4 text-center shadow-lg shadow-gold/10">
        <p className="text-2xl font-black text-gold">{score ?? "VS"}</p>
        <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-text-muted">
          {centerLabel}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-secondary/55 p-4">
        <AssetImage
          src={getTeamCardSrc(awayTeam)}
          alt={`${getTeamDisplayName(awayTeam)} card`}
          className="pointer-events-none absolute left-0 top-0 h-full w-44 object-cover opacity-12"
          fallbackClassName="hidden"
        />

        {awayTeam ? (
          <div className="pointer-events-none absolute bottom-[-26px] left-[-24px] opacity-10">
            <TeamHelmetVisual team={awayTeam} size="card" />
          </div>
        ) : null}

        <div className="relative">
          <p className="mb-3 text-right text-xs font-black uppercase tracking-[0.24em] text-text-muted">
            Away Team
          </p>
          <TeamIdentity team={awayTeam} align="right" />
        </div>
      </div>
    </div>
  );
}

function UserGameCard({ game }: { game: StoredGame }) {
  const homeTeam = getTeamFromHub(game.homeTeamId);
  const awayTeam = getTeamFromHub(game.awayTeamId);
  const href = buildUserGameHref(game);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="relative min-w-0 overflow-hidden rounded-3xl border border-gold/30 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.16),transparent_38%),#101F33] p-5 shadow-xl"
    >
      <AssetImage
        src={homeTeam ? getTeamCardSrc(homeTeam) : teamVisualAssets.backgrounds.stadiumFlare}
        alt="Your active game background"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
        fallbackClassName="hidden"
      />

      <AssetImage
        src={teamVisualAssets.backgrounds.stadiumFlare}
        alt="Your active game glow"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-18"
        fallbackClassName="hidden"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,26,42,0.54),rgba(11,26,42,0.94))]" />

      <div className="relative">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant={game.status === "live" ? "danger" : "gold"}>
                <Radio className="mr-1 h-3 w-3" />
                Your {game.status === "live" ? "Live Game" : "Pregame"}
              </Badge>

              <Badge variant="info">
                {game.matchType.toUpperCase()} · Stake {game.stake} MVP
              </Badge>

              <Badge variant="gold">Dynamic Matchup</Badge>
            </div>

            <h2 className="break-words text-2xl font-black uppercase text-white">
              {getTeamDisplayName(homeTeam)} vs {getTeamDisplayName(awayTeam)}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              This game involves one of your franchises. Open it to continue.
            </p>
          </div>

          <Link href={href}>
            <Button variant="gold" className="w-full gap-2 xl:w-auto">
              <Radio className="h-4 w-4" />
              {game.status === "live" ? "Return Live" : "Enter Pregame"}
            </Button>
          </Link>
        </div>

        <MatchupPanel
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          centerLabel={game.status}
        />
      </div>
    </motion.article>
  );
}

function PublicGameCard({ game }: { game: PublicSpectatorGame }) {
  const homeTeam = getTeamFromHub(game.homeTeamId);
  const awayTeam = getTeamFromHub(game.awayTeamId);
  const href = buildSpectatorHref(game);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl transition hover:border-gold/40"
    >
      <AssetImage
        src={homeTeam ? getTeamCardSrc(homeTeam) : teamVisualAssets.backgrounds.field}
        alt="Spectator matchup background"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-12"
        fallbackClassName="hidden"
      />

      <AssetImage
        src={teamVisualAssets.backgrounds.field}
        alt="Spectator field background"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
        fallbackClassName="hidden"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.12),transparent_34%),linear-gradient(180deg,rgba(11,26,42,0.70),rgba(11,26,42,0.94))]" />

      <div className="relative">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="danger">
                <Radio className="mr-1 h-3 w-3" />
                Live Now
              </Badge>

              <Badge variant="info">
                <Eye className="mr-1 h-3 w-3" />
                {game.spectators.toLocaleString()} watching
              </Badge>

              <Badge variant="gold">{game.matchType.toUpperCase()}</Badge>
            </div>

            <h2 className="break-words text-2xl font-black uppercase text-white">
              {getTeamDisplayName(homeTeam)} vs {getTeamDisplayName(awayTeam)}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Spectator mode only. Watch, chat, and follow the play-by-play.
            </p>
          </div>

          <Link href={href}>
            <Button variant="secondary" className="w-full gap-2 xl:w-auto">
              <Eye className="h-4 w-4" />
              Watch Live
            </Button>
          </Link>
        </div>

        <MatchupPanel
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          centerLabel={game.quarter}
          score={game.score}
        />

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center backdrop-blur">
            <Clock className="mx-auto mb-2 h-4 w-4 text-gold" />
            <p className="text-xs font-black uppercase text-text-muted">
              Started
            </p>
            <p className="text-sm font-black text-white">{game.startedAt}</p>
          </div>

          <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center backdrop-blur">
            <Crown className="mx-auto mb-2 h-4 w-4 text-gold" />
            <p className="text-xs font-black uppercase text-text-muted">
              Stake
            </p>
            <p className="text-sm font-black text-white">{game.stake} MVP</p>
          </div>

          <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center backdrop-blur">
            <MessageCircle className="mx-auto mb-2 h-4 w-4 text-electric" />
            <p className="text-xs font-black uppercase text-text-muted">Chat</p>
            <p className="text-sm font-black text-white">Open</p>
          </div>

          <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center backdrop-blur">
            <Zap className="mx-auto mb-2 h-4 w-4 text-success" />
            <p className="text-xs font-black uppercase text-text-muted">
              Predict
            </p>
            <p className="text-sm font-black text-white">Soon</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function createPublicSpectatorGames(): PublicSpectatorGame[] {
  const teams = defaultAiTeams;

  if (teams.length < 2) {
    return [];
  }

  const pairings: SpectatorPairing[] = [
    {
      homeIndex: 0,
      awayIndex: 1,
      score: "14-10",
      quarter: "Q2",
      spectators: 847,
      stake: 25,
    },
    {
      homeIndex: 2,
      awayIndex: 3,
      score: "21-17",
      quarter: "Q3",
      spectators: 1219,
      stake: 50,
    },
    {
      homeIndex: 4,
      awayIndex: 5,
      score: "7-7",
      quarter: "Q1",
      spectators: 602,
      stake: 0,
    },
    {
      homeIndex: 6,
      awayIndex: 7,
      score: "28-24",
      quarter: "Q4",
      spectators: 1844,
      stake: 100,
    },
    {
      homeIndex: 8,
      awayIndex: 9,
      score: "17-13",
      quarter: "Q3",
      spectators: 998,
      stake: 25,
    },
  ];

  return pairings
    .filter((pairing) => teams[pairing.homeIndex] && teams[pairing.awayIndex])
    .map((pairing, index) => {
      const homeTeam = teams[pairing.homeIndex];
      const awayTeam = teams[pairing.awayIndex];

      return {
        id: `spectator_game_${homeTeam.id}_${awayTeam.id}_${index}`,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        status: "live",
        matchType: pairing.stake === 0 ? "ai" : "pvp",
        spectators: pairing.spectators,
        quarter: pairing.quarter,
        score: pairing.score,
        stake: pairing.stake,
        startedAt:
          index === 0
            ? "8 min ago"
            : index === 1
              ? "18 min ago"
              : index === 2
                ? "4 min ago"
                : index === 3
                  ? "31 min ago"
                  : "22 min ago",
      };
    });
}

export default function GamesInProgressPage() {
  const [mounted, setMounted] = useState(false);
  const [activeGames, setActiveGames] = useState<StoredGame[]>([]);

  const publicGames = useMemo(() => createPublicSpectatorGames(), []);

  const yourGames = activeGames.filter(
    (game) => game.status === "pregame" || game.status === "live"
  );

  const listedGames = activeGames.filter((game) => game.status === "listed");

  useEffect(() => {
    setMounted(true);

    const refresh = () => {
      setActiveGames(getActiveStoredGames());
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

  if (!mounted) {
    return (
      <AppShell>
        <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden">
          <div className="h-40 rounded-3xl border border-navy-border bg-navy-card" />
          <div className="h-72 rounded-3xl border border-navy-border bg-navy-card" />
          <div className="h-72 rounded-3xl border border-navy-border bg-navy-card" />
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
            src={teamVisualAssets.backgrounds.commandCenter}
            alt="Games in progress command center"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-34"
            fallbackClassName="hidden"
          />

          <AssetImage
            src={teamVisualAssets.backgrounds.field}
            alt="Games in progress field"
            className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-[520px] object-cover opacity-16 xl:block"
            fallbackClassName="hidden"
          />

          {yourGames[0] ? (
            <div className="pointer-events-none absolute bottom-[-44px] right-8 hidden opacity-18 xl:block">
              <TeamHelmetVisual
                team={getTeamFromHub(yourGames[0].homeTeamId)}
                size="card"
              />
            </div>
          ) : null}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,26,42,0.92),rgba(11,26,42,0.74),rgba(11,26,42,0.94))]" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="danger">
                  <Radio className="mr-1 h-3 w-3" />
                  Live Center
                </Badge>

                <Badge variant="info">
                  <Users className="mr-1 h-3 w-3" />
                  {publicGames.length + yourGames.length} Games Active
                </Badge>

                <Badge variant="gold">
                  <Eye className="mr-1 h-3 w-3" />
                  Spectator Mode
                </Badge>
              </div>

              <h1 className="break-words text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
                Games In Progress
              </h1>

              <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-text-muted md:text-base">
                Watch live platform games, return to your own active matches, or
                spectate computer-vs-computer matchups with dynamic helmets and
                team IDs.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 xl:max-w-[560px]">
              <Link href="/challenge-hub">
                <Button variant="gold" className="w-full gap-2">
                  <Swords className="h-4 w-4" />
                  Challenge Hub
                </Button>
              </Link>

              <Link href="/create-challenge">
                <Button variant="secondary" className="w-full gap-2">
                  <Trophy className="h-4 w-4" />
                  Create Challenge
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
        </motion.section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
            <Radio className="mb-3 h-6 w-6 text-danger" />
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Live Games
            </p>
            <p className="mt-2 text-4xl font-black text-white">
              {publicGames.length +
                yourGames.filter((game) => game.status === "live").length}
            </p>
          </div>

          <div className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
            <Clock className="mb-3 h-6 w-6 text-gold" />
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Pregame
            </p>
            <p className="mt-2 text-4xl font-black text-white">
              {yourGames.filter((game) => game.status === "pregame").length}
            </p>
          </div>

          <div className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
            <Activity className="mb-3 h-6 w-6 text-electric" />
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Listed
            </p>
            <p className="mt-2 text-4xl font-black text-white">
              {listedGames.length}
            </p>
          </div>

          <div className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
            <Eye className="mb-3 h-6 w-6 text-success" />
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Spectators
            </p>
            <p className="mt-2 text-4xl font-black text-white">
              {publicGames
                .reduce((sum, game) => sum + game.spectators, 0)
                .toLocaleString()}
            </p>
          </div>
        </section>

        {yourGames.length > 0 && (
          <section className="space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                Your Active Games
              </p>
              <h2 className="mt-1 text-2xl font-black uppercase text-white">
                Continue Your Match
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {yourGames.map((game) => (
                <UserGameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
              Platform Live Games
            </p>
            <h2 className="mt-1 text-2xl font-black uppercase text-white">
              Spectate Other Matches
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              These mock platform games now use real dynamic team IDs and
              helmets.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {publicGames.map((game) => (
              <PublicGameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {listedGames.length > 0 && (
          <section className="space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                Listed Challenges
              </p>
              <h2 className="mt-1 text-2xl font-black uppercase text-white">
                Waiting For Opponents
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {listedGames.map((game) => {
                const homeTeam = getTeamFromHub(game.homeTeamId);

                return (
                  <motion.article
                    key={game.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -3 }}
                    className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl transition hover:border-gold/35"
                  >
                    <AssetImage
                      src={getTeamCardSrc(homeTeam)}
                      alt={`${getTeamDisplayName(homeTeam)} card`}
                      className="pointer-events-none absolute right-0 top-0 h-full w-52 object-cover opacity-12"
                      fallbackClassName="hidden"
                    />

                    {homeTeam ? (
                      <div className="pointer-events-none absolute bottom-[-28px] right-[-20px] opacity-10">
                        <TeamHelmetVisual team={homeTeam} size="card" />
                      </div>
                    ) : null}

                    <div className="relative">
                      <div className="mb-4 flex flex-wrap gap-2">
                        <Badge variant="gold">Listed</Badge>
                        <Badge variant="info">
                          {game.matchType.toUpperCase()}
                        </Badge>
                      </div>

                      <TeamIdentity team={homeTeam} />

                      <p className="mt-4 text-sm text-text-muted">
                        This challenge is waiting for another franchise to
                        accept.
                      </p>

                      <Link href="/challenge-hub">
                        <Button variant="secondary" className="mt-4 w-full gap-2">
                          <Swords className="h-4 w-4" />
                          Open Challenge Hub
                        </Button>
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        )}

        <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-5 shadow-xl">
          <AssetImage
            src={teamVisualAssets.backgrounds.stadiumFlare}
            alt="Games note glow"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
            fallbackClassName="hidden"
          />

          <div className="relative flex items-start gap-3">
            <Bot className="mt-1 h-5 w-5 shrink-0 text-gold" />
            <p className="break-words text-sm leading-6 text-text-muted">
              Spectator games now pass their actual team IDs into the live game
              page. Clicking Watch Live opens the correct dynamic matchup with
              the correct helmets and team identity.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}