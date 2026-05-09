const PRIMARY_FRANCHISE_KEY = "gmdl_primary_franchise";
const DELETED_FRANCHISE_IDS_KEY = "gmdl_deleted_franchise_ids";

const CREATED_TEAMS_KEY = "gmdl_created_teams";
const USER_FRANCHISES_KEY = "gmdl_user_franchises";
const FRANCHISES_KEY = "gmdl_franchises";
const OWNED_FRANCHISES_KEY = "gmdl_owned_franchises";

const CREATED_GAMES_KEY = "gmdl_created_games";
const OLD_FRANCHISE_GAME_PLANS_KEY = "gmdl_franchise_gameplans";
const TEAM_GAME_PLANS_V2_KEY = "gmdl_team_game_plans_v2";
const TEAM_DEPTH_CHARTS_V2_KEY = "gmdl_team_depth_charts_v2";

type StoredTeamLike = {
  id: string;
  [key: string]: unknown;
};

const FRANCHISE_STORAGE_KEYS = [
  CREATED_TEAMS_KEY,
  USER_FRANCHISES_KEY,
  FRANCHISES_KEY,
  OWNED_FRANCHISES_KEY,
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.log(`Unable to update ${key}`);
  }
}

export function getDeletedFranchiseIds() {
  return readJson<string[]>(DELETED_FRANCHISE_IDS_KEY, []);
}

export function isFranchiseDeleted(teamId?: string | null) {
  if (!teamId) return false;
  return getDeletedFranchiseIds().includes(teamId);
}

function addDeletedFranchiseId(teamId: string) {
  const current = getDeletedFranchiseIds();
  const next = Array.from(new Set([...current, teamId]));
  writeJson(DELETED_FRANCHISE_IDS_KEY, next);
}

function removeTeamFromStorageKey(key: string, teamId: string) {
  const teams = readJson<StoredTeamLike[]>(key, []);

  if (!Array.isArray(teams)) return;

  const next = teams.filter((team) => team.id !== teamId);
  writeJson(key, next);
}

function removeGamesWithTeam(teamId: string) {
  const games = readJson<any[]>(CREATED_GAMES_KEY, []);

  if (!Array.isArray(games)) return;

  const next = games.filter(
    (game) => game?.homeTeamId !== teamId && game?.awayTeamId !== teamId
  );

  writeJson(CREATED_GAMES_KEY, next);
}

function removeTeamRecordFromObjectStorage(key: string, teamId: string) {
  const data = readJson<Record<string, unknown>>(key, {});

  if (!data || typeof data !== "object") return;

  const next = { ...data };
  delete next[teamId];

  writeJson(key, next);
}

export function deleteFranchiseEverywhere(teamId: string) {
  if (typeof window === "undefined" || !teamId) return;

  addDeletedFranchiseId(teamId);

  FRANCHISE_STORAGE_KEYS.forEach((key) => {
    removeTeamFromStorageKey(key, teamId);
  });

  removeGamesWithTeam(teamId);

  removeTeamRecordFromObjectStorage(OLD_FRANCHISE_GAME_PLANS_KEY, teamId);
  removeTeamRecordFromObjectStorage(TEAM_GAME_PLANS_V2_KEY, teamId);
  removeTeamRecordFromObjectStorage(TEAM_DEPTH_CHARTS_V2_KEY, teamId);

  const remainingTeams = FRANCHISE_STORAGE_KEYS.flatMap((key) =>
    readJson<StoredTeamLike[]>(key, [])
  ).filter((team) => team.id !== teamId);

  const currentPrimary = window.localStorage.getItem(PRIMARY_FRANCHISE_KEY);

  if (currentPrimary === teamId) {
    const nextPrimary = remainingTeams[0]?.id;

    if (nextPrimary) {
      window.localStorage.setItem(PRIMARY_FRANCHISE_KEY, nextPrimary);
    } else {
      window.localStorage.removeItem(PRIMARY_FRANCHISE_KEY);
    }
  }

  window.dispatchEvent(new Event("gmdl-storage-change"));
}

export function clearDeletedFranchiseMemory() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(DELETED_FRANCHISE_IDS_KEY);
  window.dispatchEvent(new Event("gmdl-storage-change"));
}