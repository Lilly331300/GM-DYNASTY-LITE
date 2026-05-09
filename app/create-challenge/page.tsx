"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  CalendarClock,
  ChevronDown,
  Clock,
  Crown,
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
  createChallengeGame,
  createAiInstantGame,
  getTeamBusyReason,
  getUserFranchises,
  isTeamBusy,
  toPregameHref,
  type StoredFranchiseTeam,
} from "@/lib/gameHub";
import { cn, formatRecord } from "@/lib/utils";
import {
  getTeamCardSrc,
  getTeamDisplayName,
  getTeamInitials,
  teamVisualAssets,
} from "@/lib/teamVisuals";

type MatchType = "free" | "paid";
type OpponentType = "public" | "invite" | "ai";
type ScheduleMode = "instant" | "scheduled";
type AiDifficulty = "easy" | "medium" | "hard" | "elite";

function getTomorrowIsoLocal() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getAiStake(difficulty: AiDifficulty) {
  if (difficulty === "easy") return 0;
  if (difficulty === "medium") return 25;
  if (difficulty === "hard") return 50;
  return 100;
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
  team?: StoredFranchiseTeam;
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

function TeamOptionCard({
  team,
  selected,
  busy,
  onClick,
}: {
  team: StoredFranchiseTeam;
  selected: boolean;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      disabled={busy}
      onClick={onClick}
      whileHover={busy ? undefined : { y: -3 }}
      className={cn(
        "relative w-full min-w-0 overflow-hidden rounded-3xl border p-5 text-left shadow-xl transition",
        selected
          ? "border-gold/60 bg-gold/10 shadow-gold/10"
          : "border-navy-border bg-navy-card hover:border-gold/35",
        busy && "cursor-not-allowed opacity-50"
      )}
    >
      <AssetImage
        src={getTeamCardSrc(team)}
        alt={`${getTeamDisplayName(team)} card background`}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
        fallbackClassName="hidden"
      />

      <div className="pointer-events-none absolute bottom-[-30px] right-[-24px] opacity-12">
        <TeamHelmetVisual team={team} size="card" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.12),transparent_36%),linear-gradient(180deg,rgba(11,26,42,0.64),rgba(11,26,42,0.96))]" />

      <div className="relative">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-navy-primary/70 shadow-lg">
            <TeamHelmet team={team} size="md" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap gap-2">
              {selected ? <Badge variant="gold">Selected</Badge> : null}
              <Badge variant={busy ? "danger" : "success"}>
                {busy ? "Busy" : "Ready"}
              </Badge>
              <Badge variant="info">{getTeamInitials(team)}</Badge>
            </div>

            <p className="break-words text-lg font-black uppercase leading-tight text-white">
              {getTeamDisplayName(team)}
            </p>

            <p className="mt-1 text-sm text-text-muted">
              {formatRecord(
                team.record.wins,
                team.record.losses,
                team.record.ties
              )}{" "}
              · OVR {team.overallRating}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-navy-border bg-navy-card/75 p-2 text-center">
            <p className="text-[10px] font-black uppercase text-text-muted">
              OFF
            </p>
            <p className="text-lg font-black text-white">
              {team.offensiveRating}
            </p>
          </div>

          <div className="rounded-2xl border border-navy-border bg-navy-card/75 p-2 text-center">
            <p className="text-[10px] font-black uppercase text-text-muted">
              DEF
            </p>
            <p className="text-lg font-black text-white">
              {team.defensiveRating}
            </p>
          </div>

          <div className="rounded-2xl border border-navy-border bg-navy-card/75 p-2 text-center">
            <p className="text-[10px] font-black uppercase text-text-muted">
              ST
            </p>
            <p className="text-lg font-black text-white">
              {team.specialTeamsRating}
            </p>
          </div>
        </div>

        {busy ? (
          <p className="mt-4 rounded-2xl border border-danger/20 bg-danger/10 p-3 text-xs font-semibold text-danger">
            {getTeamBusyReason(team.id) ?? "This franchise is already busy."}
          </p>
        ) : null}
      </div>
    </motion.button>
  );
}

function OptionButton({
  active,
  disabled,
  icon: Icon,
  label,
  description,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  icon?: React.ElementType;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-4 text-center transition",
        active
          ? "border-gold/50 bg-gold/15 text-gold shadow-lg shadow-gold/10"
          : "border-navy-border bg-navy-card text-text-muted hover:border-gold/25 hover:text-white",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {Icon ? <Icon className="mx-auto mb-2 h-5 w-5" /> : null}
      <p className="text-sm font-black uppercase">{label}</p>
      {description ? (
        <p className="mt-1 text-[11px] leading-4 text-text-muted">
          {description}
        </p>
      ) : null}
    </button>
  );
}

function ChallengePreview({
  selectedTeam,
  opponentType,
  matchType,
  stake,
  aiDifficulty,
  selectedBusy,
  predictionsEnabled,
  scheduleMode,
  scheduledFor,
  onCreate,
}: {
  selectedTeam?: StoredFranchiseTeam;
  opponentType: OpponentType;
  matchType: MatchType;
  stake: number;
  aiDifficulty: AiDifficulty;
  selectedBusy: boolean;
  predictionsEnabled: boolean;
  scheduleMode: ScheduleMode;
  scheduledFor: string;
  onCreate: () => void;
}) {
  const previewStake =
    opponentType === "ai"
      ? getAiStake(aiDifficulty)
      : matchType === "free"
        ? 0
        : stake;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-5 shadow-xl">
      <AssetImage
        src={
          selectedTeam
            ? getTeamCardSrc(selectedTeam)
            : teamVisualAssets.backgrounds.field
        }
        alt="Challenge preview background"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-16"
        fallbackClassName="hidden"
      />

      {selectedTeam ? (
        <div className="pointer-events-none absolute bottom-[-34px] right-[-28px] opacity-14">
          <TeamHelmetVisual team={selectedTeam} size="card" />
        </div>
      ) : null}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.16),transparent_38%),linear-gradient(180deg,rgba(11,26,42,0.62),rgba(11,26,42,0.96))]" />

      <div className="relative">
        <Crown className="mb-3 h-7 w-7 text-gold" />

        <p className="text-xs font-black uppercase tracking-widest text-gold">
          Challenge Preview
        </p>

        {selectedTeam ? (
          <div className="mt-4 flex min-w-0 items-center gap-4">
            <TeamHelmet team={selectedTeam} size="lg" />

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant="gold">{getTeamInitials(selectedTeam)}</Badge>
                <Badge variant="info">OVR {selectedTeam.overallRating}</Badge>
              </div>

              <h2 className="break-words text-2xl font-black uppercase leading-tight text-white">
                {getTeamDisplayName(selectedTeam)}
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                {selectedTeam.city} Franchise
              </p>
            </div>
          </div>
        ) : (
          <h2 className="mt-2 break-words text-2xl font-black uppercase text-white">
            No Team Selected
          </h2>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-navy-border bg-navy-card/70 p-4 text-center">
            <p className="text-xs font-black uppercase text-text-muted">
              Stake
            </p>
            <p className="mt-1 text-2xl font-black text-white">
              {previewStake}
            </p>
          </div>

          <div className="rounded-2xl border border-navy-border bg-navy-card/70 p-4 text-center">
            <p className="text-xs font-black uppercase text-text-muted">
              Status
            </p>
            <p
              className={cn(
                "mt-1 text-2xl font-black",
                selectedBusy ? "text-danger" : "text-success"
              )}
            >
              {selectedBusy ? "Busy" : "Ready"}
            </p>
          </div>

          <div className="rounded-2xl border border-navy-border bg-navy-card/70 p-4 text-center">
            <p className="text-xs font-black uppercase text-text-muted">
              Opponent
            </p>
            <p className="mt-1 text-lg font-black uppercase text-white">
              {opponentType}
            </p>
          </div>

          <div className="rounded-2xl border border-navy-border bg-navy-card/70 p-4 text-center">
            <p className="text-xs font-black uppercase text-text-muted">
              Predict
            </p>
            <p className="mt-1 text-lg font-black uppercase text-white">
              {predictionsEnabled ? "On" : "Off"}
            </p>
          </div>
        </div>

        {scheduleMode === "scheduled" && opponentType !== "ai" ? (
          <div className="mt-4 rounded-2xl border border-gold/20 bg-gold/10 p-3">
            <p className="text-xs font-black uppercase tracking-widest text-gold">
              Scheduled For
            </p>
            <p className="mt-1 text-sm font-bold text-white">
              {scheduledFor ? new Date(scheduledFor).toLocaleString() : "Not set"}
            </p>
          </div>
        ) : null}

        <Button
          variant="gold"
          className="mt-5 w-full gap-2"
          onClick={onCreate}
        >
          <Zap className="h-4 w-4" />
          {opponentType === "ai" ? "Start AI Game" : "Create Challenge"}
        </Button>
      </div>
    </section>
  );
}

export default function CreateChallengePage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [teams, setTeams] = useState<StoredFranchiseTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [matchType, setMatchType] = useState<MatchType>("free");
  const [opponentType, setOpponentType] = useState<OpponentType>("public");
  const [stake, setStake] = useState(50);
  const [predictionsEnabled, setPredictionsEnabled] = useState(true);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("instant");
  const [scheduledFor, setScheduledFor] = useState(getTomorrowIsoLocal());
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>("medium");
  const [error, setError] = useState("");

  const refreshTeams = () => {
    const userTeams = getUserFranchises();
    setTeams(userTeams);

    setSelectedTeamId((current) => {
      if (current && userTeams.some((team) => team.id === current)) {
        return current;
      }

      const firstAvailable = userTeams.find((team) => !isTeamBusy(team.id));
      return firstAvailable?.id ?? userTeams[0]?.id ?? "";
    });
  };

  useEffect(() => {
    setMounted(true);
    refreshTeams();

    window.addEventListener("storage", refreshTeams);
    window.addEventListener("gmdl-storage-change", refreshTeams);
    window.addEventListener("focus", refreshTeams);

    return () => {
      window.removeEventListener("storage", refreshTeams);
      window.removeEventListener("gmdl-storage-change", refreshTeams);
      window.removeEventListener("focus", refreshTeams);
    };
  }, []);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId),
    [selectedTeamId, teams]
  );

  const selectedBusy = selectedTeamId ? isTeamBusy(selectedTeamId) : false;

  const handleCreate = () => {
    setError("");

    if (!selectedTeamId) {
      setError("Create or select a franchise first.");
      return;
    }

    if (isTeamBusy(selectedTeamId)) {
      setError(
        getTeamBusyReason(selectedTeamId) ?? "This franchise is already busy."
      );
      return;
    }

    if (opponentType === "ai") {
      const game = createAiInstantGame(selectedTeamId, aiDifficulty);

      if (!game) {
        setError("Could not create AI game. This franchise may already be busy.");
        return;
      }

      router.push(toPregameHref(game));
      return;
    }

    const game = createChallengeGame({
      teamId: selectedTeamId,
      matchType,
      opponentType,
      stake: matchType === "free" ? 0 : stake,
      predictionsEnabled,
      simulationMode: "live",
      scheduledFor:
        scheduleMode === "scheduled"
          ? new Date(scheduledFor).toISOString()
          : undefined,
    });

    if (game.status === "pregame") {
      router.push(toPregameHref(game));
      return;
    }

    router.push("/challenge-hub");
  };

  if (!mounted) {
    return (
      <AppShell>
        <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden">
          <div className="h-44 rounded-3xl border border-navy-border bg-navy-card" />
          <div className="h-96 rounded-3xl border border-navy-border bg-navy-card" />
        </div>
      </AppShell>
    );
  }

  if (teams.length === 0) {
    return (
      <AppShell>
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-navy-border bg-navy-card p-10 text-center shadow-xl">
          <AssetImage
            src={teamVisualAssets.backgrounds.field}
            alt="No franchise field"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
            fallbackClassName="hidden"
          />

          <div className="relative">
            <Shield className="mx-auto h-12 w-12 text-text-muted" />
            <h1 className="mt-4 text-3xl font-black uppercase text-white">
              No Franchise Found
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Create a franchise before creating a challenge.
            </p>

            <Link href="/team-create">
              <Button variant="gold" className="mt-5 gap-2">
                <Shield className="h-4 w-4" />
                Create Franchise
              </Button>
            </Link>
          </div>
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
            src={
              selectedTeam
                ? getTeamCardSrc(selectedTeam)
                : teamVisualAssets.backgrounds.commandCenter
            }
            alt="Create challenge command background"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
            fallbackClassName="hidden"
          />

          <AssetImage
            src={teamVisualAssets.backgrounds.commandCenter}
            alt="Create challenge command center"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-34"
            fallbackClassName="hidden"
          />

          {selectedTeam ? (
            <div className="pointer-events-none absolute bottom-[-44px] right-8 hidden opacity-18 xl:block">
              <TeamHelmetVisual team={selectedTeam} size="card" />
            </div>
          ) : null}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,26,42,0.92),rgba(11,26,42,0.72),rgba(11,26,42,0.94))]" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="gold">
                  <Swords className="mr-1 h-3 w-3" />
                  Create Challenge
                </Badge>
                <Badge variant="info">
                  <Shield className="mr-1 h-3 w-3" />
                  Franchise Required
                </Badge>
                <Badge variant="gold">
                  <Radio className="mr-1 h-3 w-3" />
                  Live Simulation
                </Badge>
              </div>

              <h1 className="break-words text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
                Match Creation Center
              </h1>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-text-muted md:text-base">
                Select a franchise, choose the match type, set stake/schedule,
                and create a public challenge or start an AI game immediately.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:max-w-[420px]">
              <Link href="/challenge-hub">
                <Button variant="secondary" className="w-full gap-2">
                  <Trophy className="h-4 w-4" />
                  Challenge Hub
                </Button>
              </Link>

              <Button
                variant="gold"
                className="w-full gap-2"
                onClick={handleCreate}
              >
                <Zap className="h-4 w-4" />
                {opponentType === "ai" ? "Start AI Game" : "Create Challenge"}
              </Button>
            </div>
          </div>
        </motion.section>

        {error ? (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-danger/30 bg-danger/10 p-5 text-danger"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-black uppercase">Action blocked</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </motion.section>
        ) : null}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 space-y-6">
            <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
              <AssetImage
                src={teamVisualAssets.backgrounds.stadiumFlare}
                alt="Franchise selection glow"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-12"
                fallbackClassName="hidden"
              />

              <div className="relative">
                <div className="mb-5">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                    Step 1
                  </p>
                  <h2 className="mt-1 text-2xl font-black uppercase text-white">
                    Select Franchise
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Busy franchises cannot be listed or used for another match.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                  {teams.map((team) => (
                    <TeamOptionCard
                      key={team.id}
                      team={team}
                      selected={team.id === selectedTeamId}
                      busy={isTeamBusy(team.id)}
                      onClick={() => setSelectedTeamId(team.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
              <AssetImage
                src={teamVisualAssets.backgrounds.field}
                alt="Match settings field"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
                fallbackClassName="hidden"
              />

              <div className="relative">
                <div className="mb-5">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                    Step 2
                  </p>
                  <h2 className="mt-1 text-2xl font-black uppercase text-white">
                    Match Settings
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  <div className="min-w-0 rounded-3xl border border-navy-border bg-navy-secondary/50 p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-widest text-text-muted">
                      Opponent Type
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <OptionButton
                        active={opponentType === "public"}
                        icon={Users}
                        label="Public"
                        description="List in hub"
                        onClick={() => setOpponentType("public")}
                      />

                      <OptionButton
                        active={opponentType === "invite"}
                        icon={Crown}
                        label="Invite"
                        description="Private match"
                        onClick={() => setOpponentType("invite")}
                      />

                      <OptionButton
                        active={opponentType === "ai"}
                        icon={Bot}
                        label="AI"
                        description="Instant game"
                        onClick={() => setOpponentType("ai")}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 rounded-3xl border border-navy-border bg-navy-secondary/50 p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-widest text-text-muted">
                      Match Type
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <OptionButton
                        active={matchType === "free"}
                        disabled={opponentType === "ai"}
                        label="Free Game"
                        description="No stake"
                        onClick={() => setMatchType("free")}
                      />

                      <OptionButton
                        active={matchType === "paid"}
                        disabled={opponentType === "ai"}
                        label="Paid Stake"
                        description="Winner takes pot"
                        onClick={() => setMatchType("paid")}
                      />
                    </div>

                    {matchType === "paid" && opponentType !== "ai" ? (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-black uppercase text-text-muted">
                          Stake Amount
                        </p>
                        <input
                          type="number"
                          value={stake}
                          min={5}
                          max={500}
                          onChange={(event) =>
                            setStake(Number(event.target.value))
                          }
                          className="w-full rounded-2xl border border-navy-border bg-navy-primary px-4 py-3 text-sm font-bold text-white outline-none focus:border-gold/50"
                        />
                      </div>
                    ) : null}
                  </div>

                  {opponentType === "ai" ? (
                    <div className="min-w-0 rounded-3xl border border-navy-border bg-navy-secondary/50 p-4 xl:col-span-2">
                      <p className="mb-3 text-xs font-black uppercase tracking-widest text-text-muted">
                        AI Difficulty
                      </p>

                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {(["easy", "medium", "hard", "elite"] as AiDifficulty[]).map(
                          (difficulty) => (
                            <OptionButton
                              key={difficulty}
                              active={aiDifficulty === difficulty}
                              label={difficulty}
                              description={`${getAiStake(difficulty)} MVP`}
                              onClick={() => setAiDifficulty(difficulty)}
                            />
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="min-w-0 rounded-3xl border border-navy-border bg-navy-secondary/50 p-4 xl:col-span-2">
                      <p className="mb-3 text-xs font-black uppercase tracking-widest text-text-muted">
                        Schedule
                      </p>

                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[260px_1fr]">
                        <div className="relative">
                          <select
                            value={scheduleMode}
                            onChange={(event) =>
                              setScheduleMode(event.target.value as ScheduleMode)
                            }
                            className="w-full appearance-none rounded-2xl border border-navy-border bg-navy-primary px-4 py-3 pr-10 text-sm font-bold text-white outline-none focus:border-gold/50"
                          >
                            <option value="instant">Instant Match</option>
                            <option value="scheduled">Scheduled Match</option>
                          </select>

                          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                        </div>

                        <input
                          type="datetime-local"
                          disabled={scheduleMode === "instant"}
                          value={scheduledFor}
                          onChange={(event) =>
                            setScheduledFor(event.target.value)
                          }
                          className="w-full rounded-2xl border border-navy-border bg-navy-primary px-4 py-3 text-sm font-bold text-white outline-none focus:border-gold/50 disabled:opacity-40"
                        />
                      </div>
                    </div>
                  )}

                  <div className="min-w-0 rounded-3xl border border-navy-border bg-navy-secondary/50 p-4 xl:col-span-2">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-text-muted">
                          Prediction Panel
                        </p>
                        <p className="mt-1 text-sm text-text-muted">
                          Allow spectators to view prediction UI during live
                          matches.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setPredictionsEnabled((current) => !current)
                        }
                        className={cn(
                          "flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition",
                          predictionsEnabled ? "bg-success" : "bg-navy-border"
                        )}
                      >
                        <span
                          className={cn(
                            "h-6 w-6 rounded-full bg-white shadow-md transition",
                            predictionsEnabled
                              ? "translate-x-6"
                              : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-6">
            <ChallengePreview
              selectedTeam={selectedTeam}
              opponentType={opponentType}
              matchType={matchType}
              stake={stake}
              aiDifficulty={aiDifficulty}
              selectedBusy={selectedBusy}
              predictionsEnabled={predictionsEnabled}
              scheduleMode={scheduleMode}
              scheduledFor={scheduledFor}
              onCreate={handleCreate}
            />

            <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
              <AssetImage
                src={teamVisualAssets.backgrounds.stadiumFlare}
                alt="Flow rules glow"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-12"
                fallbackClassName="hidden"
              />

              <div className="relative">
                <CalendarClock className="mb-3 h-7 w-7 text-gold" />
                <h2 className="text-xl font-black uppercase text-white">
                  Flow Rules
                </h2>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  Public/invite challenges appear in Challenge Hub. AI games move
                  directly into pregame. Busy teams cannot join another match
                  until the active game is completed.
                </p>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-5 shadow-xl">
              <AssetImage
                src={teamVisualAssets.backgrounds.field}
                alt="Creation note field"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
                fallbackClassName="hidden"
              />

              <div className="relative flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <p className="text-sm leading-6 text-text-muted">
                  Created challenges now carry the selected franchise identity
                  into Challenge Hub, Pregame, Live Game, Games In Progress, and
                  Notifications.
                </p>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}