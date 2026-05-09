"use client";

import { getTeamPlayers } from "@/lib/gameHub";

export interface FranchiseGamePlanSettings {
  teamId: string;
  offenseStyle: "balanced" | "run-heavy" | "pass-heavy" | "spread" | "power";
  defensiveStyle:
    | "balanced"
    | "aggressive"
    | "coverage"
    | "run-stop"
    | "bend-dont-break";
  runPassBalance: number;
  tempo: number;
  fourthDownAggression: number;
  firstDownBehavior: number;
  shortYardageBehavior: number;
  longYardageBehavior: number;
  blitzFrequency: number;
  coverageDepth: number;
  turnoverAggression: number;
  stopRun: number;
  redZoneRisk: number;
  maxFieldGoalRange: number;
  savedAt: string;
}

export interface DepthChartSlot {
  position: string;
  starterId: string;
  backupId?: string;
}

export interface FranchiseDepthChartSettings {
  teamId: string;
  formation: "base" | "spread" | "power" | "nickel" | "dime";
  slots: DepthChartSlot[];
  savedAt: string;
}

const GAME_PLAN_KEY = "gmdl_franchise_gameplans";
const DEPTH_CHART_KEY = "gmdl_franchise_depthcharts";
const PRIMARY_FRANCHISE_KEY = "gmdl_primary_franchise";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("gmdl-storage-change"));
  } catch {
    console.log("Unable to save:", key);
  }
}

export function getPrimaryFranchiseId() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(PRIMARY_FRANCHISE_KEY) ?? undefined;
}

export function setPrimaryFranchiseId(teamId: string) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(PRIMARY_FRANCHISE_KEY, teamId);
  window.dispatchEvent(new Event("gmdl-storage-change"));
}

export function createDefaultGamePlan(
  teamId: string
): FranchiseGamePlanSettings {
  return {
    teamId,
    offenseStyle: "balanced",
    defensiveStyle: "balanced",
    runPassBalance: 50,
    tempo: 50,
    fourthDownAggression: 40,
    firstDownBehavior: 50,
    shortYardageBehavior: 68,
    longYardageBehavior: 30,
    blitzFrequency: 45,
    coverageDepth: 55,
    turnoverAggression: 50,
    stopRun: 50,
    redZoneRisk: 45,
    maxFieldGoalRange: 52,
    savedAt: new Date().toISOString(),
  };
}

export function getGamePlanForFranchise(teamId: string) {
  const all = safeRead<Record<string, FranchiseGamePlanSettings>>(
    GAME_PLAN_KEY,
    {}
  );

  return all[teamId] ?? createDefaultGamePlan(teamId);
}

export function saveGamePlanForFranchise(
  settings: FranchiseGamePlanSettings
) {
  const all = safeRead<Record<string, FranchiseGamePlanSettings>>(
    GAME_PLAN_KEY,
    {}
  );

  safeWrite(GAME_PLAN_KEY, {
    ...all,
    [settings.teamId]: {
      ...settings,
      savedAt: new Date().toISOString(),
    },
  });
}

export function createDefaultDepthChart(
  teamId: string
): FranchiseDepthChartSettings {
  const players = getTeamPlayers(teamId);

  const positions = [
    "QB",
    "RB",
    "WR",
    "TE",
    "LT",
    "LG",
    "C",
    "RG",
    "RT",
    "LE",
    "DT",
    "RE",
    "LOLB",
    "MLB",
    "ROLB",
    "CB",
    "FS",
    "SS",
    "K",
  ];

  const slots = positions.map((position) => {
    const positionPlayers = players.filter(
      (player) => player.position === position
    );

    const sorted = [...positionPlayers].sort(
      (a, b) => b.overall - a.overall
    );

    return {
      position,
      starterId: sorted[0]?.id ?? players[0]?.id ?? "",
      backupId: sorted[1]?.id ?? players[1]?.id,
    };
  });

  return {
    teamId,
    formation: "base",
    slots,
    savedAt: new Date().toISOString(),
  };
}

export function getDepthChartForFranchise(teamId: string) {
  const all = safeRead<Record<string, FranchiseDepthChartSettings>>(
    DEPTH_CHART_KEY,
    {}
  );

  return all[teamId] ?? createDefaultDepthChart(teamId);
}

export function saveDepthChartForFranchise(
  settings: FranchiseDepthChartSettings
) {
  const all = safeRead<Record<string, FranchiseDepthChartSettings>>(
    DEPTH_CHART_KEY,
    {}
  );

  safeWrite(DEPTH_CHART_KEY, {
    ...all,
    [settings.teamId]: {
      ...settings,
      savedAt: new Date().toISOString(),
    },
  });
}