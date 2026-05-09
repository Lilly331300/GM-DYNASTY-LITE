"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowDownAZ,
  BarChart3,
  Bot,
  ChevronDown,
  ClipboardList,
  Crown,
  Dumbbell,
  Eye,
  Filter,
  Gauge,
  LayoutGrid,
  List,
  Search,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  getDepthChartBackupIds,
  getDepthChartStarterIds,
  getTeamPlayers,
  getUserFranchises,
  type StoredFranchiseTeam,
} from "@/lib/gameHub";
import { FranchisePlayer } from "@/lib/defaultAiTeams";
import { cn, formatNumber, formatRecord, getRatingColor } from "@/lib/utils";

type RosterView = "grid" | "table";
type SortMode =
  | "overall-desc"
  | "overall-asc"
  | "name-asc"
  | "age-asc"
  | "age-desc"
  | "speed-desc"
  | "strength-desc"
  | "iq-desc";

type TeamVisualKey =
  | "memphis"
  | "kansas"
  | "dallas"
  | "miami"
  | "chicago"
  | "fallback";

const pageAssets = {
  stadiumFlare: "/assets/dashboard/dashboard-stadium-flare.png",
  fieldBg: "/assets/dashboard/dashboard-field-bg.jpg",
};

const teamImageAssets = {
  helmets: {
    memphis: "/assets/dashboard/primary-franchise-helmet.png",
    kansas: "/assets/teams/helmets/default-helmet-kansas.png",
    dallas: "/assets/teams/helmets/default-helmet-dallas.png",
    miami: "/assets/teams/helmets/default-helmet-miami.png",
    chicago: "/assets/teams/helmets/default-helmet-chicago.png",
    fallback: "/assets/dashboard/primary-franchise-helmet.png",
  },
  cards: {
    memphis: "/assets/teams/cards/memphis-card.png",
    kansas: "/assets/teams/cards/kansas-city-kings-card.png",
    dallas: "/assets/teams/cards/dallas-storm-card.png",
    miami: "/assets/teams/cards/miami-sharks-card.png",
    chicago: "/assets/teams/cards/chicago-bruisers-card.png",
    fallback: "/assets/teams/cards/kansas-city-kings-card.png",
  },
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

const allPlayerFaceAssets = [...rosterFaceAssets, ...fallbackFaceAssets];

const positionGroups = [
  "ALL",
  "QB",
  "RB",
  "WR",
  "TE",
  "OL",
  "DL",
  "LB",
  "CB",
  "S",
  "K",
];

const sortOptions: Array<{ value: SortMode; label: string }> = [
  { value: "overall-desc", label: "Overall: High to Low" },
  { value: "overall-asc", label: "Overall: Low to High" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "age-asc", label: "Age: Youngest" },
  { value: "age-desc", label: "Age: Oldest" },
  { value: "speed-desc", label: "Speed: High to Low" },
  { value: "strength-desc", label: "Strength: High to Low" },
  { value: "iq-desc", label: "IQ: High to Low" },
];

function hashText(text: string) {
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function getPlayerFaceSrc(player: FranchisePlayer) {
  const key = `${player.id}-${getPlayerName(player)}-${getPlayerPosition(player)}`;
  const index = hashText(key) % allPlayerFaceAssets.length;

  return allPlayerFaceAssets[index];
}

function getTopPlayerFaceSrc(player: FranchisePlayer | undefined, fallbackIndex = 0) {
  if (!player) return allPlayerFaceAssets[fallbackIndex] ?? fallbackFaceAssets[0];
  return getPlayerFaceSrc(player);
}

function getTeamVisualKey(team?: StoredFranchiseTeam): TeamVisualKey {
  const text = `${team?.city ?? ""} ${team?.nickname ?? ""} ${
    team?.name ?? ""
  } ${team?.abbreviation ?? ""}`.toLowerCase();

  if (
    text.includes("memphis") ||
    text.includes("your mom") ||
    text.includes("mom")
  ) {
    return "memphis";
  }

  if (text.includes("kansas") || text.includes("king") || text.includes("fighter")) {
    return "kansas";
  }

  if (text.includes("dallas") || text.includes("storm")) {
    return "dallas";
  }

  if (text.includes("miami") || text.includes("shark")) {
    return "miami";
  }

  if (text.includes("chicago") || text.includes("bruiser")) {
    return "chicago";
  }

  return "fallback";
}

function getTeamHelmetSrc(team?: StoredFranchiseTeam) {
  return teamImageAssets.helmets[getTeamVisualKey(team)];
}

function getTeamCardSrc(team?: StoredFranchiseTeam) {
  return teamImageAssets.cards[getTeamVisualKey(team)];
}

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

function getPlayerName(player: FranchisePlayer) {
  const anyPlayer = player as any;
  const fallback = `${anyPlayer.firstName ?? ""} ${anyPlayer.lastName ?? ""}`.trim();

  return String(anyPlayer.name ?? fallback ?? "Unknown Player");
}

function getPlayerOverall(player: FranchisePlayer) {
  const anyPlayer = player as any;
  return Number(anyPlayer.overall ?? anyPlayer.overallRating ?? 60);
}

function getPlayerNumber(player: FranchisePlayer) {
  return Number((player as any).number ?? 0);
}

function getPlayerAge(player: FranchisePlayer) {
  return Number((player as any).age ?? 24);
}

function getPlayerTrait(player: FranchisePlayer) {
  const anyPlayer = player as any;
  return String(
    anyPlayer.trait ??
      anyPlayer.developmentTrait ??
      anyPlayer.specialSkill ??
      "Normal"
  );
}

function getPlayerSpeed(player: FranchisePlayer) {
  return Number((player as any).speed ?? 60);
}

function getPlayerStrength(player: FranchisePlayer) {
  return Number((player as any).strength ?? 60);
}

function getPlayerIQ(player: FranchisePlayer) {
  const anyPlayer = player as any;
  return Number(anyPlayer.intelligence ?? anyPlayer.awareness ?? 60);
}

function getPlayerConsistency(player: FranchisePlayer) {
  return Number((player as any).consistency ?? 60);
}

function getPlayerStamina(player: FranchisePlayer) {
  return Number((player as any).stamina ?? (player as any).durability ?? 60);
}

function getPlayerPosition(player: FranchisePlayer) {
  return String((player as any).position ?? "ATH").toUpperCase();
}

function getTeamDisplayName(team?: StoredFranchiseTeam) {
  if (!team) return "No Franchise";

  const city = team.city?.trim();
  const nickname = team.nickname?.trim();

  if (city && nickname) return `${city} ${nickname}`;
  return team.name ?? nickname ?? city ?? "Unnamed Franchise";
}

function getTeamInitials(team?: StoredFranchiseTeam) {
  if (!team) return "GM";
  if (team.abbreviation) return team.abbreviation.slice(0, 3).toUpperCase();

  return getTeamDisplayName(team)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function positionMatches(playerPosition: string, selected: string) {
  if (selected === "ALL") return true;
  if (selected === playerPosition) return true;

  if (selected === "OL") {
    return ["LT", "LG", "C", "RG", "RT", "OL"].includes(playerPosition);
  }

  if (selected === "DL") {
    return ["LE", "RE", "DT", "DE", "DL"].includes(playerPosition);
  }

  if (selected === "LB") {
    return ["LOLB", "MLB", "ROLB", "LB"].includes(playerPosition);
  }

  if (selected === "S") {
    return ["FS", "SS", "S"].includes(playerPosition);
  }

  return false;
}

function getPlayerTier(overall: number) {
  if (overall >= 90) return "Elite";
  if (overall >= 82) return "Star";
  if (overall >= 74) return "Starter";
  if (overall >= 66) return "Rotation";
  return "Depth";
}

function getPlayerRole(
  player: FranchisePlayer,
  starterIds: string[],
  backupIds: string[]
) {
  if (starterIds.includes(player.id)) return "Starter";
  if (backupIds.includes(player.id)) return "Backup";
  return "Reserve";
}

function getRoleBadgeVariant(role: string): "gold" | "info" | "outline" {
  if (role === "Starter") return "gold";
  if (role === "Backup") return "info";
  return "outline";
}

function getPositionRoomLabel(position: string) {
  if (position === "OL") return "Offensive Line";
  if (position === "DL") return "Defensive Line";
  if (position === "LB") return "Linebackers";
  if (position === "S") return "Safeties";
  if (position === "ALL") return "Full Roster";
  return position;
}

function sortPlayers(players: FranchisePlayer[], sort: SortMode) {
  return [...players].sort((a, b) => {
    if (sort === "overall-desc") return getPlayerOverall(b) - getPlayerOverall(a);
    if (sort === "overall-asc") return getPlayerOverall(a) - getPlayerOverall(b);
    if (sort === "name-asc") return getPlayerName(a).localeCompare(getPlayerName(b));
    if (sort === "age-asc") return getPlayerAge(a) - getPlayerAge(b);
    if (sort === "age-desc") return getPlayerAge(b) - getPlayerAge(a);
    if (sort === "speed-desc") return getPlayerSpeed(b) - getPlayerSpeed(a);
    if (sort === "strength-desc") {
      return getPlayerStrength(b) - getPlayerStrength(a);
    }
    if (sort === "iq-desc") return getPlayerIQ(b) - getPlayerIQ(a);

    return getPlayerOverall(b) - getPlayerOverall(a);
  });
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

function PlayerAvatar({
  player,
  size = "md",
  className,
}: {
  player: FranchisePlayer;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClass =
    size === "xl"
      ? "h-32 w-32 rounded-[2rem]"
      : size === "lg"
        ? "h-20 w-20 rounded-3xl"
        : size === "sm"
          ? "h-10 w-10 rounded-xl"
          : "h-14 w-14 rounded-2xl";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden border border-gold/20 bg-navy-secondary shadow-xl",
        sizeClass,
        className
      )}
    >
      <AssetImage
        src={getPlayerFaceSrc(player)}
        alt={getPlayerName(player)}
        className="h-full w-full object-cover"
        fallbackClassName="h-full w-full"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.14),transparent_42%)]" />
    </div>
  );
}

function TeamHelmet({ team, compact = false }: { team: StoredFranchiseTeam; compact?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-visible",
        compact ? "h-16 w-16" : "h-24 w-24"
      )}
    >
      <AssetImage
        src={getTeamHelmetSrc(team)}
        alt={getTeamDisplayName(team)}
        className="h-full w-full object-contain drop-shadow-2xl"
        fallbackClassName="h-full w-full"
      />
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

function RatingMeter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-wide text-text-muted">
          {label}
        </span>
        <span className={cn("text-sm font-black", getRatingColor(value))}>
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-navy-primary">
        <div
          className="h-full rounded-full bg-gold"
          style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function TeamIdentity({
  team,
  compact = false,
}: {
  team: StoredFranchiseTeam;
  compact?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <TeamHelmet team={team} compact={compact} />

      <div className="min-w-0">
        <p className="truncate text-[11px] font-black uppercase tracking-[0.28em] text-gold">
          Selected Franchise
        </p>
        <h2
          className={cn(
            "mt-1 truncate font-black uppercase text-white",
            compact ? "text-xl" : "text-2xl md:text-3xl"
          )}
        >
          {getTeamDisplayName(team)}
        </h2>
        <p className="truncate text-sm font-semibold text-text-muted">
          {formatRecord(team.record.wins, team.record.losses, team.record.ties)} ·
          OVR {team.overallRating} · {team.division}
        </p>
      </div>
    </div>
  );
}

function TeamSelector({
  teams,
  selectedTeamId,
  onChange,
}: {
  teams: StoredFranchiseTeam[];
  selectedTeamId: string;
  onChange: (teamId: string) => void;
}) {
  const selectedTeam = teams.find((team) => team.id === selectedTeamId);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl md:p-6">
      <AssetImage
        src={pageAssets.stadiumFlare}
        alt="Roster stadium flare"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
        fallbackClassName="hidden"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,26,42,0.88),rgba(11,26,42,0.72),rgba(11,26,42,0.9))]" />

      <div className="relative grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px] xl:items-center">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
            Franchise Roster
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase text-white">
            Select Franchise
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-text-muted">
            Every owned franchise has its own generated roster, rating profile, player
            traits, and depth-chart setup.
          </p>

          <div className="relative mt-4">
            <select
              value={selectedTeamId}
              onChange={(event) => onChange(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 pr-10 text-sm font-semibold text-white outline-none transition focus:border-gold/50"
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {getTeamDisplayName(team)} — OVR {team.overallRating}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        {selectedTeam && (
          <div className="relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/10 via-navy-secondary/70 to-navy-primary p-4">
            <AssetImage
              src={getTeamCardSrc(selectedTeam)}
              alt={`${getTeamDisplayName(selectedTeam)} franchise card`}
              className="pointer-events-none absolute right-0 top-0 h-full w-40 object-cover opacity-18"
              fallbackClassName="hidden"
            />

            <div className="relative">
              <TeamIdentity team={selectedTeam} compact />

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-navy-primary/70 px-3 py-2 text-center">
                  <p className="text-[10px] font-black uppercase text-text-muted">
                    Off
                  </p>
                  <p className="text-lg font-black text-white">
                    {selectedTeam.offensiveRating}
                  </p>
                </div>

                <div className="rounded-2xl bg-navy-primary/70 px-3 py-2 text-center">
                  <p className="text-[10px] font-black uppercase text-text-muted">
                    Def
                  </p>
                  <p className="text-lg font-black text-white">
                    {selectedTeam.defensiveRating}
                  </p>
                </div>

                <div className="rounded-2xl bg-navy-primary/70 px-3 py-2 text-center">
                  <p className="text-[10px] font-black uppercase text-text-muted">
                    ST
                  </p>
                  <p className="text-lg font-black text-white">
                    {selectedTeam.specialTeamsRating}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PositionRoomCard({
  label,
  players,
}: {
  label: string;
  players: FranchisePlayer[];
}) {
  const count = players.length;
  const average =
    count > 0
      ? Math.round(players.reduce((sum, player) => sum + getPlayerOverall(player), 0) / count)
      : 0;
  const best = players[0];

  return (
    <div className="min-w-0 rounded-3xl border border-navy-border bg-navy-card p-4 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.24em] text-text-muted">
            {getPositionRoomLabel(label)}
          </p>
          <p className="mt-1 text-2xl font-black text-white">{average}</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-gold/10 px-3 py-2 text-xs font-black text-gold">
          {count} players
        </div>
      </div>

      {best ? (
        <button
          type="button"
          className="mt-4 flex w-full min-w-0 items-center gap-3 rounded-2xl bg-navy-secondary/60 p-3 text-left transition hover:bg-navy-secondary"
        >
          <PlayerAvatar player={best} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-black uppercase text-white">
              {getPlayerName(best)}
            </p>
            <p className="mt-1 text-xs font-semibold text-text-muted">
              Best in room · {getPlayerPosition(best)} · OVR {getPlayerOverall(best)}
            </p>
          </div>
        </button>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-navy-border p-3 text-xs text-text-muted">
          No players in this room.
        </div>
      )}
    </div>
  );
}

function PlayerCard({
  player,
  role,
  onOpen,
}: {
  player: FranchisePlayer;
  role: string;
  onOpen: (player: FranchisePlayer) => void;
}) {
  const overall = getPlayerOverall(player);
  const position = getPlayerPosition(player);
  const tier = getPlayerTier(overall);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group min-w-0 overflow-hidden rounded-[2rem] border border-navy-border bg-navy-card shadow-xl transition hover:border-gold/30"
    >
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.16),transparent_42%),linear-gradient(180deg,#16283A,#0B1A2A)]" />

        <div className="relative flex items-start justify-between gap-4 p-5 pb-0">
          <div className="flex min-w-0 items-center gap-3">
            <PlayerAvatar player={player} size="lg" />

            <div className="min-w-0">
              <h3 className="truncate text-lg font-black uppercase text-white">
                {getPlayerName(player)}
              </h3>
              <p className="text-xs font-semibold text-text-muted">
                #{getPlayerNumber(player)} · {position} · Age {getPlayerAge(player)}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs font-black uppercase text-text-muted">OVR</p>
            <p className={cn("text-3xl font-black", getRatingColor(overall))}>
              {overall}
            </p>
          </div>
        </div>

        <div className="relative px-5 py-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant={getRoleBadgeVariant(role)}>
              <Shield className="mr-1 h-3 w-3" />
              {role}
            </Badge>

            <Badge variant="info">
              <Star className="mr-1 h-3 w-3" />
              {getPlayerTrait(player)}
            </Badge>

            {overall >= 82 && (
              <Badge variant="success">
                <Crown className="mr-1 h-3 w-3" />
                Impact
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center">
              <p className="text-xs font-black uppercase text-text-muted">SPD</p>
              <p className="text-xl font-black text-white">{getPlayerSpeed(player)}</p>
            </div>

            <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center">
              <p className="text-xs font-black uppercase text-text-muted">STR</p>
              <p className="text-xl font-black text-white">
                {getPlayerStrength(player)}
              </p>
            </div>

            <div className="rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-center">
              <p className="text-xs font-black uppercase text-text-muted">IQ</p>
              <p className="text-xl font-black text-white">{getPlayerIQ(player)}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-navy-border bg-navy-primary/70 px-4 py-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                Player Tier
              </p>
              <p className="text-sm font-black uppercase text-white">{tier}</p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => onOpen(player)}
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function PlayerTable({
  players,
  starterIds,
  backupIds,
  onOpen,
}: {
  players: FranchisePlayer[];
  starterIds: string[];
  backupIds: string[];
  onOpen: (player: FranchisePlayer) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-navy-border bg-navy-card shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead className="border-b border-navy-border bg-navy-secondary/80">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                Player
              </th>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                Role
              </th>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                Pos
              </th>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                OVR
              </th>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                Speed
              </th>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                Strength
              </th>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                IQ
              </th>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-text-muted">
                Trait
              </th>
              <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-widest text-text-muted">
                View
              </th>
            </tr>
          </thead>

          <tbody>
            {players.map((player) => {
              const role = getPlayerRole(player, starterIds, backupIds);
              const overall = getPlayerOverall(player);

              return (
                <tr
                  key={player.id}
                  className="border-b border-navy-border/70 transition hover:bg-navy-secondary/40"
                >
                  <td className="px-4 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <PlayerAvatar player={player} size="sm" />

                      <div className="min-w-0">
                        <p className="truncate font-black uppercase text-white">
                          {getPlayerName(player)}
                        </p>
                        <p className="text-xs text-text-muted">
                          #{getPlayerNumber(player)} · Age {getPlayerAge(player)}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <Badge variant={getRoleBadgeVariant(role)}>{role}</Badge>
                  </td>

                  <td className="px-4 py-4 font-black text-gold">
                    {getPlayerPosition(player)}
                  </td>

                  <td className={cn("px-4 py-4 font-black", getRatingColor(overall))}>
                    {overall}
                  </td>

                  <td className="px-4 py-4 font-bold text-text-muted">
                    {getPlayerSpeed(player)}
                  </td>

                  <td className="px-4 py-4 font-bold text-text-muted">
                    {getPlayerStrength(player)}
                  </td>

                  <td className="px-4 py-4 font-bold text-text-muted">
                    {getPlayerIQ(player)}
                  </td>

                  <td className="px-4 py-4">
                    <Badge variant="info">{getPlayerTrait(player)}</Badge>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                      onClick={() => onOpen(player)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PlayerModal({
  player,
  role,
  onClose,
}: {
  player: FranchisePlayer;
  role: string;
  onClose: () => void;
}) {
  const overall = getPlayerOverall(player);
  const position = getPlayerPosition(player);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-navy-border bg-navy-card shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-navy-border bg-navy-card/95 p-5 backdrop-blur">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">
              Player Profile
            </p>
            <h2 className="mt-1 truncate text-2xl font-black uppercase text-white">
              {getPlayerName(player)}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-navy-border bg-navy-secondary text-text-muted transition hover:border-danger/40 hover:text-danger"
            aria-label="Close player profile"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
            <div className="relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/10 via-navy-secondary to-navy-primary p-5 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,197,66,0.16),transparent_48%)]" />

              <div className="relative mx-auto">
                <PlayerAvatar player={player} size="xl" className="mx-auto" />
              </div>

              <h3 className="relative mt-4 text-2xl font-black uppercase text-white">
                {position}
              </h3>

              <p className={cn("relative mt-2 text-5xl font-black", getRatingColor(overall))}>
                {overall}
              </p>

              <p className="relative text-xs font-black uppercase tracking-[0.24em] text-text-muted">
                Overall Rating
              </p>

              <div className="relative mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant={getRoleBadgeVariant(role)}>{role}</Badge>
                <Badge variant="info">{getPlayerTrait(player)}</Badge>
                <Badge variant="outline">#{getPlayerNumber(player)}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatPill label="Age" value={getPlayerAge(player)} />
                <StatPill label="Speed" value={getPlayerSpeed(player)} tone="info" />
                <StatPill
                  label="Strength"
                  value={getPlayerStrength(player)}
                  tone="gold"
                />
                <StatPill label="IQ" value={getPlayerIQ(player)} tone="success" />
              </div>

              <div className="rounded-3xl border border-navy-border bg-navy-secondary/50 p-5">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.24em] text-text-muted">
                  Attribute Breakdown
                </p>

                <div className="space-y-4">
                  <RatingMeter label="Speed" value={getPlayerSpeed(player)} />
                  <RatingMeter label="Strength" value={getPlayerStrength(player)} />
                  <RatingMeter label="Football IQ" value={getPlayerIQ(player)} />
                  <RatingMeter
                    label="Consistency"
                    value={getPlayerConsistency(player)}
                  />
                  <RatingMeter label="Stamina" value={getPlayerStamina(player)} />
                </div>
              </div>

              <div className="rounded-3xl border border-navy-border bg-navy-secondary/50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-text-muted">
                  Coaching Note
                </p>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  {getPlayerName(player)} projects as a{" "}
                  <span className="font-black text-white">
                    {getPlayerTier(overall).toLowerCase()}
                  </span>{" "}
                  level {position}. Use the Depth Chart page to control whether this
                  player starts, backs up, or stays in reserve for simulation priority.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="gap-2" onClick={onClose}>
              Close
            </Button>

            <Link href="/depth-chart">
              <Button variant="gold" className="w-full gap-2 sm:w-auto">
                <BarChart3 className="h-4 w-4" />
                Open Depth Chart
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function RosterPage() {
  const [teams, setTeams] = useState<StoredFranchiseTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("ALL");
  const [sort, setSort] = useState<SortMode>("overall-desc");
  const [view, setView] = useState<RosterView>("grid");
  const [selectedPlayer, setSelectedPlayer] = useState<FranchisePlayer | null>(null);

  useEffect(() => {
    const userTeams = getUserFranchises();
    const params = new URLSearchParams(window.location.search);
    const teamFromUrl = params.get("team");
    const primaryTeamId = window.localStorage.getItem("gmdl_primary_franchise");

    const validInitialTeam =
      userTeams.find((team) => team.id === teamFromUrl)?.id ??
      userTeams.find((team) => team.id === primaryTeamId)?.id ??
      userTeams[0]?.id ??
      "";

    setTeams(userTeams);
    setSelectedTeamId(validInitialTeam);
  }, []);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId),
    [teams, selectedTeamId]
  );

  const players = useMemo(() => {
    if (!selectedTeamId) return [];
    return getTeamPlayers(selectedTeamId);
  }, [selectedTeamId]);

  const starterIds = useMemo(() => {
    if (!selectedTeamId) return [];
    return getDepthChartStarterIds(selectedTeamId);
  }, [selectedTeamId]);

  const backupIds = useMemo(() => {
    if (!selectedTeamId) return [];
    return getDepthChartBackupIds(selectedTeamId);
  }, [selectedTeamId]);

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const visible = players.filter((player) => {
      const name = getPlayerName(player).toLowerCase();
      const playerPosition = getPlayerPosition(player);

      const matchesSearch =
        !query ||
        name.includes(query) ||
        playerPosition.toLowerCase().includes(query) ||
        String(getPlayerNumber(player)).includes(query) ||
        getPlayerTrait(player).toLowerCase().includes(query);

      const matchesPosition = positionMatches(playerPosition, position);

      return matchesSearch && matchesPosition;
    });

    return sortPlayers(visible, sort);
  }, [players, search, position, sort]);

  const averageOverall =
    players.length > 0
      ? Math.round(
          players.reduce((sum, player) => sum + getPlayerOverall(player), 0) /
            players.length
        )
      : 0;

  const topPlayer = useMemo(
    () => sortPlayers(players, "overall-desc")[0],
    [players]
  );

  const youngestPlayer = useMemo(
    () => sortPlayers(players, "age-asc")[0],
    [players]
  );

  const fastestPlayer = useMemo(
    () => sortPlayers(players, "speed-desc")[0],
    [players]
  );

  const starterCount = players.filter((player) => starterIds.includes(player.id)).length;
  const backupCount = players.filter((player) => backupIds.includes(player.id)).length;

  const roomPlayers = useMemo(() => {
    return positionGroups
      .filter((item) => item !== "ALL")
      .slice(0, 6)
      .map((item) => ({
        label: item,
        players: sortPlayers(
          players.filter((player) => positionMatches(getPlayerPosition(player), item)),
          "overall-desc"
        ),
      }));
  }, [players]);

  if (teams.length === 0) {
    return (
      <AppShell>
        <div className="rounded-[2rem] border border-dashed border-navy-border bg-navy-card p-10 text-center shadow-xl">
          <Shield className="mx-auto h-12 w-12 text-gold" />
          <h1 className="mt-4 text-3xl font-black uppercase text-white">
            No Franchise Found
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-text-muted">
            Create a franchise first, then return here to manage its roster, player
            ratings, traits, and depth-chart priority.
          </p>

          <Link href="/team-create">
            <Button variant="gold" className="mt-5 gap-2">
              <Sparkles className="h-4 w-4" />
              Create Franchise
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-2xl md:p-6"
        >
          <AssetImage
            src={pageAssets.fieldBg}
            alt="Roster field background"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-34"
            fallbackClassName="hidden"
          />

          <AssetImage
            src={selectedTeam ? getTeamCardSrc(selectedTeam) : teamImageAssets.cards.fallback}
            alt="Roster franchise card"
            className="pointer-events-none absolute right-0 top-0 hidden h-full w-[360px] object-cover opacity-18 xl:block"
            fallbackClassName="hidden"
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,26,42,0.94),rgba(11,26,42,0.82),rgba(11,26,42,0.94))]" />
          <div className="absolute right-[-120px] top-[-120px] h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute bottom-[-140px] left-[20%] h-72 w-72 rounded-full bg-electric/10 blur-3xl" />

          <div className="relative grid grid-cols-1 gap-6 xl:grid-cols-[1fr_520px] xl:items-center">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="gold">
                  <Users className="mr-1 h-3 w-3" />
                  Franchise Roster
                </Badge>

                <Badge variant="info">
                  <Shield className="mr-1 h-3 w-3" />
                  {players.length} Players
                </Badge>

                <Badge variant="success">
                  <Activity className="mr-1 h-3 w-3" />
                  Avg OVR {averageOverall}
                </Badge>
              </div>

              <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
                Roster Control
              </h1>

              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-text-muted md:text-base">
                Review each franchise’s player pool, compare position rooms, inspect
                traits, and confirm which athletes are already prioritized by the saved
                Depth Chart.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href={`/depth-chart?team=${selectedTeamId}`}>
                  <Button variant="gold" className="w-full gap-2 sm:w-auto">
                    <BarChart3 className="h-4 w-4" />
                    Edit Depth Chart
                  </Button>
                </Link>

                <Link href={`/game-plan?team=${selectedTeamId}`}>
                  <Button variant="secondary" className="w-full gap-2 sm:w-auto">
                    <ClipboardList className="h-4 w-4" />
                    Game Plan
                  </Button>
                </Link>

                <Link href={`/scouting?team=${selectedTeamId}`}>
                  <Button variant="secondary" className="w-full gap-2 sm:w-auto">
                    <Target className="h-4 w-4" />
                    Scouting
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-2">
              <StatPill label="Players" value={players.length} />
              <StatPill label="Avg OVR" value={averageOverall} tone="gold" />
              <StatPill label="Starters" value={starterCount} tone="success" />
              <StatPill label="Backups" value={backupCount} tone="info" />
            </div>
          </div>
        </motion.section>

        <TeamSelector
          teams={teams}
          selectedTeamId={selectedTeamId}
          onChange={(teamId) => {
            setSelectedTeamId(teamId);
            setSearch("");
            setPosition("ALL");
            setSelectedPlayer(null);

            const params = new URLSearchParams(window.location.search);
            params.set("team", teamId);
            window.history.replaceState(null, "", `?${params.toString()}`);
          }}
        />

        {selectedTeam && (
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-gold/25 bg-gradient-to-br from-gold/10 via-navy-card to-navy-secondary p-5 shadow-xl md:p-6">
              <AssetImage
                src={getTeamCardSrc(selectedTeam)}
                alt={`${getTeamDisplayName(selectedTeam)} card`}
                className="pointer-events-none absolute right-0 top-0 hidden h-full w-56 object-cover opacity-16 lg:block"
                fallbackClassName="hidden"
              />
              <div className="relative">
                <TeamIdentity team={selectedTeam} />

                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatPill label="Offense" value={selectedTeam.offensiveRating} />
                  <StatPill label="Defense" value={selectedTeam.defensiveRating} />
                  <StatPill label="Special" value={selectedTeam.specialTeamsRating} />
                  <StatPill label="Prestige" value={formatNumber(selectedTeam.prestige)} />
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl md:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-text-muted">
                    Roster Spotlight
                  </p>
                  <h2 className="mt-1 text-2xl font-black uppercase text-white">
                    Key Players
                  </h2>
                </div>

                <Crown className="h-7 w-7 text-gold" />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-1">
                {[
                  { label: "Top Rated", player: topPlayer, icon: Crown },
                  { label: "Fastest", player: fastestPlayer, icon: Zap },
                  { label: "Youngest", player: youngestPlayer, icon: TrendingUp },
                ].map((item, index) => {
                  const Icon = item.icon;

                  return item.player ? (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setSelectedPlayer(item.player)}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-navy-border bg-navy-secondary/60 p-3 text-left transition hover:border-gold/30"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <PlayerAvatar player={item.player} size="sm" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-gold" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                              {item.label}
                            </p>
                          </div>
                          <p className="truncate text-sm font-black uppercase text-white">
                            {getPlayerName(item.player)}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-lg font-black text-gold">
                        {getPlayerOverall(item.player)}
                      </span>
                    </button>
                  ) : null;
                })}
              </div>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roomPlayers.map((room) => (
            <PositionRoomCard
              key={room.label}
              label={room.label}
              players={room.players}
            />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <section className="rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_160px_240px_180px]">
              <div className="relative min-w-0">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search player, position, trait, jersey number..."
                  className="w-full rounded-2xl border border-navy-border bg-navy-secondary px-11 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-text-muted focus:border-gold/50"
                />
              </div>

              <div className="relative">
                <select
                  value={position}
                  onChange={(event) => setPosition(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 pr-10 text-sm font-semibold text-white outline-none transition focus:border-gold/50"
                >
                  {positionGroups.map((item) => (
                    <option key={item} value={item}>
                      {getPositionRoomLabel(item)}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              </div>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortMode)}
                  className="w-full appearance-none rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 pr-10 text-sm font-semibold text-white outline-none transition focus:border-gold/50"
                >
                  {sortOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <ArrowDownAZ className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-navy-border bg-navy-secondary p-1">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-black uppercase transition",
                    view === "grid"
                      ? "bg-gold text-navy-primary"
                      : "text-text-muted hover:text-white"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Grid
                </button>

                <button
                  type="button"
                  onClick={() => setView("table")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-black uppercase transition",
                    view === "table"
                      ? "bg-gold text-navy-primary"
                      : "text-text-muted hover:text-white"
                  )}
                >
                  <List className="h-4 w-4" />
                  Table
                </button>
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-gold/30 bg-gold/10 p-5 shadow-xl">
            <Crown className="mb-3 h-7 w-7 text-gold" />
            <h2 className="text-xl font-black uppercase text-white">
              {selectedTeam?.nickname ?? "Selected"} Roster
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Showing{" "}
              <span className="font-black text-white">
                {filteredPlayers.length}
              </span>{" "}
              of <span className="font-black text-white">{players.length}</span>{" "}
              players. Starters and backups are pulled from the saved Depth Chart.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link href={`/depth-chart?team=${selectedTeamId}`}>
                <Button variant="gold" className="w-full gap-2">
                  <Gauge className="h-4 w-4" />
                  Depth
                </Button>
              </Link>

              <Link href={`/challenge-hub?team=${selectedTeamId}`}>
                <Button variant="secondary" className="w-full gap-2">
                  <Bot className="h-4 w-4" />
                  Play
                </Button>
              </Link>
            </div>
          </aside>
        </section>

        {filteredPlayers.length === 0 ? (
          <section className="rounded-[2rem] border border-dashed border-navy-border bg-navy-card p-10 text-center shadow-xl">
            <Filter className="mx-auto h-10 w-10 text-text-muted" />
            <h2 className="mt-4 text-2xl font-black uppercase text-white">
              No players found
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Try changing the search, position filter, or sort option.
            </p>
          </section>
        ) : view === "grid" ? (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                role={getPlayerRole(player, starterIds, backupIds)}
                onOpen={setSelectedPlayer}
              />
            ))}
          </section>
        ) : (
          <PlayerTable
            players={filteredPlayers}
            starterIds={starterIds}
            backupIds={backupIds}
            onOpen={setSelectedPlayer}
          />
        )}

        <section className="rounded-[2rem] border border-navy-border bg-navy-card p-5 shadow-xl md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-gold" />
            <h2 className="text-xl font-black uppercase text-white">
              Roster Notes
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-navy-secondary/60 p-4">
              <User className="mb-3 h-5 w-5 text-electric" />
              <p className="font-black uppercase text-white">
                Franchise-specific players
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Each created franchise gets a different generated player pool.
              </p>
            </div>

            <div className="rounded-2xl bg-navy-secondary/60 p-4">
              <Star className="mb-3 h-5 w-5 text-gold" />
              <p className="font-black uppercase text-white">Ratings matter</p>
              <p className="mt-1 text-sm text-text-muted">
                Better rosters influence future simulation logic and matchup strength.
              </p>
            </div>

            <div className="rounded-2xl bg-navy-secondary/60 p-4">
              <Shield className="mb-3 h-5 w-5 text-success" />
              <p className="font-black uppercase text-white">Depth chart priority</p>
              <p className="mt-1 text-sm text-text-muted">
                Saved starters and backups are highlighted here for quick review.
              </p>
            </div>
          </div>
        </section>

        {selectedPlayer && (
          <PlayerModal
            player={selectedPlayer}
            role={getPlayerRole(selectedPlayer, starterIds, backupIds)}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </div>
    </AppShell>
  );
}