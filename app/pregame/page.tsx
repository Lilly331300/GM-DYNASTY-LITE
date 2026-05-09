"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  Clock,
  Crown,
  Radio,
  Save,
  Shield,
  SlidersHorizontal,
  Swords,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TeamHelmetVisual } from "@/components/team/TeamHelmetVisual";
import {
  getPregameGamePlan,
  getSimulationPlayers,
  getTeamFromHub,
  savePregameGamePlan,
  toLiveHref,
  updateStoredGame,
  type PregameGamePlan,
  type StoredGame,
} from "@/lib/gameHub";
import { cn } from "@/lib/utils";
import {
  getTeamCardSrc,
  getTeamDisplayName,
  getTeamInitials,
  teamVisualAssets,
  type VisualTeam,
} from "@/lib/teamVisuals";

const PREGAME_COUNTDOWN_SECONDS = 5 * 60;

function formatCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function isAwaitingOpponent(awayId?: string | null) {
  return !awayId || awayId === "awaiting_opponent";
}

function getPlayerName(player: any) {
  return (
    player.name ??
    `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim() ??
    "Unknown Player"
  );
}

function getPlayerOverall(player: any) {
  return Number(player.overallRating ?? player.overall ?? 60);
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

function PlayerMiniCard({ player }: { player: any }) {
  return (
    <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 backdrop-blur">
      <p className="truncate text-xs font-black uppercase text-gold">
        {player.position}
      </p>
      <p className="mt-1 truncate text-sm font-black uppercase text-white">
        {getPlayerName(player)}
      </p>
      <p className="text-xs text-text-muted">
        OVR {getPlayerOverall(player)}
      </p>
    </div>
  );
}

function TeamCard({ team, label }: { team?: VisualTeam | null; label: string }) {
  const players = getSimulationPlayers(team?.id);

  const topPlayers = [...players]
    .sort((a: any, b: any) => getPlayerOverall(b) - getPlayerOverall(a))
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl"
    >
      <AssetImage
        src={team ? getTeamCardSrc(team) : teamVisualAssets.backgrounds.field}
        alt={`${getTeamDisplayName(team ?? undefined)} background`}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
        fallbackClassName="hidden"
      />

      {team ? (
        <div className="pointer-events-none absolute bottom-[-28px] right-[-12px] hidden opacity-12 xl:block">
          <TeamHelmetVisual team={team} size="card" />
        </div>
      ) : null}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.12),transparent_38%),linear-gradient(180deg,rgba(11,26,42,0.72),rgba(11,26,42,0.96))]" />

      <div className="relative">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex h-28 w-32 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-navy-secondary/70 shadow-lg">
            {team ? (
              <TeamHelmet team={team} size="lg" />
            ) : (
              <span className="text-2xl font-black text-white">?</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <Badge variant="gold">{label}</Badge>

            <h2 className="mt-2 whitespace-normal break-words text-2xl font-black uppercase leading-tight text-white">
              {team ? getTeamDisplayName(team) : "Awaiting Opponent"}
            </h2>

            <p className="mt-1 text-sm font-semibold text-text-muted">
              {team
                ? `OVR ${getTeamOverall(team) || "--"} · OFF ${
                    getTeamOffense(team) || "--"
                  } · DEF ${getTeamDefense(team) || "--"} · ${getTeamInitials(
                    team
                  )}`
                : "Challenge must be accepted before kickoff."}
            </p>
          </div>
        </div>

        {team ? (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {topPlayers.length > 0 ? (
              topPlayers.map((player: any) => (
                <PlayerMiniCard key={player.id} player={player} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-navy-border bg-navy-secondary/50 p-4 text-center sm:col-span-3">
                <p className="text-sm font-black uppercase text-white">
                  Roster loading
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Simulation players will appear here when available.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-gold/30 bg-gold/10 p-4 text-center">
            <p className="text-sm font-black uppercase text-gold">
              Waiting for another franchise to accept
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Once accepted, this page becomes a real pregame lobby.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SliderRow({
  label,
  left,
  right,
  value,
  onChange,
}: {
  label: string;
  left: string;
  right: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-black uppercase text-white">
            {label}
          </p>
          <p className="text-xs text-text-muted">
            {left} ↔ {right}
          </p>
        </div>

        <p className="shrink-0 rounded-xl border border-gold/20 bg-gold/10 px-3 py-1 text-sm font-black text-gold">
          {value}%
        </p>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-gold"
      />
    </div>
  );
}

function GamePlanModal({
  plan,
  onClose,
  onSave,
}: {
  plan: PregameGamePlan;
  onClose: () => void;
  onSave: (plan: PregameGamePlan) => void;
}) {
  const [draft, setDraft] = useState<PregameGamePlan>(plan);

  const update = <K extends keyof PregameGamePlan>(
    key: K,
    value: PregameGamePlan[K]
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-navy-border bg-navy-card p-5 shadow-2xl"
      >
        <AssetImage
          src={teamVisualAssets.backgrounds.stadiumFlare}
          alt="Pregame modal glow"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
          fallbackClassName="hidden"
        />

        <div className="relative">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Badge variant="gold">
                <SlidersHorizontal className="mr-1 h-3 w-3" />
                Pregame Override
              </Badge>

              <h2 className="mt-3 text-3xl font-black uppercase text-white">
                Quick Game Plan Edit
              </h2>

              <p className="mt-2 text-sm text-text-muted">
                These changes affect only this upcoming match. Your default
                franchise game plan remains saved separately.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-navy-border bg-navy-secondary p-2 text-text-muted transition hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted">
                  Offense Style
                </p>
                <div className="relative">
                  <select
                    value={draft.offenseStyle}
                    onChange={(event) =>
                      update(
                        "offenseStyle",
                        event.target.value as PregameGamePlan["offenseStyle"]
                      )
                    }
                    className="w-full appearance-none rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 pr-10 text-sm font-bold text-white outline-none"
                  >
                    <option value="balanced">Balanced</option>
                    <option value="run-heavy">Run Heavy</option>
                    <option value="pass-heavy">Pass Heavy</option>
                    <option value="spread">Spread</option>
                    <option value="power">Power</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                </div>
              </div>

              <SliderRow
                label="Run / Pass Balance"
                left="Run"
                right="Pass"
                value={draft.runPassBalance}
                onChange={(value) => update("runPassBalance", value)}
              />

              <SliderRow
                label="Tempo"
                left="Slow"
                right="Fast"
                value={draft.tempo}
                onChange={(value) => update("tempo", value)}
              />

              <SliderRow
                label="4th Down Aggression"
                left="Conservative"
                right="Aggressive"
                value={draft.fourthDownAggression}
                onChange={(value) => update("fourthDownAggression", value)}
              />

              <SliderRow
                label="Red Zone Risk"
                left="Safe"
                right="Aggressive"
                value={draft.redZoneRisk}
                onChange={(value) => update("redZoneRisk", value)}
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted">
                  Defensive Style
                </p>
                <div className="relative">
                  <select
                    value={draft.defensiveStyle}
                    onChange={(event) =>
                      update(
                        "defensiveStyle",
                        event.target.value as PregameGamePlan["defensiveStyle"]
                      )
                    }
                    className="w-full appearance-none rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 pr-10 text-sm font-bold text-white outline-none"
                  >
                    <option value="balanced">Balanced</option>
                    <option value="aggressive">Aggressive</option>
                    <option value="coverage">Coverage</option>
                    <option value="run-stop">Run Stop</option>
                    <option value="bend-dont-break">Bend Don&apos;t Break</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                </div>
              </div>

              <SliderRow
                label="Blitz Frequency"
                left="Less"
                right="More"
                value={draft.blitzFrequency}
                onChange={(value) => update("blitzFrequency", value)}
              />

              <SliderRow
                label="Coverage Depth"
                left="Short"
                right="Deep"
                value={draft.coverageDepth}
                onChange={(value) => update("coverageDepth", value)}
              />

              <SliderRow
                label="Turnover Aggression"
                left="Safe"
                right="Attack Ball"
                value={draft.turnoverAggression}
                onChange={(value) => update("turnoverAggression", value)}
              />

              <SliderRow
                label="Stop Run"
                left="Pass Focus"
                right="Run Focus"
                value={draft.stopRun}
                onChange={(value) => update("stopRun", value)}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="gold"
              className="gap-2"
              onClick={() => onSave(draft)}
            >
              <Save className="h-4 w-4" />
              Save Pregame Override
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ReadyStatusPanel({
  awaitingOpponent,
  homeReady,
  awayReady,
  bothReady,
  countdownExpired,
  countdownText,
  isAiGame,
  onToggleHomeReady,
  onToggleAwayReady,
}: {
  awaitingOpponent: boolean;
  homeReady: boolean;
  awayReady: boolean;
  bothReady: boolean;
  countdownExpired: boolean;
  countdownText: string;
  isAiGame: boolean;
  onToggleHomeReady: () => void;
  onToggleAwayReady: () => void;
}) {
  if (awaitingOpponent) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-5 shadow-xl">
      <AssetImage
        src={teamVisualAssets.backgrounds.stadiumFlare}
        alt="Pregame countdown glow"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
        fallbackClassName="hidden"
      />

      <div className="relative grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px_1fr] xl:items-center">
        <div className="rounded-3xl border border-navy-border bg-navy-card/75 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-text-muted">
            Home Ready
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black uppercase text-white">Your Franchise</p>
              <p className="text-xs text-text-muted">
                {homeReady ? "Ready for kickoff" : "Waiting for confirmation"}
              </p>
            </div>

            <Button
              variant={homeReady ? "gold" : "secondary"}
              className="gap-2"
              onClick={onToggleHomeReady}
            >
              <CheckCircle2 className="h-4 w-4" />
              {homeReady ? "Ready" : "Mark Ready"}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "rounded-3xl border p-5 text-center shadow-lg",
            bothReady
              ? "border-success/30 bg-success/10"
              : countdownExpired
                ? "border-gold/30 bg-gold/10"
                : "border-navy-border bg-navy-card/75"
          )}
        >
          <Clock className="mx-auto mb-2 h-7 w-7 text-gold" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-text-muted">
            Pregame Clock
          </p>

          <p className="mt-2 text-5xl font-black tabular-nums text-white">
            {countdownText}
          </p>

          <p className="mt-2 text-xs font-semibold text-text-muted">
            {bothReady
              ? "Both teams ready. Kickoff unlocked."
              : countdownExpired
                ? "Timer finished. Kickoff unlocked."
                : "Kickoff unlocks when both teams are ready or the timer ends."}
          </p>
        </div>

        <div className="rounded-3xl border border-navy-border bg-navy-card/75 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-text-muted">
            Away Ready
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black uppercase text-white">
                {isAiGame ? "AI Opponent" : "Away Franchise"}
              </p>
              <p className="text-xs text-text-muted">
                {awayReady ? "Ready for kickoff" : "Waiting for confirmation"}
              </p>
            </div>

            <Button
              variant={awayReady ? "gold" : "secondary"}
              className="gap-2"
              disabled={isAiGame}
              onClick={onToggleAwayReady}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isAiGame ? "Auto Ready" : awayReady ? "Ready" : "Mark Ready"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PregamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const gameId = searchParams.get("game") ?? "demo";
  const homeId = searchParams.get("home");
  const awayId = searchParams.get("away");
  const mode = searchParams.get("mode") ?? "pvp";

  const homeTeam = getTeamFromHub(homeId);
  const awayTeam = getTeamFromHub(awayId);

  const awaitingOpponent = isAwaitingOpponent(awayId) || !awayTeam;
  const isAiGame = mode === "ai";

  const [countdownSeconds, setCountdownSeconds] = useState(
    PREGAME_COUNTDOWN_SECONDS
  );

  const [gamePlan, setGamePlan] = useState<PregameGamePlan>(() =>
    getPregameGamePlan(gameId, homeId)
  );
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [homeReady, setHomeReady] = useState(false);
  const [awayReady, setAwayReady] = useState(isAiGame && !awaitingOpponent);
  const [error, setError] = useState("");

  const countdownExpired = countdownSeconds <= 0;
  const bothReady = homeReady && awayReady;
  const canStartGame = !awaitingOpponent && (bothReady || countdownExpired);
  const countdownText = countdownExpired
    ? "00:00"
    : formatCountdown(countdownSeconds);

  const storedGame = useMemo<StoredGame>(
    () => ({
      id: gameId,
      challengeId: gameId,
      homeTeamId: homeId ?? homeTeam?.id ?? "home",
      awayTeamId: awayId ?? awayTeam?.id ?? "awaiting_opponent",
      homeOwnerId: "user",
      awayOwnerId:
        mode === "ai" ? "ai" : awaitingOpponent ? undefined : "opponent",
      status: awaitingOpponent ? "listed" : "pregame",
      matchType: mode === "ai" ? "ai" : "paid",
      opponentType: mode === "ai" ? "ai" : "public",
      stake: mode === "ai" ? 0 : 50,
      predictionsEnabled: true,
      simulationMode: "live",
      createdAt: new Date().toISOString(),
    }),
    [awayId, awaitingOpponent, gameId, homeId, homeTeam?.id, mode]
  );

  const liveHref = toLiveHref(storedGame);

  useEffect(() => {
    if (awaitingOpponent) {
      setAwayReady(false);
      return;
    }

    if (isAiGame) {
      setAwayReady(true);
    }
  }, [awaitingOpponent, isAiGame]);

  useEffect(() => {
    if (awaitingOpponent || bothReady || countdownExpired) return;

    const interval = window.setInterval(() => {
      setCountdownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [awaitingOpponent, bothReady, countdownExpired]);

  const enterLiveGame = () => {
    setError("");

    if (awaitingOpponent) {
      setError(
        "This challenge is still waiting for an opponent. The game can only start after another franchise accepts it."
      );
      return;
    }

    if (!canStartGame) {
      setError(
        "Kickoff is locked. Both teams must mark ready, or the 5-minute pregame countdown must finish."
      );
      return;
    }

    updateStoredGame(gameId, { status: "live" });
    router.push(liveHref);
  };

  const saveOverride = (draft: PregameGamePlan) => {
    savePregameGamePlan(gameId, draft);
    setGamePlan(draft);
    setShowPlanModal(false);
  };

  return (
    <AppShell>
      <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden pb-12">
        {showPlanModal && (
          <GamePlanModal
            plan={gamePlan}
            onClose={() => setShowPlanModal(false)}
            onSave={saveOverride}
          />
        )}

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-navy-border bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.18),transparent_34%),linear-gradient(135deg,#0B1A2A,#101F33_55%,#16283A)] p-5 shadow-2xl md:p-6"
        >
          <AssetImage
            src={
              homeTeam
                ? getTeamCardSrc(homeTeam)
                : teamVisualAssets.backgrounds.commandCenter
            }
            alt="Pregame franchise background"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
            fallbackClassName="hidden"
          />

          <AssetImage
            src={teamVisualAssets.backgrounds.commandCenter}
            alt="Pregame command center"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
            fallbackClassName="hidden"
          />

          {homeTeam ? (
            <div className="pointer-events-none absolute bottom-[-44px] right-8 hidden opacity-18 xl:block">
              <TeamHelmetVisual team={homeTeam} size="card" />
            </div>
          ) : null}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,26,42,0.92),rgba(11,26,42,0.72),rgba(11,26,42,0.94))]" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="gold">
                  <Clock className="mr-1 h-3 w-3" />
                  {awaitingOpponent ? "Awaiting Opponent" : "Pregame Lobby"}
                </Badge>

                <Badge variant="info">
                  <Users className="mr-1 h-3 w-3" />
                  {mode.toUpperCase()}
                </Badge>

                <Badge
                  variant={
                    awaitingOpponent
                      ? "gold"
                      : bothReady
                        ? "success"
                        : countdownExpired
                          ? "gold"
                          : "info"
                  }
                >
                  {awaitingOpponent
                    ? "Not Ready"
                    : bothReady
                      ? "Both Ready"
                      : countdownExpired
                        ? "Timer Expired"
                        : "Waiting"}
                </Badge>
              </div>

              <h1 className="text-3xl font-black uppercase text-white md:text-4xl">
                {awaitingOpponent ? "Challenge Listed" : "Pregame Setup"}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-text-muted">
                {awaitingOpponent
                  ? "This match cannot start yet. Another franchise must accept the challenge first."
                  : "Review both teams, confirm readiness, and make a final game plan override before kickoff."}
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 xl:max-w-[560px]">
              <Button
                variant="secondary"
                className="gap-2"
                disabled={awaitingOpponent}
                onClick={() => setShowPlanModal(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Quick Edit
              </Button>

              <Button
                variant={homeReady ? "gold" : "secondary"}
                className="gap-2"
                disabled={awaitingOpponent}
                onClick={() => setHomeReady((current) => !current)}
              >
                <CheckCircle2 className="h-4 w-4" />
                {homeReady ? "Ready" : "Mark Ready"}
              </Button>

              <Button
                variant="gold"
                className="gap-2"
                disabled={awaitingOpponent || !canStartGame}
                onClick={enterLiveGame}
              >
                <Radio className="h-4 w-4" />
                {canStartGame ? "Start Game" : "Locked"}
              </Button>
            </div>
          </div>
        </motion.section>

        <ReadyStatusPanel
          awaitingOpponent={awaitingOpponent}
          homeReady={homeReady}
          awayReady={awayReady}
          bothReady={bothReady}
          countdownExpired={countdownExpired}
          countdownText={countdownText}
          isAiGame={isAiGame}
          onToggleHomeReady={() => setHomeReady((current) => !current)}
          onToggleAwayReady={() => setAwayReady((current) => !current)}
        />

        {error ? (
          <section className="rounded-3xl border border-danger/30 bg-danger/10 p-5 text-danger shadow-xl">
            <p className="font-black uppercase">Kickoff blocked</p>
            <p className="mt-1 text-sm">{error}</p>
          </section>
        ) : null}

        {awaitingOpponent ? (
          <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-5 shadow-xl">
            <AssetImage
              src={teamVisualAssets.backgrounds.stadiumFlare}
              alt="Awaiting opponent glow"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
              fallbackClassName="hidden"
            />

            <div className="relative flex items-start gap-3">
              <Swords className="mt-1 h-5 w-5 shrink-0 text-gold" />
              <div>
                <p className="font-black uppercase text-white">
                  Waiting for challenge acceptance
                </p>
                <p className="mt-1 text-sm leading-6 text-text-muted">
                  Your franchise has listed this game. Once another franchise
                  accepts it from the Challenge Hub, both teams will enter the
                  real pregame lobby and the game can begin.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/challenge-hub">
                    <Button variant="gold" className="gap-2">
                      <Swords className="h-4 w-4" />
                      Open Challenge Hub
                    </Button>
                  </Link>

                  <Link href="/dashboard">
                    <Button variant="secondary">Back to Dashboard</Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_160px_1fr] xl:items-stretch">
          <TeamCard team={homeTeam} label="Home Franchise" />

          <div className="relative flex items-center justify-center overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-5 text-center shadow-xl">
            <AssetImage
              src={teamVisualAssets.backgrounds.stadiumFlare}
              alt="Pregame versus glow"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-18"
              fallbackClassName="hidden"
            />

            <div className="relative">
              <Swords className="mx-auto mb-3 h-8 w-8 text-gold" />
              <p className="text-4xl font-black text-gold">VS</p>
              <p className="mt-3 text-xs font-black uppercase tracking-widest text-text-muted">
                {awaitingOpponent ? "Status" : "Starts In"}
              </p>
              <p className="mt-1 text-sm font-black text-white">
                {awaitingOpponent
                  ? "Awaiting Opponent"
                  : bothReady
                    ? "Both Ready"
                    : countdownExpired
                      ? "Ready Now"
                      : countdownText}
              </p>
            </div>
          </div>

          <TeamCard team={awayTeam} label="Away Franchise" />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
            <Crown className="mb-3 h-7 w-7 text-gold" />
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Offensive Identity
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase text-white">
              {gamePlan.offenseStyle}
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Run/pass balance: {gamePlan.runPassBalance}%
            </p>
          </div>

          <div className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
            <Shield className="mb-3 h-7 w-7 text-success" />
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Defensive Identity
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase text-white">
              {gamePlan.defensiveStyle}
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Blitz frequency: {gamePlan.blitzFrequency}%
            </p>
          </div>

          <div className="rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
            <Activity className="mb-3 h-7 w-7 text-electric" />
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Game Engine Bridge
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase text-white">
              {awaitingOpponent
                ? "Waiting"
                : canStartGame
                  ? "Kickoff Unlocked"
                  : "Countdown Active"}
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              {awaitingOpponent
                ? "Engine connection activates after challenge acceptance."
                : canStartGame
                  ? "Live game can now read saved game plan and depth chart starters."
                  : "Kickoff unlocks when both teams mark ready or the 5-minute timer ends."}
            </p>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-5 shadow-xl">
          <AssetImage
            src={teamVisualAssets.backgrounds.field}
            alt="Pregame notes field"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
            fallbackClassName="hidden"
          />

          <div className="relative flex items-start gap-3">
            <Zap className="mt-1 h-5 w-5 shrink-0 text-gold" />
            <p className="text-sm leading-6 text-text-muted">
              Pregame has a 5-minute countdown. If both teams mark ready before
              the timer ends, kickoff unlocks immediately. If the timer expires,
              the game can also begin.
            </p>
          </div>
        </section>

        <Link href="/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    </AppShell>
  );
}