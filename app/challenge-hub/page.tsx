"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bot,
  ChevronDown,
  Clock,
  Crown,
  Eye,
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
  acceptChallenge,
  createAiInstantGame,
  getActiveStoredGames,
  getTeamBusyReason,
  getTeamFromHub,
  getUserFranchises,
  isTeamBusy,
  toLiveHref,
  toPregameHref,
  type StoredFranchiseTeam,
  type StoredGame,
} from "@/lib/gameHub";
import { defaultAiTeams } from "@/lib/defaultAiTeams";
import { cn, formatRecord } from "@/lib/utils";
import {
  getTeamCardSrc,
  getTeamDisplayName,
  getTeamInitials,
  teamVisualAssets,
  type VisualTeam,
} from "@/lib/teamVisuals";

type AiDifficulty = "easy" | "medium" | "hard" | "elite";

function getTeamOverall(team?: VisualTeam) {
  return Number(team?.overallRating ?? 0);
}

function getTeamOffense(team?: VisualTeam) {
  return Number(team?.offensiveRating ?? 0);
}

function getTeamDefense(team?: VisualTeam) {
  return Number(team?.defensiveRating ?? 0);
}

function getDifficultyTone(difficulty?: string) {
  if (difficulty === "elite") return "danger";
  if (difficulty === "hard") return "gold";
  if (difficulty === "medium") return "info";
  return "success";
}

function getDifficultyLabel(difficulty?: string) {
  if (!difficulty) return "Dynamic";
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function getTeamRecordLabel(team?: any) {
  if (!team?.record) return "0-0-0";

  return formatRecord(
    team.record.wins ?? 0,
    team.record.losses ?? 0,
    team.record.ties ?? 0
  );
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
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const visualSize =
    size === "xl" ? "xl" : size === "lg" ? "lg" : size === "sm" ? "sm" : "md";

  const shellClass =
    size === "xl"
      ? "h-32 w-40"
      : size === "lg"
        ? "h-24 w-32"
        : size === "sm"
          ? "h-12 w-16"
          : "h-16 w-20";

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
  const fullName = getTeamDisplayName(team);

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
          {fullName}
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

function TeamMatchCard({
  team,
  label,
  align = "left",
}: {
  team?: VisualTeam;
  label: string;
  align?: "left" | "right";
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-secondary/55 p-4 backdrop-blur">
      <AssetImage
        src={getTeamCardSrc(team)}
        alt={`${getTeamDisplayName(team)} card background`}
        className={cn(
          "pointer-events-none absolute top-0 h-full w-44 object-cover opacity-12",
          align === "right" ? "left-0" : "right-0"
        )}
        fallbackClassName="hidden"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.08),transparent_36%)]" />

      <div className="relative">
        <p
          className={cn(
            "mb-3 text-xs font-black uppercase tracking-[0.24em] text-text-muted",
            align === "right" && "text-right"
          )}
        >
          {label}
        </p>

        <TeamIdentity team={team} align={align} />

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-navy-border bg-navy-card/80 p-2 text-center">
            <p className="text-[10px] font-black uppercase text-text-muted">
              OVR
            </p>
            <p className="text-lg font-black text-white">
              {getTeamOverall(team) || "--"}
            </p>
          </div>

          <div className="rounded-2xl border border-navy-border bg-navy-card/80 p-2 text-center">
            <p className="text-[10px] font-black uppercase text-text-muted">
              OFF
            </p>
            <p className="text-lg font-black text-white">
              {getTeamOffense(team) || "--"}
            </p>
          </div>

          <div className="rounded-2xl border border-navy-border bg-navy-card/80 p-2 text-center">
            <p className="text-[10px] font-black uppercase text-text-muted">
              DEF
            </p>
            <p className="text-lg font-black text-white">
              {getTeamDefense(team) || "--"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FranchiseSelect({
  teams,
  value,
  onChange,
}: {
  teams: StoredFranchiseTeam[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative min-w-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 pr-10 text-sm font-bold text-white outline-none transition focus:border-gold/50"
      >
        {teams.length > 0 ? (
          teams.map((team) => (
            <option key={team.id} value={team.id}>
              {getTeamDisplayName(team)} —{" "}
              {isTeamBusy(team.id) ? "Busy" : `OVR ${team.overallRating}`}
            </option>
          ))
        ) : (
          <option value="">No franchise created yet</option>
        )}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
    </div>
  );
}

function SelectedFranchisePanel({
  teams,
  selectedTeam,
  selectedTeamId,
  onChange,
}: {
  teams: StoredFranchiseTeam[];
  selectedTeam?: StoredFranchiseTeam;
  selectedTeamId: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl">
      <AssetImage
        src={teamVisualAssets.backgrounds.stadiumFlare}
        alt="Challenge hub glow"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
        fallbackClassName="hidden"
      />

      {selectedTeam ? (
        <>
          <AssetImage
            src={getTeamCardSrc(selectedTeam)}
            alt={`${getTeamDisplayName(selectedTeam)} card`}
            className="pointer-events-none absolute right-0 top-0 h-full w-64 object-cover opacity-14"
            fallbackClassName="hidden"
          />

          <div className="pointer-events-none absolute bottom-[-26px] right-4 hidden opacity-14 xl:block">
            <TeamHelmetVisual team={selectedTeam} size="card" />
          </div>
        </>
      ) : null}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.08),transparent_36%)]" />

      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
          Select Franchise
        </p>

        <h2 className="mt-1 text-2xl font-black uppercase text-white">
          Franchise To Use
        </h2>

        <p className="mt-1 text-sm text-text-muted">
          This selection applies to accepting challenges and starting AI games.
        </p>

        <div className="mt-4">
          <FranchiseSelect
            teams={teams}
            value={selectedTeamId}
            onChange={onChange}
          />
        </div>

        {selectedTeam ? (
          <div className="mt-5 rounded-3xl border border-gold/20 bg-gold/10 p-4">
            <TeamIdentity team={selectedTeam} />

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-navy-card/75 p-3 text-center">
                <p className="text-[10px] font-black uppercase text-text-muted">
                  Record
                </p>
                <p className="text-sm font-black text-white">
                  {getTeamRecordLabel(selectedTeam)}
                </p>
              </div>

              <div className="rounded-2xl bg-navy-card/75 p-3 text-center">
                <p className="text-[10px] font-black uppercase text-text-muted">
                  OVR
                </p>
                <p className="text-sm font-black text-white">
                  {selectedTeam.overallRating}
                </p>
              </div>

              <div className="rounded-2xl bg-navy-card/75 p-3 text-center">
                <p className="text-[10px] font-black uppercase text-text-muted">
                  State
                </p>
                <p
                  className={cn(
                    "text-sm font-black",
                    isTeamBusy(selectedTeam.id) ? "text-danger" : "text-success"
                  )}
                >
                  {isTeamBusy(selectedTeam.id) ? "Busy" : "Ready"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-navy-border bg-navy-secondary/40 p-5 text-center">
            <Shield className="mx-auto h-8 w-8 text-text-muted" />
            <p className="mt-3 font-black uppercase text-white">
              No Franchise Selected
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Create or select a team before entering the hub.
            </p>
          </div>
        )}

        {selectedTeamId && isTeamBusy(selectedTeamId) ? (
          <p className="mt-4 rounded-2xl border border-danger/20 bg-danger/10 p-3 text-xs font-semibold text-danger">
            {getTeamBusyReason(selectedTeamId)}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function ListedChallengeCard({
  game,
  selectedTeamId,
  onAccept,
}: {
  game: StoredGame;
  selectedTeamId: string;
  onAccept: (game: StoredGame) => void;
}) {
  const homeTeam = getTeamFromHub(game.homeTeamId);
  const selectedTeam = getTeamFromHub(selectedTeamId);

  const isOwnTeam = selectedTeamId === game.homeTeamId;
  const selectedBusy = selectedTeamId ? isTeamBusy(selectedTeamId) : false;
  const disabled = !selectedTeamId || isOwnTeam || selectedBusy;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl transition hover:border-gold/40"
    >
      <AssetImage
        src={homeTeam ? getTeamCardSrc(homeTeam) : teamVisualAssets.backgrounds.stadiumFlare}
        alt="Challenge card glow"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
        fallbackClassName="hidden"
      />

      <AssetImage
        src={teamVisualAssets.backgrounds.stadiumFlare}
        alt="Challenge card stadium glow"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
        fallbackClassName="hidden"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,26,42,0.64),rgba(11,26,42,0.94))]" />

      <div className="relative">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="gold">
                <Trophy className="mr-1 h-3 w-3" />
                Listed Challenge
              </Badge>

              <Badge variant="info">
                {game.matchType.toUpperCase()} · Stake {game.stake} MVP
              </Badge>

              {game.scheduledFor ? (
                <Badge variant="gold">
                  <Clock className="mr-1 h-3 w-3" />
                  Scheduled
                </Badge>
              ) : (
                <Badge variant="info">Instant</Badge>
              )}
            </div>

            <h2 className="break-words text-2xl font-black uppercase text-white">
              {homeTeam ? getTeamDisplayName(homeTeam) : "Franchise"} awaits
              opponent
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Accept using one of your available franchises.
            </p>
          </div>

          <Button
            variant="gold"
            className="w-full gap-2 xl:w-auto"
            disabled={disabled}
            onClick={() => onAccept(game)}
          >
            <Swords className="h-4 w-4" />
            Accept Challenge
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_100px_1fr] xl:items-center">
          <TeamMatchCard team={homeTeam} label="Listed Team" />

          <div className="rounded-3xl border border-gold/30 bg-gold/10 p-4 text-center shadow-lg shadow-gold/10">
            <p className="text-3xl font-black text-gold">VS</p>
            <p className="mt-1 text-[11px] font-black uppercase text-text-muted">
              Open
            </p>
          </div>

          <TeamMatchCard
            team={selectedTeam}
            label="Your Selected Team"
            align="right"
          />
        </div>

        {isOwnTeam ? (
          <p className="mt-4 rounded-2xl border border-danger/20 bg-danger/10 p-3 text-xs font-semibold text-danger">
            You cannot accept your own challenge with the same franchise.
          </p>
        ) : selectedBusy ? (
          <p className="mt-4 rounded-2xl border border-danger/20 bg-danger/10 p-3 text-xs font-semibold text-danger">
            {getTeamBusyReason(selectedTeamId) ?? "Selected franchise is busy."}
          </p>
        ) : null}
      </div>
    </motion.article>
  );
}

function AiOpponentCard({
  aiTeam,
  selectedTeamId,
  difficulty,
  onPlay,
}: {
  aiTeam: (typeof defaultAiTeams)[number];
  selectedTeamId: string;
  difficulty: AiDifficulty;
  onPlay: (difficulty: AiDifficulty) => void;
}) {
  const selectedBusy = selectedTeamId ? isTeamBusy(selectedTeamId) : false;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl transition hover:border-gold/40"
    >
      <AssetImage
        src={teamVisualAssets.backgrounds.field}
        alt={`${getTeamDisplayName(aiTeam)} background`}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-16"
        fallbackClassName="hidden"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.12),transparent_34%),linear-gradient(180deg,rgba(11,26,42,0.72),rgba(11,26,42,0.94))]" />

      <div className="relative">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="gold">
                <Bot className="mr-1 h-3 w-3" />
                AI Opponent
              </Badge>

              <Badge variant={getDifficultyTone(aiTeam.difficulty)}>
                {getDifficultyLabel(aiTeam.difficulty)}
              </Badge>

              <Badge variant="info">Dynamic Team</Badge>
            </div>

            <h2 className="break-words text-2xl font-black uppercase text-white">
              {getTeamDisplayName(aiTeam)}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              OVR {aiTeam.overallRating} · OFF {aiTeam.offensiveRating} · DEF{" "}
              {aiTeam.defensiveRating}
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 xl:w-auto xl:grid-cols-1">
            <Button
              variant="gold"
              className="w-full gap-2"
              disabled={!selectedTeamId || selectedBusy}
              onClick={() => onPlay(difficulty)}
            >
              <Zap className="h-4 w-4" />
              Play AI
            </Button>

            <Link href={`/scouting?opponent=${aiTeam.id}`}>
              <Button variant="secondary" className="w-full gap-2">
                <Eye className="h-4 w-4" />
                Scout
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[120px_1fr] lg:items-center">
          <div className="mx-auto lg:mx-0">
            <TeamHelmet team={aiTeam} size="lg" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-navy-border bg-navy-card/75 p-3 text-center">
              <p className="text-[10px] font-black uppercase text-text-muted">
                OVR
              </p>
              <p className="text-2xl font-black text-white">
                {aiTeam.overallRating}
              </p>
            </div>

            <div className="rounded-2xl border border-navy-border bg-navy-card/75 p-3 text-center">
              <p className="text-[10px] font-black uppercase text-text-muted">
                OFF
              </p>
              <p className="text-2xl font-black text-white">
                {aiTeam.offensiveRating}
              </p>
            </div>

            <div className="rounded-2xl border border-navy-border bg-navy-card/75 p-3 text-center">
              <p className="text-[10px] font-black uppercase text-text-muted">
                DEF
              </p>
              <p className="text-2xl font-black text-white">
                {aiTeam.defensiveRating}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-navy-border bg-navy-card/60 p-3">
          <p className="text-xs font-black uppercase tracking-widest text-text-muted">
            AI Archetype
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {aiTeam.archetype ?? "Balanced AI opponent"}
          </p>
        </div>

        {selectedBusy ? (
          <p className="mt-4 rounded-2xl border border-danger/20 bg-danger/10 p-3 text-xs font-semibold text-danger">
            {getTeamBusyReason(selectedTeamId) ?? "Selected franchise is busy."}
          </p>
        ) : null}
      </div>
    </motion.article>
  );
}

export default function ChallengeHubPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [teams, setTeams] = useState<StoredFranchiseTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [activeGames, setActiveGames] = useState<StoredGame[]>([]);
  const [difficulty, setDifficulty] = useState<AiDifficulty>("medium");
  const [error, setError] = useState("");

  const listedChallenges = useMemo(
    () => activeGames.filter((game) => game.status === "listed"),
    [activeGames]
  );

  const yourActiveGames = useMemo(
    () =>
      activeGames.filter(
        (game) =>
          game.status !== "listed" &&
          (teams.some((team) => team.id === game.homeTeamId) ||
            teams.some((team) => team.id === game.awayTeamId))
      ),
    [activeGames, teams]
  );

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId),
    [teams, selectedTeamId]
  );

  useEffect(() => {
    setMounted(true);

    const refresh = () => {
      const userTeams = getUserFranchises();
      setTeams(userTeams);
      setActiveGames(getActiveStoredGames());

      setSelectedTeamId((current) => {
        if (current && userTeams.some((team) => team.id === current)) {
          return current;
        }

        const firstAvailable = userTeams.find((team) => !isTeamBusy(team.id));
        return firstAvailable?.id ?? userTeams[0]?.id ?? "";
      });
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

  const handleAccept = (game: StoredGame) => {
    setError("");

    if (!selectedTeamId) {
      setError("Select a franchise first.");
      return;
    }

    if (selectedTeamId === game.homeTeamId) {
      setError("You cannot accept your own challenge with the same franchise.");
      return;
    }

    if (isTeamBusy(selectedTeamId)) {
      setError(
        getTeamBusyReason(selectedTeamId) ?? "Selected franchise is busy."
      );
      return;
    }

    const accepted = acceptChallenge({
      gameId: game.id,
      acceptingTeamId: selectedTeamId,
    });

    if (!accepted) {
      setError("Could not accept challenge. Select another franchise.");
      return;
    }

    router.push(toPregameHref(accepted));
  };

  const handlePlayAi = (selectedDifficulty: AiDifficulty) => {
    setError("");

    if (!selectedTeamId) {
      setError("Select a franchise first.");
      return;
    }

    if (isTeamBusy(selectedTeamId)) {
      setError(
        getTeamBusyReason(selectedTeamId) ?? "Selected franchise is busy."
      );
      return;
    }

    const game = createAiInstantGame(selectedTeamId, selectedDifficulty);

    if (!game) {
      setError("Could not start AI game.");
      return;
    }

    router.push(toPregameHref(game));
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

  return (
    <AppShell>
      <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden pb-12">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-navy-border bg-[linear-gradient(135deg,#0B1A2A,#101F33_55%,#16283A)] p-5 shadow-2xl md:p-6"
        >
          <AssetImage
            src={
              selectedTeam
                ? getTeamCardSrc(selectedTeam)
                : teamVisualAssets.backgrounds.commandCenter
            }
            alt="Challenge hub custom franchise background"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
            fallbackClassName="hidden"
          />

          <AssetImage
            src={teamVisualAssets.backgrounds.commandCenter}
            alt="Challenge hub command background"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-34"
            fallbackClassName="hidden"
          />

          {selectedTeam ? (
            <div className="pointer-events-none absolute bottom-[-42px] right-8 hidden opacity-18 xl:block">
              <TeamHelmetVisual team={selectedTeam} size="card" />
            </div>
          ) : null}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.18),transparent_34%),linear-gradient(90deg,rgba(11,26,42,0.88),rgba(11,26,42,0.68),rgba(11,26,42,0.92))]" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="gold">
                  <Trophy className="mr-1 h-3 w-3" />
                  Challenge Hub
                </Badge>

                <Badge variant="info">
                  <Users className="mr-1 h-3 w-3" />
                  {teams.length} Franchises
                </Badge>

                <Badge variant="gold">
                  <Activity className="mr-1 h-3 w-3" />
                  {listedChallenges.length} Listed
                </Badge>

                <Badge
                  variant={yourActiveGames.length > 0 ? "danger" : "success"}
                >
                  <Radio className="mr-1 h-3 w-3" />
                  {yourActiveGames.length} Active
                </Badge>
              </div>

              <h1 className="break-words text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
                Matchmaking Command Center
              </h1>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-text-muted md:text-base">
                Accept public challenges, choose which franchise to use, or
                instantly play dynamic AI teams with real matchup identity.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:max-w-[420px]">
              <Link href="/create-challenge">
                <Button variant="gold" className="w-full gap-2">
                  <Swords className="h-4 w-4" />
                  Create Challenge
                </Button>
              </Link>

              <Link href="/games-in-progress">
                <Button variant="secondary" className="w-full gap-2">
                  <Radio className="h-4 w-4" />
                  Live Games
                </Button>
              </Link>
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
          <SelectedFranchisePanel
            teams={teams}
            selectedTeam={selectedTeam}
            selectedTeamId={selectedTeamId}
            onChange={setSelectedTeamId}
          />

          <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-5 shadow-xl">
            <AssetImage
              src={teamVisualAssets.backgrounds.field}
              alt="Hub summary field"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-12"
              fallbackClassName="hidden"
            />

            <div className="relative">
              <Crown className="mb-3 h-7 w-7 text-gold" />

              <p className="text-xs font-black uppercase tracking-widest text-gold">
                Hub Summary
              </p>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-navy-border bg-navy-card/75 p-4 text-center">
                  <p className="text-xs font-black uppercase text-text-muted">
                    Listed
                  </p>
                  <p className="text-3xl font-black text-white">
                    {listedChallenges.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-navy-border bg-navy-card/75 p-4 text-center">
                  <p className="text-xs font-black uppercase text-text-muted">
                    Active
                  </p>
                  <p className="text-3xl font-black text-white">
                    {yourActiveGames.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-navy-border bg-navy-card/75 p-4 text-center">
                  <p className="text-xs font-black uppercase text-text-muted">
                    AI
                  </p>
                  <p className="text-3xl font-black text-white">
                    {defaultAiTeams.length}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-text-muted">
                Challenge Hub keeps teams from being reused while they are
                listed, in pregame, or live.
              </p>
            </div>
          </section>
        </section>

        {yourActiveGames.length > 0 ? (
          <section className="space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                Your Active Matches
              </p>

              <h2 className="mt-1 text-2xl font-black uppercase text-white">
                Continue Existing Game
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {yourActiveGames.map((game) => {
                const homeTeam = getTeamFromHub(game.homeTeamId);
                const awayTeam = getTeamFromHub(game.awayTeamId);

                return (
                  <motion.article
                    key={game.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-5 shadow-xl"
                  >
                    <AssetImage
                      src={homeTeam ? getTeamCardSrc(homeTeam) : teamVisualAssets.backgrounds.field}
                      alt="Active match field"
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
                      fallbackClassName="hidden"
                    />

                    <AssetImage
                      src={teamVisualAssets.backgrounds.field}
                      alt="Active match overlay field"
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
                      fallbackClassName="hidden"
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,26,42,0.58),rgba(11,26,42,0.92))]" />

                    <div className="relative">
                      <div className="mb-4 flex flex-wrap gap-2">
                        <Badge
                          variant={game.status === "live" ? "danger" : "gold"}
                        >
                          {game.status}
                        </Badge>

                        <Badge variant="info">
                          {game.matchType.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_90px_1fr] xl:items-center">
                        <TeamMatchCard team={homeTeam} label="Home" />

                        <div className="rounded-3xl border border-gold/30 bg-gold/10 p-4 text-center shadow-lg shadow-gold/10">
                          <p className="text-3xl font-black text-gold">VS</p>
                        </div>

                        <TeamMatchCard
                          team={awayTeam}
                          label="Away"
                          align="right"
                        />
                      </div>

                      <Link
                        href={
                          game.status === "live"
                            ? toLiveHref(game)
                            : toPregameHref(game)
                        }
                      >
                        <Button variant="gold" className="mt-4 w-full gap-2">
                          <Radio className="h-4 w-4" />
                          Continue
                        </Button>
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
              Public Challenges
            </p>

            <h2 className="mt-1 text-2xl font-black uppercase text-white">
              Accept A Listed Match
            </h2>
          </div>

          {listedChallenges.length > 0 ? (
            <div className="grid grid-cols-1 gap-5">
              {listedChallenges.map((game) => (
                <ListedChallengeCard
                  key={game.id}
                  game={game}
                  selectedTeamId={selectedTeamId}
                  onAccept={handleAccept}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-navy-border bg-navy-card p-8 text-center shadow-xl">
              <Trophy className="mx-auto h-10 w-10 text-text-muted" />

              <h2 className="mt-4 text-2xl font-black uppercase text-white">
                No listed challenge yet
              </h2>

              <p className="mt-2 text-sm text-text-muted">
                Create one or play an AI team instantly.
              </p>

              <Link href="/create-challenge">
                <Button variant="gold" className="mt-5 gap-2">
                  <Swords className="h-4 w-4" />
                  Create Challenge
                </Button>
              </Link>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
                AI Matchups
              </p>

              <h2 className="mt-1 text-2xl font-black uppercase text-white">
                Play Computer Teams
              </h2>
            </div>

            <div className="relative min-w-[240px]">
              <select
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value as AiDifficulty)
                }
                className="w-full appearance-none rounded-2xl border border-navy-border bg-navy-card px-4 py-3 pr-10 text-sm font-bold text-white outline-none transition focus:border-gold/50"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="elite">Elite</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {defaultAiTeams.map((aiTeam) => (
              <AiOpponentCard
                key={aiTeam.id}
                aiTeam={aiTeam}
                selectedTeamId={selectedTeamId}
                difficulty={difficulty}
                onPlay={handlePlayAi}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}