"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  Crown,
  Gamepad2,
  Plus,
  Radio,
  Shield,
  Swords,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TeamHelmetVisual } from "@/components/team/TeamHelmetVisual";
import {
  getNextGameForDashboard,
  getNflSyncSummary,
  getTeamFromHub,
  getUserFranchises,
  toLiveHref,
  toPregameHref,
  type StoredGame,
  type StoredFranchiseTeam,
} from "@/lib/gameHub";
import { getRecentDashboardGames, type CompletedGame } from "@/lib/gameResults";
import {
  getTeamCardSrc,
  getTeamDisplayName,
  getTeamInitials,
  teamVisualAssets,
  type VisualTeam,
} from "@/lib/teamVisuals";
import { cn, formatRecord } from "@/lib/utils";

const dashboardAssets = {
  commandCenterBg: "/assets/dashboard/command-center-bg.jpg",
  stadiumFlare: "/assets/dashboard/dashboard-stadium-flare.png",
  fieldBg: "/assets/dashboard/dashboard-field-bg.jpg",
  historyThumb: "/assets/dashboard/history/latest-history-thumb.png",
  coachOwner: "/assets/dashboard/coach-owner.png",
  avatars: {
    inviteMain: "/assets/dashboard/avatars/invite-main.png",
    avatar01: "/assets/dashboard/avatars/avatar-01.png",
    avatar02: "/assets/dashboard/avatars/avatar-02.png",
    avatar03: "/assets/dashboard/avatars/avatar-03.png",
    avatar04: "/assets/dashboard/avatars/avatar-04.png",
    avatar05: "/assets/dashboard/avatars/avatar-05.png",
    avatar06: "/assets/dashboard/avatars/avatar-06.png",
  },
};

const playerFaceAssets = [
  "/assets/players/faces/player-qb-001.png",
  "/assets/players/faces/player-rb-001.png",
  "/assets/players/faces/player-cb-001.png",
];

const onlineUsers = [
  {
    name: "CoachRay",
    rating: 64,
    status: "Available",
    tag: "Balanced",
    avatar: dashboardAssets.avatars.inviteMain,
  },
  {
    name: "GridironQueen",
    rating: 72,
    status: "Available",
    tag: "Pass Heavy",
    avatar: dashboardAssets.avatars.avatar01,
  },
  {
    name: "BarryGM",
    rating: 81,
    status: "In Lobby",
    tag: "Elite",
    avatar: dashboardAssets.avatars.avatar02,
  },
  {
    name: "ScoutLab",
    rating: 58,
    status: "Watching",
    tag: "Analyst",
    avatar: dashboardAssets.avatars.avatar03,
  },
  {
    name: "BlitzMason",
    rating: 69,
    status: "Available",
    tag: "Aggressive",
    avatar: dashboardAssets.avatars.avatar04,
  },
  {
    name: "FilmRoomKai",
    rating: 61,
    status: "Available",
    tag: "Scout",
    avatar: dashboardAssets.avatars.avatar05,
  },
];

function getPlayerName(player: any) {
  return String(player?.name ?? "Impact Player");
}

function getPlayerPosition(player: any, index: number) {
  return String(player?.position ?? ["QB", "RB", "CB"][index] ?? "ATH");
}

function getPlayerOverall(player: any, fallback: number) {
  return Number(player?.overall ?? player?.overallRating ?? fallback);
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

function DashboardSkeleton() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="h-56 rounded-3xl border border-navy-border bg-navy-card" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-3xl border border-navy-border bg-navy-card"
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function InvitePopup({
  username,
  onClose,
}: {
  username: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 2200);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        className="fixed bottom-6 right-6 z-[100] w-[calc(100%-3rem)] max-w-md rounded-3xl border border-gold/40 bg-navy-card p-5 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-success/20 bg-success/10 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black uppercase tracking-widest text-gold">
              Invite Sent
            </p>
            <p className="mt-1 break-words text-base font-bold text-white">
              Invite has been sent to {username}.
            </p>
            <p className="mt-1 text-xs text-text-muted">
              They can accept from their challenge notifications.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-navy-border bg-navy-secondary p-2 text-text-muted hover:text-white"
            aria-label="Close invite popup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function TeamLogo({
  team,
  size = "lg",
}: {
  team?: VisualTeam;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClass =
    size === "sm"
      ? "h-12 w-14 rounded-2xl"
      : size === "md"
        ? "h-16 w-20 rounded-2xl"
        : size === "xl"
          ? "h-28 w-36 rounded-3xl"
          : "h-24 w-32 rounded-3xl";

  if (!team) {
    return (
      <div
        className={`${sizeClass} flex shrink-0 items-center justify-center border border-dashed border-navy-border bg-navy-secondary text-text-muted`}
      >
        —
      </div>
    );
  }

  return (
    <div
      className={cn(
        sizeClass,
        "relative flex shrink-0 items-center justify-center overflow-visible border border-white/10 bg-navy-primary/55 shadow-xl"
      )}
    >
      <TeamHelmetVisual
        team={team}
        size={size === "xl" ? "lg" : size === "lg" ? "md" : size}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
  subtitle,
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone: "gold" | "success" | "electric" | "danger";
  subtitle: string;
  delay?: number;
}) {
  const toneClass =
    tone === "gold"
      ? "border-gold/20 bg-gold/10 text-gold"
      : tone === "success"
        ? "border-success/20 bg-success/10 text-success"
        : tone === "danger"
          ? "border-danger/20 bg-danger/10 text-danger"
          : "border-electric/20 bg-electric/10 text-electric";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl"
    >
      <AssetImage
        src={dashboardAssets.stadiumFlare}
        alt={`${label} glow`}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
        fallbackClassName="hidden"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-text-muted">
            {label}
          </p>
          <p className="mt-2 truncate text-4xl font-black tabular-nums text-white">
            {value}
          </p>
          <p className="mt-1 text-xs font-semibold text-text-muted">
            {subtitle}
          </p>
        </div>

        <div className={`rounded-2xl border p-3 ${toneClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

function FeaturedPlayerStrip({ team }: { team?: StoredFranchiseTeam }) {
  const players = useMemo(() => {
    const realPlayers = [...(team?.players ?? [])]
      .sort((a: any, b: any) => getPlayerOverall(b, 0) - getPlayerOverall(a, 0))
      .slice(0, 3);

    if (realPlayers.length >= 3) return realPlayers;

    return [
      ...realPlayers,
      { id: "fallback-qb", name: "J. Maddox", position: "QB", overall: 78 },
      { id: "fallback-rb", name: "T. Vaughn", position: "RB", overall: 75 },
      { id: "fallback-cb", name: "A. Cooper", position: "CB", overall: 77 },
    ].slice(0, 3);
  }, [team]);

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
      {players.map((player: any, index) => (
        <motion.div
          key={player.id ?? index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-navy-border bg-navy-primary/75 p-2"
        >
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-gold/20 bg-navy-secondary">
            <AssetImage
              src={playerFaceAssets[index] ?? playerFaceAssets[0]}
              alt={getPlayerName(player)}
              className="h-full w-full object-cover"
              fallbackClassName="h-full w-full"
            />
          </div>

          <div className="min-w-0">
            <Badge variant="outline" className="mb-1">
              {getPlayerPosition(player, index)}
            </Badge>
            <p className="truncate text-sm font-black text-white">
              {getPlayerName(player)}
            </p>
            <p className="text-xs font-semibold text-text-muted">
              OVR {getPlayerOverall(player, [78, 75, 77][index] ?? 74)}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function PrimaryTeamCard({ team }: { team?: StoredFranchiseTeam }) {
  if (!team) {
    return (
      <section className="rounded-3xl border border-dashed border-navy-border bg-navy-card p-6 text-center shadow-xl">
        <Shield className="mx-auto h-10 w-10 text-text-muted" />
        <h2 className="mt-4 text-2xl font-black uppercase text-white">
          No Franchise Yet
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-text-muted">
          Create your first franchise to unlock roster, strategy, challenges,
          and live games.
        </p>

        <Link href="/team-create">
          <Button variant="gold" className="mt-5 gap-2">
            <Plus className="h-4 w-4" />
            Create Franchise
          </Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
      <AssetImage
        src={getTeamCardSrc(team)}
        alt={`${getTeamDisplayName(team)} card background`}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-18"
        fallbackClassName="hidden"
      />

      <AssetImage
        src={dashboardAssets.stadiumFlare}
        alt="Dashboard stadium flare"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35"
        fallbackClassName="hidden"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.12),transparent_42%),linear-gradient(180deg,rgba(11,26,42,0.44),rgba(11,26,42,0.90))]" />

      <div className="relative flex items-center gap-4">
        <TeamLogo team={team} size="xl" />

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="gold">
              <Crown className="mr-1 h-3 w-3" />
              Primary
            </Badge>

            {team.nflSync?.enabled && (
              <Badge variant="success">
                <Shield className="mr-1 h-3 w-3" />
                NFL Sync
              </Badge>
            )}

            <Badge variant="info">{getTeamInitials(team)}</Badge>
          </div>

          <h2 className="break-words text-2xl font-black uppercase text-white">
            {getTeamDisplayName(team)}
          </h2>

          <p className="text-sm font-semibold text-text-muted">
            {formatRecord(
              team.record.wins,
              team.record.losses,
              team.record.ties
            )}{" "}
            · OVR {team.overallRating}
          </p>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-navy-border bg-navy-primary/80 p-3 text-center backdrop-blur">
          <p className="text-xs font-black uppercase text-text-muted">OFF</p>
          <p className="text-2xl font-black text-white">
            {team.offensiveRating}
          </p>
        </div>

        <div className="rounded-2xl border border-navy-border bg-navy-primary/80 p-3 text-center backdrop-blur">
          <p className="text-xs font-black uppercase text-text-muted">DEF</p>
          <p className="text-2xl font-black text-white">
            {team.defensiveRating}
          </p>
        </div>

        <div className="rounded-2xl border border-navy-border bg-navy-primary/80 p-3 text-center backdrop-blur">
          <p className="text-xs font-black uppercase text-text-muted">ST</p>
          <p className="text-2xl font-black text-white">
            {team.specialTeamsRating}
          </p>
        </div>
      </div>

      <div className="relative">
        <FeaturedPlayerStrip team={team} />
      </div>

      <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link href={`/game-plan?team=${team.id}`}>
          <Button variant="secondary" className="w-full justify-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Game Plan
          </Button>
        </Link>

        <Link href={`/roster?team=${team.id}`}>
          <Button variant="secondary" className="w-full justify-center gap-2">
            <Users className="h-4 w-4" />
            Roster
          </Button>
        </Link>

        <Link href="/team-create">
          <Button variant="gold" className="w-full justify-center gap-2">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </Link>
      </div>
    </section>
  );
}

function NextGamePanel({ game }: { game?: StoredGame }) {
  if (!game) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-[#101F33] p-5 shadow-xl">
        <AssetImage
          src={dashboardAssets.fieldBg}
          alt="Dashboard field background"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-52"
          fallbackClassName="hidden"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.16),transparent_38%),linear-gradient(180deg,rgba(16,31,51,0.60),rgba(11,26,42,0.92))]" />

        <div className="relative mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Badge variant="gold">
              <Radio className="mr-1 h-3 w-3" />
              Next Game
            </Badge>

            <h2 className="mt-3 text-2xl font-black uppercase text-white">
              No Active Match
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-muted">
              Your next game slot is open. Create a challenge, accept an
              opponent, or start an AI matchup instantly.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-gold/20 bg-gold/10 p-3 text-gold">
            <Radio className="h-7 w-7" />
          </div>
        </div>

        <div className="relative grid grid-cols-1 gap-3 lg:grid-cols-[1fr_90px_1fr]">
          <div className="rounded-2xl border border-dashed border-navy-border bg-navy-card/75 p-4 text-center backdrop-blur">
            <div className="flex justify-center">
              <TeamLogo size="md" />
            </div>
            <p className="mt-3 text-xs font-black uppercase tracking-widest text-text-muted">
              Your Team
            </p>
            <p className="mt-1 text-sm font-black uppercase text-white">
              Awaiting Selection
            </p>
          </div>

          <div className="flex items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 p-4 text-center backdrop-blur">
            <div>
              <p className="text-2xl font-black text-gold">VS</p>
              <p className="mt-1 text-[11px] font-bold uppercase text-text-muted">
                Pending
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-navy-border bg-navy-card/75 p-4 text-center backdrop-blur">
            <div className="flex justify-center">
              <TeamLogo size="md" />
            </div>
            <p className="mt-3 text-xs font-black uppercase tracking-widest text-text-muted">
              Opponent
            </p>
            <p className="mt-1 text-sm font-black uppercase text-white">
              Waiting
            </p>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link href="/team-create">
            <Button variant="secondary" className="w-full justify-center gap-2">
              <Plus className="h-4 w-4" />
              Create Franchise
            </Button>
          </Link>

          <Link href="/challenge-hub">
            <Button variant="gold" className="w-full justify-center gap-2">
              <Bot className="h-4 w-4" />
              Play AI
            </Button>
          </Link>

          <Link href="/create-challenge">
            <Button variant="primary" className="w-full justify-center gap-2">
              <Swords className="h-4 w-4" />
              Challenge
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  const home = getTeamFromHub(game.homeTeamId);
  const away = getTeamFromHub(game.awayTeamId);
  const isListed = game.status === "listed";

  const href =
    game.status === "live"
      ? toLiveHref(game)
      : isListed
        ? "/challenge-hub"
        : toPregameHref(game);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-[#101F33] p-5 shadow-xl">
      <AssetImage
        src={home ? getTeamCardSrc(home) : dashboardAssets.fieldBg}
        alt="Dashboard active game background"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-18"
        fallbackClassName="hidden"
      />

      <AssetImage
        src={dashboardAssets.fieldBg}
        alt="Dashboard field background"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
        fallbackClassName="hidden"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.18),transparent_38%),linear-gradient(180deg,rgba(16,31,51,0.58),rgba(11,26,42,0.92))]" />

      <div className="relative mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Badge
            variant={
              game.status === "live"
                ? "danger"
                : game.status === "listed"
                  ? "gold"
                  : "gold"
            }
          >
            <Radio className="mr-1 h-3 w-3" />
            {game.status}
          </Badge>

          <h2 className="mt-3 text-2xl font-black uppercase text-white">
            {isListed ? "Challenge Awaiting Opponent" : "Next Game"}
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            {game.matchType.toUpperCase()} · Stake {game.stake} MVP
          </p>
        </div>

        <Link href={href}>
          <Button variant="gold" className="justify-center gap-2">
            <Radio className="h-4 w-4" />
            {game.status === "live"
              ? "Return Live"
              : isListed
                ? "Open Challenge Hub"
                : "Enter Pregame"}
          </Button>
        </Link>
      </div>

      <div className="relative grid grid-cols-1 gap-3 lg:grid-cols-[1fr_90px_1fr]">
        <div className="rounded-2xl border border-navy-border bg-navy-card/80 p-4 text-center backdrop-blur">
          <div className="flex justify-center">
            <TeamLogo team={home} size="xl" />
          </div>

          <p className="mt-4 text-xs font-black uppercase tracking-widest text-text-muted">
            Home Team
          </p>

          <h3 className="mx-auto mt-1 max-w-[260px] text-lg font-black uppercase leading-6 text-white">
            {home ? getTeamDisplayName(home) : "Awaiting"}
          </h3>

          <p className="mt-1 text-xs font-semibold text-text-muted">
            {home ? `OVR ${home.overallRating}` : "No team"}
          </p>
        </div>

        <div className="flex items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 p-4 text-center backdrop-blur">
          <div>
            <p className="text-3xl font-black text-gold">VS</p>
            <p className="mt-2 text-[11px] font-bold uppercase leading-4 text-text-muted">
              {isListed
                ? "Waiting"
                : game.scheduledFor
                  ? new Date(game.scheduledFor).toLocaleString()
                  : game.status === "live"
                    ? "Live Now"
                    : "Pregame"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-navy-border bg-navy-card/80 p-4 text-center backdrop-blur">
          <div className="flex justify-center">
            <TeamLogo team={away} size="xl" />
          </div>

          <p className="mt-4 text-xs font-black uppercase tracking-widest text-text-muted">
            Away Team
          </p>

          <h3 className="mx-auto mt-1 max-w-[260px] text-lg font-black uppercase leading-6 text-white">
            {away ? getTeamDisplayName(away) : "Awaiting Opponent"}
          </h3>

          <p className="mt-1 text-xs font-semibold text-text-muted">
            {away ? `OVR ${away.overallRating}` : "Challenge not accepted"}
          </p>
        </div>
      </div>

      {isListed ? (
        <div className="relative mt-5 rounded-2xl border border-gold/20 bg-gold/10 p-4 text-center">
          <p className="text-sm font-black uppercase text-gold">
            This game cannot start yet
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Another franchise must accept the challenge before pregame and live
            kickoff can begin.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function RecentGamesPanel({ games }: { games: CompletedGame[] }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
      <AssetImage
        src={dashboardAssets.stadiumFlare}
        alt="Dashboard stadium flare"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-34"
        fallbackClassName="hidden"
      />

      <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
            Recent Games
          </p>
          <h2 className="mt-1 text-2xl font-black uppercase text-white">
            Latest History
          </h2>
        </div>

        <Link href="/game-history">
          <Button variant="secondary" size="sm" className="gap-2">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="relative space-y-3">
        {games.length > 0 ? (
          games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link href={`/box-score?game=${game.id}`}>
                <div className="grid grid-cols-[72px_1fr_auto] items-center gap-4 rounded-2xl border border-navy-border bg-navy-secondary/70 p-3 transition hover:border-gold/40 md:grid-cols-[96px_1fr_auto]">
                  <div className="flex h-16 items-center justify-center overflow-visible rounded-2xl border border-gold/15 bg-navy-primary">
                    <TeamHelmetVisual team={game.homeTeam} size="sm" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black uppercase text-white">
                      {getTeamDisplayName(game.homeTeam)} vs{" "}
                      {getTeamDisplayName(game.awayTeam)}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                      {game.matchType.toUpperCase()} ·{" "}
                      {new Date(game.date).toLocaleDateString()} · MVP{" "}
                      {game.mvp.name}
                    </p>
                  </div>

                  <p className="whitespace-nowrap text-lg font-black text-gold">
                    {game.homeScore}-{game.awayScore}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-navy-border bg-navy-secondary/40 p-5 text-center">
            <p className="font-black uppercase text-white">
              No completed games yet
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Your latest match history will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function OnlineUsersPanel({
  onInvite,
}: {
  onInvite: (username: string) => void;
}) {
  return (
    <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
            Online Users
          </p>
          <h2 className="mt-1 text-2xl font-black uppercase text-white">
            Quick Invite
          </h2>
        </div>

        <Users className="h-7 w-7 text-gold" />
      </div>

      <div className="space-y-3">
        {onlineUsers.map((user) => (
          <div
            key={user.name}
            className="flex items-center justify-between gap-3 rounded-2xl border border-navy-border bg-navy-secondary/65 p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-gold/25 bg-navy-primary">
                <AssetImage
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                  fallbackClassName="h-full w-full"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate font-black text-white">{user.name}</p>
                <p className="truncate text-xs text-text-muted">
                  OVR {user.rating} · {user.status} · {user.tag}
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onInvite(user.name)}
            >
              Invite
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickActionsPanel() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
      <AssetImage
        src={dashboardAssets.coachOwner}
        alt="Coach owner"
        className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 object-contain object-bottom opacity-26"
        fallbackClassName="hidden"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,197,66,0.14),transparent_38%)]" />

      <div className="relative mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
            Quick Actions
          </p>
          <h2 className="mt-1 text-2xl font-black uppercase text-white">
            Manage Team
          </h2>
        </div>

        <Zap className="h-7 w-7 text-gold" />
      </div>

      <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/team-create">
          <Button variant="gold" className="w-full justify-center gap-2">
            <Plus className="h-4 w-4" />
            Create Franchise
          </Button>
        </Link>

        <Link href="/challenge-hub">
          <Button variant="secondary" className="w-full justify-center gap-2">
            <Bot className="h-4 w-4" />
            Play AI Team
          </Button>
        </Link>

        <Link href="/create-challenge">
          <Button variant="secondary" className="w-full justify-center gap-2">
            <Swords className="h-4 w-4" />
            Create Challenge
          </Button>
        </Link>

        <Link href="/games-in-progress">
          <Button variant="secondary" className="w-full justify-center gap-2">
            <Radio className="h-4 w-4" />
            Watch Live
          </Button>
        </Link>
      </div>
    </section>
  );
}

function SyncImpactPanel({
  syncSummary,
}: {
  syncSummary: ReturnType<typeof getNflSyncSummary>;
}) {
  return (
    <section className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
            NFL Sync
          </p>
          <h2 className="mt-1 text-2xl font-black uppercase text-white">
            Real City Impact
          </h2>
        </div>

        <CalendarClock className="h-7 w-7 text-gold" />
      </div>

      {syncSummary.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {syncSummary.map((item) => (
            <div
              key={item.team.id}
              className="relative overflow-hidden rounded-2xl border border-navy-border bg-navy-secondary/60 p-4"
            >
              <AssetImage
                src={getTeamCardSrc(item.team)}
                alt={`${getTeamDisplayName(item.team)} sync background`}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
                fallbackClassName="hidden"
              />

              <div className="relative flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-black uppercase text-white">{item.city}</p>
                  <p className="truncate text-xs text-text-muted">
                    {item.nflTeam}
                  </p>
                </div>

                <p
                  className={`shrink-0 text-2xl font-black ${
                    item.points >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {item.points >= 0 ? "+" : ""}
                  {item.points}
                </p>
              </div>

              <p className="relative mt-2 text-xs text-text-muted">
                {item.note}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-navy-border bg-navy-secondary/40 p-6 text-center">
          <p className="font-black uppercase text-white">No synced team yet</p>
          <p className="mt-1 text-sm text-text-muted">
            Enable NFL sync while creating a franchise.
          </p>
        </div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [franchises, setFranchises] = useState<StoredFranchiseTeam[]>([]);
  const [nextGame, setNextGame] = useState<StoredGame | undefined>();
  const [recentGames, setRecentGames] = useState<CompletedGame[]>([]);
  const [syncSummary, setSyncSummary] = useState<
    ReturnType<typeof getNflSyncSummary>
  >([]);
  const [inviteUser, setInviteUser] = useState<string | null>(null);

  const refresh = () => {
    setFranchises(getUserFranchises());
    setNextGame(getNextGameForDashboard());
    setRecentGames(getRecentDashboardGames(5));
    setSyncSummary(getNflSyncSummary());
  };

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return <DashboardSkeleton />;

  const primary = franchises[0];
  const crownsEarned = recentGames.reduce((sum, game) => sum + game.reward, 0);

  return (
    <AppShell>
      <div className="space-y-6 overflow-hidden">
        {inviteUser ? (
          <InvitePopup
            username={inviteUser}
            onClose={() => setInviteUser(null)}
          />
        ) : null}

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-navy-border bg-[#101F33] p-6 shadow-2xl"
        >
          <AssetImage
            src={primary ? getTeamCardSrc(primary) : dashboardAssets.commandCenterBg}
            alt="Command center background"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
            fallbackClassName="hidden"
          />

          <AssetImage
            src={dashboardAssets.commandCenterBg}
            alt="Command center texture"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-34"
            fallbackClassName="hidden"
          />

          <AssetImage
            src={dashboardAssets.coachOwner}
            alt="Coach owner"
            className="pointer-events-none absolute bottom-0 right-[330px] hidden h-56 w-56 object-contain object-bottom opacity-28 xl:block"
            fallbackClassName="hidden"
          />

          {primary ? (
            <div className="pointer-events-none absolute bottom-[-38px] right-6 hidden opacity-22 xl:block">
              <TeamHelmetVisual team={primary} size="card" />
            </div>
          ) : null}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,26,42,0.88),rgba(11,26,42,0.66),rgba(11,26,42,0.92))]" />

          <div className="relative grid grid-cols-1 gap-6 xl:grid-cols-[1fr_480px] xl:items-center">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="gold">
                  <Crown className="mr-1 h-3 w-3" />
                  Owner Dashboard
                </Badge>

                <Badge variant="info">
                  <Shield className="mr-1 h-3 w-3" />
                  {franchises.length} Franchises
                </Badge>

                <Badge variant={nextGame ? "danger" : "success"}>
                  <Radio className="mr-1 h-3 w-3" />
                  {nextGame ? "Game Active" : "Ready"}
                </Badge>
              </div>

              <h1 className="max-w-4xl text-4xl font-black uppercase leading-tight tracking-tight text-white md:text-5xl">
                Franchise Command Center
              </h1>

              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-text-muted md:text-base">
                Manage your teams, enter live simulations, review performance,
                set strategy, invite opponents, and grow your American football
                dynasty.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <Link href="/team-create">
                <Button variant="secondary" className="w-full justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Franchise
                </Button>
              </Link>

              <Link href="/challenge-hub">
                <Button variant="gold" className="w-full justify-center gap-2">
                  <Zap className="h-4 w-4" />
                  Play Now
                </Button>
              </Link>

              <Link href="/games-in-progress">
                <Button variant="primary" className="w-full justify-center gap-2">
                  <Radio className="h-4 w-4" />
                  Watch Live Games
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Franchises"
            value={franchises.length}
            icon={Shield}
            tone="gold"
            subtitle="Owned teams"
            delay={0.02}
          />

          <MetricCard
            label="Recent Games"
            value={recentGames.length}
            icon={Trophy}
            tone="success"
            subtitle="Latest completed games"
            delay={0.05}
          />

          <MetricCard
            label="Crowns Earned"
            value={crownsEarned}
            icon={Crown}
            tone="gold"
            subtitle="From paid games"
            delay={0.08}
          />

          <MetricCard
            label="Active Games"
            value={nextGame ? 1 : 0}
            icon={Activity}
            tone={nextGame ? "danger" : "electric"}
            subtitle={nextGame ? "Action required" : "No active match"}
            delay={0.11}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)]">
          <PrimaryTeamCard team={primary} />
          <NextGamePanel game={nextGame} />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <div className="space-y-6">
            <RecentGamesPanel games={recentGames} />
            <QuickActionsPanel />
          </div>

          <OnlineUsersPanel onInvite={(username) => setInviteUser(username)} />
        </section>

        <SyncImpactPanel syncSummary={syncSummary} />
      </div>
    </AppShell>
  );
}