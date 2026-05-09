"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BarChart3,
  Crown,
  Eye,
  MessageCircle,
  Radio,
  Shield,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Scoreboard } from "@/components/football/Scoreboard";
import { FieldVisualization } from "@/components/football/FieldVisualization";
import { PlayByPlay } from "@/components/football/PlayByPlay";
import { DriveSummary } from "@/components/football/DriveSummary";
import { MomentumIndicator } from "@/components/football/MomentumIndicator";
import { GameControls } from "@/components/game/GameControls";
import {
  SimulationSpeed,
  type SimulationSpeedValue,
} from "@/components/game/SimulationSpeed";
import { PredictionPanel } from "@/components/game/PredictionPanel";
import { SpectatorInfo } from "@/components/game/SpectatorInfo";
import { TeamHelmetVisual } from "@/components/team/TeamHelmetVisual";
import { mockGamePlan, mockPlayers, mockTeams } from "@/lib/mockData";
import { TeamGameStats } from "@/lib/types";
import {
  SimulationState,
  createInitialState,
  getWinProbability,
  simulateNextPlay,
} from "@/lib/simulation";
import { cn } from "@/lib/utils";
import {
  buildGamePlanFromPregame,
  getTeamFromHub,
  markGameCompleted,
  updateStoredGame,
} from "@/lib/gameHub";
import { saveCompletedGame } from "@/lib/gameResults";
import {
  getTeamCardSrc,
  getTeamDisplayName,
  getTeamInitials,
  teamVisualAssets,
  type VisualTeam,
} from "@/lib/teamVisuals";

const speedDelay: Record<SimulationSpeedValue, number> = {
  normal: 1800,
  fast: 900,
  skip: 400,
};

const mockChat = [
  { id: 1, user: "CoachRay", text: "That 3rd down call was risky." },
  { id: 2, user: "GridironQueen", text: "This matchup is getting serious." },
  { id: 3, user: "ScoutLab", text: "Watch the left edge pressure." },
];

function getTeamOverall(team?: VisualTeam) {
  return Number(team?.overallRating ?? 0);
}

function getTeamOffense(team?: VisualTeam) {
  return Number(team?.offensiveRating ?? 0);
}

function getTeamDefense(team?: VisualTeam) {
  return Number(team?.defensiveRating ?? 0);
}

function getTeamAbbreviation(team?: VisualTeam) {
  return team?.abbreviation ?? getTeamInitials(team);
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

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-card/80 p-4 text-center backdrop-blur">
      <p className="truncate text-xs font-black uppercase tracking-widest text-text-muted">
        {label}
      </p>
      <p className="mt-2 truncate text-2xl font-black tabular-nums text-white">
        {value}
      </p>
    </div>
  );
}

function BroadcastTeamCard({
  team,
  score,
  side,
  possession,
}: {
  team?: VisualTeam;
  score: number;
  side: "home" | "away";
  possession: boolean;
}) {
  return (
    <div
      className={cn(
        "relative min-w-0 max-w-full overflow-hidden rounded-3xl border bg-navy-card/75 p-4 shadow-xl backdrop-blur",
        possession ? "border-gold/45 shadow-gold/10" : "border-navy-border"
      )}
    >
      <AssetImage
        src={getTeamCardSrc(team)}
        alt={`${getTeamDisplayName(team)} card`}
        className={cn(
          "pointer-events-none absolute top-0 h-full w-52 object-cover opacity-14",
          side === "home" ? "right-0" : "left-0"
        )}
        fallbackClassName="hidden"
      />

      <div
        className={cn(
          "pointer-events-none absolute bottom-[-26px] opacity-10",
          side === "home" ? "right-[-24px]" : "left-[-24px]"
        )}
      >
        <TeamHelmetVisual team={team} size="card" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.10),transparent_34%)]" />

      <div
        className={cn(
          "relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3",
          side === "away" && "grid-cols-[auto_minmax(0,1fr)_auto]"
        )}
      >
        {side === "home" ? <TeamHelmet team={team} size="lg" /> : null}

        {side === "away" ? (
          <div className="shrink-0 rounded-3xl border border-gold/30 bg-gold/10 px-4 py-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gold">
              Score
            </p>
            <p className="text-3xl font-black tabular-nums text-white md:text-4xl">
              {score}
            </p>
          </div>
        ) : null}

        <div className={cn("min-w-0", side === "away" && "text-right")}>
          <div
            className={cn(
              "mb-2 flex flex-wrap items-center gap-2",
              side === "away" && "justify-end"
            )}
          >
            <span className="rounded-full border border-gold/20 bg-gold/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-gold">
              {side === "home" ? "Home" : "Away"}
            </span>

            {possession ? (
              <span className="rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-success">
                Possession
              </span>
            ) : null}
          </div>

          <p className="break-words text-lg font-black uppercase leading-tight text-white md:text-2xl">
            {getTeamDisplayName(team)}
          </p>

          <p className="mt-1 break-words text-xs font-semibold text-text-muted">
            {getTeamAbbreviation(team)} · OVR {getTeamOverall(team) || "--"} ·
            OFF {getTeamOffense(team) || "--"} · DEF{" "}
            {getTeamDefense(team) || "--"}
          </p>
        </div>

        {side === "home" ? (
          <div className="shrink-0 rounded-3xl border border-gold/30 bg-gold/10 px-4 py-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gold">
              Score
            </p>
            <p className="text-3xl font-black tabular-nums text-white md:text-4xl">
              {score}
            </p>
          </div>
        ) : null}

        {side === "away" ? <TeamHelmet team={team} size="lg" /> : null}
      </div>
    </div>
  );
}

function BroadcastMatchHeader({
  homeTeam,
  awayTeam,
  state,
  matchType,
  isSpectator,
  wasSkipped,
}: {
  homeTeam: VisualTeam;
  awayTeam: VisualTeam;
  state: SimulationState;
  matchType: "pvp" | "ai";
  isSpectator: boolean;
  wasSkipped: boolean;
}) {
  const possessionTeamId = String((state as any).possessionTeamId ?? "");
  const homePossession =
    possessionTeamId === homeTeam.id ||
    (!possessionTeamId && state.possession === "home");
  const awayPossession =
    possessionTeamId === awayTeam.id ||
    (!possessionTeamId && state.possession === "away");

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-full overflow-hidden rounded-3xl border border-navy-border bg-[linear-gradient(135deg,#0B1A2A,#101F33_55%,#16283A)] p-5 shadow-2xl md:p-6"
    >
      <AssetImage
        src={getTeamCardSrc(homeTeam)}
        alt="Live game franchise background"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-18"
        fallbackClassName="hidden"
      />

      <AssetImage
        src={teamVisualAssets.backgrounds.commandCenter}
        alt="Live game command center"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
        fallbackClassName="hidden"
      />

      <div className="pointer-events-none absolute bottom-[-46px] right-8 hidden opacity-16 xl:block">
        <TeamHelmetVisual team={homeTeam} size="card" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.18),transparent_34%),linear-gradient(90deg,rgba(11,26,42,0.90),rgba(11,26,42,0.70),rgba(11,26,42,0.94))]" />

      <div className="relative min-w-0 max-w-full">
        <div className="mx-auto mb-6 flex w-full max-w-5xl flex-col items-center justify-center text-center">
          <div className="mb-3 flex w-full max-w-4xl flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-danger">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              {state.isFinished
                ? "Final"
                : isSpectator
                  ? "Spectating"
                  : "Live Match"}
            </span>

            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-gold">
              MVP Crowns Stake: {matchType === "pvp" ? 50 : 0}
            </span>

            <span className="rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-electric">
              {matchType.toUpperCase()} · 4 Quarters
            </span>

            {wasSkipped ? (
              <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-success">
                Engine-resolved finish
              </span>
            ) : null}
          </div>

          <h1 className="mx-auto w-full max-w-4xl break-words text-center text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
            {getTeamDisplayName(homeTeam)} vs {getTeamDisplayName(awayTeam)}
          </h1>

          <p className="mx-auto mt-3 w-full max-w-2xl text-center text-sm font-medium leading-6 text-text-muted md:text-base">
            Live simulation between selected teams. Completed games are saved to
            game history and box score automatically.
          </p>

          <div className="mx-auto mt-5 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Quarter" value={`Q${state.quarter}`} />
            <StatTile label="Plays" value={state.plays.length} />
            <StatTile label="Viewers" value={247 + state.plays.length * 9} />
            <StatTile label="Type" value={matchType.toUpperCase()} />
          </div>
        </div>

        <div className="grid min-w-0 max-w-full grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_100px_minmax(0,1fr)] xl:items-center">
          <BroadcastTeamCard
            team={homeTeam}
            score={state.homeScore}
            side="home"
            possession={homePossession}
          />

          <div className="rounded-3xl border border-gold/30 bg-gold/10 p-4 text-center shadow-lg shadow-gold/10">
            <p className="text-4xl font-black text-gold">VS</p>
            <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-text-muted">
              Live
            </p>
          </div>

          <BroadcastTeamCard
            team={awayTeam}
            score={state.awayScore}
            side="away"
            possession={awayPossession}
          />
        </div>
      </div>
    </motion.section>
  );
}

function getRedZoneText(stats: TeamGameStats) {
  const value = Number((stats as any).redZoneScores ?? 0);
  return value;
}

function TeamStatsComparison({
  homeStats,
  awayStats,
}: {
  homeStats: TeamGameStats;
  awayStats: TeamGameStats;
}) {
  const rows = [
    ["Total Yards", homeStats.totalYards, awayStats.totalYards],
    ["Passing", homeStats.passingYards, awayStats.passingYards],
    ["Rushing", homeStats.rushingYards, awayStats.rushingYards],
    ["First Downs", homeStats.firstDowns, awayStats.firstDowns],
    ["Red Zone Scores", getRedZoneText(homeStats), getRedZoneText(awayStats)],
    ["Turnovers", homeStats.turnovers, awayStats.turnovers],
    ["Penalties", homeStats.penalties, awayStats.penalties],
    ["Penalty Yards", homeStats.penaltyYards, awayStats.penaltyYards],
    ["Sacks Made", homeStats.sacksMade, awayStats.sacksMade],
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-4 shadow-xl">
      <AssetImage
        src={teamVisualAssets.backgrounds.stadiumFlare}
        alt="Team stats glow"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-18"
        fallbackClassName="hidden"
      />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Team Stats
            </p>
            <h3 className="text-xl font-black uppercase text-white">
              Control Room Data
            </h3>
          </div>

          <BarChart3 className="h-6 w-6 text-gold" />
        </div>

        <div className="space-y-2">
          {rows.map(([label, home, away]) => (
            <div
              key={String(label)}
              className="grid grid-cols-[70px_1fr_70px] items-center gap-3 rounded-xl border border-navy-border bg-navy-secondary/60 px-3 py-2"
            >
              <p className="text-lg font-black tabular-nums text-white">
                {home}
              </p>
              <p className="text-center text-xs font-black uppercase tracking-wide text-text-muted">
                {label}
              </p>
              <p className="text-right text-lg font-black tabular-nums text-white">
                {away}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkipRequestModal({
  onCancel,
  onAccept,
}: {
  onCancel: () => void;
  onAccept: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-lg rounded-3xl border border-gold/30 bg-navy-card p-6 shadow-2xl"
        >
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
            Skip Request Sent
          </p>

          <h3 className="mt-2 text-3xl font-black uppercase text-white">
            Awaiting Opponent Approval
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            In PvP, the other player must approve before the engine resolves the
            remaining game.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" className="w-full" onClick={onCancel}>
              Keep Watching
            </Button>

            <Button variant="gold" className="w-full" onClick={onAccept}>
              Mock Opponent Accepts
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ReplayModal({
  state,
  onClose,
}: {
  state: SimulationState;
  onClose: () => void;
}) {
  const plays = [...state.plays].slice(-16).reverse();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-3xl rounded-3xl border border-electric/30 bg-navy-card p-6 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-electric">
                Match Replay
              </p>
              <h3 className="mt-2 text-3xl font-black uppercase text-white">
                Key Broadcast Moments
              </h3>
            </div>

            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="mt-5 max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {plays.map((play) => (
              <div
                key={play.id}
                className="rounded-2xl border border-navy-border bg-navy-secondary p-4"
              >
                <p className="text-xs font-black uppercase text-text-muted">
                  Q{play.quarter} · {play.time} · {play.down} &{" "}
                  {play.distance}
                </p>
                <p className="mt-1 text-lg font-black uppercase text-white">
                  {play.result}
                </p>
                <p className="text-sm text-text-muted">{play.commentary}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function LiveChatPopup({
  isOpen,
  onClose,
  unreadCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockChat);

  const sendMessage = () => {
    if (!message.trim()) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        user: "You",
        text: message.trim(),
      },
    ]);

    setMessage("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.section
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 28, scale: 0.94 }}
          transition={{ duration: 0.22 }}
          className="fixed bottom-24 right-4 z-[65] w-[calc(100vw-2rem)] max-w-[390px] rounded-3xl border border-navy-border bg-white p-4 text-navy-primary shadow-2xl md:bottom-6 md:right-6"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-electric/10">
                <MessageCircle className="h-5 w-5 text-electric" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Live Chat
                </p>
                <h3 className="text-lg font-black uppercase">Spectator Box</h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              aria-label="Close live chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
            {messages.map((chat) => (
              <div key={chat.id} className="rounded-xl bg-white p-3 shadow-sm">
                <p className="text-xs font-black uppercase text-electric">
                  {chat.user}
                </p>
                <p className="text-sm font-semibold text-slate-600">
                  {chat.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
              placeholder="Send a quick reaction..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:border-electric"
            />

            <Button variant="primary" size="sm" onClick={sendMessage}>
              Send
            </Button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

function FloatingChatButton({
  onClick,
  unreadCount,
}: {
  onClick: () => void;
  unreadCount: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-4 z-[60] flex items-center gap-3 rounded-2xl border border-electric/30 bg-navy-card px-4 py-3 text-white shadow-2xl transition hover:-translate-y-0.5 hover:border-electric/60 md:right-6"
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-electric/15">
        <MessageCircle className="h-5 w-5 text-electric" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </span>

      <span className="hidden text-left sm:block">
        <span className="block text-xs font-black uppercase tracking-widest text-text-muted">
          Spectator
        </span>
        <span className="block text-sm font-black uppercase">Open Chat</span>
      </span>
    </button>
  );
}

function EventPopup({ state }: { state: SimulationState }) {
  const lastPlay = state.plays[state.plays.length - 1];

  if (!lastPlay || (!lastPlay.isScore && !lastPlay.isTurnover)) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key={lastPlay.id}
        initial={{ opacity: 0, y: -18, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -18 }}
        className={cn(
          "fixed left-1/2 top-24 z-50 w-[min(520px,92vw)] -translate-x-1/2 rounded-2xl border px-5 py-4 text-center shadow-2xl backdrop-blur",
          lastPlay.isScore
            ? "border-gold/50 bg-gold/20 text-gold"
            : "border-danger/50 bg-danger/20 text-danger"
        )}
      >
        <p className="text-xs font-black uppercase tracking-[0.3em]">
          {lastPlay.isScore ? "Scoring Alert" : "Turnover Alert"}
        </p>

        <p className="mt-1 text-2xl font-black uppercase text-white">
          {lastPlay.result}
        </p>

        <p className="text-sm font-semibold text-white/80">
          {lastPlay.commentary}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}

export default function LiveGamePage() {
  const searchParams = useSearchParams();

  const gameId = searchParams.get("game");
  const homeTeamId = searchParams.get("home");
  const awayTeamId = searchParams.get("away");
  const modeParam = searchParams.get("mode");
  const isSpectator = searchParams.get("spectator") === "1";

  const matchType: "pvp" | "ai" = modeParam === "ai" ? "ai" : "pvp";

  const homeTeam = getTeamFromHub(homeTeamId) ?? mockTeams[0];
  const awayTeam = getTeamFromHub(awayTeamId) ?? mockTeams[1] ?? mockTeams[0];

  const homePlayers = useMemo(() => {
    const directPlayers = mockPlayers.filter(
      (player) => player.teamId === homeTeam.id
    );

    if (directPlayers.length > 0) return directPlayers;

    return mockPlayers
      .filter((player) => player.teamId === mockTeams[0].id)
      .map((player) => ({
        ...player,
        id: `home_${homeTeam.id}_${player.id}`,
        teamId: homeTeam.id,
        overallRating: Math.max(
          45,
          Math.min(95, player.overallRating + homeTeam.overallRating - 60)
        ),
      }));
  }, [homeTeam]);

  const awayPlayers = useMemo(() => {
    const directPlayers = mockPlayers.filter(
      (player) => player.teamId === awayTeam.id
    );

    if (directPlayers.length > 0) return directPlayers;

    return mockPlayers
      .filter((player) => player.teamId === mockTeams[0].id)
      .map((player) => ({
        ...player,
        id: `away_${awayTeam.id}_${player.id}`,
        teamId: awayTeam.id,
        overallRating: Math.max(
          45,
          Math.min(95, player.overallRating + awayTeam.overallRating - 60)
        ),
      }));
  }, [awayTeam]);

  const homeLiveGamePlan = useMemo(
    () => buildGamePlanFromPregame(gameId, mockGamePlan, homeTeam.id),
    [gameId, homeTeam.id]
  );

  const awayLiveGamePlan = useMemo(
    () =>
      buildGamePlanFromPregame(
        gameId,
        {
          ...mockGamePlan,
          teamId: awayTeam.id,
        },
        awayTeam.id
      ),
    [gameId, awayTeam.id]
  );

  const [state, setState] = useState<SimulationState>(() =>
    createInitialState(homeTeam.id, awayTeam.id)
  );

  const [speed, setSpeed] = useState<SimulationSpeedValue>("normal");
  const [skipRequested, setSkipRequested] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [wasSkipped, setWasSkipped] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [completionMarked, setCompletionMarked] = useState(false);
  const [completedGameId, setCompletedGameId] = useState<string | null>(null);

  const lastPlay = state.plays[state.plays.length - 1];
  const unreadChatCount = chatOpen ? 0 : 3;

  const homeWinProbability = getWinProbability(
    state.homeScore,
    state.awayScore,
    state.quarter,
    state.timeRemaining
  );

  useEffect(() => {
    if (!gameId || gameId === "demo" || isSpectator) return;

    updateStoredGame(gameId, { status: "live" });
  }, [gameId, isSpectator]);

  useEffect(() => {
    setState(createInitialState(homeTeam.id, awayTeam.id));
    setCompletionMarked(false);
    setCompletedGameId(null);
  }, [homeTeam.id, awayTeam.id]);

  const simulatePlay = () => {
    setState((current) => {
      if (current.isFinished) return current;

      return simulateNextPlay(
        current,
        homeTeam,
        awayTeam,
        homePlayers,
        awayPlayers,
        homeLiveGamePlan,
        awayLiveGamePlan
      ).newState;
    });
  };

  const resolveRemainingGame = () => {
    if (isSpectator) return;

    setWasSkipped(true);
    setShowSkipModal(false);

    setState((current) => {
      let resolved = current;

      for (let index = 0; index < 55; index += 1) {
        if (resolved.isFinished) break;

        resolved = simulateNextPlay(
          resolved,
          homeTeam,
          awayTeam,
          homePlayers,
          awayPlayers,
          homeLiveGamePlan,
          awayLiveGamePlan
        ).newState;
      }

      return {
        ...resolved,
        isFinished: true,
        quarter: 4,
        timeRemaining: 0,
      };
    });
  };

  useEffect(() => {
    if (state.isFinished) return;

    const timer = window.setTimeout(() => {
      simulatePlay();
    }, speedDelay[speed]);

    return () => window.clearTimeout(timer);
  }, [speed, state]);

  useEffect(() => {
    if (!state.isFinished || completionMarked || isSpectator) return;

    const completed = saveCompletedGame({
      sourceGameId: gameId,
      homeTeam,
      awayTeam,
      homePlayers,
      awayPlayers,
      state,
      matchType,
      stake: matchType === "pvp" ? 50 : 0,
      wasSkipped,
    });

    setCompletedGameId(completed.id);
    markGameCompleted(gameId);
    setCompletionMarked(true);
  }, [
    state.isFinished,
    completionMarked,
    isSpectator,
    gameId,
    homeTeam,
    awayTeam,
    homePlayers,
    awayPlayers,
    state,
    matchType,
    wasSkipped,
  ]);

  const resetGame = () => {
    setState(createInitialState(homeTeam.id, awayTeam.id));
    setSkipRequested(false);
    setShowSkipModal(false);
    setShowReplay(false);
    setInviteCopied(false);
    setWasSkipped(false);
    setChatOpen(false);
    setCompletionMarked(false);
    setCompletedGameId(null);
  };

  const endAiGame = () => {
    if (matchType !== "ai" || isSpectator) return;
    resolveRemainingGame();
  };

  const requestSkip = () => {
    if (isSpectator) return;

    setSkipRequested(true);
    setShowSkipModal(true);
  };

  const copyInvite = async () => {
    const inviteLink =
      typeof window === "undefined"
        ? `/live-game?game=${gameId ?? "demo"}`
        : window.location.href;

    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      console.log(inviteLink);
    }

    setInviteCopied(true);

    window.setTimeout(() => {
      setInviteCopied(false);
    }, 2200);
  };

  const winner =
    state.homeScore === state.awayScore
      ? null
      : state.homeScore > state.awayScore
        ? homeTeam
        : awayTeam;

  return (
    <AppShell>
      <div className="min-h-screen max-w-full space-y-6 overflow-x-hidden pb-24">
        <EventPopup state={state} />

        <FloatingChatButton
          onClick={() => setChatOpen(true)}
          unreadCount={unreadChatCount}
        />

        <LiveChatPopup
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          unreadCount={unreadChatCount}
        />

        {showSkipModal && (
          <SkipRequestModal
            onCancel={() => setShowSkipModal(false)}
            onAccept={resolveRemainingGame}
          />
        )}

        {showReplay && (
          <ReplayModal state={state} onClose={() => setShowReplay(false)} />
        )}

        <BroadcastMatchHeader
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          state={state}
          matchType={matchType}
          isSpectator={isSpectator}
          wasSkipped={wasSkipped}
        />

        <Scoreboard homeTeam={homeTeam} awayTeam={awayTeam} state={state} />

        <div className="grid min-w-0 max-w-full grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 space-y-6">
            <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-4 shadow-xl">
              <AssetImage
                src={teamVisualAssets.backgrounds.field}
                alt="Live game field background"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-16"
                fallbackClassName="hidden"
              />

              <div className="relative min-w-0 max-w-full">
                <FieldVisualization
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  state={state}
                  lastPlay={lastPlay}
                />
              </div>
            </section>

            {lastPlay && (
              <motion.div
                key={lastPlay.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-navy-border bg-navy-card px-4 py-3 shadow-xl"
              >
                <p className="text-xs font-black uppercase tracking-widest text-gold">
                  Quick Subtitle
                </p>
                <p className="mt-1 text-sm font-semibold text-white md:text-base">
                  Q{lastPlay.quarter} · {lastPlay.time} —{" "}
                  {lastPlay.commentary}
                </p>
              </motion.div>
            )}

            {!isSpectator ? (
              <GameControls
                matchType={matchType}
                isFinished={state.isFinished}
                skipRequested={skipRequested}
                replayAvailable={state.isFinished || state.plays.length > 4}
                inviteCopied={inviteCopied}
                onRequestSkip={requestSkip}
                onEndAiGame={endAiGame}
                onWatchReplay={() => setShowReplay(true)}
                onCopyInvite={copyInvite}
                onResetDemo={resetGame}
              />
            ) : (
              <div className="rounded-2xl border border-navy-border bg-navy-card p-5 shadow-xl">
                <div className="mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-gold" />
                  <h3 className="text-xl font-black uppercase text-white">
                    Spectator Mode
                  </h3>
                </div>

                <p className="text-sm text-text-muted">
                  You are watching only. You can chat and follow the broadcast,
                  but game controls are disabled.
                </p>

                <Button variant="secondary" className="mt-4 gap-2" disabled>
                  Predict Coming Soon
                </Button>
              </div>
            )}

            <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
              <DriveSummary
                state={state}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
              />

              <MomentumIndicator
                momentum={state.momentum}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
              />
            </div>

            <TeamStatsComparison
              homeStats={state.homeStats}
              awayStats={state.awayStats}
            />
          </div>

          <aside className="min-w-0 space-y-6">
            <PlayByPlay
              plays={state.plays}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />

            <SimulationSpeed value={speed} onChange={setSpeed} />

            <PredictionPanel
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              homeWinProbability={homeWinProbability}
              spectators={state.isFinished ? 1884 : 247 + state.plays.length * 9}
              pool={1250 + state.plays.length * 12}
            />

            <SpectatorInfo spectators={247 + state.plays.length * 9} peak={1982} />
          </aside>
        </div>

        {state.isFinished && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-gold/15 via-navy-card to-navy-secondary p-6 shadow-2xl"
          >
            <AssetImage
              src={winner ? getTeamCardSrc(winner) : teamVisualAssets.backgrounds.field}
              alt="Final result background"
              className="pointer-events-none absolute right-0 top-0 hidden h-full w-[360px] object-cover opacity-16 xl:block"
              fallbackClassName="hidden"
            />

            {winner ? (
              <div className="pointer-events-none absolute bottom-[-42px] right-8 hidden opacity-18 xl:block">
                <TeamHelmetVisual team={winner} size="card" />
              </div>
            ) : null}

            <div className="relative">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-gold">
                    <Trophy className="h-4 w-4" />
                    Final Result
                  </p>

                  <div className="mt-4 flex min-w-0 items-center gap-4">
                    {winner ? <TeamHelmet team={winner} size="lg" /> : null}

                    <div className="min-w-0">
                      <h2 className="break-words text-3xl font-black uppercase leading-tight text-white md:text-5xl">
                        {winner
                          ? `${getTeamDisplayName(winner)} Win`
                          : "Game Drawn"}
                      </h2>

                      <p className="mt-2 text-text-muted">
                        Final score: {getTeamAbbreviation(homeTeam)}{" "}
                        {state.homeScore} - {state.awayScore}{" "}
                        {getTeamAbbreviation(awayTeam)}
                      </p>

                      {!isSpectator && (
                        <p className="mt-2 text-sm text-success">
                          Game saved to history. Teams are free for another
                          match.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 text-gold">
                    <Crown className="mb-2 h-5 w-5" />
                    <p className="text-xs font-black uppercase">Reward</p>
                    <p className="text-2xl font-black">
                      {matchType === "pvp" ? 95 : 0}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-electric/30 bg-electric/10 p-4 text-electric">
                    <Activity className="mb-2 h-5 w-5" />
                    <p className="text-xs font-black uppercase">Plays</p>
                    <p className="text-2xl font-black">{state.plays.length}</p>
                  </div>

                  <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-success">
                    <Shield className="mb-2 h-5 w-5" />
                    <p className="text-xs font-black uppercase">Fee</p>
                    <p className="text-2xl font-black">
                      {matchType === "pvp" ? "5%" : "0%"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {!isSpectator && (
                  <Link
                    href={`/box-score${
                      completedGameId ? `?game=${completedGameId}` : ""
                    }`}
                  >
                    <Button variant="gold" className="gap-2">
                      <Crown className="h-4 w-4" />
                      Open Post-game Analysis
                    </Button>
                  </Link>
                )}

                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => setShowReplay(true)}
                >
                  <Zap className="h-4 w-4" />
                  Watch Replay
                </Button>

                <Link href="/challenge-hub">
                  <Button variant="secondary" className="gap-2">
                    <Users className="h-4 w-4" />
                    Play Another Game
                  </Button>
                </Link>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </AppShell>
  );
}