// ============================================
// GM DYNASTY LITE - CORE TYPES
// ============================================

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  walletBalance: number;
  totalEarnings: number;
  isPremium: boolean;
}

export interface Team {
  id: string;
  ownerId: string;
  name: string;
  city: string;
  nickname: string;
  abbreviation: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  helmetUrl?: string;
  overallRating: number;
  offensiveRating: number;
  defensiveRating: number;
  specialTeamsRating: number;
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  prestige: number;
  fanBase: number;
  leagueRank: number;
  division: string;
  conference: string;
  nflSync: {
    enabled: boolean;
    nflTeam?: string;
    lastSync?: string;
  };
  createdAt: string;
  isActive: boolean;
}

export interface Player {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  number: number;
  position: Position;
  age: number;
  height: string;
  weight: number;
  overallRating: number;
  experience: number;
  college: string;
  
  // Static traits
  speed: number;
  strength: number;
  agility: number;
  explosiveness: number;
  
  // Variable traits
  passing?: number;
  running?: number;
  receiving?: number;
  blocking?: number;
  rushDefense?: number;
  coverage?: number;
  tackling?: number;
  runDefense?: number;
  kicking?: number;
  punting?: number;
  
  // Hidden traits (not fully displayed)
  consistency: number;
  intelligence: number;
  durability: number;
  workEthic: number;
  desire: number;
  intangibles: number;
  
  // Status
  status: "Healthy" | "Questionable" | "Injured" | "Out";
  injuryWeeks?: number;
  specialSkill?: SpecialSkill;
  isStarter: boolean;
  depthPosition: number;
}

export type Position = 
  | "QB" | "RB" | "FB" | "WR" | "TE" 
  | "LT" | "LG" | "C" | "RG" | "RT"
  | "LE" | "DT" | "RE" | "LOLB" | "MLB" | "ROLB"
  | "CB" | "FS" | "SS" 
  | "K" | "P" | "KR" | "PR";

export type SpecialSkill = 
  | "Clutch" | "Workhorse" | "Playmaker" | "Red Zone Threat" 
  | "Enforcer" | "Shutdown" | "Deep Threat" | "Route Runner"
  | "Pass Rusher" | "Run Stuffer" | "Ball Hawk" | "Return Specialist";

export interface GamePlan {
  teamId: string;
  
  // Offense
  offense: {
    basePersonnel: "22" | "21" | "12" | "11" | "10";
    formationStyle: "Spread" | "West Coast" | "Power" | "Multiple";
    runPassTendency: number; // 0-100, 0 = run heavy, 100 = pass heavy
    firstDownBehavior: number; // 0-100
    shortYardageBehavior: number; // 0-100
    longYardageBehavior: number; // 0-100
    fourthDownAggression: number; // 0-100
    shotgunVsUnderCenter: number; // 0-100, 0 = under center, 100 = shotgun
    interiorVsOutsideRuns: number; // 0-100
    tempo: number; // 0-100, 0 = slow, 100 = fast
    playAction: number; // 0-100
    screenUsage: number; // 0-100
  };
  
  // Defense
  defense: {
    baseScheme: "4-3" | "3-4" | "Nickel" | "Dime";
    blitzFrequency: number; // 0-100
    coveragePreference: number; // 0-100, 0 = man, 100 = zone
    turnoverAggression: number; // 0-100
    runPassBias: number; // 0-100, 0 = stop run, 100 = stop pass
    deepCoverageTendency: number; // 0-100
    stopRun: number; // 0-100
    passRush: number; // 0-100
    aggression: number; // 0-100
    linebackerBlitz: number; // 0-100
    cbSafetyBlitz: number; // 0-100
  };
  
  // Special Teams
  specialTeams: {
    maxFieldGoalRange: number; // yards
    kickoffStrategy: number; // 0-100, 0 = touchback, 100 = return
    twoPointConversionAggression: number; // 0-100
  };
}

export interface Challenge {
  id: string;
  creatorId: string;
  creatorTeamId: string;
  opponentId?: string;
  opponentTeamId?: string;
  type: "free" | "paid" | "ai";
  stake: number;
  status: "pending" | "accepted" | "live" | "completed" | "cancelled";
  predictionsEnabled: boolean;
  predictionCount: number;
  maxPredictions: number;
  createdAt: string;
  scheduledFor?: string;
  winnerId?: string;
  isAiMatch: boolean;
  aiDifficulty?: "easy" | "medium" | "hard" | "elite";
}

export interface Match {
  id: string;
  challengeId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  quarter: number;
  timeRemaining: string;
  down: number;
  distance: number;
  fieldPosition: number;
  possession: "home" | "away";
  status: "pregame" | "live" | "halftime" | "final";
  plays: Play[];
  homeStats: TeamGameStats;
  awayStats: TeamGameStats;
  weather: string;
  attendance: number;
  spectators: number;
  startTime: string;
  endTime?: string;
  mvpCrownsPool: number;
  platformFee: number;
}

export interface Play {
  id: string;
  matchId: string;
  quarter: number;
  time: string;
  down: number;
  distance: number;
  fieldPosition: number;
  possession: "home" | "away";
  playType: "run" | "pass" | "sack" | "field_goal" | "punt" | "kickoff" | "pat" | "two_point";
  result: string;
  yards: number;
  playerName?: string;
  isTurnover: boolean;
  isScore: boolean;
  scoreType?: "touchdown" | "field_goal" | "safety";
  commentary: string;
  homeScore: number;
  awayScore: number;
}

export interface TeamGameStats {
  totalYards: number;
  passingYards: number;
  rushingYards: number;
  firstDowns: number;
  thirdDownConversions: number;
  thirdDownAttempts: number;
  fourthDownConversions: number;
  fourthDownAttempts: number;
  redZoneTrips: number;
  redZoneScores: number;
  turnovers: number;
  sacksTaken: number;
  sacksMade: number;
  penalties: number;
  penaltyYards: number;
  timeOfPossession: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  pendingRewards: number;
  totalEarned: number;
  totalDeposited: number;
  totalWithdrawn: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "withdrawal" | "match_win" | "match_loss" | "challenge_stake" | "challenge_return" | "bonus" | "fee";
  amount: number;
  status: "pending" | "completed" | "failed";
  description: string;
  matchId?: string;
  challengeId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "challenge" | "match" | "reward" | "system" | "invite";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface Standing {
  teamId: string;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  winPercentage: number;
  pointsFor: number;
  pointsAgainst: number;
  streak: string;
  division: string;
  conference: string;
}

export interface Prediction {
  id: string;
  matchId: string;
  userId: string;
  predictedOutcome: string;
  stake: number;
  potentialWin: number;
  status: "pending" | "won" | "lost";
  createdAt: string;
}

export type Theme = "dark" | "light" | "system";

export interface UserSettings {
  userId: string;
  theme: Theme;
  notifications: {
    email: boolean;
    push: boolean;
    challenges: boolean;
    matches: boolean;
    rewards: boolean;
  };
  privacy: {
    showWallet: boolean;
    showStats: boolean;
    allowInvites: boolean;
  };
  gamePreferences: {
    autoSimulate: boolean;
    simulationSpeed: "slow" | "normal" | "fast";
    showPredictions: boolean;
  };
}