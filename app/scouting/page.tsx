"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  ChevronDown,
  ClipboardList,
  Crown,
  Eye,
  Gauge,
  LineChart,
  Lock,
  Radar,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Star,
  Swords,
  Target,
  Trophy,
  Unlock,
  Users,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { defaultAiTeams, type FranchisePlayer } from "@/lib/defaultAiTeams";
import {
  getTeamPlayers,
  getUserFranchises,
  type StoredFranchiseTeam,
} from "@/lib/gameHub";
import { cn, formatRecord, getRatingColor } from "@/lib/utils";
import {
  getTeamCardSrc,
  getTeamDisplayName,
  getTeamHelmetSrc,
  getTeamInitials,
  teamVisualAssets,
  type VisualTeam,
} from "@/lib/teamVisuals";

type ScoutTab = "overview" | "roster" | "tendencies" | "report";

const SCOUTING_REPORTS_KEY = "gmdl_scouting_reports_v1";

type SavedScoutingReport = {
  opponentId: string;
  myTeamId: string;
  unlockedAt: string;
  scoutLevel: number;
};

const rosterFaceAssets = [
  "/assets/players/faces/roster/player-face-01.png",
  "/assets/players/faces/roster/player-face-02.png",
  "/assets/players/faces/roster/player-face-03.png",
  "/assets/players/faces/roster/player-face-04.png",
  "/assets/players/faces/roster/player-face-05.png",
  "/assets/players/faces/roster/player-face-06.png",
  "/assets/players/faces/roster/player-face-07.png",
  "/assets/players/faces/roster/player-face-08.png",
  "/assets/players/faces/roster/player-face-09.png",
  "/assets/players/faces/roster/player-face-10.png",
  "/assets/players/faces/roster/player-face-11.png",
  "/assets/players/faces/roster/player-face-12.png",
  "/assets/players/faces/roster/player-face-13.png",
  "/assets/players/faces/roster/player-face-14.png",
  "/assets/players/faces/roster/player-face-15.png",
];

const fallbackFaceAssets = [
  "/assets/players/faces/player-qb-001.png",
  "/assets/players/faces/player-rb-001.png",
  "/assets/players/faces/player-cb-001.png",
];

const allFaceAssets = [...rosterFaceAssets, ...fallbackFaceAssets];

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("gmdl-storage-change"));
  } catch {
    console.log(`Unable to save ${key}`);
  }
}

function hashText(text: string) {
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function getPlayerFaceSrc(player: FranchisePlayer) {
  const key = `${player.id}-${player.name}-${player.position}`;
  const index = hashText(key) % allFaceAssets.length;

  return allFaceAssets[index] ?? fallbackFaceAssets[0];
}

function getPlayerTier(overall: number) {
  if (overall >= 90) return "Elite";
  if (overall >= 82) return "Star";
  if (overall >= 74) return "Starter";
  if (overall >= 66) return "Rotation";
  return "Depth";
}

function getAverage(players: FranchisePlayer[], key: keyof FranchisePlayer) {
  if (players.length === 0) return 0;

  const total = players.reduce((sum, player) => {
    const value = player[key];
    return sum + (typeof value === "number" ? value : 0);
  }, 0);

  return Math.round(total / players.length);
}

function getPositionStrength(players: FranchisePlayer[], positions: string[]) {
  const room = players.filter((player) => positions.includes(player.position));

  if (room.length === 0) return 0;

  return Math.round(
    room.reduce((sum, player) => sum + player.overall, 0) / room.length
  );
}

function getThreatLevel(rating: number) {
  if (rating >= 88) return "Severe Threat";
  if (rating >= 80) return "High Threat";
  if (rating >= 70) return "Balanced Threat";
  if (rating >= 60) return "Manageable Threat";
  return "Low Threat";
}

function getMatchupSummary(myRating?: number, opponentRating?: number) {
  if (!myRating || !opponentRating) {
    return "Select your franchise to compare matchup ratings.";
  }

  const diff = myRating - opponentRating;

  if (diff >= 8) return "You have a clear ratings advantage. Avoid reckless tactics.";
  if (diff >= 2) return "You have a slight edge. Control tempo and reduce turnovers.";
  if (diff > -2) return "This is a tight matchup. Small tactical decisions can swing the result.";
  if (diff > -8) return "Opponent has a slight edge. Use scouting to attack weak rooms.";
  return "Opponent has a strong edge. You need a conservative, high-efficiency plan.";
}

function getOpponentTendencies(opponent: (typeof defaultAiTeams)[number]) {
  const label = `${opponent.archetype} ${opponent.nickname}`.toLowerCase();

  const runBias =
    label.includes("power") ||
    label.includes("rushing") ||
    label.includes("physical")
      ? 64
      : label.includes("spread") || label.includes("passing")
        ? 38
        : 50;

  const blitz =
    label.includes("aggressive") ||
    label.includes("chaotic") ||
    label.includes("pressure")
      ? 72
      : label.includes("coverage")
        ? 34
        : 52;

  const passDepth =
    label.includes("deep") ||
    label.includes("passing") ||
    label.includes("spread")
      ? 70
      : label.includes("power")
        ? 38
        : 54;

  const risk =
    label.includes("chaotic") || label.includes("risky")
      ? 76
      : label.includes("balanced")
        ? 48
        : 56;

  return {
    runBias,
    passBias: 100 - runBias,
    blitz,
    passDepth,
    risk,
  };
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
  const sizeClass =
    size === "xl"
      ? "h-28 w-28"
      : size === "lg"
        ? "h-24 w-24"
        : size === "sm"
          ? "h-12 w-12"
          : "h-16 w-16";

  return (
    <div className={cn("relative shrink-0 overflow-visible", sizeClass)}>
      <AssetImage
        src={getTeamHelmetSrc(team)}
        alt={`${getTeamDisplayName(team)} helmet`}
        className="h-full w-full object-contain drop-shadow-2xl"
        fallbackClassName="h-full w-full"
      />
    </div>
  );
}

function PlayerAvatar({
  player,
  locked,
}: {
  player: FranchisePlayer;
  locked: boolean;
}) {
  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-gold/20 bg-navy-primary shadow-lg">
      {locked ? (
        <div className="flex h-full w-full items-center justify-center bg-navy-secondary">
          <Lock className="h-5 w-5 text-text-muted" />
        </div>
      ) : (
        <AssetImage
          src={getPlayerFaceSrc(player)}
          alt={player.name}
          className="h-full w-full object-cover"
          fallbackClassName="h-full w-full"
        />
      )}
    </div>
  );
}

function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "gold" | "success" | "danger" | "info";
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-secondary/60 p-4">
      <p className="truncate text-[11px] font-black uppercase tracking-widest text-text-muted">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 truncate text-2xl font-black text-white",
          tone === "gold" && "text-gold",
          tone === "success" && "text-success",
          tone === "danger" && "text-danger",
          tone === "info" && "text-electric"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Meter({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-navy-border bg-navy-primary/60 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-wider text-text-muted">
          {label}
        </span>
        <span className={cn("text-sm font-black", getRatingColor(value))}>
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-navy-card">
        <div
          className="h-full rounded-full bg-gold"
          style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
        />
      </div>

      {hint ? <p className="mt-2 text-xs leading-5 text-text-muted">{hint}</p> : null}
    </div>
  );
}

function TeamMiniPanel({
  label,
  team,
  children,
}: {
  label: string;
  team?: VisualTeam;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl md:p-6">
      <AssetImage
        src={getTeamCardSrc(team)}
        alt={`${getTeamDisplayName(team)} background`}
        className="pointer-events-none absolute right-0 top-0 h-full w-56 object-cover opacity-14"
        fallbackClassName="hidden"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.10),transparent_36%)]" />

      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
          {label}
        </p>

        {children}

        {team ? (
          <div className="mt-5 flex min-w-0 items-center gap-4 rounded-3xl border border-gold/20 bg-gold/10 p-4">
            <TeamHelmet team={team} />

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant="gold">{getTeamInitials(team)}</Badge>
                {"difficulty" in team && team.difficulty ? (
                  <Badge variant="info">{String(team.difficulty)}</Badge>
                ) : null}
                {"nflSync" in team && team.nflSync?.enabled ? (
                  <Badge variant="success">NFL Synced</Badge>
                ) : null}
              </div>

              <h2 className="break-words text-2xl font-black uppercase leading-tight text-white">
                {getTeamDisplayName(team)}
              </h2>

              <p className="mt-1 text-sm font-semibold text-text-muted">
                {"record" in team && team.record
                  ? `${formatRecord(
                      team.record.wins,
                      team.record.losses,
                      team.record.ties
                    )} · `
                  : ""}
                OVR {team.overallRating ?? "--"}
              </p>

              {"archetype" in team && team.archetype ? (
                <p className="mt-1 text-xs font-semibold text-gold">
                  {String(team.archetype)}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-navy-border bg-navy-secondary/40 p-5">
            <p className="text-sm text-text-muted">
              Create a franchise first to compare matchup strengths.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerScoutRow({
  player,
  locked,
}: {
  player: FranchisePlayer;
  locked: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-navy-border bg-navy-secondary/50 p-3 transition hover:border-gold/25 hover:bg-navy-secondary/70">
      <div className="flex min-w-0 items-center gap-3">
        <PlayerAvatar player={player} locked={locked} />

        <div className="min-w-0">
          <p className="truncate text-sm font-black uppercase text-white">
            {locked ? "Hidden Player Profile" : player.name}
          </p>
          <p className="text-xs font-semibold text-text-muted">
            #{player.number} · {player.position} · Age {locked ? "??" : player.age}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={locked ? "outline" : "info"}>
          {locked ? "Hidden Trait" : player.trait}
        </Badge>

        <span
          className={cn(
            "w-10 text-right text-lg font-black",
            locked ? "text-text-muted" : getRatingColor(player.overall)
          )}
        >
          {locked ? "??" : player.overall}
        </span>
      </div>
    </div>
  );
}

export default function ScoutingPage() {
  const [myFranchises, setMyFranchises] = useState<StoredFranchiseTeam[]>([]);
  const [selectedMyTeamId, setSelectedMyTeamId] = useState("");
  const [selectedOpponentId, setSelectedOpponentId] = useState(
    defaultAiTeams[0]?.id ?? ""
  );
  const [tab, setTab] = useState<ScoutTab>("overview");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const teams = getUserFranchises();
    const params = new URLSearchParams(window.location.search);
    const teamFromUrl = params.get("team");
    const opponentFromUrl = params.get("opponent");
    const primaryTeamId = window.localStorage.getItem("gmdl_primary_franchise");

    setMyFranchises(teams);

    setSelectedMyTeamId(
      teams.find((team) => team.id === teamFromUrl)?.id ??
        teams.find((team) => team.id === primaryTeamId)?.id ??
        teams[0]?.id ??
        ""
    );

    if (defaultAiTeams.some((team) => team.id === opponentFromUrl)) {
      setSelectedOpponentId(opponentFromUrl ?? defaultAiTeams[0].id);
    }
  }, []);

  const selectedMyTeam = useMemo(
    () => myFranchises.find((team) => team.id === selectedMyTeamId),
    [myFranchises, selectedMyTeamId]
  );

  const opponent = useMemo(
    () =>
      defaultAiTeams.find((team) => team.id === selectedOpponentId) ??
      defaultAiTeams[0],
    [selectedOpponentId]
  );

  const opponentPlayers = useMemo(
    () => getTeamPlayers(opponent.id),
    [opponent.id]
  );

  const reports = safeReadJson<Record<string, SavedScoutingReport>>(
    SCOUTING_REPORTS_KEY,
    {}
  );

  const reportKey = `${selectedMyTeamId}_${opponent.id}`;
  const savedReport = reports[reportKey];
  const reportUnlocked = Boolean(savedReport);

  const topPlayers = useMemo(
    () => [...opponentPlayers].sort((a, b) => b.overall - a.overall).slice(0, 8),
    [opponentPlayers]
  );

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return opponentPlayers
      .filter((player) => {
        if (!query) return true;

        return (
          player.name.toLowerCase().includes(query) ||
          player.position.toLowerCase().includes(query) ||
          player.trait.toLowerCase().includes(query) ||
          String(player.number).includes(query)
        );
      })
      .sort((a, b) => b.overall - a.overall);
  }, [opponentPlayers, search]);

  const tendencies = getOpponentTendencies(opponent);

  const opponentStrengths = {
    quarterback: getPositionStrength(opponentPlayers, ["QB"]),
    skill: getPositionStrength(opponentPlayers, ["RB", "WR", "TE"]),
    trenches: getPositionStrength(opponentPlayers, [
      "LT",
      "LG",
      "C",
      "RG",
      "RT",
      "LE",
      "DT",
      "RE",
    ]),
    coverage: getPositionStrength(opponentPlayers, ["CB", "FS", "SS"]),
    frontSeven: getPositionStrength(opponentPlayers, [
      "LE",
      "DT",
      "RE",
      "LOLB",
      "MLB",
      "ROLB",
    ]),
  };

  const avgSpeed = getAverage(opponentPlayers, "speed");
  const avgStrength = getAverage(opponentPlayers, "strength");
  const avgIQ = getAverage(opponentPlayers, "intelligence");
  const avgConsistency = getAverage(opponentPlayers, "consistency");

  const ratingDiff = selectedMyTeam
    ? selectedMyTeam.overallRating - opponent.overallRating
    : 0;

  const unlockReport = () => {
    if (!selectedMyTeamId) return;

    const nextReports = {
      ...reports,
      [reportKey]: {
        opponentId: opponent.id,
        myTeamId: selectedMyTeamId,
        unlockedAt: new Date().toISOString(),
        scoutLevel: 1,
      },
    };

    safeWriteJson(SCOUTING_REPORTS_KEY, nextReports);
    setTab("report");
  };

  const resetReport = () => {
    const nextReports = { ...reports };
    delete nextReports[reportKey];
    safeWriteJson(SCOUTING_REPORTS_KEY, nextReports);
    setTab("overview");
  };

  const updateUrl = (teamId: string, opponentId: string) => {
    const params = new URLSearchParams(window.location.search);

    if (teamId) params.set("team", teamId);
    if (opponentId) params.set("opponent", opponentId);

    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  return (
    <AppShell>
      <div className="space-y-6 overflow-x-hidden pb-12">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-navy-border bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.16),transparent_36%),linear-gradient(135deg,#0B1A2A,#101F33_55%,#16283A)] p-5 shadow-2xl md:p-6"
        >
          <AssetImage
            src={teamVisualAssets.backgrounds.commandCenter}
            alt="Scouting command center"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-34"
            fallbackClassName="hidden"
          />

          <AssetImage
            src={getTeamHelmetSrc(opponent)}
            alt={`${getTeamDisplayName(opponent)} helmet`}
            className="pointer-events-none absolute bottom-[-28px] right-4 hidden h-60 w-60 object-contain opacity-22 drop-shadow-2xl xl:block"
            fallbackClassName="hidden"
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,26,42,0.92),rgba(11,26,42,0.76),rgba(11,26,42,0.94))]" />
          <div className="absolute right-[-120px] top-[-120px] h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute bottom-[-140px] left-[20%] h-72 w-72 rounded-full bg-electric/10 blur-3xl" />

          <div className="relative grid grid-cols-1 gap-6 xl:grid-cols-[1fr_500px] xl:items-center">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="gold">
                  <Search className="mr-1 h-3 w-3" />
                  Scouting Room
                </Badge>

                <Badge variant="info">
                  <Bot className="mr-1 h-3 w-3" />
                  AI Opponent Intel
                </Badge>

                <Badge variant={reportUnlocked ? "success" : "warning"}>
                  {reportUnlocked ? (
                    <Unlock className="mr-1 h-3 w-3" />
                  ) : (
                    <Lock className="mr-1 h-3 w-3" />
                  )}
                  {reportUnlocked ? "Report Unlocked" : "Basic Intel"}
                </Badge>
              </div>

              <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
                Scouting Center
              </h1>

              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-text-muted md:text-base">
                Compare your franchise against AI opponents, inspect roster threats,
                reveal tendencies, and create a tactical report before entering the
                Challenge Hub.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href={`/game-plan?team=${selectedMyTeamId}`}>
                  <Button variant="gold" className="w-full gap-2 sm:w-auto">
                    <ClipboardList className="h-4 w-4" />
                    Adjust Game Plan
                  </Button>
                </Link>

                <Link href={`/depth-chart?team=${selectedMyTeamId}`}>
                  <Button variant="secondary" className="w-full gap-2 sm:w-auto">
                    <BarChart3 className="h-4 w-4" />
                    Depth Chart
                  </Button>
                </Link>

                <Link href={`/challenge-hub?team=${selectedMyTeamId}`}>
                  <Button variant="secondary" className="w-full gap-2 sm:w-auto">
                    <Swords className="h-4 w-4" />
                    Challenge Hub
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatPill
                label="Opponent OVR"
                value={opponent.overallRating}
                tone="gold"
              />
              <StatPill
                label="Threat"
                value={getThreatLevel(opponent.overallRating)}
                tone={opponent.overallRating >= 80 ? "danger" : "info"}
              />
              <StatPill
                label="Rating Gap"
                value={
                  selectedMyTeam
                    ? `${ratingDiff > 0 ? "+" : ""}${ratingDiff}`
                    : "N/A"
                }
                tone={ratingDiff >= 0 ? "success" : "danger"}
              />
              <StatPill
                label="Scout Level"
                value={reportUnlocked ? "Advanced" : "Basic"}
              />
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
          <TeamMiniPanel label="Your Franchise" team={selectedMyTeam}>
            <div className="relative mt-4">
              <select
                value={selectedMyTeamId}
                onChange={(event) => {
                  setSelectedMyTeamId(event.target.value);
                  updateUrl(event.target.value, selectedOpponentId);
                }}
                className="w-full appearance-none rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 pr-10 text-sm font-semibold text-white outline-none transition focus:border-gold/50"
              >
                {myFranchises.length > 0 ? (
                  myFranchises.map((team) => (
                    <option key={team.id} value={team.id}>
                      {getTeamDisplayName(team)} — OVR {team.overallRating}
                    </option>
                  ))
                ) : (
                  <option value="">No franchise created yet</option>
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>
          </TeamMiniPanel>

          <TeamMiniPanel label="Opponent Board" team={opponent}>
            <div className="relative mt-4">
              <select
                value={selectedOpponentId}
                onChange={(event) => {
                  setSelectedOpponentId(event.target.value);
                  updateUrl(selectedMyTeamId, event.target.value);
                  setTab("overview");
                }}
                className="w-full appearance-none rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 pr-10 text-sm font-semibold text-white outline-none transition focus:border-gold/50"
              >
                {defaultAiTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {getTeamDisplayName(team)} — {team.difficulty.toUpperCase()} — OVR{" "}
                    {team.overallRating}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>
          </TeamMiniPanel>
        </section>

        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatPill label="Opponent Offense" value={opponent.offensiveRating} />
          <StatPill label="Opponent Defense" value={opponent.defensiveRating} />
          <StatPill label="Special Teams" value={opponent.specialTeamsRating} />
          <StatPill
            label="Players Scouted"
            value={reportUnlocked ? opponentPlayers.length : topPlayers.length}
            tone="gold"
          />
        </section>

        <section className="rounded-[2rem] border border-navy-border bg-navy-card p-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              { id: "overview", label: "Overview", icon: Gauge },
              { id: "roster", label: "Roster", icon: Users },
              { id: "tendencies", label: "Tendencies", icon: Radar },
              { id: "report", label: "Report", icon: LineChart },
            ].map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id as ScoutTab)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-wide transition",
                    active
                      ? "border-gold/40 bg-gold/15 text-gold"
                      : "border-transparent bg-navy-secondary/60 text-text-muted hover:border-gold/25 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        {tab === "overview" && (
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">
            <div className="relative overflow-hidden rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl md:p-6">
              <AssetImage
                src={teamVisualAssets.backgrounds.stadiumFlare}
                alt="Scouting overview glow"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-16"
                fallbackClassName="hidden"
              />

              <div className="relative">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-text-muted">
                      Matchup Read
                    </p>
                    <h2 className="mt-2 text-2xl font-black uppercase text-white">
                      {getThreatLevel(opponent.overallRating)}
                    </h2>
                  </div>

                  <Target className="h-9 w-9 text-gold" />
                </div>

                <div className="rounded-3xl border border-gold/20 bg-gold/10 p-5">
                  <p className="text-sm font-semibold leading-6 text-text-light">
                    {getMatchupSummary(
                      selectedMyTeam?.overallRating,
                      opponent.overallRating
                    )}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Meter
                    label="Quarterback Room"
                    value={opponentStrengths.quarterback}
                    hint="Higher value means the opponent can punish poor coverage."
                  />
                  <Meter
                    label="Skill Positions"
                    value={opponentStrengths.skill}
                    hint="RB, WR and TE combined threat rating."
                  />
                  <Meter
                    label="Trenches"
                    value={opponentStrengths.trenches}
                    hint="Line strength on both sides of the ball."
                  />
                  <Meter
                    label="Coverage Unit"
                    value={opponentStrengths.coverage}
                    hint="Cornerback and safety strength."
                  />
                </div>
              </div>
            </div>

            <aside className="relative overflow-hidden rounded-[2rem] border border-gold/25 bg-gold/10 p-5 shadow-xl md:p-6">
              <AssetImage
                src={getTeamHelmetSrc(opponent)}
                alt={`${getTeamDisplayName(opponent)} helmet`}
                className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 object-contain opacity-14"
                fallbackClassName="hidden"
              />

              <div className="relative">
                <Crown className="h-9 w-9 text-gold" />

                <h2 className="mt-4 text-2xl font-black uppercase text-white">
                  Top Threats
                </h2>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  These are the highest-impact players to plan around. Unlock the full
                  report to reveal deeper traits and coaching recommendations.
                </p>

                <div className="mt-5 space-y-3">
                  {topPlayers.slice(0, 4).map((player) => (
                    <PlayerScoutRow
                      key={player.id}
                      player={player}
                      locked={!reportUnlocked}
                    />
                  ))}
                </div>

                <Button
                  variant={reportUnlocked ? "secondary" : "gold"}
                  className="mt-5 w-full gap-2"
                  onClick={reportUnlocked ? resetReport : unlockReport}
                  disabled={!selectedMyTeamId}
                >
                  {reportUnlocked ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Reset Report
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4" />
                      Unlock Full Report
                    </>
                  )}
                </Button>
              </div>
            </aside>
          </section>
        )}

        {tab === "roster" && (
          <section className="space-y-5">
            <div className="rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search opponent player, position, trait, number..."
                  className="w-full rounded-2xl border border-navy-border bg-navy-secondary px-11 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-text-muted focus:border-gold/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {filteredPlayers.map((player) => (
                <PlayerScoutRow
                  key={player.id}
                  player={player}
                  locked={!reportUnlocked}
                />
              ))}
            </div>
          </section>
        )}

        {tab === "tendencies" && (
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">
            <div className="rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Radar className="h-7 w-7 text-gold" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-text-muted">
                    Tendencies
                  </p>
                  <h2 className="text-2xl font-black uppercase text-white">
                    AI Behavior Estimate
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Meter label="Run Bias" value={tendencies.runBias} />
                <Meter label="Pass Bias" value={tendencies.passBias} />
                <Meter label="Blitz Frequency" value={tendencies.blitz} />
                <Meter label="Deep Passing" value={tendencies.passDepth} />
                <Meter label="Risk Tolerance" value={tendencies.risk} />
                <Meter
                  label="Front Seven Strength"
                  value={opponentStrengths.frontSeven}
                />
              </div>
            </div>

            <aside className="rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl md:p-6">
              <AlertTriangle className="h-8 w-8 text-gold" />
              <h2 className="mt-4 text-2xl font-black uppercase text-white">
                Coaching Warning
              </h2>

              <div className="mt-4 space-y-3 text-sm leading-6 text-text-muted">
                <p>
                  If the opponent has a high blitz tendency, reduce slow-developing
                  plays and increase short-yardage efficiency.
                </p>
                <p>
                  If their coverage unit is strong, avoid forcing deep passes unless your
                  receiver room has a clear speed advantage.
                </p>
                <p>
                  If their trenches are weak, lean into power formations and controlled
                  rushing to reduce turnover risk.
                </p>
              </div>

              <Link href={`/game-plan?team=${selectedMyTeamId}`}>
                <Button variant="gold" className="mt-5 w-full gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Apply In Game Plan
                </Button>
              </Link>
            </aside>
          </section>
        )}

        {tab === "report" && (
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">
            <div className="rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl md:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-text-muted">
                    Advanced Report
                  </p>
                  <h2 className="mt-2 text-2xl font-black uppercase text-white">
                    {reportUnlocked ? "Unlocked Coaching Notes" : "Report Locked"}
                  </h2>
                </div>

                {reportUnlocked ? (
                  <Unlock className="h-9 w-9 text-success" />
                ) : (
                  <Lock className="h-9 w-9 text-gold" />
                )}
              </div>

              {!reportUnlocked ? (
                <div className="rounded-3xl border border-dashed border-gold/30 bg-gold/10 p-6 text-center">
                  <Lock className="mx-auto h-10 w-10 text-gold" />
                  <h3 className="mt-4 text-xl font-black uppercase text-white">
                    Full scouting report is locked
                  </h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-text-muted">
                    Unlock the report to reveal deeper matchup notes, hidden tendency
                    estimates, and coaching recommendations for this opponent.
                  </p>

                  <Button
                    variant="gold"
                    className="mt-5 gap-2"
                    onClick={unlockReport}
                    disabled={!selectedMyTeamId}
                  >
                    <Unlock className="h-4 w-4" />
                    Unlock Full Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-success/25 bg-success/10 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-success">
                      Recommended Approach
                    </p>
                    <p className="mt-2 text-sm leading-6 text-text-light">
                      {ratingDiff >= 0
                        ? "You can control this matchup by staying balanced, protecting possession, and forcing the AI to play from behind."
                        : "You should reduce risk, emphasize short-yardage efficiency, and attack the weakest defensive room instead of chasing big plays."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-3xl border border-navy-border bg-navy-secondary/50 p-5">
                      <Zap className="h-7 w-7 text-gold" />
                      <h3 className="mt-3 text-lg font-black uppercase text-white">
                        Attack Point
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-text-muted">
                        Target the opponent’s weakest major unit. Based on current
                        scouting, that is likely the{" "}
                        <span className="font-black text-white">
                          {opponentStrengths.coverage < opponentStrengths.frontSeven
                            ? "coverage unit"
                            : "front seven"}
                        </span>
                        .
                      </p>
                    </div>

                    <div className="rounded-3xl border border-navy-border bg-navy-secondary/50 p-5">
                      <Shield className="h-7 w-7 text-electric" />
                      <h3 className="mt-3 text-lg font-black uppercase text-white">
                        Defensive Priority
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-text-muted">
                        Keep pressure balanced. Their offensive profile suggests a{" "}
                        <span className="font-black text-white">
                          {tendencies.passBias > tendencies.runBias
                            ? "pass-first"
                            : "run-first"}
                        </span>{" "}
                        lean.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-navy-border bg-navy-secondary/50 p-5">
                      <Activity className="h-7 w-7 text-success" />
                      <h3 className="mt-3 text-lg font-black uppercase text-white">
                        Risk Control
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-text-muted">
                        Their risk rating is {tendencies.risk}. If it is high, wait for
                        mistakes. If it is low, create pressure manually.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-navy-border bg-navy-secondary/50 p-5">
                      <Trophy className="h-7 w-7 text-gold" />
                      <h3 className="mt-3 text-lg font-black uppercase text-white">
                        Win Condition
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-text-muted">
                        Win the turnover battle, avoid unnecessary fourth-down aggression,
                        and make the AI sustain long drives.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <aside className="relative overflow-hidden rounded-[2rem] border border-gold/25 bg-gold/10 p-5 shadow-xl md:p-6">
              <AssetImage
                src={getTeamHelmetSrc(opponent)}
                alt={`${getTeamDisplayName(opponent)} helmet`}
                className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 object-contain opacity-16"
                fallbackClassName="hidden"
              />

              <div className="relative">
                <Sparkles className="h-9 w-9 text-gold" />

                <h2 className="mt-4 text-2xl font-black uppercase text-white">
                  Next Actions
                </h2>

                <p className="mt-2 text-sm leading-6 text-text-muted">
                  Scouting should lead directly into tactical setup. Use this report to
                  update your Game Plan and Depth Chart before starting a challenge.
                </p>

                <div className="mt-5 space-y-3">
                  <Link href={`/game-plan?team=${selectedMyTeamId}`}>
                    <Button variant="gold" className="w-full gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Adjust Game Plan
                    </Button>
                  </Link>

                  <Link href={`/depth-chart?team=${selectedMyTeamId}`}>
                    <Button variant="secondary" className="w-full gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Review Depth Chart
                    </Button>
                  </Link>

                  <Link href={`/challenge-hub?team=${selectedMyTeamId}`}>
                    <Button variant="secondary" className="w-full gap-2">
                      <Swords className="h-4 w-4" />
                      Enter Challenge Hub
                    </Button>
                  </Link>
                </div>

                <div className="mt-5 rounded-2xl border border-navy-border bg-navy-card/70 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-text-muted">
                    Attribute Averages
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <StatPill label="Speed" value={avgSpeed} />
                    <StatPill label="Strength" value={avgStrength} />
                    <StatPill label="IQ" value={avgIQ} />
                    <StatPill label="Consistency" value={avgConsistency} />
                  </div>
                </div>
              </div>
            </aside>
          </section>
        )}

        <section className="rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-gold" />
            <h2 className="text-xl font-black uppercase text-white">
              Scouting Notes
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-navy-secondary/60 p-4">
              <Star className="mb-3 h-5 w-5 text-gold" />
              <p className="font-black uppercase text-white">Basic Intel</p>
              <p className="mt-1 text-sm text-text-muted">
                Shows public ratings, broad team tendencies, and top threat previews.
              </p>
            </div>

            <div className="rounded-2xl bg-navy-secondary/60 p-4">
              <Unlock className="mb-3 h-5 w-5 text-success" />
              <p className="font-black uppercase text-white">Unlocked Report</p>
              <p className="mt-1 text-sm text-text-muted">
                Reveals player ratings, traits, and specific coaching recommendations.
              </p>
            </div>

            <div className="rounded-2xl bg-navy-secondary/60 p-4">
              <Target className="mb-3 h-5 w-5 text-electric" />
              <p className="font-black uppercase text-white">Tactical Loop</p>
              <p className="mt-1 text-sm text-text-muted">
                Use intel to adjust Game Plan, Depth Chart, and challenge decisions.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}