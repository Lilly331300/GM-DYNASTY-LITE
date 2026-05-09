"use client";

import { mockTeams } from "@/lib/mockData";

const COMPLETED_GAMES_KEY = "gmdl_completed_games_v2";

export type CompletedGameType = "free" | "paid" | "ai" | "pvp";

export type CompletedGameTeam = {
  id: string;
  name: string;
  city: string;
  nickname: string;
  abbreviation: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  overallRating: number;
  offensiveRating?: number;
  defensiveRating?: number;
};

export type CompletedGamePlayer = {
  id: string;
  name: string;
  position: string;
  teamId: string;
  number?: number;
  overallRating: number;
  passingYards?: number;
  rushingYards?: number;
  receivingYards?: number;
  tackles?: number;
  sacks?: number;
  interceptions?: number;
  touchdowns?: number;
};

export type CompletedGameStats = {
  totalYards: number;
  passingYards: number;
  rushingYards: number;
  firstDowns: number;
  thirdDownAttempts: number;
  thirdDownConversions: number;
  fourthDownAttempts: number;
  fourthDownConversions: number;
  redZoneAttempts: number;
  redZoneScores: number;
  turnovers: number;
  sacksMade: number;
  penalties: number;
  penaltyYards: number;
  timeOfPossession: string;
};

export type CompletedGameKeyPlay = {
  id: string;
  quarter: number;
  time: string;
  teamId: string;
  label: string;
  description: string;
  yards: number;
  impact: "touchdown" | "turnover" | "sack" | "penalty" | "big-play" | "score";
};

export type CompletedGame = {
  id: string;
  sourceGameId?: string | null;
  date: string;
  homeTeam: CompletedGameTeam;
  awayTeam: CompletedGameTeam;
  homeScore: number;
  awayScore: number;
  winnerTeamId?: string | null;
  matchType: CompletedGameType;
  stake: number;
  platformFee: number;
  reward: number;
  crownsWon: number;
  wasSkipped: boolean;
  mvp: CompletedGamePlayer;
  homeStats: CompletedGameStats;
  awayStats: CompletedGameStats;
  keyPlays: CompletedGameKeyPlay[];
  playerStats: CompletedGamePlayer[];
  totalPlays: number;
};

type SaveCompletedGameInput = {
  sourceGameId?: string | null;
  homeTeam: any;
  awayTeam: any;
  homePlayers: any[];
  awayPlayers: any[];
  state: any;
  matchType: "pvp" | "ai" | "paid" | "free";
  stake: number;
  wasSkipped?: boolean;
};

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
    console.log("Unable to save completed games.");
  }
}

function normalizeTeam(team: any, fallbackIndex = 0): CompletedGameTeam {
  const fallback = mockTeams[fallbackIndex] ?? mockTeams[0];

  return {
    id: String(team?.id ?? fallback?.id ?? `team_${fallbackIndex}`),
    name: String(team?.name ?? fallback?.name ?? "Unknown Team"),
    city: String(team?.city ?? fallback?.city ?? "Unknown"),
    nickname: String(team?.nickname ?? fallback?.nickname ?? "Franchise"),
    abbreviation: String(team?.abbreviation ?? fallback?.abbreviation ?? "GM"),
    primaryColor: String(team?.primaryColor ?? fallback?.primaryColor ?? "#1E3A5F"),
    secondaryColor: String(
      team?.secondaryColor ?? fallback?.secondaryColor ?? "#27466D"
    ),
    logoUrl: team?.logoUrl,
    overallRating: Number(team?.overallRating ?? fallback?.overallRating ?? 60),
    offensiveRating: Number(
      team?.offensiveRating ?? fallback?.offensiveRating ?? 60
    ),
    defensiveRating: Number(
      team?.defensiveRating ?? fallback?.defensiveRating ?? 60
    ),
  };
}

function getPlayerName(player: any, index = 0) {
  const fullName =
    player?.name ??
    `${player?.firstName ?? ""} ${player?.lastName ?? ""}`.trim();

  return fullName || `Player ${index + 1}`;
}

function getPlayerOverall(player: any) {
  return Number(player?.overallRating ?? player?.overall ?? 60);
}

function getPlayerPosition(player: any) {
  return String(player?.position ?? "ATH");
}

function normalizePlayer(
  player: any,
  teamId: string,
  index: number
): CompletedGamePlayer {
  return {
    id: String(player?.id ?? `${teamId}_player_${index}`),
    name: getPlayerName(player, index),
    position: getPlayerPosition(player),
    teamId,
    number: Number(player?.number ?? index + 1),
    overallRating: getPlayerOverall(player),
  };
}

function formatClockSeconds(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function normalizeStats(stats: any, points = 0): CompletedGameStats {
  const totalYards = Number(stats?.totalYards ?? 260 + points * 5);
  const passingYards = Number(stats?.passingYards ?? Math.round(totalYards * 0.6));
  const rushingYards = Number(stats?.rushingYards ?? totalYards - passingYards);
  const firstDowns = Number(stats?.firstDowns ?? Math.max(12, Math.round(totalYards / 18)));
  const turnovers = Number(stats?.turnovers ?? 0);
  const penalties = Number(stats?.penalties ?? Math.max(2, Math.floor(points / 10)));
  const penaltyYards = Number(stats?.penaltyYards ?? penalties * 8);

  return {
    totalYards,
    passingYards,
    rushingYards,
    firstDowns,
    thirdDownAttempts: Number(stats?.thirdDownAttempts ?? 11),
    thirdDownConversions: Number(stats?.thirdDownConversions ?? 4),
    fourthDownAttempts: Number(stats?.fourthDownAttempts ?? 1),
    fourthDownConversions: Number(stats?.fourthDownConversions ?? 0),
    redZoneAttempts: Number(stats?.redZoneAttempts ?? 2 + Math.floor(points / 14)),
    redZoneScores: Number(stats?.redZoneScores ?? Math.max(1, Math.floor(points / 10))),
    turnovers,
    sacksMade: Number(stats?.sacksMade ?? 2),
    penalties,
    penaltyYards,
    timeOfPossession: String(
      stats?.timeOfPossession ?? formatClockSeconds(28 * 60 + Math.floor(points * 8))
    ),
  };
}

function getPlayImpact(play: any): CompletedGameKeyPlay["impact"] {
  const text = `${play?.type ?? ""} ${play?.commentary ?? ""}`.toLowerCase();

  if (text.includes("touchdown")) return "touchdown";
  if (text.includes("fumble") || text.includes("interception") || text.includes("turnover")) {
    return "turnover";
  }
  if (text.includes("sack")) return "sack";
  if (text.includes("penalty")) return "penalty";
  if (text.includes("field goal") || text.includes("score")) return "score";
  return "big-play";
}

function getPlayLabel(play: any) {
  const impact = getPlayImpact(play);

  if (impact === "touchdown") return "Touchdown";
  if (impact === "turnover") return "Turnover";
  if (impact === "sack") return "Sack";
  if (impact === "penalty") return "Penalty";
  if (impact === "score") return "Scoring Play";
  return "Big Play";
}

function buildKeyPlays(state: any): CompletedGameKeyPlay[] {
  const plays = Array.isArray(state?.plays) ? state.plays : [];

  const importantPlays = plays
    .filter((play: any) => {
      const impact = getPlayImpact(play);
      const yards = Math.abs(Number(play?.yards ?? play?.yardsGained ?? 0));

      return impact !== "big-play" || yards >= 18;
    })
    .slice(-8)
    .reverse();

  return importantPlays.map((play: any, index: number) => ({
    id: String(play?.id ?? `key_play_${index}`),
    quarter: Number(play?.quarter ?? state?.quarter ?? 4),
    time: String(play?.time ?? "0:00"),
    teamId: String(play?.teamId ?? play?.offenseTeamId ?? ""),
    label: getPlayLabel(play),
    description: String(play?.commentary ?? play?.description ?? "Important play"),
    yards: Number(play?.yards ?? play?.yardsGained ?? 0),
    impact: getPlayImpact(play),
  }));
}

function buildPlayerStats(
  homePlayers: any[],
  awayPlayers: any[],
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number
): CompletedGamePlayer[] {
  const allPlayers = [
    ...homePlayers.slice(0, 12).map((player, index) =>
      normalizePlayer(player, homeTeamId, index)
    ),
    ...awayPlayers.slice(0, 12).map((player, index) =>
      normalizePlayer(player, awayTeamId, index)
    ),
  ];

  return allPlayers.map((player, index) => {
    const isHome = player.teamId === homeTeamId;
    const teamScore = isHome ? homeScore : awayScore;
    const ratingBoost = Math.max(0, player.overallRating - 55);
    const position = player.position.toUpperCase();

    const baseTouchdowns =
      teamScore >= 28 ? 2 : teamScore >= 17 ? 1 : teamScore >= 10 ? 1 : 0;

    if (position === "QB") {
      return {
        ...player,
        passingYards: 170 + ratingBoost * 3 + teamScore * 4,
        rushingYards: Math.max(0, Math.round(ratingBoost / 2)),
        touchdowns: baseTouchdowns,
      };
    }

    if (["RB", "FB"].includes(position)) {
      return {
        ...player,
        rushingYards: 45 + ratingBoost * 2 + Math.round(teamScore * 1.4),
        receivingYards: 8 + Math.round(ratingBoost / 2),
        touchdowns: teamScore >= 21 ? 1 : 0,
      };
    }

    if (["WR", "TE", "SLOT"].includes(position)) {
      return {
        ...player,
        receivingYards: 35 + ratingBoost * 2 + Math.round(teamScore * 1.8),
        touchdowns: teamScore >= 24 && index % 3 === 0 ? 1 : 0,
      };
    }

    if (["DE", "EDGE", "DT", "LB", "MLB", "LOLB", "ROLB", "CB", "FS", "SS"].includes(position)) {
      return {
        ...player,
        tackles: 3 + Math.floor(ratingBoost / 6),
        sacks: ["DE", "EDGE", "DT", "LB", "MLB", "LOLB", "ROLB"].includes(position)
          ? Math.max(0, Math.floor(ratingBoost / 14))
          : 0,
        interceptions: ["CB", "FS", "SS"].includes(position) && ratingBoost > 18 ? 1 : 0,
      };
    }

    return {
      ...player,
      tackles: Math.max(0, Math.floor(ratingBoost / 8)),
    };
  });
}

function chooseMvp(
  playerStats: CompletedGamePlayer[],
  winnerTeamId: string | null,
  homeTeamId: string,
  awayTeamId: string
): CompletedGamePlayer {
  const candidates = playerStats.filter((player) =>
    winnerTeamId ? player.teamId === winnerTeamId : true
  );

  const scored = candidates.map((player) => {
    const score =
      player.overallRating +
      (player.passingYards ?? 0) * 0.05 +
      (player.rushingYards ?? 0) * 0.08 +
      (player.receivingYards ?? 0) * 0.08 +
      (player.touchdowns ?? 0) * 18 +
      (player.tackles ?? 0) * 2 +
      (player.sacks ?? 0) * 12 +
      (player.interceptions ?? 0) * 15;

    return { player, score };
  });

  const best = scored.sort((a, b) => b.score - a.score)[0]?.player;

  return (
    best ??
    playerStats[0] ?? {
      id: `${homeTeamId}_mvp`,
      name: "Game MVP",
      position: "QB",
      teamId: winnerTeamId ?? homeTeamId ?? awayTeamId,
      overallRating: 70,
    }
  );
}

function normalizeMatchType(type: SaveCompletedGameInput["matchType"]): CompletedGameType {
  if (type === "pvp") return "paid";
  return type;
}

function createSeedTeam(index: number): CompletedGameTeam {
  const team = mockTeams[index] ?? mockTeams[0];

  return normalizeTeam(team, index);
}

function createSeedGame(index: number): CompletedGame {
  const homeTeam = createSeedTeam(index % mockTeams.length);
  const awayTeam = createSeedTeam((index + 1) % mockTeams.length);

  const scores = [
    [24, 17],
    [31, 28],
    [14, 10],
    [27, 20],
    [21, 23],
  ];

  const [homeScore, awayScore] = scores[index] ?? [20, 17];
  const winnerTeamId =
    homeScore === awayScore ? null : homeScore > awayScore ? homeTeam.id : awayTeam.id;

  const homeStats = normalizeStats(undefined, homeScore);
  const awayStats = normalizeStats(undefined, awayScore);

  const playerStats = buildPlayerStats(
    [],
    [],
    homeTeam.id,
    awayTeam.id,
    homeScore,
    awayScore
  );

  const fallbackPlayerStats: CompletedGamePlayer[] = [
    {
      id: `${winnerTeamId ?? homeTeam.id}_seed_mvp_${index}`,
      name: ["Marcus Stone", "Jaylen Cross", "Dante Rivers", "Cole Hunter", "Andre King"][index] ?? "Game MVP",
      position: ["QB", "RB", "WR", "LB", "QB"][index] ?? "QB",
      teamId: winnerTeamId ?? homeTeam.id,
      overallRating: 78 + index,
      passingYards: index % 2 === 0 ? 245 : undefined,
      rushingYards: index % 2 === 1 ? 92 : undefined,
      touchdowns: 2,
    },
  ];

  const mvp = playerStats.length
    ? chooseMvp(playerStats, winnerTeamId, homeTeam.id, awayTeam.id)
    : fallbackPlayerStats[0];

  return {
    id: `seed_completed_game_${index + 1}`,
    sourceGameId: null,
    date: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    winnerTeamId,
    matchType: index % 3 === 0 ? "paid" : index % 3 === 1 ? "ai" : "free",
    stake: index % 3 === 0 ? 50 : 0,
    platformFee: index % 3 === 0 ? 5 : 0,
    reward: index % 3 === 0 ? 95 : 0,
    crownsWon: index % 3 === 0 ? 95 : 0,
    wasSkipped: false,
    mvp,
    homeStats,
    awayStats,
    keyPlays: [
      {
        id: `seed_key_${index}_1`,
        quarter: 4,
        time: "2:18",
        teamId: winnerTeamId ?? homeTeam.id,
        label: "Game-Sealing Drive",
        description: "A late explosive play helped decide the matchup.",
        yards: 34,
        impact: "big-play",
      },
      {
        id: `seed_key_${index}_2`,
        quarter: 2,
        time: "6:44",
        teamId: homeTeam.id,
        label: "Touchdown",
        description: "Red zone execution created a key touchdown.",
        yards: 12,
        impact: "touchdown",
      },
    ],
    playerStats: fallbackPlayerStats,
    totalPlays: 118 + index * 4,
  };
}

export function getSeedCompletedGames(): CompletedGame[] {
  return [0, 1, 2, 3, 4].map(createSeedGame);
}

export function getCompletedGames(): CompletedGame[] {
  const stored = safeRead<CompletedGame[]>(COMPLETED_GAMES_KEY, []);
  const seeded = getSeedCompletedGames();

  const merged = [...stored, ...seeded];
  const seen = new Set<string>();

  return merged
    .filter((game) => {
      if (seen.has(game.id)) return false;
      seen.add(game.id);
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRecentDashboardGames(limit = 5): CompletedGame[] {
  return getCompletedGames().slice(0, limit);
}

export function getCompletedGameById(gameId?: string | null): CompletedGame | undefined {
  const games = getCompletedGames();

  if (!gameId) return games[0];

  return (
    games.find((game) => game.id === gameId) ??
    games.find((game) => game.sourceGameId === gameId) ??
    games[0]
  );
}

export function saveCompletedGame(input: SaveCompletedGameInput): CompletedGame {
  const existingGames = safeRead<CompletedGame[]>(COMPLETED_GAMES_KEY, []);

  const existingBySource = input.sourceGameId
    ? existingGames.find((game) => game.sourceGameId === input.sourceGameId)
    : undefined;

  if (existingBySource) {
    return existingBySource;
  }

  const homeTeam = normalizeTeam(input.homeTeam, 0);
  const awayTeam = normalizeTeam(input.awayTeam, 1);

  const homeScore = Number(input.state?.homeScore ?? 0);
  const awayScore = Number(input.state?.awayScore ?? 0);

  const winnerTeamId =
    homeScore === awayScore ? null : homeScore > awayScore ? homeTeam.id : awayTeam.id;

  const homeStats = normalizeStats(input.state?.homeStats, homeScore);
  const awayStats = normalizeStats(input.state?.awayStats, awayScore);

  const playerStats = buildPlayerStats(
    input.homePlayers ?? [],
    input.awayPlayers ?? [],
    homeTeam.id,
    awayTeam.id,
    homeScore,
    awayScore
  );

  const mvp = chooseMvp(playerStats, winnerTeamId, homeTeam.id, awayTeam.id);

  const normalizedMatchType = normalizeMatchType(input.matchType);
  const stake = Number(input.stake ?? 0);
  const isPaid = normalizedMatchType === "paid" && stake > 0;
  const totalPot = isPaid ? stake * 2 : 0;
  const platformFee = isPaid ? Math.round(totalPot * 0.05) : 0;
  const reward = isPaid ? totalPot - platformFee : 0;

  const completedGame: CompletedGame = {
    id: `completed_${input.sourceGameId ?? Date.now()}`,
    sourceGameId: input.sourceGameId ?? null,
    date: new Date().toISOString(),
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    winnerTeamId,
    matchType: normalizedMatchType,
    stake,
    platformFee,
    reward,
    crownsWon: reward,
    wasSkipped: Boolean(input.wasSkipped),
    mvp,
    homeStats,
    awayStats,
    keyPlays: buildKeyPlays(input.state),
    playerStats,
    totalPlays: Array.isArray(input.state?.plays) ? input.state.plays.length : 0,
  };

  safeWrite(COMPLETED_GAMES_KEY, [
    completedGame,
    ...existingGames.filter((game) => game.id !== completedGame.id),
  ]);

  return completedGame;
}

export function clearCompletedGames() {
  safeWrite(COMPLETED_GAMES_KEY, []);
}