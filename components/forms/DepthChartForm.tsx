"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Crown,
  Gauge,
  Layers,
  RotateCcw,
  Save,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  getTeamPlayers,
  getUserFranchises,
  type StoredFranchiseTeam,
} from "@/lib/gameHub";
import { type FranchisePlayer } from "@/lib/defaultAiTeams";
import { cn, formatRecord } from "@/lib/utils";

type DepthChartGroup = "offense" | "defense" | "special";

type DepthChartSlot = {
  position: string;
  starterId: string;
  backupId: string;
  group: DepthChartGroup;
};

type TeamDepthChart = {
  teamId: string;
  activeFormation: string;
  slots: DepthChartSlot[];
  lastUpdated: string;
};

type TeamVisualKey =
  | "memphis"
  | "kansas"
  | "dallas"
  | "miami"
  | "chicago"
  | "fallback";

const STORAGE_KEY = "gmdl_team_depth_charts_v2";

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

const FORMATIONS = [
  {
    key: "balanced",
    label: "Balanced Depth Chart",
    description:
      "Default balanced setup using the best-rated starters across offense, defense, and special teams.",
  },
  {
    key: "spread",
    label: "Spread / Passing Focus",
    description:
      "Prioritizes wide receivers, pass blockers, coverage defenders, and speed-based players.",
  },
  {
    key: "power",
    label: "Power / Run Focus",
    description:
      "Prioritizes running backs, tight ends, interior linemen, linebackers, and physical defenders.",
  },
  {
    key: "nickel",
    label: "Nickel Defensive Focus",
    description:
      "Prioritizes extra defensive backs and coverage depth for pass-heavy matchups.",
  },
  {
    key: "dime",
    label: "Dime Defensive Focus",
    description:
      "Prioritizes maximum defensive back coverage and passing-down personnel.",
  },
];

const POSITION_SLOTS: Array<{
  position: string;
  group: DepthChartGroup;
  label: string;
  description: string;
}> = [
  {
    position: "QB",
    group: "offense",
    label: "Quarterback",
    description: "Main passer and offensive decision maker.",
  },
  {
    position: "RB",
    group: "offense",
    label: "Running Back",
    description: "Primary ball carrier and backfield option.",
  },
  {
    position: "FB",
    group: "offense",
    label: "Fullback",
    description: "Power blocker and short-yardage back.",
  },
  {
    position: "WR",
    group: "offense",
    label: "Wide Receiver",
    description: "Primary outside receiving threat.",
  },
  {
    position: "WR2",
    group: "offense",
    label: "Wide Receiver 2",
    description: "Secondary receiving option.",
  },
  {
    position: "SLOT",
    group: "offense",
    label: "Slot Receiver",
    description: "Interior receiver for quick passing concepts.",
  },
  {
    position: "TE",
    group: "offense",
    label: "Tight End",
    description: "Hybrid blocker and receiving option.",
  },
  {
    position: "LT",
    group: "offense",
    label: "Left Tackle",
    description: "Blindside pass protector.",
  },
  {
    position: "LG",
    group: "offense",
    label: "Left Guard",
    description: "Interior offensive lineman.",
  },
  {
    position: "C",
    group: "offense",
    label: "Center",
    description: "Snap and interior protection anchor.",
  },
  {
    position: "RG",
    group: "offense",
    label: "Right Guard",
    description: "Interior offensive lineman.",
  },
  {
    position: "RT",
    group: "offense",
    label: "Right Tackle",
    description: "Edge pass protector.",
  },
  {
    position: "LE",
    group: "defense",
    label: "Left Edge",
    description: "Edge pressure and run containment.",
  },
  {
    position: "DT",
    group: "defense",
    label: "Defensive Tackle",
    description: "Interior run stopper and pocket disruptor.",
  },
  {
    position: "RE",
    group: "defense",
    label: "Right Edge",
    description: "Edge pressure and backside pursuit.",
  },
  {
    position: "LOLB",
    group: "defense",
    label: "Left Outside LB",
    description: "Coverage, blitzing, and run support.",
  },
  {
    position: "MLB",
    group: "defense",
    label: "Middle Linebacker",
    description: "Defensive leader and run-fit anchor.",
  },
  {
    position: "ROLB",
    group: "defense",
    label: "Right Outside LB",
    description: "Coverage, blitzing, and run support.",
  },
  {
    position: "CB",
    group: "defense",
    label: "Cornerback",
    description: "Primary outside coverage defender.",
  },
  {
    position: "CB2",
    group: "defense",
    label: "Cornerback 2",
    description: "Secondary outside coverage defender.",
  },
  {
    position: "NB",
    group: "defense",
    label: "Nickel Back",
    description: "Slot coverage defender.",
  },
  {
    position: "FS",
    group: "defense",
    label: "Free Safety",
    description: "Deep coverage and ball-hawking safety.",
  },
  {
    position: "SS",
    group: "defense",
    label: "Strong Safety",
    description: "Box support and intermediate coverage.",
  },
  {
    position: "K",
    group: "special",
    label: "Kicker",
    description: "Field goals, PATs, and kickoff leg strength.",
  },
  {
    position: "P",
    group: "special",
    label: "Punter",
    description: "Field position and punt control.",
  },
  {
    position: "KR",
    group: "special",
    label: "Kick Returner",
    description: "Primary kickoff return threat.",
  },
  {
    position: "PR",
    group: "special",
    label: "Punt Returner",
    description: "Primary punt return threat.",
  },
];

function hashText(text: string) {
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function getPlayerName(player?: FranchisePlayer) {
  if (!player) return "Unassigned";

  const anyPlayer = player as any;

  if (anyPlayer.name) return String(anyPlayer.name);

  const firstName = anyPlayer.firstName ?? "";
  const lastName = anyPlayer.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "Unknown Player";
}

function getPlayerPosition(player?: FranchisePlayer) {
  if (!player) return "ATH";
  return String((player as any).position ?? "ATH").toUpperCase();
}

function getPlayerOverall(player?: FranchisePlayer) {
  if (!player) return 0;
  return Number((player as any).overall ?? (player as any).overallRating ?? 60);
}

function getPlayerNumber(player?: FranchisePlayer) {
  if (!player) return 0;
  return Number((player as any).number ?? 0);
}

function getPlayerAge(player?: FranchisePlayer) {
  if (!player) return 24;
  return Number((player as any).age ?? 24);
}

function getPlayerSpeed(player?: FranchisePlayer) {
  if (!player) return 60;
  return Number((player as any).speed ?? 60);
}

function getPlayerStrength(player?: FranchisePlayer) {
  if (!player) return 60;
  return Number((player as any).strength ?? 60);
}

function getPlayerIQ(player?: FranchisePlayer) {
  if (!player) return 60;
  return Number(
    (player as any).intelligence ?? (player as any).awareness ?? 60
  );
}

function getPlayerTrait(player?: FranchisePlayer) {
  if (!player) return "Normal";
  return String(
    (player as any).trait ??
      (player as any).developmentTrait ??
      (player as any).specialSkill ??
      "Normal"
  );
}

function getPlayerFaceSrc(player?: FranchisePlayer) {
  if (!player) return fallbackFaceAssets[0];

  const key = `${player.id}-${getPlayerName(player)}-${getPlayerPosition(player)}`;
  const index = hashText(key) % allPlayerFaceAssets.length;

  return allPlayerFaceAssets[index];
}

function getInitials(team?: StoredFranchiseTeam) {
  if (!team) return "GM";
  return team.abbreviation || `${team.city[0] ?? "G"}${team.nickname[0] ?? "M"}`;
}

function getTeamDisplayName(team?: StoredFranchiseTeam) {
  if (!team) return "Selected Franchise";

  const city = team.city?.trim();
  const nickname = team.nickname?.trim();

  if (city && nickname) return `${city} ${nickname}`;
  return team.name ?? nickname ?? city ?? "Selected Franchise";
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

function formatUpdatedDate(value?: string) {
  if (!value) return "Not saved yet";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Not saved yet";
  }
}

function normalizePosition(position: string) {
  if (position === "WR2" || position === "SLOT") return "WR";
  if (position === "CB2" || position === "NB") return "CB";
  if (position === "KR" || position === "PR") return "WR";
  if (position === "FB") return "RB";
  return position;
}

function playerFitsSlot(player: FranchisePlayer, slotPosition: string) {
  const playerPosition = getPlayerPosition(player);
  const normalizedSlot = normalizePosition(slotPosition);

  if (playerPosition === slotPosition) return true;
  if (playerPosition === normalizedSlot) return true;

  if (slotPosition === "LE" || slotPosition === "RE") {
    return ["DE", "EDGE", "LE", "RE"].includes(playerPosition);
  }

  if (slotPosition === "DT") {
    return ["DT", "NT"].includes(playerPosition);
  }

  if (["LOLB", "MLB", "ROLB"].includes(slotPosition)) {
    return ["LB", "LOLB", "MLB", "ROLB"].includes(playerPosition);
  }

  if (["LT", "LG", "C", "RG", "RT"].includes(slotPosition)) {
    return ["OL", "LT", "LG", "C", "RG", "RT"].includes(playerPosition);
  }

  if (slotPosition === "TE") {
    return ["TE", "FB"].includes(playerPosition);
  }

  return false;
}

function getEligiblePlayers(players: FranchisePlayer[], slotPosition: string) {
  const direct = players
    .filter((player) => playerFitsSlot(player, slotPosition))
    .sort((a, b) => getPlayerOverall(b) - getPlayerOverall(a));

  if (direct.length > 0) return direct;

  return [...players].sort((a, b) => getPlayerOverall(b) - getPlayerOverall(a));
}

function buildDefaultDepthChart(
  teamId: string,
  players: FranchisePlayer[]
): TeamDepthChart {
  const usedStarters = new Set<string>();

  const slots = POSITION_SLOTS.map((slot) => {
    const eligible = getEligiblePlayers(players, slot.position);

    const starter =
      eligible.find((player) => !usedStarters.has(player.id)) ?? eligible[0];

    if (starter?.id) usedStarters.add(starter.id);

    const backup = eligible.find((player) => player.id !== starter?.id);

    return {
      position: slot.position,
      group: slot.group,
      starterId: starter?.id ?? "",
      backupId: backup?.id ?? "",
    };
  });

  return {
    teamId,
    activeFormation: "balanced",
    slots,
    lastUpdated: new Date().toISOString(),
  };
}

function loadStoredDepthCharts(): Record<string, TeamDepthChart> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, TeamDepthChart>;
  } catch {
    return {};
  }
}

function saveStoredDepthCharts(depthCharts: Record<string, TeamDepthChart>) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(depthCharts));
    window.dispatchEvent(new Event("gmdl-storage-change"));
  } catch {
    console.log("Could not save depth chart.");
  }
}

function getFormationMeta(key: string) {
  return FORMATIONS.find((formation) => formation.key === key) ?? FORMATIONS[0];
}

function getPlayerTier(player?: FranchisePlayer) {
  const overall = getPlayerOverall(player);

  if (overall >= 90) return "Elite";
  if (overall >= 82) return "Star";
  if (overall >= 74) return "Starter";
  if (overall >= 66) return "Rotation";
  return "Depth";
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
}: {
  player?: FranchisePlayer;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg"
      ? "h-20 w-20 rounded-3xl"
      : size === "sm"
        ? "h-10 w-10 rounded-xl"
        : "h-14 w-14 rounded-2xl";

  if (!player) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center border border-dashed border-navy-border bg-navy-primary text-xs font-black text-text-muted",
          sizeClass
        )}
      >
        —
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden border border-gold/20 bg-navy-primary shadow-xl",
        sizeClass
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

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div className="mb-5 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold shadow-lg shadow-gold/10">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="break-words text-xl font-black uppercase tracking-wide text-white">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl break-words text-sm leading-6 text-text-muted">
            {subtitle}
          </p>
        </div>
      </div>

      {badge ? (
        <Badge variant="gold" className="w-fit whitespace-nowrap">
          {badge}
        </Badge>
      ) : null}
    </div>
  );
}

function HeroMetric({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone?: "default" | "gold" | "success" | "info";
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-card/60 p-4 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-muted">
          {label}
        </p>
        <Icon
          className={cn(
            "h-4 w-4",
            tone === "gold" && "text-gold",
            tone === "success" && "text-success",
            tone === "info" && "text-electric",
            tone === "default" && "text-text-muted"
          )}
        />
      </div>

      <p
        className={cn(
          "text-2xl font-black text-white",
          tone === "gold" && "text-gold",
          tone === "success" && "text-success",
          tone === "info" && "text-electric"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function FranchiseIdentityCard({
  selectedTeam,
}: {
  selectedTeam?: StoredFranchiseTeam;
}) {
  const fullName = getTeamDisplayName(selectedTeam);

  return (
    <div className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-[linear-gradient(135deg,#16283A,#101F33)] p-5">
      <AssetImage
        src={selectedTeam ? getTeamCardSrc(selectedTeam) : pageAssets.fieldBg}
        alt={fullName}
        className="pointer-events-none absolute right-0 top-0 h-full w-52 object-cover opacity-16"
        fallbackClassName="hidden"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.16),transparent_36%)]" />

      <div className="relative flex min-w-0 flex-col gap-5">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-navy-card/60 text-2xl font-black text-white shadow-lg md:h-24 md:w-24">
            <AssetImage
              src={getTeamHelmetSrc(selectedTeam)}
              alt={fullName}
              className="h-[85%] w-[85%] object-contain drop-shadow-2xl"
              fallbackClassName="h-full w-full"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-widest text-gold">
              Selected Franchise
            </p>

            <h3
              className="mt-1 w-full whitespace-normal break-words text-2xl font-black uppercase leading-tight text-white md:text-3xl xl:text-[1.7rem] 2xl:text-3xl"
              title={fullName}
            >
              {fullName}
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="gold">
                OVR {selectedTeam?.overallRating ?? "--"}
              </Badge>

              <Badge variant="info">
                {selectedTeam
                  ? formatRecord(
                      selectedTeam.record.wins,
                      selectedTeam.record.losses,
                      selectedTeam.record.ties
                    )
                  : "0-0-0"}
              </Badge>

              {selectedTeam?.nflSync.enabled ? (
                <Badge variant="success">NFL Synced</Badge>
              ) : (
                <Badge variant="gold">Manual Franchise</Badge>
              )}

              <Badge variant="outline">{getInitials(selectedTeam)}</Badge>
            </div>
          </div>
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-card/80 p-4 text-center backdrop-blur">
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Offense
            </p>
            <p className="mt-1 text-3xl font-black text-white">
              {selectedTeam?.offensiveRating ?? "--"}
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-card/80 p-4 text-center backdrop-blur">
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Defense
            </p>
            <p className="mt-1 text-3xl font-black text-white">
              {selectedTeam?.defensiveRating ?? "--"}
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-gold/20 bg-gold/10 p-4 text-center backdrop-blur">
            <p className="text-xs font-black uppercase tracking-widest text-gold">
              Team Rating
            </p>
            <p className="mt-1 text-3xl font-black text-white">
              {selectedTeam?.overallRating ?? "--"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerMiniCard({
  player,
  label,
}: {
  player?: FranchisePlayer;
  label: string;
}) {
  if (!player) {
    return (
      <div className="min-w-0 rounded-2xl border border-dashed border-navy-border bg-navy-secondary/40 p-4">
        <p className="text-xs font-black uppercase tracking-widest text-text-muted">
          {label}
        </p>
        <p className="mt-2 text-sm font-black uppercase text-white">
          Unassigned
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-secondary/60 p-4 transition hover:border-gold/25">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <PlayerAvatar player={player} size="md" />

          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              {label}
            </p>

            <p className="mt-1 break-words text-sm font-black uppercase text-white">
              #{getPlayerNumber(player)} {getPlayerName(player)}
            </p>

            <p className="mt-1 text-xs font-semibold text-text-muted">
              {getPlayerPosition(player)} · Age {getPlayerAge(player)} ·{" "}
              {getPlayerTrait(player)}
            </p>
          </div>
        </div>

        <div className="shrink-0 rounded-xl border border-gold/20 bg-gold/10 px-3 py-2 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gold">
            OVR
          </p>
          <p className="text-xl font-black text-white">
            {getPlayerOverall(player)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-navy-card/70 p-2 text-center">
          <p className="text-[10px] font-black uppercase text-text-muted">
            SPD
          </p>
          <p className="text-sm font-black text-white">
            {getPlayerSpeed(player)}
          </p>
        </div>

        <div className="rounded-xl bg-navy-card/70 p-2 text-center">
          <p className="text-[10px] font-black uppercase text-text-muted">
            STR
          </p>
          <p className="text-sm font-black text-white">
            {getPlayerStrength(player)}
          </p>
        </div>

        <div className="rounded-xl bg-navy-card/70 p-2 text-center">
          <p className="text-[10px] font-black uppercase text-text-muted">IQ</p>
          <p className="text-sm font-black text-white">{getPlayerIQ(player)}</p>
        </div>
      </div>
    </div>
  );
}

function PlayerSelect({
  value,
  players,
  onChange,
}: {
  value: string;
  players: FranchisePlayer[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative min-w-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="block w-full min-w-0 appearance-none rounded-2xl border border-navy-border bg-navy-primary px-4 py-3 pr-11 text-sm font-bold text-white outline-none transition focus:border-gold/50"
      >
        <option value="">Unassigned</option>

        {players.map((player) => (
          <option key={player.id} value={player.id}>
            #{getPlayerNumber(player)} {getPlayerName(player)} —{" "}
            {getPlayerPosition(player)} — OVR {getPlayerOverall(player)}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
    </div>
  );
}

function DepthChartRow({
  slot,
  slotMeta,
  players,
  onStarterChange,
  onBackupChange,
}: {
  slot: DepthChartSlot;
  slotMeta: (typeof POSITION_SLOTS)[number];
  players: FranchisePlayer[];
  onStarterChange: (value: string) => void;
  onBackupChange: (value: string) => void;
}) {
  const eligiblePlayers = getEligiblePlayers(players, slot.position);
  const starter = players.find((player) => player.id === slot.starterId);
  const backup = players.find((player) => player.id === slot.backupId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl transition hover:border-gold/25"
    >
      <AssetImage
        src={pageAssets.stadiumFlare}
        alt="Depth chart glow"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-14"
        fallbackClassName="hidden"
      />

      <div className="relative">
        <div className="mb-4 flex min-w-0 flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="gold">{slot.position}</Badge>
              <Badge variant="info">{slot.group}</Badge>
              <Badge variant="outline">{eligiblePlayers.length} eligible</Badge>
            </div>

            <h3 className="break-words text-xl font-black uppercase text-white">
              {slotMeta.label}
            </h3>

            <p className="mt-1 break-words text-sm leading-6 text-text-muted">
              {slotMeta.description}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gold">
              Slot Priority
            </p>
            <p className="text-2xl font-black text-white">
              {starter ? getPlayerOverall(starter) : "--"}
            </p>
          </div>
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="min-w-0 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Starter
            </p>

            <PlayerSelect
              value={slot.starterId}
              players={eligiblePlayers}
              onChange={onStarterChange}
            />

            <PlayerMiniCard player={starter} label="Starter Profile" />
          </div>

          <div className="min-w-0 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Backup
            </p>

            <PlayerSelect
              value={slot.backupId}
              players={eligiblePlayers.filter(
                (player) => player.id !== slot.starterId
              )}
              onChange={onBackupChange}
            />

            <PlayerMiniCard player={backup} label="Backup Profile" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GroupButton({
  group,
  label,
  icon: Icon,
  activeGroup,
  onClick,
}: {
  group: DepthChartGroup;
  label: string;
  icon: React.ElementType;
  activeGroup: DepthChartGroup;
  onClick: () => void;
}) {
  const isActive = activeGroup === group;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-0 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black uppercase transition",
        isActive
          ? "border-gold/50 bg-gold/15 text-gold shadow-lg shadow-gold/10"
          : "border-navy-border bg-navy-secondary text-text-muted hover:border-gold/30 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

export function DepthChartForm() {
  const [mounted, setMounted] = useState(false);
  const [teams, setTeams] = useState<StoredFranchiseTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [players, setPlayers] = useState<FranchisePlayer[]>([]);
  const [depthCharts, setDepthCharts] = useState<Record<string, TeamDepthChart>>(
    {}
  );
  const [activeGroup, setActiveGroup] = useState<DepthChartGroup>("offense");
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    setMounted(true);

    const userTeams = getUserFranchises();
    const storedDepthCharts = loadStoredDepthCharts();
    const primaryTeamId =
      window.localStorage.getItem("gmdl_primary_franchise") ?? "";

    const initialTeam =
      userTeams.find((team) => team.id === primaryTeamId) ?? userTeams[0];

    setTeams(userTeams);
    setDepthCharts(storedDepthCharts);

    if (initialTeam) {
      setSelectedTeamId(initialTeam.id);
      setPlayers(getTeamPlayers(initialTeam.id));
    }
  }, []);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId),
    [teams, selectedTeamId]
  );

  const currentDepthChart = useMemo(() => {
    if (!selectedTeamId) {
      return buildDefaultDepthChart("unknown", []);
    }

    return (
      depthCharts[selectedTeamId] ??
      buildDefaultDepthChart(selectedTeamId, players)
    );
  }, [depthCharts, players, selectedTeamId]);

  const activeFormation = getFormationMeta(currentDepthChart.activeFormation);

  const filteredSlots = currentDepthChart.slots.filter(
    (slot) => slot.group === activeGroup
  );

  const starters = currentDepthChart.slots
    .map((slot) => players.find((player) => player.id === slot.starterId))
    .filter(Boolean) as FranchisePlayer[];

  const backups = currentDepthChart.slots
    .map((slot) => players.find((player) => player.id === slot.backupId))
    .filter(Boolean) as FranchisePlayer[];

  const averageStarterRating =
    starters.length > 0
      ? Math.round(
          starters.reduce((sum, player) => sum + getPlayerOverall(player), 0) /
            starters.length
        )
      : 0;

  const topStarter = [...starters].sort(
    (a, b) => getPlayerOverall(b) - getPlayerOverall(a)
  )[0];

  const fastestStarter = [...starters].sort(
    (a, b) => getPlayerSpeed(b) - getPlayerSpeed(a)
  )[0];

  const strongestStarter = [...starters].sort(
    (a, b) => getPlayerStrength(b) - getPlayerStrength(a)
  )[0];

  const updateCurrentDepthChart = (
    updater: (chart: TeamDepthChart) => TeamDepthChart
  ) => {
    if (!selectedTeamId) return;

    setDepthCharts((previous) => {
      const existing =
        previous[selectedTeamId] ??
        buildDefaultDepthChart(selectedTeamId, players);

      return {
        ...previous,
        [selectedTeamId]: updater(existing),
      };
    });

    setSaveState("idle");
  };

  const updateSlot = (position: string, update: Partial<DepthChartSlot>) => {
    updateCurrentDepthChart((chart) => ({
      ...chart,
      slots: chart.slots.map((slot) =>
        slot.position === position ? { ...slot, ...update } : slot
      ),
    }));
  };

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
    setPlayers(getTeamPlayers(teamId));
    setActiveGroup("offense");
    setSaveState("idle");

    const params = new URLSearchParams(window.location.search);
    params.set("team", teamId);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const handleSave = () => {
    if (!selectedTeamId) return;

    const nextDepthCharts = {
      ...depthCharts,
      [selectedTeamId]: {
        ...currentDepthChart,
        teamId: selectedTeamId,
        lastUpdated: new Date().toISOString(),
      },
    };

    setDepthCharts(nextDepthCharts);
    saveStoredDepthCharts(nextDepthCharts);
    setSaveState("saved");

    window.setTimeout(() => {
      setSaveState("idle");
    }, 1800);
  };

  const handleReset = () => {
    if (!selectedTeamId) return;

    const freshChart = buildDefaultDepthChart(selectedTeamId, players);

    setDepthCharts((previous) => ({
      ...previous,
      [selectedTeamId]: freshChart,
    }));

    setSaveState("idle");
  };

  const handleAutoFillBest = () => {
    if (!selectedTeamId) return;

    updateCurrentDepthChart(() => buildDefaultDepthChart(selectedTeamId, players));
  };

  if (!mounted) {
    return (
      <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden">
        <div className="h-24 rounded-3xl border border-navy-border bg-navy-card" />
        <div className="h-48 rounded-3xl border border-navy-border bg-navy-card" />
        <div className="grid w-full min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-[700px] rounded-3xl border border-navy-border bg-navy-card" />
          <div className="h-[700px] rounded-3xl border border-navy-border bg-navy-card" />
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-navy-border bg-navy-card p-10 text-center">
        <BarChart3 className="mx-auto h-10 w-10 text-text-muted" />
        <h1 className="mt-4 text-3xl font-black uppercase text-white">
          No Franchise Found
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Create a franchise first before setting a depth chart.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-[linear-gradient(135deg,#0B1A2A,#101F33_55%,#16283A)] p-5 shadow-2xl md:p-6"
      >
        <AssetImage
          src={pageAssets.fieldBg}
          alt="Depth chart field background"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-28"
          fallbackClassName="hidden"
        />

        <AssetImage
          src={selectedTeam ? getTeamCardSrc(selectedTeam) : teamImageAssets.cards.fallback}
          alt="Depth chart team card"
          className="pointer-events-none absolute right-0 top-0 hidden h-full w-[360px] object-cover opacity-18 xl:block"
          fallbackClassName="hidden"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.16),transparent_34%),linear-gradient(90deg,rgba(11,26,42,0.92),rgba(11,26,42,0.76),rgba(11,26,42,0.92))]" />

        <div className="relative flex min-w-0 flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="gold">
                <BarChart3 className="mr-1 h-3 w-3" />
                Depth Chart Center
              </Badge>

              <Badge variant="info">
                <Shield className="mr-1 h-3 w-3" />
                Saved Per Franchise
              </Badge>

              {saveState === "saved" ? (
                <Badge variant="success">Saved</Badge>
              ) : (
                <Badge variant="gold">Adjust & Save</Badge>
              )}
            </div>

            <h1 className="break-words text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              Depth Chart
            </h1>

            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-text-muted md:text-base">
              Select starters and backups for each franchise. These saved
              personnel decisions become the default lineup used by the game
              engine unless changed later.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <HeroMetric
                label="Players"
                value={players.length}
                icon={Users}
                tone="gold"
              />
              <HeroMetric
                label="Starters Avg"
                value={averageStarterRating}
                icon={Gauge}
                tone="success"
              />
              <HeroMetric
                label="Formation"
                value={activeFormation.label.split("/")[0].trim()}
                icon={Layers}
                tone="info"
              />
            </div>
          </div>

          <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 xl:max-w-[620px]">
            <Button
              variant="secondary"
              className="w-full justify-center gap-2"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
              Reset Chart
            </Button>

            <Button
              variant="secondary"
              className="w-full justify-center gap-2"
              onClick={handleAutoFillBest}
            >
              <Zap className="h-4 w-4" />
              Auto-Fill Best
            </Button>

            <Button
              variant="gold"
              className="w-full justify-center gap-2"
              onClick={handleSave}
            >
              {saveState === "saved" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveState === "saved" ? "Saved" : "Save Changes"}
            </Button>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl"
      >
        <SectionHeader
          icon={Shield}
          title="Franchise Context"
          subtitle="Choose the franchise this depth chart should apply to. Each franchise keeps a separate roster and lineup."
          badge="Team-Specific"
        />

        <div className="grid w-full min-w-0 grid-cols-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="mb-2 break-words text-xs font-black uppercase tracking-widest text-text-muted">
              Select Franchise
            </p>

            <div className="relative min-w-0">
              <select
                value={selectedTeamId}
                onChange={(event) => handleSelectTeam(event.target.value)}
                className="block w-full min-w-0 appearance-none rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 pr-11 text-sm font-bold text-white outline-none transition focus:border-gold/50"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.city} {team.nickname} — OVR {team.overallRating}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>

            <div className="mt-4 min-w-0 rounded-2xl border border-navy-border bg-navy-secondary/50 p-4">
              <p className="break-words text-xs font-black uppercase tracking-widest text-text-muted">
                Last Updated
              </p>
              <p className="mt-2 break-words text-sm font-bold text-white">
                {formatUpdatedDate(currentDepthChart.lastUpdated)}
              </p>
              <p className="mt-2 break-words text-xs leading-5 text-text-muted">
                The selected starters become the default personnel used for this
                franchise in simulations.
              </p>
            </div>
          </div>

          <FranchiseIdentityCard selectedTeam={selectedTeam} />
        </div>
      </motion.section>

      <section className="grid w-full min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl"
        >
          <AssetImage
            src={pageAssets.stadiumFlare}
            alt="Formation glow"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-16"
            fallbackClassName="hidden"
          />

          <div className="relative">
            <SectionHeader
              icon={Layers}
              title="Formation & Personnel Mode"
              subtitle="Choose how the depth chart should be viewed. This does not erase assignments; it helps organize lineup strategy."
              badge="Formation"
            />

            <div className="relative min-w-0">
              <select
                value={currentDepthChart.activeFormation}
                onChange={(event) =>
                  updateCurrentDepthChart((chart) => ({
                    ...chart,
                    activeFormation: event.target.value,
                  }))
                }
                className="block w-full min-w-0 appearance-none rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 pr-11 text-sm font-bold text-white outline-none transition focus:border-gold/50"
              >
                {FORMATIONS.map((formation) => (
                  <option key={formation.key} value={formation.key}>
                    {formation.label}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>

            <div className="mt-4 min-w-0 rounded-2xl border border-navy-border bg-navy-secondary/50 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-gold">
                Active Formation View
              </p>
              <p className="mt-1 break-words text-lg font-black uppercase text-white">
                {activeFormation.label}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-text-muted">
                {activeFormation.description}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <GroupButton
                group="offense"
                label="Offense"
                icon={Users}
                activeGroup={activeGroup}
                onClick={() => setActiveGroup("offense")}
              />

              <GroupButton
                group="defense"
                label="Defense"
                icon={Shield}
                activeGroup={activeGroup}
                onClick={() => setActiveGroup("defense")}
              />

              <GroupButton
                group="special"
                label="Special Teams"
                icon={Star}
                activeGroup={activeGroup}
                onClick={() => setActiveGroup("special")}
              />
            </div>
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative min-w-0 overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-5 shadow-xl"
        >
          <AssetImage
            src={topStarter ? getPlayerFaceSrc(topStarter) : fallbackFaceAssets[0]}
            alt="Top starter"
            className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 object-cover opacity-16"
            fallbackClassName="hidden"
          />

          <div className="relative">
            <Crown className="mb-3 h-7 w-7 text-gold" />

            <h2 className="break-words text-xl font-black uppercase text-white">
              Depth Chart Summary
            </h2>

            <p className="mt-2 break-words text-sm leading-6 text-text-muted">
              This lineup is saved for{" "}
              <span className="font-black text-white">
                {getTeamDisplayName(selectedTeam)}
              </span>
              .
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-navy-border bg-navy-card/70 p-4 text-center">
                <p className="text-xs font-black uppercase text-text-muted">
                  Players
                </p>
                <p className="mt-1 text-3xl font-black text-white">
                  {players.length}
                </p>
              </div>

              <div className="rounded-2xl border border-navy-border bg-navy-card/70 p-4 text-center">
                <p className="text-xs font-black uppercase text-text-muted">
                  Starters
                </p>
                <p className="mt-1 text-3xl font-black text-white">
                  {starters.length}
                </p>
              </div>

              <div className="rounded-2xl border border-navy-border bg-navy-card/70 p-4 text-center">
                <p className="text-xs font-black uppercase text-text-muted">
                  Backups
                </p>
                <p className="mt-1 text-3xl font-black text-white">
                  {backups.length}
                </p>
              </div>

              <div className="rounded-2xl border border-gold/20 bg-gold/10 p-4 text-center">
                <p className="text-xs font-black uppercase text-gold">
                  Avg OVR
                </p>
                <p className="mt-1 text-3xl font-black text-white">
                  {averageStarterRating}
                </p>
              </div>
            </div>

            {topStarter ? (
              <div className="mt-5 rounded-2xl border border-navy-border bg-navy-card/70 p-4">
                <div className="flex items-center gap-3">
                  <PlayerAvatar player={topStarter} size="md" />

                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest text-gold">
                      Top Starter
                    </p>
                    <p className="truncate text-sm font-black uppercase text-white">
                      {getPlayerName(topStarter)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {getPlayerPosition(topStarter)} · OVR{" "}
                      {getPlayerOverall(topStarter)} · {getPlayerTier(topStarter)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.aside>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-navy-border bg-navy-card p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <PlayerAvatar player={topStarter} size="md" />
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-widest text-gold">
                Best Overall
              </p>
              <p className="truncate text-sm font-black uppercase text-white">
                {topStarter ? getPlayerName(topStarter) : "No Starter"}
              </p>
              <p className="text-xs text-text-muted">
                {topStarter
                  ? `${getPlayerPosition(topStarter)} · OVR ${getPlayerOverall(
                      topStarter
                    )}`
                  : "Assign starters first"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-navy-border bg-navy-card p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <PlayerAvatar player={fastestStarter} size="md" />
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-widest text-electric">
                Fastest Starter
              </p>
              <p className="truncate text-sm font-black uppercase text-white">
                {fastestStarter ? getPlayerName(fastestStarter) : "No Starter"}
              </p>
              <p className="text-xs text-text-muted">
                {fastestStarter
                  ? `${getPlayerPosition(fastestStarter)} · SPD ${getPlayerSpeed(
                      fastestStarter
                    )}`
                  : "Assign starters first"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-navy-border bg-navy-card p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <PlayerAvatar player={strongestStarter} size="md" />
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-widest text-success">
                Strongest Starter
              </p>
              <p className="truncate text-sm font-black uppercase text-white">
                {strongestStarter
                  ? getPlayerName(strongestStarter)
                  : "No Starter"}
              </p>
              <p className="text-xs text-text-muted">
                {strongestStarter
                  ? `${getPlayerPosition(
                      strongestStarter
                    )} · STR ${getPlayerStrength(strongestStarter)}`
                  : "Assign starters first"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid w-full min-w-0 grid-cols-1 gap-5">
        {filteredSlots.map((slot, index) => {
          const slotMeta =
            POSITION_SLOTS.find((item) => item.position === slot.position) ??
            POSITION_SLOTS[0];

          return (
            <DepthChartRow
              key={`${slot.position}-${index}`}
              slot={slot}
              slotMeta={slotMeta}
              players={players}
              onStarterChange={(value) =>
                updateSlot(slot.position, {
                  starterId: value,
                  backupId:
                    value === slot.backupId ? "" : slot.backupId,
                })
              }
              onBackupChange={(value) =>
                updateSlot(slot.position, {
                  backupId: value,
                })
              }
            />
          );
        })}
      </section>

      <section className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-[linear-gradient(135deg,#101F33,#16283A)] p-5 shadow-xl">
        <AssetImage
          src={pageAssets.fieldBg}
          alt="Depth chart notes field"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
          fallbackClassName="hidden"
        />

        <div className="relative grid w-full min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-card/60 p-4 backdrop-blur">
            <div className="mb-3 flex min-w-0 items-center gap-2">
              <Target className="h-5 w-5 shrink-0 text-gold" />
              <p className="break-words text-sm font-black uppercase tracking-wide text-white">
                Starter Priority
              </p>
            </div>

            <p className="break-words text-sm leading-6 text-text-muted">
              Starters are the first-choice players the simulation should treat
              as your default lineup for each slot.
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-card/60 p-4 backdrop-blur">
            <div className="mb-3 flex min-w-0 items-center gap-2">
              <Activity className="h-5 w-5 shrink-0 text-electric" />
              <p className="break-words text-sm font-black uppercase tracking-wide text-white">
                Backup Protection
              </p>
            </div>

            <p className="break-words text-sm leading-6 text-text-muted">
              Backups give your franchise realistic depth for injuries,
              fatigue, substitutions, and formation-specific rotations.
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-card/60 p-4 backdrop-blur">
            <div className="mb-3 flex min-w-0 items-center gap-2">
              <Sparkles className="h-5 w-5 shrink-0 text-success" />
              <p className="break-words text-sm font-black uppercase tracking-wide text-white">
                Save Per Franchise
              </p>
            </div>

            <p className="break-words text-sm leading-6 text-text-muted">
              Every team keeps its own depth chart, so updating one franchise
              will not overwrite another franchise’s lineup.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DepthChartForm;