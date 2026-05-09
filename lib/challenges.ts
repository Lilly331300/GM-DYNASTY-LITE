import { Challenge, Match, Team } from "@/lib/types";
import { getTeamById, mockChallenges, mockTeams, mockUser } from "@/lib/mockData";

export type ChallengeFilter = "all" | "free" | "paid" | "ai" | "pvp" | "my";

export interface ChallengeView {
  challenge: Challenge;
  creatorTeam: Team;
  opponentTeam?: Team;
  ownerName: string;
  isMine: boolean;
  isLocked: boolean;
  lockReason?: string;
}

export interface GameInProgressView {
  id: string;
  challengeId: string;
  homeTeam: Team;
  awayTeam: Team;
  homeOwner: string;
  awayOwner: string;
  homeScore: number;
  awayScore: number;
  quarter: number;
  timeRemaining: string;
  status: "listed" | "pregame" | "live" | "halftime";
  matchType: "Free" | "Paid" | "AI";
  stake: number;
  predictionsEnabled: boolean;
  spectators: number;
  createdAt: string;
}

export const mockOwnerNames: Record<string, string> = {
  user_001: "Coach Goated",
  user_002: "Drock Coach",
  user_003: "Sainted GM",
  user_004: "Gridiron Guru",
  user_005: "North Star",
  user_006: "Steel Hammer",
  user_007: "Blitz General",
  user_008: "Chief Kingdom",
};

export const platformRules = [
  "One team can only be listed once at a time.",
  "One team cannot be in two active matches.",
  "A user may own multiple franchises.",
  "PvP matches begin after both teams are ready or after the lobby countdown ends.",
  "Paid match winners receive the pool after the 5% platform fee.",
];

export function getOwnerName(userId: string) {
  return mockOwnerNames[userId] ?? "Unknown Owner";
}

export function getActiveChallenges() {
  return mockChallenges.filter((challenge) =>
    ["pending", "accepted", "live"].includes(challenge.status)
  );
}

export function isTeamInActiveChallenge(teamId: string, ignoredChallengeId?: string) {
  return getActiveChallenges().some((challenge) => {
    if (ignoredChallengeId && challenge.id === ignoredChallengeId) return false;

    return (
      challenge.creatorTeamId === teamId ||
      challenge.opponentTeamId === teamId
    );
  });
}

export function getTeamLockReason(teamId: string) {
  const active = getActiveChallenges().find(
    (challenge) =>
      challenge.creatorTeamId === teamId ||
      challenge.opponentTeamId === teamId
  );

  if (!active) return undefined;

  if (active.status === "live") return "This team is already in a live game.";
  if (active.status === "accepted") return "This team is already in a pregame lobby.";
  return "This team is already listed in the Challenge Hub.";
}

export function getEligibleTeamsForChallenge(userId = mockUser.id) {
  return mockTeams.map((team) => ({
    team,
    isOwnedByUser: team.ownerId === userId,
    isLocked: isTeamInActiveChallenge(team.id),
    lockReason: getTeamLockReason(team.id),
  }));
}

export function getChallengeViews(): ChallengeView[] {
  return mockChallenges
    .map((challenge) => {
      const creatorTeam = getTeamById(challenge.creatorTeamId);
      if (!creatorTeam) return null;

      const opponentTeam = challenge.opponentTeamId
        ? getTeamById(challenge.opponentTeamId)
        : undefined;

      const isMine = challenge.creatorId === mockUser.id;
      const isLocked =
        isTeamInActiveChallenge(challenge.creatorTeamId, challenge.id) ||
        Boolean(challenge.opponentTeamId && isTeamInActiveChallenge(challenge.opponentTeamId, challenge.id));

      return {
        challenge,
        creatorTeam,
        opponentTeam,
        ownerName: getOwnerName(challenge.creatorId),
        isMine,
        isLocked,
        lockReason: isLocked ? "One of these teams is already committed." : undefined,
      };
    })
    .filter(Boolean) as ChallengeView[];
}

export function filterChallengeViews(
  views: ChallengeView[],
  filter: ChallengeFilter,
  searchTerm = ""
) {
  const search = searchTerm.trim().toLowerCase();

  return views.filter((view) => {
    const challenge = view.challenge;
    const team = view.creatorTeam;

    const matchesFilter =
      filter === "all" ||
      (filter === "free" && challenge.type === "free") ||
      (filter === "paid" && challenge.type === "paid") ||
      (filter === "ai" && challenge.isAiMatch) ||
      (filter === "pvp" && !challenge.isAiMatch) ||
      (filter === "my" && view.isMine);

    const matchesSearch =
      !search ||
      team.name.toLowerCase().includes(search) ||
      team.city.toLowerCase().includes(search) ||
      team.nickname.toLowerCase().includes(search) ||
      view.ownerName.toLowerCase().includes(search) ||
      team.abbreviation.toLowerCase().includes(search);

    return matchesFilter && matchesSearch;
  });
}

export function createMockInviteLink(challengeId: string) {
  if (typeof window === "undefined") {
    return `/pregame?challenge=${challengeId}`;
  }

  return `${window.location.origin}/pregame?challenge=${challengeId}`;
}

export function getChallengeStatusMeta(status: Challenge["status"]) {
  if (status === "live") {
    return {
      label: "LIVE",
      badgeVariant: "danger" as const,
      ringClass: "border-danger/40 shadow-danger/10",
      pulse: true,
    };
  }

  if (status === "accepted") {
    return {
      label: "PREGAME",
      badgeVariant: "info" as const,
      ringClass: "border-electric/40 shadow-electric/10",
      pulse: false,
    };
  }

  if (status === "pending") {
    return {
      label: "OPEN",
      badgeVariant: "warning" as const,
      ringClass: "border-gold/30 shadow-gold/10",
      pulse: false,
    };
  }

  if (status === "completed") {
    return {
      label: "FINAL",
      badgeVariant: "success" as const,
      ringClass: "border-success/30 shadow-success/10",
      pulse: false,
    };
  }

  return {
    label: status.toUpperCase(),
    badgeVariant: "outline" as const,
    ringClass: "border-navy-border",
    pulse: false,
  };
}

export function getMockGamesInProgress(): GameInProgressView[] {
  const team1 = getTeamById("team_001") ?? mockTeams[0];
  const team2 = getTeamById("team_002") ?? mockTeams[1];
  const team3 = getTeamById("team_003") ?? mockTeams[2];
  const team4 = getTeamById("team_004") ?? mockTeams[3];
  const team5 = getTeamById("team_005") ?? mockTeams[4];
  const team6 = getTeamById("team_006") ?? mockTeams[0];
  const team7 = getTeamById("team_007") ?? mockTeams[1];
  const team8 = getTeamById("team_008") ?? mockTeams[2];

  return [
    {
      id: "game_live_001",
      challengeId: "challenge_001",
      homeTeam: team1,
      awayTeam: team2,
      homeOwner: getOwnerName(team1.ownerId),
      awayOwner: getOwnerName(team2.ownerId),
      homeScore: 17,
      awayScore: 13,
      quarter: 3,
      timeRemaining: "2:41",
      status: "live",
      matchType: "Paid",
      stake: 50,
      predictionsEnabled: true,
      spectators: 247,
      createdAt: "2026-05-05T18:40:00Z",
    },
    {
      id: "game_live_002",
      challengeId: "challenge_002",
      homeTeam: team3,
      awayTeam: team4,
      homeOwner: getOwnerName(team3.ownerId),
      awayOwner: getOwnerName(team4.ownerId),
      homeScore: 7,
      awayScore: 10,
      quarter: 2,
      timeRemaining: "1:18",
      status: "live",
      matchType: "Free",
      stake: 0,
      predictionsEnabled: false,
      spectators: 91,
      createdAt: "2026-05-05T18:48:00Z",
    },
    {
      id: "game_pregame_001",
      challengeId: "challenge_003",
      homeTeam: team5,
      awayTeam: team6,
      homeOwner: getOwnerName(team5.ownerId),
      awayOwner: "AI Elite Coach",
      homeScore: 0,
      awayScore: 0,
      quarter: 0,
      timeRemaining: "4:22",
      status: "pregame",
      matchType: "AI",
      stake: 25,
      predictionsEnabled: true,
      spectators: 32,
      createdAt: "2026-05-05T18:52:00Z",
    },
    {
      id: "game_listed_001",
      challengeId: "challenge_004",
      homeTeam: team7,
      awayTeam: team8,
      homeOwner: getOwnerName(team7.ownerId),
      awayOwner: "Awaiting Opponent",
      homeScore: 0,
      awayScore: 0,
      quarter: 0,
      timeRemaining: "Open",
      status: "listed",
      matchType: "Paid",
      stake: 100,
      predictionsEnabled: true,
      spectators: 14,
      createdAt: "2026-05-05T18:55:00Z",
    },
  ];
}

export function getLiveGameCountLabel() {
  const count = getMockGamesInProgress().filter((game) => game.status === "live").length;
  return count > 9 ? "9+" : String(count);
}

export function getListedGameCountLabel() {
  const count = getMockGamesInProgress().filter((game) => game.status === "listed").length;
  return count > 9 ? "9+" : String(count);
}

export function createPreviewChallenge(input: {
  teamId: string;
  type: "free" | "paid";
  opponentType: "public" | "invite" | "ai";
  stake: number;
  predictionsEnabled: boolean;
  simulationMode: "live" | "instant";
}) {
  const team = getTeamById(input.teamId) ?? mockTeams[0];

  return {
    id: "preview_challenge",
    creatorId: mockUser.id,
    creatorTeamId: team.id,
    type: input.opponentType === "ai" ? "ai" : input.type,
    stake: input.type === "free" ? 0 : input.stake,
    status: "pending",
    predictionsEnabled: input.predictionsEnabled,
    predictionCount: input.predictionsEnabled ? 0 : 0,
    maxPredictions: input.predictionsEnabled ? 250 : 0,
    createdAt: new Date().toISOString(),
    isAiMatch: input.opponentType === "ai",
    aiDifficulty: input.opponentType === "ai" ? "medium" : undefined,
  } satisfies Challenge;
}