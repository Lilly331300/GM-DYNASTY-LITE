"use client";

import { Team, Player } from "@/lib/types";
import { mockTeams, mockUser } from "@/lib/mockData";
import {
  AiTeamTemplate,
  FranchisePlayer,
  defaultAiTeams,
  generateFranchisePlayers,
  getAiTeamById,
  getAiTeamForDifficulty,
} from "@/lib/defaultAiTeams";
import { getDeletedFranchiseIds } from "@/lib/franchiseDelete";

export type StoredGameStatus = "listed" | "pregame" | "live" | "completed";

export interface TeamVisualIdentity {
  primaryColor?: string;
  secondaryColor?: string;
  helmetBaseSrc?: string;
  helmetGlowSrc?: string;
  selectedLogoId?: string;
  logoSrc?: string;
  customLogoDataUrl?: string | null;
  cardBgSrc?: string;
  cardBgId?: string;
  builderVersion?: number;
}

export interface PregameGamePlan {
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
  savedAt?: string;
}

export interface StoredFranchiseTeam extends Team {
  players?: FranchisePlayer[];
  visualIdentity?: TeamVisualIdentity;
  helmetUrl?: string;
  helmetAssetPath?: string;
  cardAssetPath?: string;
  logoAssetPath?: string;
}

export interface StoredGame {
  id: string;
  challengeId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeOwnerId: string;
  awayOwnerId?: string;
  status: StoredGameStatus;
  matchType: "free" | "paid" | "ai";
  opponentType: "public" | "invite" | "ai";
  stake: number;
  predictionsEnabled: boolean;
  simulationMode: "live" | "instant";
  scheduledFor?: string;
  createdAt: string;
  completedAt?: string;
  gamePlan?: PregameGamePlan;
}

export interface FranchiseCreateInput {
  name: string;
  city: string;
  nickname: string;
  abbreviation: string;
  primaryColor: string;
  secondaryColor: string;
  nflSyncEnabled: boolean;
  nflTeam?: string;
  logoUrl?: string;
  helmetUrl?: string;
  helmetAssetPath?: string;
  cardAssetPath?: string;
  logoAssetPath?: string;
  visualIdentity?: TeamVisualIdentity;
}

type SavedOffensiveTactics = {
  deviateFromBase: number;
  firstDownPlaySelection: number;
  shortPlaySelection: number;
  longPlaySelection: number;
  fourthDownGoForIt: number;
  rushingPlays: number;
  quarterbackSnap: number;
};

type SavedDefensiveTactics = {
  firstDownBias: number;
  deepCoverage: number;
  coverageAssignment: number;
  blitz: number;
  forceTurnovers: number;
};

type SavedTeamGamePlanV2 = {
  offensiveBaseScheme: string;
  offensiveEditingScheme: string;
  offensiveSchemes: Record<string, SavedOffensiveTactics>;
  defensiveBaseScheme: string;
  defensiveEditingScheme: string;
  defensiveSchemes: Record<string, SavedDefensiveTactics>;
  specialTeams: {
    fieldGoalMaxRange: number;
    kickoffStrategy: number;
    twoPointWhenBehind: number;
  };
  lastUpdated: string;
};

type SavedDepthChartSlot = {
  position: string;
  starterId: string;
  backupId: string;
  group: "offense" | "defense" | "special";
};

type SavedDepthChartV2 = {
  teamId: string;
  activeFormation: string;
  slots: SavedDepthChartSlot[];
  lastUpdated: string;
};

const CREATED_TEAMS_KEY = "gmdl_created_teams";
const USER_FRANCHISES_KEY = "gmdl_user_franchises";
const FRANCHISES_KEY = "gmdl_franchises";
const OWNED_FRANCHISES_KEY = "gmdl_owned_franchises";

const CREATED_GAMES_KEY = "gmdl_created_games";
const OLD_FRANCHISE_GAME_PLANS_KEY = "gmdl_franchise_gameplans";
const TEAM_GAME_PLANS_V2_KEY = "gmdl_team_game_plans_v2";
const TEAM_DEPTH_CHARTS_V2_KEY = "gmdl_team_depth_charts_v2";
const PRIMARY_FRANCHISE_KEY = "gmdl_primary_franchise";

const FRANCHISE_STORAGE_KEYS = [
  CREATED_TEAMS_KEY,
  USER_FRANCHISES_KEY,
  FRANCHISES_KEY,
  OWNED_FRANCHISES_KEY,
];

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
    console.log("Unable to write local storage:", key);
  }
}

function safeWriteString(key: string, value: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new Event("gmdl-storage-change"));
  } catch {
    console.log("Unable to write local storage:", key);
  }
}

function getDeletedIds() {
  try {
    return getDeletedFranchiseIds();
  } catch {
    return [];
  }
}

function isDeletedTeamId(teamId?: string | null) {
  if (!teamId || teamId === "awaiting_opponent") return false;
  return getDeletedIds().includes(teamId);
}

function filterDeletedFranchises<T extends { id: string }>(teams: T[]): T[] {
  const deletedIds = getDeletedIds();
  return teams.filter((team) => !deletedIds.includes(team.id));
}

function filterDeletedGames(games: StoredGame[]): StoredGame[] {
  const deletedIds = getDeletedIds();

  return games.filter(
    (game) =>
      !deletedIds.includes(game.homeTeamId) &&
      !deletedIds.includes(game.awayTeamId)
  );
}

function getRawStoredGames(): StoredGame[] {
  return safeRead<StoredGame[]>(CREATED_GAMES_KEY, []);
}

function writeRawStoredGames(games: StoredGame[]) {
  safeWrite(CREATED_GAMES_KEY, filterDeletedGames(games));
}

function getTeamDisplayNameFromParts(team: Partial<StoredFranchiseTeam>) {
  const city = team.city?.trim();
  const nickname = team.nickname?.trim();

  if (city && nickname) return `${city} ${nickname}`;
  return team.name ?? nickname ?? city ?? "Unnamed Franchise";
}

function getTeamInitialsFromParts(team: Partial<StoredFranchiseTeam>) {
  const abbreviation = team.abbreviation?.trim();

  if (abbreviation) return abbreviation.slice(0, 3).toUpperCase();

  return getTeamDisplayNameFromParts(team)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function normalizeStoredTeam(
  team: Partial<StoredFranchiseTeam>,
  index = 0
): StoredFranchiseTeam | null {
  if (!team?.id) return null;

  const overallRating = Number(team.overallRating ?? 55);
  const city = team.city ?? "Expansion";
  const nickname = team.nickname ?? team.name ?? "Franchise";
  const name = team.name ?? `${city} ${nickname}`.trim();

  return {
    ...(team as StoredFranchiseTeam),
    id: team.id,
    ownerId: team.ownerId ?? mockUser.id,
    name,
    city,
    nickname,
    abbreviation:
      team.abbreviation?.toUpperCase().slice(0, 3) ??
      getTeamInitialsFromParts({ city, nickname, name }),
    primaryColor:
      team.primaryColor ?? team.visualIdentity?.primaryColor ?? "#0B1A2A",
    secondaryColor:
      team.secondaryColor ?? team.visualIdentity?.secondaryColor ?? "#F5C542",
    logoUrl:
      team.logoUrl ??
      team.visualIdentity?.customLogoDataUrl ??
      team.visualIdentity?.logoSrc,
    helmetUrl: team.helmetUrl,
    helmetAssetPath: team.helmetAssetPath,
    cardAssetPath: team.cardAssetPath ?? team.visualIdentity?.cardBgSrc,
    logoAssetPath: team.logoAssetPath ?? team.visualIdentity?.logoSrc,
    visualIdentity: team.visualIdentity,
    overallRating,
    offensiveRating: Number(team.offensiveRating ?? overallRating),
    defensiveRating: Number(team.defensiveRating ?? overallRating),
    specialTeamsRating: Number(team.specialTeamsRating ?? overallRating),
    record: team.record ?? {
      wins: 0,
      losses: 0,
      ties: 0,
    },
    prestige: Number(team.prestige ?? 250),
    fanBase: Number(team.fanBase ?? 12000),
    leagueRank: Number(team.leagueRank ?? 32),
    division: team.division ?? "Expansion Division",
    conference: team.conference ?? "Independent",
    nflSync: {
      enabled: Boolean(team.nflSync?.enabled),
      nflTeam: team.nflSync?.nflTeam,
      lastSync: team.nflSync?.lastSync,
    },
    createdAt: team.createdAt ?? new Date().toISOString(),
    isActive: team.isActive ?? true,
    players:
      Array.isArray(team.players) && team.players.length > 0
        ? team.players
        : generateFranchisePlayers(team.id, overallRating, 500 + index),
  };
}

function dedupeTeams(teams: StoredFranchiseTeam[]) {
  const map = new Map<string, StoredFranchiseTeam>();

  teams.forEach((team, index) => {
    const normalized = normalizeStoredTeam(team, index);
    if (!normalized) return;
    map.set(normalized.id, normalized);
  });

  return Array.from(map.values());
}

function readAllStoredFranchises() {
  const allTeams = FRANCHISE_STORAGE_KEYS.flatMap((key) =>
    safeRead<StoredFranchiseTeam[]>(key, [])
  );

  return filterDeletedFranchises(dedupeTeams(allTeams));
}

function syncCreatedTeamsEverywhere(teams: StoredFranchiseTeam[]) {
  const cleanTeams = filterDeletedFranchises(dedupeTeams(teams));

  FRANCHISE_STORAGE_KEYS.forEach((key) => {
    safeWrite(key, cleanTeams);
  });

  const savedPrimary =
    typeof window !== "undefined"
      ? window.localStorage.getItem(PRIMARY_FRANCHISE_KEY)
      : undefined;

  const primaryStillExists = cleanTeams.some((team) => team.id === savedPrimary);

  if (typeof window !== "undefined" && !primaryStillExists) {
    if (cleanTeams[0]?.id) {
      safeWriteString(PRIMARY_FRANCHISE_KEY, cleanTeams[0].id);
    } else {
      window.localStorage.removeItem(PRIMARY_FRANCHISE_KEY);
      window.dispatchEvent(new Event("gmdl-storage-change"));
    }
  }

  return cleanTeams;
}

export function createDefaultPregameGamePlan(): PregameGamePlan {
  return {
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

function offensiveSchemeToStyle(
  scheme?: string
): PregameGamePlan["offenseStyle"] {
  if (!scheme) return "balanced";
  if (scheme.includes("22") || scheme.includes("21")) return "power";
  if (scheme.includes("10")) return "spread";
  if (scheme.includes("11")) return "pass-heavy";
  return "balanced";
}

function defensiveSchemeToStyle(
  scheme?: string
): PregameGamePlan["defensiveStyle"] {
  if (!scheme) return "balanced";
  if (scheme.includes("Nickel") || scheme.includes("Dime")) return "coverage";
  if (scheme.includes("3-4")) return "aggressive";
  if (scheme.includes("4-3")) return "balanced";
  return "balanced";
}

function convertV2GamePlanToPregame(plan: SavedTeamGamePlanV2): PregameGamePlan {
  const offensiveTactics =
    plan.offensiveSchemes?.[plan.offensiveBaseScheme] ??
    plan.offensiveSchemes?.[plan.offensiveEditingScheme];

  const defensiveTactics =
    plan.defensiveSchemes?.[plan.defensiveBaseScheme] ??
    plan.defensiveSchemes?.[plan.defensiveEditingScheme];

  return {
    offenseStyle: offensiveSchemeToStyle(plan.offensiveBaseScheme),
    defensiveStyle: defensiveSchemeToStyle(plan.defensiveBaseScheme),
    runPassBalance: offensiveTactics?.firstDownPlaySelection ?? 50,
    tempo: offensiveTactics?.quarterbackSnap ?? 50,
    fourthDownAggression: offensiveTactics?.fourthDownGoForIt ?? 40,
    firstDownBehavior: offensiveTactics?.firstDownPlaySelection ?? 50,
    shortYardageBehavior: offensiveTactics?.shortPlaySelection ?? 50,
    longYardageBehavior: offensiveTactics?.longPlaySelection ?? 60,
    blitzFrequency: defensiveTactics?.blitz ?? 40,
    coverageDepth: defensiveTactics?.deepCoverage ?? 55,
    turnoverAggression: defensiveTactics?.forceTurnovers ?? 40,
    stopRun: 100 - (defensiveTactics?.firstDownBias ?? 50),
    redZoneRisk: offensiveTactics?.fourthDownGoForIt ?? 45,
    maxFieldGoalRange: plan.specialTeams?.fieldGoalMaxRange ?? 52,
    savedAt: plan.lastUpdated ?? new Date().toISOString(),
  };
}

export function getFranchiseDefaultGamePlan(teamId: string): PregameGamePlan {
  const v2Plans = safeRead<Record<string, SavedTeamGamePlanV2>>(
    TEAM_GAME_PLANS_V2_KEY,
    {}
  );

  if (v2Plans[teamId]) {
    return convertV2GamePlanToPregame(v2Plans[teamId]);
  }

  const oldPlans = safeRead<Record<string, PregameGamePlan>>(
    OLD_FRANCHISE_GAME_PLANS_KEY,
    {}
  );

  return oldPlans[teamId] ?? createDefaultPregameGamePlan();
}

export function getPregameGamePlan(
  gameId?: string | null,
  teamId?: string | null
): PregameGamePlan {
  if (!gameId || gameId === "demo") {
    return teamId
      ? getFranchiseDefaultGamePlan(teamId)
      : createDefaultPregameGamePlan();
  }

  const game = getRawStoredGames().find((item) => item.id === gameId);

  return (
    game?.gamePlan ??
    (teamId ? getFranchiseDefaultGamePlan(teamId) : createDefaultPregameGamePlan())
  );
}

export function savePregameGamePlan(gameId: string, gamePlan: PregameGamePlan) {
  if (!gameId || gameId === "demo") return;

  const games = getRawStoredGames();

  writeRawStoredGames(
    games.map((game) =>
      game.id === gameId
        ? {
            ...game,
            gamePlan: {
              ...gamePlan,
              savedAt: new Date().toISOString(),
            },
          }
        : game
    )
  );
}

export function buildGamePlanFromPregame<T extends Record<string, any>>(
  gameId: string | null | undefined,
  baseGamePlan: T,
  teamId: string
): T {
  const activeGame = gameId
    ? getRawStoredGames().find((game) => game.id === gameId)
    : undefined;

  const savedPlan = activeGame?.gamePlan ?? getFranchiseDefaultGamePlan(teamId);

  return {
    ...baseGamePlan,
    teamId,
    offense: {
      ...baseGamePlan.offense,
      formationStyle: savedPlan.offenseStyle,
      runPassTendency: savedPlan.runPassBalance,
      firstDownBehavior: savedPlan.firstDownBehavior,
      shortYardageBehavior: savedPlan.shortYardageBehavior,
      longYardageBehavior: savedPlan.longYardageBehavior,
      fourthDownAggression: savedPlan.fourthDownAggression,
      tempo: savedPlan.tempo,
      redZoneRisk: savedPlan.redZoneRisk,
    },
    defense: {
      ...baseGamePlan.defense,
      baseScheme: savedPlan.defensiveStyle,
      blitzFrequency: savedPlan.blitzFrequency,
      coveragePreference: savedPlan.coverageDepth,
      turnoverAggression: savedPlan.turnoverAggression,
      stopRun: savedPlan.stopRun,
    },
    specialTeams: {
      ...baseGamePlan.specialTeams,
      maxFieldGoalRange: savedPlan.maxFieldGoalRange,
    },
  };
}

export function getCreatedTeams(): StoredFranchiseTeam[] {
  return readAllStoredFranchises();
}

export function saveUserFranchises(teams: StoredFranchiseTeam[]) {
  return syncCreatedTeamsEverywhere(teams);
}

export function addOrUpdateUserFranchise(team: StoredFranchiseTeam) {
  const current = getCreatedTeams();
  const normalized = normalizeStoredTeam(team, current.length);

  if (!normalized) return current;

  return syncCreatedTeamsEverywhere([
    normalized,
    ...current.filter((item) => item.id !== normalized.id),
  ]);
}

export function saveCreatedTeam(input: FranchiseCreateInput): StoredFranchiseTeam {
  const createdTeams = getCreatedTeams();
  const id = `created_team_${Date.now()}`;

  const team: StoredFranchiseTeam = {
    id,
    ownerId: mockUser.id,
    name: input.name,
    city: input.city,
    nickname: input.nickname,
    abbreviation: input.abbreviation.toUpperCase().slice(0, 3),
    primaryColor: input.primaryColor,
    secondaryColor: input.secondaryColor,
    logoUrl: input.logoUrl,
    helmetUrl: input.helmetUrl,
    helmetAssetPath: input.helmetAssetPath,
    cardAssetPath: input.cardAssetPath,
    logoAssetPath: input.logoAssetPath,
    visualIdentity: input.visualIdentity,
    overallRating: 55,
    offensiveRating: 54,
    defensiveRating: 55,
    specialTeamsRating: 53,
    record: {
      wins: 0,
      losses: 0,
      ties: 0,
    },
    prestige: 250,
    fanBase: 12000,
    leagueRank: 32,
    division: "Expansion Division",
    conference: "Independent",
    nflSync: {
      enabled: input.nflSyncEnabled,
      nflTeam: input.nflSyncEnabled ? input.nflTeam : undefined,
      lastSync: input.nflSyncEnabled ? new Date().toISOString() : undefined,
    },
    createdAt: new Date().toISOString(),
    isActive: true,
    players: generateFranchisePlayers(id, 55, Date.now() % 1000),
  };

  syncCreatedTeamsEverywhere([team, ...createdTeams]);

  safeWriteString(PRIMARY_FRANCHISE_KEY, team.id);

  return team;
}

function hydrateMockTeam(team: Team, index: number): StoredFranchiseTeam {
  const normalized = normalizeStoredTeam(
    {
      ...(team as StoredFranchiseTeam),
      ownerId: (team as any).ownerId ?? mockUser.id,
      players: generateFranchisePlayers(team.id, team.overallRating, 300 + index),
    },
    index
  );

  return normalized as StoredFranchiseTeam;
}

export function getAllFranchises(): StoredFranchiseTeam[] {
  const created = getCreatedTeams();
  const defaultUserTeams = mockTeams.map((team, index) =>
    hydrateMockTeam(team, index)
  );

  const merged = [...created, ...defaultUserTeams];
  const seen = new Set<string>();

  const deduped = merged.filter((team) => {
    if (seen.has(team.id)) return false;
    seen.add(team.id);
    return true;
  });

  return filterDeletedFranchises(deduped);
}

export function getAllTeamsForDisplay(): Array<StoredFranchiseTeam | AiTeamTemplate> {
  return [...getAllFranchises(), ...defaultAiTeams];
}

export function getUserFranchises(userId = mockUser.id): StoredFranchiseTeam[] {
  return getAllFranchises().filter((team) => {
    const ownerId = String(team.ownerId ?? mockUser.id);
    return ownerId === userId || ownerId === "user" || !team.ownerId;
  });
}

export function getTeamFromHub(teamId?: string | null) {
  if (!teamId) return undefined;

  if (isDeletedTeamId(teamId)) return undefined;

  return (
    getAllFranchises().find((team) => team.id === teamId) ??
    getAiTeamById(teamId) ??
    defaultAiTeams.find((team) => team.id === teamId)
  );
}

export function getTeamPlayers(teamId?: string | null): FranchisePlayer[] {
  const team = getTeamFromHub(teamId);

  if (!team) return [];

  if ("players" in team && team.players?.length) {
    return team.players;
  }

  return generateFranchisePlayers(team.id, team.overallRating, 500);
}

function getSavedDepthChart(teamId: string) {
  const charts = safeRead<Record<string, SavedDepthChartV2>>(
    TEAM_DEPTH_CHARTS_V2_KEY,
    {}
  );

  return charts[teamId];
}

export function getDepthChartStarterIds(teamId: string) {
  const chart = getSavedDepthChart(teamId);

  if (!chart) return [];

  return chart.slots.map((slot) => slot.starterId).filter(Boolean);
}

export function getDepthChartBackupIds(teamId: string) {
  const chart = getSavedDepthChart(teamId);

  if (!chart) return [];

  return chart.slots.map((slot) => slot.backupId).filter(Boolean);
}

function normalizeSimulationPlayer(
  player: FranchisePlayer,
  teamId: string,
  index: number
): Player {
  const anyPlayer = player as any;
  const fullName =
    anyPlayer.name ??
    `${anyPlayer.firstName ?? ""} ${anyPlayer.lastName ?? ""}`.trim() ??
    `Player ${index + 1}`;

  return {
    ...anyPlayer,
    id: String(anyPlayer.id ?? `${teamId}_player_${index}`),
    teamId,
    name: fullName,
    firstName: anyPlayer.firstName ?? fullName.split(" ")[0] ?? "Player",
    lastName: anyPlayer.lastName ?? fullName.split(" ").slice(1).join(" ") ?? "",
    position: anyPlayer.position ?? "ATH",
    overallRating: Number(anyPlayer.overallRating ?? anyPlayer.overall ?? 60),
    overall: Number(anyPlayer.overall ?? anyPlayer.overallRating ?? 60),
  } as Player;
}

export function getSimulationPlayers(teamId?: string | null): Player[] {
  if (!teamId) return [];

  const players = getTeamPlayers(teamId);
  const starterIds = getDepthChartStarterIds(teamId);
  const backupIds = getDepthChartBackupIds(teamId);

  const starterSet = new Set(starterIds);
  const backupSet = new Set(backupIds);

  const sortedPlayers = [...players].sort((a, b) => {
    const aStarter = starterSet.has(a.id) ? 2 : backupSet.has(a.id) ? 1 : 0;
    const bStarter = starterSet.has(b.id) ? 2 : backupSet.has(b.id) ? 1 : 0;

    if (aStarter !== bStarter) return bStarter - aStarter;

    const aOverall = Number((a as any).overall ?? (a as any).overallRating ?? 60);
    const bOverall = Number((b as any).overall ?? (b as any).overallRating ?? 60);

    return bOverall - aOverall;
  });

  return sortedPlayers.map((player, index) =>
    normalizeSimulationPlayer(player, teamId, index)
  );
}

export function getStoredGames(): StoredGame[] {
  return filterDeletedGames(
    getRawStoredGames().filter((game) => game.status !== "completed")
  );
}

export function getActiveStoredGames(): StoredGame[] {
  const rawGames = getRawStoredGames();
  const cleanedRawGames = filterDeletedGames(rawGames);

  if (rawGames.length !== cleanedRawGames.length) {
    writeRawStoredGames(cleanedRawGames);
  }

  return cleanedRawGames.filter((game) =>
    ["listed", "pregame", "live"].includes(game.status)
  );
}

export function saveStoredGame(game: StoredGame) {
  if (isDeletedTeamId(game.homeTeamId) || isDeletedTeamId(game.awayTeamId)) {
    return;
  }

  const games = getRawStoredGames();

  writeRawStoredGames([game, ...games.filter((item) => item.id !== game.id)]);
}

export function updateStoredGame(gameId: string, updates: Partial<StoredGame>) {
  if (!gameId || gameId === "demo") return;

  const games = getRawStoredGames();

  writeRawStoredGames(
    games.map((game) =>
      game.id === gameId
        ? {
            ...game,
            ...updates,
          }
        : game
    )
  );
}

export function markGameCompleted(gameId?: string | null) {
  if (!gameId || gameId === "demo") return;

  const games = getRawStoredGames();
  const cleanedGames = games.filter((game) => game.id !== gameId);

  writeRawStoredGames(cleanedGames);
}

export function isTeamBusy(teamId: string) {
  if (isDeletedTeamId(teamId)) return false;

  return getActiveStoredGames().some(
    (game) => game.homeTeamId === teamId || game.awayTeamId === teamId
  );
}

export function getTeamBusyReason(teamId: string) {
  if (isDeletedTeamId(teamId)) return undefined;

  const game = getActiveStoredGames().find(
    (item) => item.homeTeamId === teamId || item.awayTeamId === teamId
  );

  if (!game) return undefined;

  if (game.status === "listed") {
    return "This franchise already has a listed challenge.";
  }

  if (game.status === "pregame") {
    return "This franchise is already in a pregame lobby.";
  }

  return "This franchise is already in a live game.";
}

export function createChallengeGame(input: {
  teamId: string;
  matchType: "free" | "paid";
  opponentType: "public" | "invite" | "ai";
  stake: number;
  predictionsEnabled: boolean;
  simulationMode: "live" | "instant";
  scheduledFor?: string;
}): StoredGame {
  const aiTeam =
    input.opponentType === "ai"
      ? defaultAiTeams[Math.floor(Math.random() * defaultAiTeams.length)]
      : undefined;

  const game: StoredGame = {
    id: `game_${Date.now()}`,
    challengeId: `challenge_${Date.now()}`,
    homeTeamId: input.teamId,
    awayTeamId: aiTeam?.id ?? "awaiting_opponent",
    homeOwnerId: mockUser.id,
    awayOwnerId: input.opponentType === "ai" ? "ai" : undefined,
    status: input.opponentType === "ai" ? "pregame" : "listed",
    matchType: input.opponentType === "ai" ? "ai" : input.matchType,
    opponentType: input.opponentType,
    stake: input.matchType === "free" ? 0 : input.stake,
    predictionsEnabled: input.predictionsEnabled,
    simulationMode: input.simulationMode,
    scheduledFor: input.scheduledFor,
    createdAt: new Date().toISOString(),
    gamePlan: getFranchiseDefaultGamePlan(input.teamId),
  };

  saveStoredGame(game);
  return game;
}

export function acceptChallenge(input: {
  gameId: string;
  acceptingTeamId: string;
}) {
  const games = getRawStoredGames();
  const game = games.find((item) => item.id === input.gameId);

  if (!game) return undefined;

  if (game.homeTeamId === input.acceptingTeamId) {
    console.log("A franchise cannot accept its own challenge.");
    return undefined;
  }

  if (isTeamBusy(input.acceptingTeamId)) {
    console.log("Selected franchise is already busy.");
    return undefined;
  }

  if (isDeletedTeamId(input.acceptingTeamId) || isDeletedTeamId(game.homeTeamId)) {
    console.log("Deleted franchise cannot accept or host a challenge.");
    return undefined;
  }

  const updated: StoredGame = {
    ...game,
    awayTeamId: input.acceptingTeamId,
    awayOwnerId: mockUser.id,
    status: "pregame",
  };

  writeRawStoredGames(
    games.map((item) => (item.id === input.gameId ? updated : item))
  );

  return updated;
}

export function createAiInstantGame(
  teamId: string,
  difficulty: "easy" | "medium" | "hard" | "elite"
) {
  if (isDeletedTeamId(teamId)) {
    console.log("Deleted franchise cannot start a game.");
    return undefined;
  }

  if (isTeamBusy(teamId)) {
    console.log("Selected franchise is already busy.");
    return undefined;
  }

  const aiTeam = getAiTeamForDifficulty(difficulty);

  const game: StoredGame = {
    id: `ai_game_${Date.now()}`,
    challengeId: `ai_challenge_${Date.now()}`,
    homeTeamId: teamId,
    awayTeamId: aiTeam.id,
    homeOwnerId: mockUser.id,
    awayOwnerId: "ai",
    status: "pregame",
    matchType: "ai",
    opponentType: "ai",
    stake:
      difficulty === "easy"
        ? 0
        : difficulty === "medium"
          ? 25
          : difficulty === "hard"
            ? 50
            : 100,
    predictionsEnabled: true,
    simulationMode: "live",
    createdAt: new Date().toISOString(),
    gamePlan: getFranchiseDefaultGamePlan(teamId),
  };

  saveStoredGame(game);
  return game;
}

export function getActiveGameAlerts() {
  const games = getActiveStoredGames();

  return games.map((game) => {
    const homeTeam = getTeamFromHub(game.homeTeamId);
    const awayTeam = getTeamFromHub(game.awayTeamId);

    const href = game.status === "live" ? toLiveHref(game) : toPregameHref(game);

    return {
      id: game.id,
      title:
        game.status === "listed"
          ? "Listed Challenge"
          : game.status === "pregame"
            ? "Pregame Lobby"
            : "Live Game",
      description:
        game.status === "listed"
          ? `${homeTeam?.nickname ?? "Your franchise"} is waiting for an opponent.`
          : `${homeTeam?.nickname ?? "Home"} vs ${
              awayTeam?.nickname ?? "Opponent"
            }`,
      href,
      status: game.status,
    };
  });
}

export function getNextGameForDashboard() {
  const games = getActiveStoredGames();

  return (
    games.find((game) => game.status === "live") ??
    games.find((game) => game.status === "pregame") ??
    games.find((game) => game.status === "listed")
  );
}

export function getNflSyncSummary() {
  return getUserFranchises()
    .filter((team) => team.nflSync.enabled)
    .map((team, index) => {
      const points = index % 2 === 0 ? 250 : -75;

      return {
        team,
        city: team.city,
        nflTeam: team.nflSync.nflTeam ?? `${team.city} NFL Team`,
        points,
        note:
          points >= 0
            ? "Real-city performance bonus"
            : "Real-city performance dip",
      };
    });
}

export function getSavedTeamGamePlan(teamId: string) {
  const plans = safeRead<Record<string, unknown>>(TEAM_GAME_PLANS_V2_KEY, {});
  return plans[teamId];
}

export function saveTeamGamePlan(teamId: string, plan: unknown) {
  const plans = safeRead<Record<string, unknown>>(TEAM_GAME_PLANS_V2_KEY, {});

  safeWrite(TEAM_GAME_PLANS_V2_KEY, {
    ...plans,
    [teamId]: plan,
  });
}

export function getSavedTeamDepthChart(teamId: string) {
  const charts = safeRead<Record<string, unknown>>(TEAM_DEPTH_CHARTS_V2_KEY, {});
  return charts[teamId];
}

export function saveTeamDepthChart(teamId: string, chart: unknown) {
  const charts = safeRead<Record<string, unknown>>(TEAM_DEPTH_CHARTS_V2_KEY, {});

  safeWrite(TEAM_DEPTH_CHARTS_V2_KEY, {
    ...charts,
    [teamId]: chart,
  });
}

export function toPregameHref(game: StoredGame) {
  const mode = game.matchType === "ai" ? "ai" : "pvp";

  return `/pregame?game=${game.id}&home=${game.homeTeamId}&away=${game.awayTeamId}&mode=${mode}`;
}

export function toLiveHref(game: StoredGame) {
  const mode = game.matchType === "ai" ? "ai" : "pvp";

  return `/live-game?game=${game.id}&home=${game.homeTeamId}&away=${game.awayTeamId}&mode=${mode}`;
}