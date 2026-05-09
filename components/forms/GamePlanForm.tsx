"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Shield,
  Swords,
  Save,
  RotateCcw,
  Info,
  ChevronDown,
  Crown,
  Goal,
  Flag,
  Radio,
  Sparkles,
  LayoutTemplate,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getUserFranchises, type StoredFranchiseTeam } from "@/lib/gameHub";
import { cn, formatRecord } from "@/lib/utils";

type OffensiveTactics = {
  deviateFromBase: number;
  firstDownPlaySelection: number;
  shortPlaySelection: number;
  longPlaySelection: number;
  fourthDownGoForIt: number;
  rushingPlays: number;
  quarterbackSnap: number;
};

type DefensiveTactics = {
  firstDownBias: number;
  deepCoverage: number;
  coverageAssignment: number;
  blitz: number;
  forceTurnovers: number;
};

type SpecialTeamsTactics = {
  fieldGoalMaxRange: number;
  kickoffStrategy: number;
  twoPointWhenBehind: number;
};

type TeamGamePlan = {
  offensiveBaseScheme: string;
  offensiveEditingScheme: string;
  offensiveSchemes: Record<string, OffensiveTactics>;
  defensiveBaseScheme: string;
  defensiveEditingScheme: string;
  defensiveSchemes: Record<string, DefensiveTactics>;
  specialTeams: SpecialTeamsTactics;
  lastUpdated: string;
};

type TeamVisualKey =
  | "memphis"
  | "kansas"
  | "dallas"
  | "miami"
  | "chicago"
  | "fallback";

const STORAGE_KEY = "gmdl_team_game_plans_v2";

const OFFENSIVE_SCHEMES = [
  {
    key: "22 Personnel",
    label: "2 RB / 2 TE / 1 WR (22 Personnel)",
    shortLabel: "22 Personnel",
    description:
      "Power personnel for downhill rushing, short-yardage situations, and heavier blocking support.",
  },
  {
    key: "21 Personnel",
    label: "2 RB / 1 TE / 2 WR (21 Personnel)",
    shortLabel: "21 Personnel",
    description:
      "Balanced power look with a fullback/halfback combination, strong for run game and play-action.",
  },
  {
    key: "12 Personnel",
    label: "1 RB / 2 TE / 2 WR (12 Personnel)",
    shortLabel: "12 Personnel",
    description:
      "Versatile package with extra blocking support and two-tight-end flexibility in the passing game.",
  },
  {
    key: "11 Personnel",
    label: "1 RB / 1 TE / 3 WR (11 Personnel)",
    shortLabel: "11 Personnel",
    description:
      "Modern balanced spread look with strong versatility for both the run and pass game.",
  },
  {
    key: "10 Personnel",
    label: "1 RB / 0 TE / 4 WR (10 Personnel)",
    shortLabel: "10 Personnel",
    description:
      "Spread passing package with four wide receivers to stress coverage and create mismatches.",
  },
];

const DEFENSIVE_SCHEMES = [
  {
    key: "4-3 Defense",
    label: "4 DL / 3 LB / 2 S / 2 CB (4-3 Defense)",
    shortLabel: "4-3 Defense",
    description:
      "Balanced front with four down linemen and three linebackers for solid run defense and pressure.",
  },
  {
    key: "3-4 Defense",
    label: "3 DL / 3 LB / 2 S / 3 CB (3-4 Defense)",
    shortLabel: "3-4 Defense",
    description:
      "Flexible structure that can disguise pressure and vary linebacker responsibilities.",
  },
  {
    key: "Nickel Defense",
    label: "4 DL / 2 LB / 2 S / 3 CB (Nickel Defense)",
    shortLabel: "Nickel",
    description:
      "Extra defensive back package built to handle spread passing situations.",
  },
  {
    key: "Dime Defense",
    label: "3 DL / 2 LB / 2 S / 4 CB (Dime Defense)",
    shortLabel: "Dime",
    description:
      "Pass-heavy coverage package with more defensive backs for obvious passing downs.",
  },
];

const DEFAULT_OFFENSIVE_TACTICS: OffensiveTactics = {
  deviateFromBase: 34,
  firstDownPlaySelection: 52,
  shortPlaySelection: 36,
  longPlaySelection: 68,
  fourthDownGoForIt: 28,
  rushingPlays: 46,
  quarterbackSnap: 58,
};

const DEFAULT_DEFENSIVE_TACTICS: DefensiveTactics = {
  firstDownBias: 44,
  deepCoverage: 56,
  coverageAssignment: 48,
  blitz: 40,
  forceTurnovers: 38,
};

const DEFAULT_SPECIAL_TEAMS: SpecialTeamsTactics = {
  fieldGoalMaxRange: 49,
  kickoffStrategy: 42,
  twoPointWhenBehind: 36,
};

const gamePlanAssets = {
  heroBg: "/assets/game-plan/game-plan-command-bg.jpg",
  strategyField: "/assets/game-plan/strategy-field.png",
  offenseBoard: "/assets/game-plan/offense-board.png",
  defenseBoard: "/assets/game-plan/defense-board.png",
  specialTeamsBoard: "/assets/game-plan/special-teams-board.png",
  playbookCard: "/assets/game-plan/playbook-card.png",
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

function buildDefaultPlan(): TeamGamePlan {
  const offensiveSchemes: Record<string, OffensiveTactics> = {};
  const defensiveSchemes: Record<string, DefensiveTactics> = {};

  OFFENSIVE_SCHEMES.forEach((scheme) => {
    offensiveSchemes[scheme.key] = { ...DEFAULT_OFFENSIVE_TACTICS };
  });

  DEFENSIVE_SCHEMES.forEach((scheme) => {
    defensiveSchemes[scheme.key] = { ...DEFAULT_DEFENSIVE_TACTICS };
  });

  return {
    offensiveBaseScheme: "11 Personnel",
    offensiveEditingScheme: "11 Personnel",
    offensiveSchemes,
    defensiveBaseScheme: "4-3 Defense",
    defensiveEditingScheme: "4-3 Defense",
    defensiveSchemes,
    specialTeams: { ...DEFAULT_SPECIAL_TEAMS },
    lastUpdated: new Date().toISOString(),
  };
}

function loadStoredPlans(): Record<string, TeamGamePlan> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, TeamGamePlan>;
  } catch {
    return {};
  }
}

function saveStoredPlans(plans: Record<string, TeamGamePlan>) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    window.dispatchEvent(new Event("gmdl-storage-change"));
  } catch {
    console.log("Could not save game plan.");
  }
}

function formatUpdatedDate(value?: string) {
  if (!value) return "Not saved yet";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Not saved yet";
  }
}

function getInitials(team?: StoredFranchiseTeam) {
  if (!team) return "GM";
  return team.abbreviation || `${team.city[0] ?? "G"}${team.nickname[0] ?? "M"}`;
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

function getStrategyLabel(value: number, low: string, mid: string, high: string) {
  if (value <= 33) return low;
  if (value <= 66) return mid;
  return high;
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

function HeroMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "gold" | "success" | "info";
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-card/60 p-4 backdrop-blur-md">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-muted">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-xl font-black text-white",
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

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
  artSrc,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: string;
  artSrc?: string;
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

      <div className="flex items-center gap-3">
        {badge ? (
          <Badge variant="gold" className="w-fit whitespace-nowrap">
            {badge}
          </Badge>
        ) : null}

        {artSrc ? (
          <div className="hidden h-14 w-20 overflow-hidden rounded-2xl border border-white/10 bg-navy-secondary/60 lg:block">
            <AssetImage
              src={artSrc}
              alt={title}
              className="h-full w-full object-cover opacity-90"
              fallbackClassName="h-full w-full"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TacticSlider({
  label,
  description,
  leftLabel,
  rightLabel,
  value,
  onChange,
  valueSuffix = "%",
}: {
  label: string;
  description: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
  valueSuffix?: string;
}) {
  return (
    <motion.div
      layout
      className="min-w-0 overflow-hidden rounded-2xl border border-navy-border bg-navy-secondary/45 p-4 transition hover:border-gold/25 hover:bg-navy-secondary/55"
    >
      <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-black uppercase tracking-wide text-white">
            {label}
          </p>
          <p className="mt-1 break-words text-xs leading-5 text-text-muted">
            {description}
          </p>
        </div>

        <div className="shrink-0 rounded-xl border border-gold/20 bg-gold/10 px-2.5 py-1 text-xs font-black text-gold">
          {value}
          {valueSuffix}
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-navy-border accent-gold"
      />

      <div className="mt-2 flex min-w-0 items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wide text-text-muted">
        <span className="truncate">{leftLabel}</span>
        <span className="truncate text-right">{rightLabel}</span>
      </div>
    </motion.div>
  );
}

function SchemeSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { key: string; label: string }[];
}) {
  return (
    <div className="min-w-0 space-y-2">
      <p className="break-words text-xs font-black uppercase tracking-widest text-text-muted">
        {label}
      </p>

      <div className="relative min-w-0">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="block w-full min-w-0 appearance-none rounded-2xl border border-navy-border bg-navy-secondary px-4 py-3 pr-11 text-sm font-bold text-white outline-none transition focus:border-gold/50"
        >
          {options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      </div>
    </div>
  );
}

function StrategyInsightCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-navy-border bg-navy-secondary/50 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-muted">
        {title}
      </p>
      <p className="mt-1 text-sm font-black uppercase text-white">{value}</p>
      <p className="mt-2 text-xs leading-5 text-text-muted">{description}</p>
    </div>
  );
}

function FranchiseIdentityCard({
  selectedTeam,
}: {
  selectedTeam?: StoredFranchiseTeam;
}) {
  const fullName = selectedTeam
    ? `${selectedTeam.city} ${selectedTeam.nickname}`
    : "Selected Franchise";

  return (
    <div className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-[linear-gradient(135deg,#16283A,#101F33)] p-5">
      <AssetImage
        src={selectedTeam ? getTeamCardSrc(selectedTeam) : gamePlanAssets.playbookCard}
        alt={fullName}
        className="pointer-events-none absolute right-0 top-0 h-full w-44 object-cover opacity-14"
        fallbackClassName="hidden"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.14),transparent_36%)]" />

      <div className="relative flex min-w-0 flex-col gap-5">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-navy-card/50 shadow-lg md:h-24 md:w-24">
            <AssetImage
              src={getTeamHelmetSrc(selectedTeam)}
              alt={fullName}
              className="h-[82%] w-[82%] object-contain drop-shadow-2xl"
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
          <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-card/80 p-4 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Offense
            </p>
            <p className="mt-1 text-3xl font-black text-white">
              {selectedTeam?.offensiveRating ?? "--"}
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-card/80 p-4 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">
              Defense
            </p>
            <p className="mt-1 text-3xl font-black text-white">
              {selectedTeam?.defensiveRating ?? "--"}
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-gold/20 bg-gold/10 p-4 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-gold">
              Team Rating
            </p>
            <p className="mt-1 text-3xl font-black text-white">
              {selectedTeam?.overallRating ?? "--"}
            </p>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-dashed border-gold/20 bg-gold/5 p-4">
          <p className="break-words text-center text-sm leading-6 text-text-muted">
            <span className="font-black uppercase text-white">Important:</span>{" "}
            The visible <span className="text-white">Base Scheme</span> becomes
            the franchise’s default foundation. You can still edit tactics for
            other formations without changing the base scheme.
          </p>
        </div>
      </div>
    </div>
  );
}

export function GamePlanForm() {
  const [mounted, setMounted] = useState(false);
  const [teams, setTeams] = useState<StoredFranchiseTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [plans, setPlans] = useState<Record<string, TeamGamePlan>>({});
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    setMounted(true);

    const userTeams = getUserFranchises();
    const storedPlans = loadStoredPlans();

    setTeams(userTeams);
    setPlans(storedPlans);

    if (userTeams.length > 0) {
      const primaryTeamId =
        window.localStorage.getItem("gmdl_primary_franchise") ?? "";
      const initialTeamId =
        userTeams.find((team) => team.id === primaryTeamId)?.id ??
        userTeams[0].id;

      setSelectedTeamId(initialTeamId);
    }
  }, []);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId),
    [teams, selectedTeamId]
  );

  const currentPlan = useMemo(() => {
    if (!selectedTeamId) return buildDefaultPlan();
    return plans[selectedTeamId] ?? buildDefaultPlan();
  }, [plans, selectedTeamId]);

  const offensiveEditingMeta = useMemo(
    () =>
      OFFENSIVE_SCHEMES.find(
        (scheme) => scheme.key === currentPlan.offensiveEditingScheme
      ),
    [currentPlan.offensiveEditingScheme]
  );

  const defensiveEditingMeta = useMemo(
    () =>
      DEFENSIVE_SCHEMES.find(
        (scheme) => scheme.key === currentPlan.defensiveEditingScheme
      ),
    [currentPlan.defensiveEditingScheme]
  );

  const updateCurrentPlan = (updater: (plan: TeamGamePlan) => TeamGamePlan) => {
    if (!selectedTeamId) return;

    setPlans((previous) => {
      const existing = previous[selectedTeamId] ?? buildDefaultPlan();

      return {
        ...previous,
        [selectedTeamId]: updater(existing),
      };
    });

    setSaveState("idle");
  };

  const updateOffensiveTactic = (
    key: keyof OffensiveTactics,
    value: number
  ) => {
    updateCurrentPlan((plan) => ({
      ...plan,
      offensiveSchemes: {
        ...plan.offensiveSchemes,
        [plan.offensiveEditingScheme]: {
          ...plan.offensiveSchemes[plan.offensiveEditingScheme],
          [key]: value,
        },
      },
    }));
  };

  const updateDefensiveTactic = (
    key: keyof DefensiveTactics,
    value: number
  ) => {
    updateCurrentPlan((plan) => ({
      ...plan,
      defensiveSchemes: {
        ...plan.defensiveSchemes,
        [plan.defensiveEditingScheme]: {
          ...plan.defensiveSchemes[plan.defensiveEditingScheme],
          [key]: value,
        },
      },
    }));
  };

  const updateSpecialTeams = (
    key: keyof SpecialTeamsTactics,
    value: number
  ) => {
    updateCurrentPlan((plan) => ({
      ...plan,
      specialTeams: {
        ...plan.specialTeams,
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    if (!selectedTeamId) return;

    const nextPlans = {
      ...plans,
      [selectedTeamId]: {
        ...currentPlan,
        lastUpdated: new Date().toISOString(),
      },
    };

    setPlans(nextPlans);
    saveStoredPlans(nextPlans);
    setSaveState("saved");

    window.setTimeout(() => {
      setSaveState("idle");
    }, 1800);
  };

  const handleResetCurrentTeam = () => {
    if (!selectedTeamId) return;
    updateCurrentPlan(() => buildDefaultPlan());
  };

  if (!mounted) {
    return (
      <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden">
        <div className="h-24 rounded-3xl border border-navy-border bg-navy-card" />
        <div className="h-48 rounded-3xl border border-navy-border bg-navy-card" />
        <div className="grid w-full min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-[780px] rounded-3xl border border-navy-border bg-navy-card" />
          <div className="h-[780px] rounded-3xl border border-navy-border bg-navy-card" />
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-navy-border bg-navy-card p-10 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-text-muted" />
        <h1 className="mt-4 text-3xl font-black uppercase text-white">
          No Franchise Found
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Create a franchise first before setting a game plan.
        </p>
      </div>
    );
  }

  const offensiveValues =
    currentPlan.offensiveSchemes[currentPlan.offensiveEditingScheme] ??
    DEFAULT_OFFENSIVE_TACTICS;

  const defensiveValues =
    currentPlan.defensiveSchemes[currentPlan.defensiveEditingScheme] ??
    DEFAULT_DEFENSIVE_TACTICS;

  const offenseIdentity = getStrategyLabel(
    offensiveValues.firstDownPlaySelection,
    "Run Lean",
    "Balanced",
    "Pass Lean"
  );

  const defenseIdentity = getStrategyLabel(
    defensiveValues.blitz,
    "Controlled",
    "Balanced Pressure",
    "Aggressive"
  );

  const specialIdentity = getStrategyLabel(
    currentPlan.specialTeams.twoPointWhenBehind,
    "Conservative",
    "Situational",
    "High Risk"
  );

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-[linear-gradient(135deg,#0B1A2A,#101F33_55%,#16283A)] p-5 shadow-2xl md:p-6"
      >
        <AssetImage
          src={gamePlanAssets.heroBg}
          alt="Game plan background"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-26"
          fallbackClassName="hidden"
        />
        <AssetImage
          src={gamePlanAssets.strategyField}
          alt="Strategy field"
          className="pointer-events-none absolute right-0 top-0 hidden h-full w-[430px] object-cover opacity-18 xl:block"
          fallbackClassName="hidden"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,197,66,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(75,168,255,0.10),transparent_30%)]" />

        <div className="relative flex min-w-0 flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="gold">
                <ClipboardList className="mr-1 h-3 w-3" />
                Strategy Center
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
              Game Plan
            </h1>

            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-text-muted md:text-base">
              Set your base offensive and defensive schemes, then adjust tactics
              per formation. Every adjustment is saved specifically to the
              selected franchise and the selected formation.
            </p>

            <div className="mt-5 grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 xl:max-w-[620px]">
              <HeroMetric
                label="Offensive Identity"
                value={offenseIdentity}
                tone="gold"
              />
              <HeroMetric
                label="Defensive Identity"
                value={defenseIdentity}
                tone="info"
              />
              <HeroMetric
                label="Special Teams"
                value={specialIdentity}
                tone="success"
              />
            </div>
          </div>

          <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 xl:max-w-[620px]">
            <Button
              variant="secondary"
              className="w-full justify-center gap-2"
              onClick={handleResetCurrentTeam}
            >
              <RotateCcw className="h-4 w-4" />
              Reset Plan
            </Button>

            <Button
              variant="secondary"
              className="w-full justify-center gap-2"
              onClick={() =>
                updateCurrentPlan((plan) => ({
                  ...plan,
                  offensiveBaseScheme: plan.offensiveEditingScheme,
                  defensiveBaseScheme: plan.defensiveEditingScheme,
                }))
              }
            >
              <Crown className="h-4 w-4" />
              Set As Base
            </Button>

            <Button
              variant="gold"
              className="w-full justify-center gap-2"
              onClick={handleSave}
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl"
      >
        <SectionHeader
          icon={Shield}
          title="Franchise Context"
          subtitle="Choose the franchise this game plan should apply to. All settings are saved independently for each team."
          badge="Team-Specific"
          artSrc={gamePlanAssets.playbookCard}
        />

        <div className="grid w-full min-w-0 grid-cols-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="mb-2 break-words text-xs font-black uppercase tracking-widest text-text-muted">
              Select Franchise
            </p>

            <div className="relative min-w-0">
              <select
                value={selectedTeamId}
                onChange={(event) => setSelectedTeamId(event.target.value)}
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
                {formatUpdatedDate(currentPlan.lastUpdated)}
              </p>
              <p className="mt-2 break-words text-xs leading-5 text-text-muted">
                The visible base schemes are the default schemes the engine will
                treat as the team’s primary foundation.
              </p>
            </div>
          </div>

          <FranchiseIdentityCard selectedTeam={selectedTeam} />
        </div>
      </motion.section>

      <section className="grid w-full min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl"
        >
          <AssetImage
            src={gamePlanAssets.offenseBoard}
            alt="Offense board"
            className="pointer-events-none absolute right-0 top-0 h-52 w-52 object-cover opacity-14"
            fallbackClassName="hidden"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.10),transparent_28%)]" />

          <div className="relative">
            <SectionHeader
              icon={Goal}
              title="Offensive Strategy"
              subtitle="Set the default base offensive scheme, then adjust tendencies for the selected offensive formation."
              badge="Offense"
              artSrc={gamePlanAssets.offenseBoard}
            />

            <div className="min-w-0 space-y-4">
              <SchemeSelect
                label="Default Base Offensive Scheme"
                value={currentPlan.offensiveBaseScheme}
                onChange={(value) =>
                  updateCurrentPlan((plan) => ({
                    ...plan,
                    offensiveBaseScheme: value,
                  }))
                }
                options={OFFENSIVE_SCHEMES.map((scheme) => ({
                  key: scheme.key,
                  label: scheme.label,
                }))}
              />

              <SchemeSelect
                label="Edit Tactics For"
                value={currentPlan.offensiveEditingScheme}
                onChange={(value) =>
                  updateCurrentPlan((plan) => ({
                    ...plan,
                    offensiveEditingScheme: value,
                  }))
                }
                options={OFFENSIVE_SCHEMES.map((scheme) => ({
                  key: scheme.key,
                  label: scheme.label,
                }))}
              />

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <StrategyInsightCard
                  title="Editing Formation"
                  value={offensiveEditingMeta?.shortLabel ?? "11 Personnel"}
                  description={offensiveEditingMeta?.description ?? ""}
                />
                <StrategyInsightCard
                  title="Base Offense"
                  value={currentPlan.offensiveBaseScheme}
                  description="This is the franchise’s visible offensive foundation."
                />
              </div>

              <TacticSlider
                label="Deviate From Base Scheme"
                description="Sets how often your team uses a formation different from its default base offense."
                leftLabel="Less"
                rightLabel="More"
                value={offensiveValues.deviateFromBase}
                onChange={(value) =>
                  updateOffensiveTactic("deviateFromBase", value)
                }
              />

              <TacticSlider
                label="1st Down Play Selection"
                description="Sets run versus pass tendency for normal first-down situations."
                leftLabel="Run"
                rightLabel="Pass"
                value={offensiveValues.firstDownPlaySelection}
                onChange={(value) =>
                  updateOffensiveTactic("firstDownPlaySelection", value)
                }
              />

              <TacticSlider
                label="Short Play Selection"
                description="Sets run versus pass tendency in short-yardage situations."
                leftLabel="Run"
                rightLabel="Pass"
                value={offensiveValues.shortPlaySelection}
                onChange={(value) =>
                  updateOffensiveTactic("shortPlaySelection", value)
                }
              />

              <TacticSlider
                label="Long Play Selection"
                description="Sets run versus pass tendency when facing longer-yardage first-down situations."
                leftLabel="Run"
                rightLabel="Pass"
                value={offensiveValues.longPlaySelection}
                onChange={(value) =>
                  updateOffensiveTactic("longPlaySelection", value)
                }
              />

              <TacticSlider
                label="4th Down 'Go For It'"
                description="Sets how often your team runs an offensive play versus punting on fourth down."
                leftLabel="Less"
                rightLabel="More"
                value={offensiveValues.fourthDownGoForIt}
                onChange={(value) =>
                  updateOffensiveTactic("fourthDownGoForIt", value)
                }
              />

              <TacticSlider
                label="Rushing Plays"
                description="Controls the frequency of interior runs versus outside sweeps."
                leftLabel="Interior"
                rightLabel="Sweeps"
                value={offensiveValues.rushingPlays}
                onChange={(value) =>
                  updateOffensiveTactic("rushingPlays", value)
                }
              />

              <TacticSlider
                label="Quarterback Snap"
                description="Controls the frequency of under-center snaps versus shotgun usage."
                leftLabel="Under Center"
                rightLabel="Shotgun"
                value={offensiveValues.quarterbackSnap}
                onChange={(value) =>
                  updateOffensiveTactic("quarterbackSnap", value)
                }
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl"
        >
          <AssetImage
            src={gamePlanAssets.defenseBoard}
            alt="Defense board"
            className="pointer-events-none absolute right-0 top-0 h-52 w-52 object-cover opacity-14"
            fallbackClassName="hidden"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(75,168,255,0.10),transparent_28%)]" />

          <div className="relative">
            <SectionHeader
              icon={Shield}
              title="Defensive Strategy"
              subtitle="Set the primary defensive structure, then tune aggression and coverage tendencies for the selected package."
              badge="Defense"
              artSrc={gamePlanAssets.defenseBoard}
            />

            <div className="min-w-0 space-y-4">
              <SchemeSelect
                label="Default Base Defensive Scheme"
                value={currentPlan.defensiveBaseScheme}
                onChange={(value) =>
                  updateCurrentPlan((plan) => ({
                    ...plan,
                    defensiveBaseScheme: value,
                  }))
                }
                options={DEFENSIVE_SCHEMES.map((scheme) => ({
                  key: scheme.key,
                  label: scheme.label,
                }))}
              />

              <SchemeSelect
                label="Edit Tactics For"
                value={currentPlan.defensiveEditingScheme}
                onChange={(value) =>
                  updateCurrentPlan((plan) => ({
                    ...plan,
                    defensiveEditingScheme: value,
                  }))
                }
                options={DEFENSIVE_SCHEMES.map((scheme) => ({
                  key: scheme.key,
                  label: scheme.label,
                }))}
              />

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <StrategyInsightCard
                  title="Editing Package"
                  value={defensiveEditingMeta?.shortLabel ?? "4-3 Defense"}
                  description={defensiveEditingMeta?.description ?? ""}
                />
                <StrategyInsightCard
                  title="Base Defense"
                  value={currentPlan.defensiveBaseScheme}
                  description="This is the franchise’s visible defensive foundation."
                />
              </div>

              <TacticSlider
                label="1st Down Bias"
                description="Sets whether the defense first reacts to stop the run or prepare for the pass."
                leftLabel="Help Run"
                rightLabel="Help Pass"
                value={defensiveValues.firstDownBias}
                onChange={(value) => updateDefensiveTactic("firstDownBias", value)}
              />

              <TacticSlider
                label="Deep Coverage"
                description="Controls deep-ball tendencies between Cover 2 and Cover 4 style behavior."
                leftLabel="Cover 2"
                rightLabel="Cover 4"
                value={defensiveValues.deepCoverage}
                onChange={(value) => updateDefensiveTactic("deepCoverage", value)}
              />

              <TacticSlider
                label="Coverage Assignment"
                description="Sets your tendency toward man coverage versus zone coverage."
                leftLabel="Man"
                rightLabel="Zone"
                value={defensiveValues.coverageAssignment}
                onChange={(value) =>
                  updateDefensiveTactic("coverageAssignment", value)
                }
              />

              <TacticSlider
                label="Blitz"
                description="Controls how frequently the defense sends extra pass rushers."
                leftLabel="Less"
                rightLabel="More"
                value={defensiveValues.blitz}
                onChange={(value) => updateDefensiveTactic("blitz", value)}
              />

              <TacticSlider
                label="Force Turnovers"
                description="Sets how aggressive the defense is in trying to create takeaways."
                leftLabel="Safer"
                rightLabel="Aggressive"
                value={defensiveValues.forceTurnovers}
                onChange={(value) =>
                  updateDefensiveTactic("forceTurnovers", value)
                }
              />
            </div>
          </div>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-navy-card p-5 shadow-xl"
      >
        <AssetImage
          src={gamePlanAssets.specialTeamsBoard}
          alt="Special teams board"
          className="pointer-events-none absolute right-0 top-0 h-52 w-56 object-cover opacity-14"
          fallbackClassName="hidden"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,0.10),transparent_26%)]" />

        <div className="relative">
          <SectionHeader
            icon={Flag}
            title="Special Teams Tactics"
            subtitle="Adjust kicking, kickoff, and conversion tendencies to match your team identity and special teams strengths."
            badge="Special Teams"
            artSrc={gamePlanAssets.specialTeamsBoard}
          />

          <div className="grid w-full min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">
            <TacticSlider
              label="Field Goal Attempt — Maximum Range"
              description="Sets the maximum range at which your kicker is likely to attempt a field goal."
              leftLabel="Shorter"
              rightLabel="Longer"
              value={currentPlan.specialTeams.fieldGoalMaxRange}
              onChange={(value) =>
                updateSpecialTeams("fieldGoalMaxRange", value)
              }
              valueSuffix=" yds"
            />

            <TacticSlider
              label="Kickoff Strategy"
              description="Controls the tendency toward touchbacks versus forcing returns."
              leftLabel="Touchback"
              rightLabel="Allow Return"
              value={currentPlan.specialTeams.kickoffStrategy}
              onChange={(value) => updateSpecialTeams("kickoffStrategy", value)}
            />

            <TacticSlider
              label="Two Point Conversion When Behind"
              description="Sets how often the team bypasses the extra point and goes for two when trailing."
              leftLabel="Less"
              rightLabel="More"
              value={currentPlan.specialTeams.twoPointWhenBehind}
              onChange={(value) =>
                updateSpecialTeams("twoPointWhenBehind", value)
              }
            />
          </div>

          <div className="mt-5 min-w-0 rounded-2xl border border-dashed border-gold/20 bg-gold/5 p-4">
            <div className="flex min-w-0 items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0 break-words text-sm leading-6 text-text-muted">
                <span className="font-black uppercase text-white">Note:</span>{" "}
                The game engine should still account for score, time, formation,
                down, and distance before making final play-calling decisions.
                These settings are tendencies, not rigid hard-coded instructions.
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="relative min-w-0 overflow-hidden rounded-3xl border border-navy-border bg-[linear-gradient(135deg,#101F33,#16283A)] p-5 shadow-xl"
      >
        <AssetImage
          src={gamePlanAssets.strategyField}
          alt="Strategy field"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
          fallbackClassName="hidden"
        />

        <div className="relative grid w-full min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-card/50 p-4 backdrop-blur-sm">
            <div className="mb-3 flex min-w-0 items-center gap-2">
              <Crown className="h-5 w-5 shrink-0 text-gold" />
              <p className="break-words text-sm font-black uppercase tracking-wide text-white">
                Base Scheme Logic
              </p>
            </div>
            <p className="break-words text-sm leading-6 text-text-muted">
              Your base scheme is the team’s visible default identity. The
              engine can still move away from it situationally depending on
              down, distance, and tactics.
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-card/50 p-4 backdrop-blur-sm">
            <div className="mb-3 flex min-w-0 items-center gap-2">
              <Swords className="h-5 w-5 shrink-0 text-gold" />
              <p className="break-words text-sm font-black uppercase tracking-wide text-white">
                Formation-Specific Saving
              </p>
            </div>
            <p className="break-words text-sm leading-6 text-text-muted">
              When you switch “Edit Tactics For,” the sliders affect only that
              formation. Use “Set As Base” if you want the current formation to
              become the default.
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-navy-border bg-navy-card/50 p-4 backdrop-blur-sm">
            <div className="mb-3 flex min-w-0 items-center gap-2">
              <Radio className="h-5 w-5 shrink-0 text-gold" />
              <p className="break-words text-sm font-black uppercase tracking-wide text-white">
                Franchise Persistence
              </p>
            </div>
            <p className="break-words text-sm leading-6 text-text-muted">
              Game plans are stored per franchise, so changing one franchise’s
              offensive or defensive identity will not overwrite another team’s
              settings.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="grid w-full min-w-0 grid-cols-1 gap-4 xl:grid-cols-3"
      >
        <div className="rounded-2xl border border-navy-border bg-navy-card p-4 shadow-lg">
          <div className="mb-3 flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-gold" />
            <p className="text-sm font-black uppercase tracking-wide text-white">
              Offensive Snapshot
            </p>
          </div>
          <p className="text-sm leading-6 text-text-muted">
            Base:{" "}
            <span className="font-black text-white">
              {currentPlan.offensiveBaseScheme}
            </span>
            . Editing:{" "}
            <span className="font-black text-white">
              {currentPlan.offensiveEditingScheme}
            </span>
            .
          </p>
        </div>

        <div className="rounded-2xl border border-navy-border bg-navy-card p-4 shadow-lg">
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-electric" />
            <p className="text-sm font-black uppercase tracking-wide text-white">
              Defensive Snapshot
            </p>
          </div>
          <p className="text-sm leading-6 text-text-muted">
            Base:{" "}
            <span className="font-black text-white">
              {currentPlan.defensiveBaseScheme}
            </span>
            . Editing:{" "}
            <span className="font-black text-white">
              {currentPlan.defensiveEditingScheme}
            </span>
            .
          </p>
        </div>

        <div className="rounded-2xl border border-navy-border bg-navy-card p-4 shadow-lg">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-success" />
            <p className="text-sm font-black uppercase tracking-wide text-white">
              Save State
            </p>
          </div>
          <p className="text-sm leading-6 text-text-muted">
            Current state:{" "}
            <span className="font-black text-white">
              {saveState === "saved" ? "Saved successfully" : "Pending changes"}
            </span>
            .
          </p>
        </div>
      </motion.section>
    </div>
  );
}

export default GamePlanForm;