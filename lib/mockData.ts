import { User, Team, Player, GamePlan, Challenge, Match, Wallet, Notification, Standing, UserSettings } from "./types";
import { generateId } from "./utils";

// ============================================
// MOCK DATA FOR GM DYNASTY LITE
// ============================================

export const mockUser: User = {
  id: "user_001",
  username: "coachgoated",
  email: "coach@example.com",
  displayName: "Coach Goated",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  createdAt: "2024-01-15T00:00:00Z",
  lastLogin: "2024-05-03T00:00:00Z",
  walletBalance: 12450,
  totalEarnings: 45600,
  isPremium: true,
};

export const mockTeams: Team[] = [
  {
    id: "team_001",
    ownerId: "user_001",
    name: "Your Mom",
    city: "Memphis",
    nickname: "Your Mom",
    abbreviation: "MEM",
    primaryColor: "#7A1E2C",
    secondaryColor: "#F5C542",
    overallRating: 51,
    offensiveRating: 48,
    defensiveRating: 53,
    specialTeamsRating: 55,
    record: { wins: 12, losses: 4, ties: 0 },
    prestige: 1120,
    fanBase: 45780,
    leagueRank: 7,
    division: "AFC South",
    conference: "AFC",
    nflSync: { enabled: true, nflTeam: "Philadelphia Eagles", lastSync: "2024-05-01T00:00:00Z" },
    createdAt: "2024-01-15T00:00:00Z",
    isActive: true,
  },
  {
    id: "team_002",
    ownerId: "user_002",
    name: "Sea Rats",
    city: "Seattle",
    nickname: "Sea Rats",
    abbreviation: "SEA",
    primaryColor: "#002244",
    secondaryColor: "#69BE28",
    overallRating: 56,
    offensiveRating: 54,
    defensiveRating: 58,
    specialTeamsRating: 52,
    record: { wins: 9, losses: 7, ties: 0 },
    prestige: 980,
    fanBase: 32100,
    leagueRank: 12,
    division: "NFC North",
    conference: "NFC",
    nflSync: { enabled: false },
    createdAt: "2024-02-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "team_003",
    ownerId: "user_003",
    name: "Dastardly Devils",
    city: "New Orleans",
    nickname: "Dastardly Devils",
    abbreviation: "NO",
    primaryColor: "#D3BC8D",
    secondaryColor: "#101820",
    overallRating: 63,
    offensiveRating: 65,
    defensiveRating: 61,
    specialTeamsRating: 60,
    record: { wins: 10, losses: 6, ties: 0 },
    prestige: 1340,
    fanBase: 28900,
    leagueRank: 5,
    division: "NFC South",
    conference: "NFC",
    nflSync: { enabled: true, nflTeam: "New Orleans Saints", lastSync: "2024-05-02T00:00:00Z" },
    createdAt: "2024-01-20T00:00:00Z",
    isActive: true,
  },
  {
    id: "team_004",
    ownerId: "user_004",
    name: "Gridiron Gurus",
    city: "Green Bay",
    nickname: "Gridiron Gurus",
    abbreviation: "GB",
    primaryColor: "#203731",
    secondaryColor: "#FFB612",
    overallRating: 68,
    offensiveRating: 70,
    defensiveRating: 66,
    specialTeamsRating: 65,
    record: { wins: 11, losses: 5, ties: 0 },
    prestige: 1560,
    fanBase: 52300,
    leagueRank: 3,
    division: "NFC North",
    conference: "NFC",
    nflSync: { enabled: false },
    createdAt: "2024-01-10T00:00:00Z",
    isActive: true,
  },
  {
    id: "team_005",
    ownerId: "user_005",
    name: "Lone Wolves",
    city: "Minneapolis",
    nickname: "Lone Wolves",
    abbreviation: "MIN",
    primaryColor: "#4F2683",
    secondaryColor: "#FFC62F",
    overallRating: 59,
    offensiveRating: 57,
    defensiveRating: 61,
    specialTeamsRating: 58,
    record: { wins: 8, losses: 8, ties: 0 },
    prestige: 890,
    fanBase: 24500,
    leagueRank: 15,
    division: "NFC North",
    conference: "NFC",
    nflSync: { enabled: true, nflTeam: "Minnesota Vikings", lastSync: "2024-04-28T00:00:00Z" },
    createdAt: "2024-02-15T00:00:00Z",
    isActive: true,
  },
];

export const mockPlayers: Player[] = [
  // QB
  {
    id: "player_001", teamId: "team_001", firstName: "Jalen", lastName: "Maddox", number: 11, position: "QB", age: 25,
    height: "6'3\"", weight: 220, overallRating: 89, experience: 3, college: "Alabama",
    speed: 78, strength: 72, agility: 82, explosiveness: 80,
    passing: 92, running: 75, blocking: 40, rushDefense: 30, coverage: 25, tackling: 35, runDefense: 30, kicking: 20, punting: 20,
    consistency: 85, intelligence: 88, durability: 82, workEthic: 90, desire: 87, intangibles: 86,
    status: "Healthy", specialSkill: "Clutch", isStarter: true, depthPosition: 1,
  },
  // RB
  {
    id: "player_002", teamId: "team_001", firstName: "Derrick", lastName: "King", number: 23, position: "RB", age: 24,
    height: "5'11\"", weight: 215, overallRating: 86, experience: 2, college: "Georgia",
    speed: 91, strength: 85, agility: 88, explosiveness: 90,
    passing: 45, running: 92, receiving: 72, blocking: 65, rushDefense: 40, coverage: 35, tackling: 45, runDefense: 40, kicking: 20, punting: 20,
    consistency: 82, intelligence: 78, durability: 80, workEthic: 88, desire: 90, intangibles: 85,
    status: "Healthy", specialSkill: "Workhorse", isStarter: true, depthPosition: 1,
  },
  // WR1
  {
    id: "player_003", teamId: "team_001", firstName: "Marquez", lastName: "Collins", number: 7, position: "WR", age: 26,
    height: "6'1\"", weight: 195, overallRating: 84, experience: 4, college: "Ohio State",
    speed: 93, strength: 74, agility: 89, explosiveness: 91,
    passing: 30, running: 55, receiving: 91, blocking: 45, rushDefense: 25, coverage: 30, tackling: 35, runDefense: 25, kicking: 20, punting: 20,
    consistency: 80, intelligence: 82, durability: 78, workEthic: 85, desire: 88, intangibles: 84,
    status: "Healthy", specialSkill: "Playmaker", isStarter: true, depthPosition: 1,
  },
  // WR2
  {
    id: "player_004", teamId: "team_001", firstName: "Rashard", lastName: "Moore", number: 14, position: "WR", age: 25,
    height: "6'0\"", weight: 188, overallRating: 76, experience: 3, college: "Clemson",
    speed: 89, strength: 70, agility: 85, explosiveness: 86,
    passing: 25, running: 50, receiving: 82, blocking: 40, rushDefense: 25, coverage: 28, tackling: 32, runDefense: 25, kicking: 20, punting: 20,
    consistency: 75, intelligence: 78, durability: 80, workEthic: 82, desire: 80, intangibles: 78,
    status: "Healthy", isStarter: true, depthPosition: 2,
  },
  // WR3
  {
    id: "player_005", teamId: "team_001", firstName: "Jalen", lastName: "Harris", number: 83, position: "WR", age: 23,
    height: "5'10\"", weight: 180, overallRating: 74, experience: 1, college: "Florida",
    speed: 91, strength: 68, agility: 87, explosiveness: 88,
    passing: 22, running: 48, receiving: 78, blocking: 38, rushDefense: 22, coverage: 25, tackling: 30, runDefense: 22, kicking: 20, punting: 20,
    consistency: 72, intelligence: 75, durability: 76, workEthic: 80, desire: 82, intangibles: 76,
    status: "Healthy", isStarter: false, depthPosition: 3,
  },
  // TE
  {
    id: "player_006", teamId: "team_001", firstName: "Tyler", lastName: "Bowers", number: 88, position: "TE", age: 27,
    height: "6'5\"", weight: 250, overallRating: 81, experience: 5, college: "Iowa",
    speed: 76, strength: 85, agility: 78, explosiveness: 80,
    passing: 30, running: 55, receiving: 82, blocking: 78, rushDefense: 45, coverage: 40, tackling: 55, runDefense: 48, kicking: 20, punting: 20,
    consistency: 82, intelligence: 84, durability: 80, workEthic: 86, desire: 83, intangibles: 82,
    status: "Healthy", specialSkill: "Red Zone Threat", isStarter: true, depthPosition: 1,
  },
  // LT
  {
    id: "player_007", teamId: "team_001", firstName: "Ethan", lastName: "Brooks", number: 66, position: "LT", age: 28,
    height: "6'6\"", weight: 315, overallRating: 79, experience: 6, college: "Notre Dame",
    speed: 58, strength: 92, agility: 65, explosiveness: 70,
    passing: 20, running: 40, receiving: 20, blocking: 88, rushDefense: 55, coverage: 30, tackling: 60, runDefense: 58, kicking: 20, punting: 20,
    consistency: 85, intelligence: 82, durability: 84, workEthic: 88, desire: 85, intangibles: 80,
    status: "Healthy", isStarter: true, depthPosition: 1,
  },
  // LG
  {
    id: "player_008", teamId: "team_001", firstName: "Elijah", lastName: "Davis", number: 71, position: "LG", age: 26,
    height: "6'4\"", weight: 305, overallRating: 76, experience: 4, college: "Wisconsin",
    speed: 55, strength: 89, agility: 62, explosiveness: 68,
    passing: 18, running: 38, receiving: 18, blocking: 85, rushDefense: 52, coverage: 28, tackling: 58, runDefense: 55, kicking: 20, punting: 20,
    consistency: 80, intelligence: 78, durability: 82, workEthic: 84, desire: 80, intangibles: 78,
    status: "Healthy", isStarter: true, depthPosition: 1,
  },
  // C
  {
    id: "player_009", teamId: "team_001", firstName: "Noah", lastName: "Wilson", number: 61, position: "C", age: 29,
    height: "6'3\"", weight: 300, overallRating: 79, experience: 7, college: "Michigan",
    speed: 52, strength: 90, agility: 60, explosiveness: 65,
    passing: 22, running: 35, receiving: 20, blocking: 87, rushDefense: 58, coverage: 30, tackling: 62, runDefense: 60, kicking: 20, punting: 20,
    consistency: 88, intelligence: 90, durability: 85, workEthic: 90, desire: 88, intangibles: 86,
    status: "Healthy", isStarter: true, depthPosition: 1,
  },
  // RG
  {
    id: "player_010", teamId: "team_001", firstName: "Aiden", lastName: "Brown", number: 73, position: "RG", age: 25,
    height: "6'5\"", weight: 310, overallRating: 76, experience: 3, college: "Penn State",
    speed: 54, strength: 88, agility: 60, explosiveness: 66,
    passing: 18, running: 36, receiving: 18, blocking: 84, rushDefense: 54, coverage: 28, tackling: 56, runDefense: 54, kicking: 20, punting: 20,
    consistency: 78, intelligence: 76, durability: 80, workEthic: 82, desire: 80, intangibles: 76,
    status: "Healthy", isStarter: true, depthPosition: 1,
  },
  // RT
  {
    id: "player_011", teamId: "team_001", firstName: "Tristan", lastName: "White", number: 77, position: "RT", age: 27,
    height: "6'6\"", weight: 318, overallRating: 78, experience: 5, college: "Texas A&M",
    speed: 56, strength: 90, agility: 62, explosiveness: 68,
    passing: 20, running: 38, receiving: 20, blocking: 86, rushDefense: 56, coverage: 30, tackling: 58, runDefense: 56, kicking: 20, punting: 20,
    consistency: 82, intelligence: 80, durability: 83, workEthic: 85, desire: 82, intangibles: 80,
    status: "Healthy", isStarter: true, depthPosition: 1,
  },
  // Defense - LE
  {
    id: "player_012", teamId: "team_001", firstName: "Cameron", lastName: "Walker", number: 99, position: "LE", age: 26,
    height: "6'4\"", weight: 280, overallRating: 79, experience: 4, college: "LSU",
    speed: 72, strength: 88, agility: 75, explosiveness: 85,
    passing: 20, running: 40, receiving: 20, blocking: 55, rushDefense: 82, coverage: 45, tackling: 78, runDefense: 80, kicking: 20, punting: 20,
    consistency: 80, intelligence: 78, durability: 82, workEthic: 85, desire: 88, intangibles: 82,
    status: "Healthy", specialSkill: "Pass Rusher", isStarter: true, depthPosition: 1,
  },
  // DT
  {
    id: "player_013", teamId: "team_001", firstName: "Jordan", lastName: "Allen", number: 97, position: "DT", age: 28,
    height: "6'3\"", weight: 310, overallRating: 77, experience: 6, college: "Alabama",
    speed: 62, strength: 92, agility: 60, explosiveness: 75,
    passing: 18, running: 35, receiving: 18, blocking: 60, rushDefense: 85, coverage: 35, tackling: 82, runDefense: 88, kicking: 20, punting: 20,
    consistency: 84, intelligence: 80, durability: 85, workEthic: 88, desire: 85, intangibles: 82,
    status: "Healthy", specialSkill: "Run Stuffer", isStarter: true, depthPosition: 1,
  },
  // DT2
  {
    id: "player_014", teamId: "team_001", firstName: "Brandon", lastName: "Hill", number: 95, position: "DT", age: 25,
    height: "6'2\"", weight: 305, overallRating: 76, experience: 3, college: "Florida State",
    speed: 65, strength: 89, agility: 62, explosiveness: 72,
    passing: 18, running: 32, receiving: 18, blocking: 58, rushDefense: 82, coverage: 32, tackling: 80, runDefense: 85, kicking: 20, punting: 20,
    consistency: 78, intelligence: 76, durability: 80, workEthic: 82, desire: 80, intangibles: 78,
    status: "Healthy", isStarter: true, depthPosition: 2,
  },
  // RE
  {
    id: "player_015", teamId: "team_001", firstName: "Kyle", lastName: "Young", number: 91, position: "RE", age: 24,
    height: "6'5\"", weight: 275, overallRating: 78, experience: 2, college: "Ohio State",
    speed: 78, strength: 85, agility: 80, explosiveness: 88,
    passing: 20, running: 38, receiving: 20, blocking: 52, rushDefense: 80, coverage: 48, tackling: 76, runDefense: 78, kicking: 20, punting: 20,
    consistency: 76, intelligence: 78, durability: 80, workEthic: 84, desire: 86, intangibles: 80,
    status: "Healthy", isStarter: true, depthPosition: 1,
  },
  // LOLB
  {
    id: "player_016", teamId: "team_001", firstName: "Darius", lastName: "Carter", number: 55, position: "LOLB", age: 26,
    height: "6'2\"", weight: 245, overallRating: 77, experience: 4, college: "Clemson",
    speed: 82, strength: 82, agility: 84, explosiveness: 85,
    passing: 25, running: 55, receiving: 40, blocking: 58, rushDefense: 78, coverage: 75, tackling: 82, runDefense: 80, kicking: 20, punting: 20,
    consistency: 80, intelligence: 82, durability: 82, workEthic: 85, desire: 84, intangibles: 82,
    status: "Healthy", isStarter: true, depthPosition: 1,
  },
  // MLB
  {
    id: "player_017", teamId: "team_001", firstName: "Samuel", lastName: "Thompson", number: 54, position: "MLB", age: 27,
    height: "6'1\"", weight: 240, overallRating: 82, experience: 5, college: "Notre Dame",
    speed: 78, strength: 86, agility: 80, explosiveness: 82,
    passing: 22, running: 58, receiving: 35, blocking: 60, rushDefense: 85, coverage: 78, tackling: 90, runDefense: 88, kicking: 20, punting: 20,
    consistency: 86, intelligence: 90, durability: 84, workEthic: 90, desire: 88, intangibles: 88,
    status: "Healthy", specialSkill: "Enforcer", isStarter: true, depthPosition: 1,
  },
  // ROLB
  {
    id: "player_018", teamId: "team_001", firstName: "Ryan", lastName: "James", number: 52, position: "ROLB", age: 25,
    height: "6'3\"", weight: 248, overallRating: 76, experience: 3, college: "Georgia",
    speed: 80, strength: 84, agility: 82, explosiveness: 84,
    passing: 22, running: 52, receiving: 38, blocking: 56, rushDefense: 80, coverage: 72, tackling: 80, runDefense: 82, kicking: 20, punting: 20,
    consistency: 78, intelligence: 80, durability: 80, workEthic: 84, desire: 82, intangibles: 80,
    status: "Healthy", isStarter: true, depthPosition: 1,
  },
  // CB1
  {
    id: "player_019", teamId: "team_001", firstName: "Tyrone", lastName: "Baker", number: 21, position: "CB", age: 26,
    height: "6'0\"", weight: 195, overallRating: 79, experience: 4, college: "Florida",
    speed: 93, strength: 72, agility: 91, explosiveness: 90,
    passing: 20, running: 45, receiving: 35, blocking: 40, rushDefense: 55, coverage: 88, tackling: 72, runDefense: 60, kicking: 20, punting: 20,
    consistency: 82, intelligence: 84, durability: 80, workEthic: 86, desire: 88, intangibles: 84,
    status: "Healthy", specialSkill: "Shutdown", isStarter: true, depthPosition: 1,
  },
  // CB2
  {
    id: "player_020", teamId: "team_001", firstName: "Jalen", lastName: "Wilson", number: 24, position: "CB", age: 24,
    height: "5'11\"", weight: 190, overallRating: 78, experience: 2, college: "Alabama",
    speed: 92, strength: 70, agility: 90, explosiveness: 88,
    passing: 18, running: 42, receiving: 32, blocking: 38, rushDefense: 52, coverage: 86, tackling: 70, runDefense: 58, kicking: 20, punting: 20,
    consistency: 78, intelligence: 80, durability: 78, workEthic: 84, desire: 86, intangibles: 80,
    status: "Healthy", isStarter: true, depthPosition: 2,
  },
  // FS
  {
    id: "player_021", teamId: "team_001", firstName: "Marcus", lastName: "Reed", number: 32, position: "FS", age: 25,
    height: "6'1\"", weight: 205, overallRating: 80, experience: 3, college: "Texas",
    speed: 88, strength: 76, agility: 86, explosiveness: 87,
    passing: 20, running: 48, receiving: 38, blocking: 42, rushDefense: 65, coverage: 85, tackling: 78, runDefense: 68, kicking: 20, punting: 20,
    consistency: 82, intelligence: 88, durability: 82, workEthic: 86, desire: 86, intangibles: 86,
    status: "Healthy", specialSkill: "Ball Hawk", isStarter: true, depthPosition: 1,
  },
  // SS
  {
    id: "player_022", teamId: "team_001", firstName: "Adrian", lastName: "Taylor", number: 29, position: "SS", age: 26,
    height: "6'0\"", weight: 210, overallRating: 76, experience: 4, college: "USC",
    speed: 85, strength: 80, agility: 82, explosiveness: 84,
    passing: 18, running: 50, receiving: 35, blocking: 48, rushDefense: 72, coverage: 78, tackling: 82, runDefense: 75, kicking: 20, punting: 20,
    consistency: 80, intelligence: 82, durability: 82, workEthic: 84, desire: 84, intangibles: 82,
    status: "Healthy", isStarter: true, depthPosition: 1,
  },
  // K
  {
    id: "player_023", teamId: "team_001", firstName: "Blake", lastName: "Aubrey", number: 3, position: "K", age: 28,
    height: "6'0\"", weight: 185, overallRating: 76, experience: 6, college: "Florida State",
    speed: 65, strength: 82, agility: 70, explosiveness: 78,
    passing: 20, running: 30, receiving: 20, blocking: 30, rushDefense: 25, coverage: 25, tackling: 30, runDefense: 25, kicking: 88, punting: 45,
    consistency: 85, intelligence: 82, durability: 80, workEthic: 86, desire: 84, intangibles: 82,
    status: "Healthy", isStarter: true, depthPosition: 1,
  },
  // P
  {
    id: "player_024", teamId: "team_001", firstName: "Cameron", lastName: "Johnston", number: 5, position: "P", age: 29,
    height: "6'2\"", weight: 195, overallRating: 73, experience: 7, college: "Ohio State",
    speed: 62, strength: 78, agility: 65, explosiveness: 72,
    passing: 18, running: 28, receiving: 18, blocking: 28, rushDefense: 22, coverage: 25, tackling: 28, runDefense: 22, kicking: 45, punting: 86,
    consistency: 82, intelligence: 80, durability: 82, workEthic: 84, desire: 82, intangibles: 80,
    status: "Healthy", isStarter: true, depthPosition: 1,
  },
];

export const mockGamePlan: GamePlan = {
  teamId: "team_001",
  offense: {
    basePersonnel: "11",
    formationStyle: "Spread",
    runPassTendency: 55,
    firstDownBehavior: 60,
    shortYardageBehavior: 70,
    longYardageBehavior: 80,
    fourthDownAggression: 40,
    shotgunVsUnderCenter: 75,
    interiorVsOutsideRuns: 45,
    tempo: 60,
    playAction: 50,
    screenUsage: 35,
  },
  defense: {
    baseScheme: "4-3",
    blitzFrequency: 30,
    coveragePreference: 65,
    turnoverAggression: 55,
    runPassBias: 50,
    deepCoverageTendency: 60,
    stopRun: 70,
    passRush: 65,
    aggression: 55,
    linebackerBlitz: 35,
    cbSafetyBlitz: 20,
  },
  specialTeams: {
    maxFieldGoalRange: 50,
    kickoffStrategy: 65,
    twoPointConversionAggression: 40,
  },
};

export const mockChallenges: Challenge[] = [
  {
    id: "challenge_001",
    creatorId: "user_001",
    creatorTeamId: "team_001",
    opponentId: "user_002",
    opponentTeamId: "team_002",
    type: "paid",
    stake: 50,
    status: "live",
    predictionsEnabled: true,
    predictionCount: 5,
    maxPredictions: 5,
    createdAt: "2024-05-03T14:00:00Z",
    scheduledFor: "2024-05-03T16:00:00Z",
    isAiMatch: false,
  },
  {
    id: "challenge_002",
    creatorId: "user_003",
    creatorTeamId: "team_003",
    type: "free",
    stake: 0,
    status: "pending",
    predictionsEnabled: true,
    predictionCount: 3,
    maxPredictions: 5,
    createdAt: "2024-05-03T13:00:00Z",
    isAiMatch: false,
  },
  {
    id: "challenge_003",
    creatorId: "user_004",
    creatorTeamId: "team_004",
    opponentId: "user_005",
    opponentTeamId: "team_005",
    type: "paid",
    stake: 100,
    status: "pending",
    predictionsEnabled: true,
    predictionCount: 5,
    maxPredictions: 5,
    createdAt: "2024-05-03T12:00:00Z",
    isAiMatch: false,
  },
  {
    id: "challenge_004",
    creatorId: "user_001",
    creatorTeamId: "team_001",
    type: "ai",
    stake: 0,
    status: "pending",
    predictionsEnabled: false,
    predictionCount: 0,
    maxPredictions: 0,
    createdAt: "2024-05-03T15:00:00Z",
    isAiMatch: true,
    aiDifficulty: "medium",
  },
];

export const mockLiveMatch: Match = {
  id: "match_001",
  challengeId: "challenge_001",
  homeTeamId: "team_001",
  awayTeamId: "team_002",
  homeScore: 21,
  awayScore: 17,
  quarter: 3,
  timeRemaining: "2:14",
  down: 1,
  distance: 10,
  fieldPosition: 28,
  possession: "home",
  status: "live",
  plays: [
    {
      id: "play_001", matchId: "match_001", quarter: 3, time: "2:14", down: 1, distance: 10, fieldPosition: 28,
      possession: "home", playType: "pass", result: "complete", yards: 8, playerName: "J. Miller",
      isTurnover: false, isScore: false, commentary: "Shotgun pass to T. Shaw for 8 yards.",
      homeScore: 21, awayScore: 17,
    },
    {
      id: "play_002", matchId: "match_001", quarter: 3, time: "2:45", down: 2, distance: 2, fieldPosition: 36,
      possession: "home", playType: "run", result: "rush", yards: 3, playerName: "D. King",
      isTurnover: false, isScore: false, commentary: "D. King rush for 3 yards. FIRST DOWN.",
      homeScore: 21, awayScore: 17,
    },
    {
      id: "play_003", matchId: "match_001", quarter: 3, time: "3:21", down: 1, distance: 10, fieldPosition: 43,
      possession: "home", playType: "pass", result: "complete", yards: 7, playerName: "J. Miller",
      isTurnover: false, isScore: false, commentary: "J. Miller pass complete to R. Moore for 7 yards.",
      homeScore: 21, awayScore: 17,
    },
    {
      id: "play_004", matchId: "match_001", quarter: 3, time: "3:47", down: 2, distance: 3, fieldPosition: 50,
      possession: "home", playType: "sack", result: "sack", yards: -6, playerName: "C. Walker",
      isTurnover: false, isScore: false, commentary: "SACK! C. Walker sacks J. Miller for a loss of 6 yards.",
      homeScore: 21, awayScore: 17,
    },
  ],
  homeStats: {
    totalYards: 287, passingYards: 198, rushingYards: 89, firstDowns: 16,
    thirdDownConversions: 5, thirdDownAttempts: 9, fourthDownConversions: 1, fourthDownAttempts: 2,
    redZoneTrips: 3, redZoneScores: 2, turnovers: 1, sacksTaken: 2, sacksMade: 3,
    penalties: 4, penaltyYards: 35, timeOfPossession: "16:45",
  },
  awayStats: {
    totalYards: 245, passingYards: 167, rushingYards: 78, firstDowns: 14,
    thirdDownConversions: 4, thirdDownAttempts: 8, fourthDownConversions: 0, fourthDownAttempts: 1,
    redZoneTrips: 2, redZoneScores: 2, turnovers: 2, sacksTaken: 3, sacksMade: 2,
    penalties: 3, penaltyYards: 25, timeOfPossession: "13:15",
  },
  weather: "72°F, Partly Cloudy",
  attendance: 24517,
  spectators: 247,
  startTime: "2024-05-03T15:00:00Z",
  mvpCrownsPool: 100,
  platformFee: 5,
};

export const mockWallet: Wallet = {
  userId: "user_001",
  balance: 12450,
  pendingRewards: 1250,
  totalEarned: 45600,
  totalDeposited: 20000,
  totalWithdrawn: 15000,
  transactions: [
    { id: "tx_001", userId: "user_001", type: "match_win", amount: 950, status: "completed", description: "Won vs Sea Rats", matchId: "match_001", createdAt: "2024-05-02T18:00:00Z" },
    { id: "tx_002", userId: "user_001", type: "challenge_stake", amount: -50, status: "completed", description: "Stake for vs Sea Rats", challengeId: "challenge_001", createdAt: "2024-05-02T17:30:00Z" },
    { id: "tx_003", userId: "user_001", type: "bonus", amount: 250, status: "completed", description: "NFL Sync Weekly Bonus", createdAt: "2024-05-01T00:00:00Z" },
    { id: "tx_004", userId: "user_001", type: "match_win", amount: 475, status: "completed", description: "Won vs Blitz City", matchId: "match_002", createdAt: "2024-04-28T16:00:00Z" },
    { id: "tx_005", userId: "user_001", type: "deposit", amount: 5000, status: "completed", description: "Initial Deposit", createdAt: "2024-01-15T00:00:00Z" },
  ],
};

export const mockNotifications: Notification[] = [
  { id: "notif_001", userId: "user_001", type: "match", title: "Game Starting Soon", message: "Your game vs Sea Rats is starting in 15 minutes.", read: false, actionUrl: "/pregame", createdAt: "2024-05-03T15:45:00Z" },
  { id: "notif_002", userId: "user_001", type: "reward", title: "Player of the Week", message: "T. Booker earned Player of the Week honors.", read: false, actionUrl: "/roster", createdAt: "2024-05-03T14:00:00Z" },
  { id: "notif_003", userId: "user_001", type: "challenge", title: "New Challenge", message: "New challenge from @GridironGuru", read: false, actionUrl: "/challenge-hub", createdAt: "2024-05-03T13:00:00Z" },
  { id: "notif_004", userId: "user_001", type: "reward", title: "MVP Crowns Earned", message: "You earned 250 MVP Crowns from weekly rewards.", read: true, actionUrl: "/wallet", createdAt: "2024-05-03T10:00:00Z" },
];

export const mockStandings: Standing[] = [
  { teamId: "team_004", rank: 1, wins: 11, losses: 5, ties: 0, winPercentage: 0.688, pointsFor: 342, pointsAgainst: 278, streak: "W3", division: "NFC North", conference: "NFC" },
  { teamId: "team_001", rank: 2, wins: 12, losses: 4, ties: 0, winPercentage: 0.750, pointsFor: 368, pointsAgainst: 289, streak: "W2", division: "AFC South", conference: "AFC" },
  { teamId: "team_003", rank: 3, wins: 10, losses: 6, ties: 0, winPercentage: 0.625, pointsFor: 315, pointsAgainst: 298, streak: "L1", division: "NFC South", conference: "NFC" },
  { teamId: "team_005", rank: 4, wins: 8, losses: 8, ties: 0, winPercentage: 0.500, pointsFor: 298, pointsAgainst: 312, streak: "W1", division: "NFC North", conference: "NFC" },
  { teamId: "team_002", rank: 5, wins: 9, losses: 7, ties: 0, winPercentage: 0.563, pointsFor: 287, pointsAgainst: 301, streak: "L2", division: "NFC North", conference: "NFC" },
];

export const mockSettings: UserSettings = {
  userId: "user_001",
  theme: "dark",
  notifications: {
    email: true,
    push: true,
    challenges: true,
    matches: true,
    rewards: true,
  },
  privacy: {
    showWallet: true,
    showStats: true,
    allowInvites: true,
  },
  gamePreferences: {
    autoSimulate: false,
    simulationSpeed: "normal",
    showPredictions: true,
  },
};

// Helper to get team by ID
export function getTeamById(id: string): Team | undefined {
  return mockTeams.find((t) => t.id === id);
}

// Helper to get players by team ID
export function getPlayersByTeamId(teamId: string): Player[] {
  return mockPlayers.filter((p) => p.teamId === teamId);
}

// Helper to get player by ID
export function getPlayerById(id: string): Player | undefined {
  return mockPlayers.find((p) => p.id === id);
}

// Helper to get challenge by ID
export function getChallengeById(id: string): Challenge | undefined {
  return mockChallenges.find((c) => c.id === id);
}

// Helper to get match by ID
export function getMatchById(id: string): Match | undefined {
  return id === "match_001" ? mockLiveMatch : undefined;
}