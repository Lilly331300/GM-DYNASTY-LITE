// ============================================
// GM DYNASTY LITE - SIMULATION ENGINE v3.2
// Realistic scoring pace, penalties, quarter events, dynamic football logic
// Fix: scoring plays now display immediately before post-score reset
// ============================================

import { Team, Player, GamePlan, Play, TeamGameStats } from "./types";

const QUARTER_LENGTH_SECONDS = 210;

export interface GameEvent {
  id: string;
  label: string;
  sub: string;
  tone: "gold" | "danger" | "electric" | "success" | "neutral";
}

export interface SimulationState {
  quarter: number;
  timeRemaining: number;
  down: number;
  distance: number;
  fieldPosition: number;
  possession: "home" | "away";
  homeScore: number;
  awayScore: number;
  plays: Play[];
  homeStats: TeamGameStats;
  awayStats: TeamGameStats;
  drivePlays: number;
  driveYards: number;
  driveStartPosition: number;
  lastPlayTime: number;
  isFinished: boolean;
  homeTeamId: string;
  awayTeamId: string;
  momentum: number;
  pendingPostScoreReset?: {
    possession: "home" | "away";
    fieldPosition: number;
    down: number;
    distance: number;
    driveStartPosition: number;
  };
  gameEvent?: GameEvent;
}

interface TeamRatings {
  overall: number;
  offense: number;
  defense: number;
  specialTeams: number;
  passOffense: number;
  runOffense: number;
  passDefense: number;
  runDefense: number;
  qbRating: number;
  rbRating: number;
  wrRating: number;
  olRating: number;
  dlRating: number;
  lbRating: number;
  dbRating: number;
  discipline: number;
  pressure: number;
}

type SimPlayType =
  | "run"
  | "pass"
  | "field_goal"
  | "punt"
  | "kickoff"
  | "pat"
  | "two_point"
  | "penalty";

interface PenaltyOption {
  name: string;
  yards: number;
  automaticFirstDown?: boolean;
}

interface PlayOutcome {
  yards: number;
  result: string;
  isTurnover: boolean;
  isScore: boolean;
  scoreType?: "touchdown" | "field_goal" | "safety";
  commentary: string;
  playerName?: string;
  penaltyOn?: "offense" | "defense";
  automaticFirstDown?: boolean;
}

function averageRating(players: Player[], fallback = 70): number {
  if (players.length === 0) return fallback;

  return Math.round(
    players.reduce((sum, player) => sum + player.overallRating, 0) /
      players.length
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function chance(probability: number) {
  return Math.random() < probability;
}

function createEmptyStats(): TeamGameStats {
  return {
    totalYards: 0,
    passingYards: 0,
    rushingYards: 0,
    firstDowns: 0,
    thirdDownConversions: 0,
    thirdDownAttempts: 0,
    fourthDownConversions: 0,
    fourthDownAttempts: 0,
    redZoneTrips: 0,
    redZoneScores: 0,
    turnovers: 0,
    sacksTaken: 0,
    sacksMade: 0,
    penalties: 0,
    penaltyYards: 0,
    timeOfPossession: "0:00",
  };
}

function calculateTeamRatings(
  team: Team,
  players: Player[],
  gamePlan: GamePlan
): TeamRatings {
  const starters = players.filter((player) => player.isStarter);

  const qb = starters.find((player) => player.position === "QB");
  const rbs = starters.filter((player) => player.position === "RB");
  const wrs = starters.filter((player) => player.position === "WR");
  const te = starters.find((player) => player.position === "TE");

  const ol = starters.filter((player) =>
    ["LT", "LG", "C", "RG", "RT"].includes(player.position)
  );

  const dl = starters.filter((player) =>
    ["LE", "DT", "RE"].includes(player.position)
  );

  const lbs = starters.filter((player) =>
    ["LOLB", "MLB", "ROLB"].includes(player.position)
  );

  const dbs = starters.filter((player) =>
    ["CB", "FS", "SS"].includes(player.position)
  );

  const qbRating = qb?.overallRating || 70;
  const rbRating = averageRating(rbs);
  const wrRating = averageRating(wrs);
  const teRating = te?.overallRating || 70;
  const olRating = averageRating(ol);
  const dlRating = averageRating(dl);
  const lbRating = averageRating(lbs);
  const dbRating = averageRating(dbs);

  const passOffense = Math.round(
    qbRating * 0.36 + wrRating * 0.25 + teRating * 0.14 + olRating * 0.25
  );

  const runOffense = Math.round(
    rbRating * 0.36 + olRating * 0.36 + teRating * 0.13 + qbRating * 0.15
  );

  const passDefense = Math.round(
    dbRating * 0.42 +
      lbRating * 0.22 +
      dlRating * 0.2 +
      (gamePlan?.defense.coveragePreference || 50) * 0.16
  );

  const runDefense = Math.round(
    dlRating * 0.36 +
      lbRating * 0.34 +
      dbRating * 0.18 +
      (gamePlan?.defense.stopRun || 50) * 0.12
  );

  const discipline = averageRating(
    starters.map((player) => ({
      ...player,
      overallRating: Math.round(
        player.consistency * 0.28 +
          player.intelligence * 0.28 +
          player.workEthic * 0.14 +
          player.desire * 0.14 +
          player.intangibles * 0.16
      ),
    })),
    72
  );

  const aggression =
    ((gamePlan?.defense.aggression || 50) +
      (gamePlan?.defense.blitzFrequency || 50) +
      (gamePlan?.defense.turnoverAggression || 50)) /
    3;

  return {
    overall: team.overallRating,
    offense: team.offensiveRating,
    defense: team.defensiveRating,
    specialTeams: team.specialTeamsRating,
    passOffense,
    runOffense,
    passDefense,
    runDefense,
    qbRating,
    rbRating,
    wrRating,
    olRating,
    dlRating,
    lbRating,
    dbRating,
    discipline,
    pressure: Math.round(dlRating * 0.55 + lbRating * 0.25 + aggression * 0.2),
  };
}

function determinePlayType(
  state: SimulationState,
  offenseRatings: TeamRatings,
  defenseRatings: TeamRatings,
  gamePlan: GamePlan
): SimPlayType {
  const penaltyChance =
    0.04 +
    clamp((100 - offenseRatings.discipline) / 1200, 0, 0.03) +
    clamp((defenseRatings.pressure - 70) / 2500, 0, 0.025);

  if (chance(penaltyChance)) {
    return "penalty";
  }

  if (state.down === 4) {
    const distanceToEndzone = 100 - state.fieldPosition;
    const kickDistance = distanceToEndzone + 17;
    const fgRange = gamePlan?.specialTeams.maxFieldGoalRange || 50;

    if (kickDistance <= fgRange && state.fieldPosition >= 55) {
      const fgConfidence =
        offenseRatings.specialTeams * 0.0085 -
        Math.max(0, kickDistance - 38) * 0.012;

      if (chance(clamp(fgConfidence, 0.34, 0.86))) return "field_goal";
    }

    if (state.fieldPosition < 42) return "punt";

    const fourthAggression =
      (gamePlan?.offense.fourthDownAggression || 40) / 100;

    const goForItBoost =
      state.distance <= 2 ? 0.18 : state.fieldPosition >= 68 ? 0.08 : -0.06;

    if (chance(clamp(fourthAggression + goForItBoost, 0.05, 0.7))) {
      return determineRunOrPass(state, offenseRatings, defenseRatings, gamePlan);
    }

    return state.fieldPosition >= 55 ? "field_goal" : "punt";
  }

  return determineRunOrPass(state, offenseRatings, defenseRatings, gamePlan);
}

function determineRunOrPass(
  state: SimulationState,
  offenseRatings: TeamRatings,
  defenseRatings: TeamRatings,
  gamePlan: GamePlan
): "run" | "pass" {
  let runWeight = gamePlan?.offense.runPassTendency || 50;

  if (state.down === 1) {
    runWeight = gamePlan?.offense.firstDownBehavior || 50;
  }

  if (state.distance <= 3) {
    runWeight = gamePlan?.offense.shortYardageBehavior || 68;
  }

  if (state.distance >= 8) {
    runWeight = gamePlan?.offense.longYardageBehavior || 30;
  }

  if (state.fieldPosition > 78) runWeight += 8;
  if (offenseRatings.runOffense > offenseRatings.passOffense + 5) runWeight += 8;
  if (defenseRatings.runDefense > defenseRatings.passDefense + 5) runWeight -= 6;

  const scoreDiff =
    state.possession === "home"
      ? state.homeScore - state.awayScore
      : state.awayScore - state.homeScore;

  if (scoreDiff > 10 && state.quarter >= 3) runWeight += 12;
  if (scoreDiff < -10 && state.quarter >= 3) runWeight -= 14;

  if (state.quarter === 4 && state.timeRemaining < 70) {
    if (scoreDiff > 0) runWeight += 18;
    if (scoreDiff < 0) runWeight -= 20;
  }

  return clamp(runWeight, 15, 85) > Math.random() * 100 ? "run" : "pass";
}

function getPlayerName(position: string, isHome: boolean): string {
  const homeNames: Record<string, string[]> = {
    QB: ["J. Maddox", "T. Shaw"],
    RB: ["D. King", "J. Harris"],
    WR: ["M. Collins", "R. Moore", "J. Harris", "T. Shaw"],
    TE: ["T. Bowers", "M. Carter"],
    K: ["B. Aubrey"],
  };

  const awayNames: Record<string, string[]> = {
    QB: ["M. Wilson", "K. Thompson"],
    RB: ["A. Brown", "C. Davis"],
    WR: ["J. Taylor", "L. Johnson", "R. Williams"],
    TE: ["S. Miller", "D. Clark"],
    K: ["J. Tucker"],
  };

  const pool =
    isHome
      ? homeNames[position] || ["Player"]
      : awayNames[position] || ["Player"];

  return pool[Math.floor(Math.random() * pool.length)];
}

function simulatePlay(
  state: SimulationState,
  playType: SimPlayType,
  offenseRatings: TeamRatings,
  defenseRatings: TeamRatings,
  gamePlan: GamePlan,
  isHome: boolean
): PlayOutcome {
  const random = Math.random();
  const distanceToEndzone = 100 - state.fieldPosition;

  let yards = 0;
  let isTurnover = false;
  let isScore = false;
  let scoreType: "touchdown" | "field_goal" | "safety" | undefined;
  let result = "";
  let commentary = "";
  let playerName = "";

  if (playType === "penalty") {
    const offensivePenaltyChance = clamp(
      0.58 + (100 - offenseRatings.discipline) / 220,
      0.5,
      0.78
    );

    const penaltyOn: "offense" | "defense" = chance(offensivePenaltyChance)
      ? "offense"
      : "defense";

    const offensivePenalties: PenaltyOption[] = [
      { name: "holding", yards: -10 },
      { name: "false start", yards: -5 },
      { name: "illegal formation", yards: -5 },
      { name: "offensive pass interference", yards: -10 },
    ];

    const defensivePenalties: PenaltyOption[] = [
      { name: "offside", yards: 5 },
      { name: "defensive holding", yards: 5, automaticFirstDown: true },
      {
        name: "pass interference",
        yards: Math.min(18, Math.max(8, state.distance + 6)),
        automaticFirstDown: true,
      },
      { name: "roughing the passer", yards: 15, automaticFirstDown: true },
    ];

    const selected =
      penaltyOn === "offense"
        ? offensivePenalties[Math.floor(Math.random() * offensivePenalties.length)]
        : defensivePenalties[Math.floor(Math.random() * defensivePenalties.length)];

    return {
      yards: selected.yards,
      result: "penalty",
      isTurnover: false,
      isScore: false,
      commentary:
        penaltyOn === "offense"
          ? `Penalty on the offense: ${selected.name}. The drive moves backward.`
          : `Penalty on the defense: ${selected.name}. Free yards for the offense.`,
      penaltyOn,
      automaticFirstDown: selected.automaticFirstDown ?? false,
    };
  }

  switch (playType) {
    case "run": {
      const runEdge = offenseRatings.runOffense - defenseRatings.runDefense;
      const successChance = clamp(0.47 + runEdge / 240, 0.28, 0.72);
      const explosiveChance = clamp(
        0.035 + (offenseRatings.rbRating - 70) / 1000,
        0.025,
        0.085
      );
      const fumbleChance = clamp(
        0.018 + (100 - offenseRatings.discipline) / 2500,
        0.012,
        0.045
      );

      playerName = getPlayerName("RB", isHome);

      if (random < fumbleChance) {
        isTurnover = true;
        yards = Math.floor(Math.random() * 5);
        result = "fumble";
        commentary = `FUMBLE! ${playerName} loses the ball after contact and the defense recovers.`;
      } else if (random < successChance) {
        const baseYards = Math.floor(Math.random() * 7) + 2;
        const ratingBonus = Math.floor(runEdge / 12);
        yards = Math.max(1, baseYards + ratingBonus);

        if (chance(explosiveChance)) {
          yards += Math.floor(Math.random() * 22) + 12;
        }

        result = "rush";

        if (yards >= distanceToEndzone) {
          yards = distanceToEndzone;
          isScore = true;
          scoreType = "touchdown";
          commentary = `TOUCHDOWN! ${playerName} finds daylight and powers into the end zone.`;
        } else if (yards >= 20) {
          commentary = `${playerName} breaks loose for ${yards} yards. Huge burst through the second level.`;
        } else {
          commentary = `${playerName} carries the ball for ${yards} yards.`;
        }
      } else {
        yards = -(Math.floor(Math.random() * 3));
        result = yards < 0 ? "stopped" : "short gain";
        commentary =
          yards < 0
            ? `${playerName} is wrapped up behind the line for a loss of ${Math.abs(yards)}.`
            : `${playerName} is bottled up at the line of scrimmage.`;
      }

      break;
    }

    case "pass": {
      const passEdge = offenseRatings.passOffense - defenseRatings.passDefense;
      const completionChance = clamp(0.58 + passEdge / 260, 0.38, 0.76);
      const pressureChance = clamp(
        0.06 + (defenseRatings.pressure - offenseRatings.olRating) / 280,
        0.04,
        0.16
      );
      const interceptionChance = clamp(
        0.018 + (defenseRatings.dbRating - offenseRatings.qbRating) / 1700,
        0.012,
        0.055
      );
      const explosiveChance = clamp(
        0.05 + (offenseRatings.wrRating - 70) / 950,
        0.035,
        0.12
      );

      const qbName = getPlayerName("QB", isHome);
      const wrName = getPlayerName("WR", isHome);
      playerName = qbName;

      if (random < interceptionChance) {
        isTurnover = true;
        yards = 0;
        result = "interception";
        commentary = `INTERCEPTION! ${qbName} tries to force it and the defensive back jumps the route.`;
      } else if (random < interceptionChance + pressureChance) {
        yards = -(Math.floor(Math.random() * 8) + 2);
        result = "sack";
        commentary = `SACK! ${qbName} is dropped for a loss of ${Math.abs(yards)} after pressure off the edge.`;
      } else if (random < completionChance) {
        const baseYards =
          state.distance >= 8
            ? Math.floor(Math.random() * 15) + 6
            : Math.floor(Math.random() * 9) + 2;

        const ratingBonus = Math.floor(passEdge / 14);
        yards = Math.max(2, baseYards + ratingBonus);

        if (chance(explosiveChance)) {
          yards += Math.floor(Math.random() * 26) + 12;
        }

        result = "complete";

        if (yards >= distanceToEndzone) {
          yards = distanceToEndzone;
          isScore = true;
          scoreType = "touchdown";
          commentary = `TOUCHDOWN! ${qbName} connects with ${wrName} in stride for the score.`;
        } else if (yards >= 25) {
          commentary = `${qbName} hits ${wrName} for ${yards} yards. The crowd reacts to the explosive play.`;
        } else {
          commentary = `${qbName} completes to ${wrName} for ${yards} yards.`;
        }
      } else {
        yards = 0;
        result = "incomplete";
        commentary = `${qbName}'s pass falls incomplete. Tight coverage on the play.`;
      }

      break;
    }

    case "field_goal": {
      const kickDistance = distanceToEndzone + 17;
      const successChance = clamp(
        0.92 -
          Math.max(0, kickDistance - 32) * 0.018 +
          (offenseRatings.specialTeams - 70) / 600,
        0.34,
        0.96
      );

      playerName = getPlayerName("K", isHome);
      yards = 0;

      if (random < successChance) {
        isScore = true;
        scoreType = "field_goal";
        result = "made";
        commentary = `${playerName}'s ${kickDistance}-yard field goal is GOOD.`;
      } else {
        result = "missed";
        commentary = `${playerName}'s ${kickDistance}-yard field goal attempt is NO GOOD.`;
        isTurnover = true;
      }

      break;
    }

    case "punt": {
      const puntDistance = Math.floor(Math.random() * 16) + 38;
      yards = puntDistance;
      result = "punt";
      commentary = `The punt travels ${puntDistance} yards and flips field position.`;
      isTurnover = true;
      break;
    }

    case "kickoff": {
      const kickDistance = Math.floor(Math.random() * 12) + 62;
      yards = kickDistance;
      result = "kickoff";
      commentary = `The kickoff goes ${kickDistance} yards. The return team sets up the next drive.`;
      isTurnover = true;
      break;
    }

    case "pat": {
      yards = 0;
      playerName = getPlayerName("K", isHome);

      if (random < 0.95) {
        result = "made";
        commentary = "The extra point is GOOD.";
      } else {
        result = "missed";
        commentary = "The extra point is NO GOOD.";
      }

      break;
    }

    case "two_point": {
      yards = 0;

      if (random < 0.45) {
        result = "conversion";
        commentary = "The two-point conversion is SUCCESSFUL.";
      } else {
        result = "failed";
        commentary = "The two-point conversion is stopped short.";
      }

      break;
    }
  }

  return {
    yards,
    result,
    isTurnover,
    isScore,
    scoreType,
    commentary,
    playerName,
  };
}

function updateStats(
  state: SimulationState,
  playType: SimPlayType,
  yards: number,
  isTurnover: boolean,
  possession: "home" | "away",
  result: string
) {
  const stats = possession === "home" ? state.homeStats : state.awayStats;

  if (playType === "run" || playType === "pass") {
    stats.totalYards += yards;
    if (playType === "pass") stats.passingYards += yards;
    if (playType === "run") stats.rushingYards += yards;
  }

  if (playType === "penalty") {
    stats.penalties += 1;
    stats.penaltyYards += Math.abs(yards);
  }

  if (isTurnover && playType !== "punt" && playType !== "kickoff") {
    stats.turnovers += 1;
  }

  if (result === "sack") {
    stats.sacksTaken += 1;
    const otherStats = possession === "home" ? state.awayStats : state.homeStats;
    otherStats.sacksMade += 1;
  }

  if (playType === "run" || playType === "pass") {
    if (state.down === 3) stats.thirdDownAttempts += 1;
    if (state.down === 4) stats.fourthDownAttempts += 1;

    if (yards >= state.distance) {
      stats.firstDowns += 1;
      if (state.down === 3) stats.thirdDownConversions += 1;
      if (state.down === 4) stats.fourthDownConversions += 1;
    }
  }

  if (state.fieldPosition >= 80) {
    stats.redZoneTrips += 1;
  }
}

function updateMomentum(
  state: SimulationState,
  playResult: string,
  yards: number,
  isTurnover: boolean,
  isScore: boolean
): number {
  let change = 0;

  if (isScore) change += 16;
  if (isTurnover) change -= 20;
  if (playResult === "sack") change -= 10;
  if (playResult === "interception") change -= 16;
  if (playResult === "fumble") change -= 14;
  if (playResult === "penalty") change -= yards < 0 ? 6 : -5;
  if (yards > 15) change += 7;
  if (yards > 25) change += 11;
  if (yards < -4) change -= 6;

  const currentMomentum =
    state.possession === "home" ? state.momentum : -state.momentum;

  const newMomentum = clamp(currentMomentum + change, -100, 100);

  return state.possession === "home" ? newMomentum : -newMomentum;
}

function createQuarterEvent(
  quarter: number,
  type: "start" | "end" | "final"
): GameEvent {
  if (type === "final") {
    return {
      id: `event_final_${Date.now()}`,
      label: "FINAL WHISTLE",
      sub: "The game is over. Post-game analysis is now available.",
      tone: "gold",
    };
  }

  const ordinal =
    quarter === 1 ? "1ST" : quarter === 2 ? "2ND" : quarter === 3 ? "3RD" : "4TH";

  return {
    id: `event_q${quarter}_${type}_${Date.now()}`,
    label: type === "start" ? `${ordinal} QUARTER BEGINS` : `END OF ${ordinal} QUARTER`,
    sub:
      type === "start"
        ? "New quarter. New adjustments. The broadcast rolls on."
        : "Teams reset, coaches adjust, and the next quarter is coming.",
    tone: type === "start" ? "electric" : "gold",
  };
}

function createScoringEvent(
  possession: "home" | "away",
  scoreType?: "touchdown" | "field_goal" | "safety"
): GameEvent {
  const teamLabel = possession === "home" ? "HOME TEAM" : "AWAY TEAM";

  if (scoreType === "touchdown") {
    return {
      id: `event_touchdown_${Date.now()}`,
      label: "TOUCHDOWN",
      sub: `${teamLabel} crosses the goal line. The score is on the board immediately.`,
      tone: "gold",
    };
  }

  if (scoreType === "field_goal") {
    return {
      id: `event_field_goal_${Date.now()}`,
      label: "FIELD GOAL GOOD",
      sub: `${teamLabel} splits the uprights for three points.`,
      tone: "success",
    };
  }

  if (scoreType === "safety") {
    return {
      id: `event_safety_${Date.now()}`,
      label: "SAFETY",
      sub: `${teamLabel} forces a safety. Two points awarded.`,
      tone: "danger",
    };
  }

  return {
    id: `event_score_${Date.now()}`,
    label: "SCORING PLAY",
    sub: `${teamLabel} scores on the play.`,
    tone: "gold",
  };
}

export function simulateNextPlay(
  state: SimulationState,
  homeTeam: Team,
  awayTeam: Team,
  homePlayers: Player[],
  awayPlayers: Player[],
  homeGamePlan: GamePlan,
  awayGamePlan: GamePlan
): { newState: SimulationState; play: Play } {
  if (state.pendingPostScoreReset) {
    state = {
      ...state,
      possession: state.pendingPostScoreReset.possession,
      fieldPosition: state.pendingPostScoreReset.fieldPosition,
      down: state.pendingPostScoreReset.down,
      distance: state.pendingPostScoreReset.distance,
      driveStartPosition: state.pendingPostScoreReset.driveStartPosition,
      drivePlays: 0,
      driveYards: 0,
      pendingPostScoreReset: undefined,
      gameEvent: undefined,
    };
  }

  const offense = state.possession === "home" ? homeTeam : awayTeam;
  const defense = state.possession === "home" ? awayTeam : homeTeam;

  const offensePlayers =
    state.possession === "home" ? homePlayers : awayPlayers;

  const defensePlayers =
    state.possession === "home" ? awayPlayers : homePlayers;

  const gamePlan = state.possession === "home" ? homeGamePlan : awayGamePlan;
  const defenseGamePlan = state.possession === "home" ? awayGamePlan : homeGamePlan;
  const isHome = state.possession === "home";

  const offenseRatings = calculateTeamRatings(offense, offensePlayers, gamePlan);
  const defenseRatings = calculateTeamRatings(defense, defensePlayers, defenseGamePlan);

  const playType = determinePlayType(
    state,
    offenseRatings,
    defenseRatings,
    gamePlan
  );

  const outcome = simulatePlay(
    state,
    playType,
    offenseRatings,
    defenseRatings,
    gamePlan,
    isHome
  );

  const newState: SimulationState = {
    ...state,
    plays: [...state.plays],
    homeStats: { ...state.homeStats },
    awayStats: { ...state.awayStats },
    gameEvent: undefined,
    pendingPostScoreReset: undefined,
  };

  if (outcome.isScore) {
    const points =
      outcome.scoreType === "touchdown"
        ? 7
        : outcome.scoreType === "field_goal"
          ? 3
          : outcome.scoreType === "safety"
            ? 2
            : 0;

    if (state.possession === "home") {
      newState.homeScore += points;
    } else {
      newState.awayScore += points;
    }
  }

  let newFieldPosition = state.fieldPosition;
  let newDown = state.down;
  let newDistance = state.distance;
  let newPossession = state.possession;
  let newDrivePlays = state.drivePlays;
  let newDriveYards = state.driveYards;

  if (playType === "penalty") {
    newFieldPosition = clamp(state.fieldPosition + outcome.yards, 1, 99);

    if (outcome.automaticFirstDown || outcome.penaltyOn === "defense") {
      newDown = 1;
      newDistance = Math.min(10, Math.max(1, 100 - newFieldPosition));

      if (outcome.automaticFirstDown) {
        const stats = state.possession === "home" ? newState.homeStats : newState.awayStats;
        stats.firstDowns += 1;
      }
    } else {
      newDown = state.down;
      newDistance = state.distance + Math.abs(outcome.yards);
    }

    newDrivePlays += 1;
  } else if (playType === "punt" || playType === "kickoff") {
    newFieldPosition = Math.min(100, state.fieldPosition + outcome.yards);
    if (newFieldPosition >= 100) newFieldPosition = 75;

    newPossession = state.possession === "home" ? "away" : "home";
    newDown = 1;
    newDistance = 10;
    newDrivePlays = 0;
    newDriveYards = 0;
    newState.driveStartPosition = newFieldPosition;
  } else if (
    outcome.isTurnover &&
    playType !== "pat" &&
    playType !== "two_point"
  ) {
    newPossession = state.possession === "home" ? "away" : "home";
    newFieldPosition = clamp(
      100 - state.fieldPosition + Math.floor(Math.random() * 10),
      12,
      88
    );
    newDown = 1;
    newDistance = 10;
    newDrivePlays = 0;
    newDriveYards = 0;
    newState.driveStartPosition = newFieldPosition;
  } else {
    newFieldPosition = state.fieldPosition + outcome.yards;

    if (newFieldPosition <= 0) {
      newFieldPosition = 20;

      if (state.possession === "home") {
        newState.awayScore += 2;
      } else {
        newState.homeScore += 2;
      }

      newState.gameEvent = createScoringEvent(
        state.possession === "home" ? "away" : "home",
        "safety"
      );

      newPossession = state.possession === "home" ? "away" : "home";
      newDown = 1;
      newDistance = 10;
      newDrivePlays = 0;
      newDriveYards = 0;
    }

    if (!outcome.isScore && playType !== "pat" && playType !== "two_point") {
      if (outcome.yards >= state.distance) {
        newDown = 1;
        newDistance = Math.min(10, Math.max(1, 100 - newFieldPosition));
      } else {
        newDown = state.down + 1;
        newDistance = Math.max(1, state.distance - outcome.yards);
      }

      newDrivePlays += 1;
      newDriveYards += outcome.yards;
    }
  }

  if (
    outcome.isScore &&
    (playType === "run" || playType === "pass" || playType === "field_goal")
  ) {
    const nextPossession = state.possession === "home" ? "away" : "home";

    newState.gameEvent = createScoringEvent(state.possession, outcome.scoreType);

    if (outcome.scoreType === "touchdown") {
      newFieldPosition = 99;
    }

    if (outcome.scoreType === "field_goal") {
      newFieldPosition = clamp(state.fieldPosition, 55, 99);
    }

    newPossession = state.possession;
    newDown = state.down;
    newDistance = state.distance;
    newDrivePlays = state.drivePlays + 1;
    newDriveYards = state.driveYards + Math.max(0, outcome.yards);

    newState.pendingPostScoreReset = {
      possession: nextPossession,
      fieldPosition: 25,
      down: 1,
      distance: 10,
      driveStartPosition: 25,
    };

    const scoringStats =
      state.possession === "home" ? newState.homeStats : newState.awayStats;

    if (state.fieldPosition >= 80) {
      scoringStats.redZoneScores += 1;
    }
  }

  if (newDown > 4) {
    newPossession = state.possession === "home" ? "away" : "home";
    newFieldPosition = clamp(100 - newFieldPosition, 15, 85);
    newDown = 1;
    newDistance = 10;
    newDrivePlays = 0;
    newDriveYards = 0;
    newState.driveStartPosition = newFieldPosition;
  }

  const timeUsed =
    playType === "pass" && outcome.result === "incomplete"
      ? Math.floor(Math.random() * 8) + 6
      : playType === "penalty"
        ? Math.floor(Math.random() * 7) + 4
        : Math.floor(Math.random() * 18) + 12;

  let newTimeRemaining = Math.max(0, state.timeRemaining - timeUsed);
  let newQuarter = state.quarter;

  if (state.plays.length === 0 && !newState.gameEvent) {
    newState.gameEvent = createQuarterEvent(1, "start");
  }

  if (newTimeRemaining <= 0 && newQuarter < 4) {
    if (!newState.gameEvent) {
      newState.gameEvent = createQuarterEvent(newQuarter, "end");
    }

    newQuarter += 1;
    newTimeRemaining = QUARTER_LENGTH_SECONDS;

    if (!newState.pendingPostScoreReset) {
      newDown = 1;
      newDistance = 10;
      newPossession = newQuarter % 2 === 1 ? "home" : "away";
      newFieldPosition = 25;
      newDrivePlays = 0;
      newDriveYards = 0;
      newState.driveStartPosition = newFieldPosition;
    }
  } else if (newTimeRemaining <= 0 && newQuarter === 4) {
    newState.isFinished = true;

    if (!newState.gameEvent) {
      newState.gameEvent = createQuarterEvent(4, "final");
    }
  } else if (
    state.timeRemaining === QUARTER_LENGTH_SECONDS &&
    state.plays.length > 0 &&
    !newState.gameEvent
  ) {
    newState.gameEvent = createQuarterEvent(state.quarter, "start");
  }

  newState.quarter = newQuarter;
  newState.timeRemaining = newTimeRemaining;
  newState.down = newDown;
  newState.distance = Math.max(1, newDistance);
  newState.fieldPosition = clamp(newFieldPosition, 1, 99);
  newState.possession = newPossession;
  newState.drivePlays = newDrivePlays;
  newState.driveYards = newDriveYards;
  newState.momentum = updateMomentum(
    state,
    outcome.result,
    outcome.yards,
    outcome.isTurnover,
    outcome.isScore
  );

  updateStats(
    newState,
    playType,
    outcome.yards,
    outcome.isTurnover,
    state.possession,
    outcome.result
  );

  const actualPlayType: Play["playType"] =
    outcome.result === "sack"
      ? "sack"
      : playType === "penalty"
        ? state.down >= 3
          ? "pass"
          : "run"
        : playType;

  const play: Play = {
    id: `play_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    matchId: "match_live",
    quarter: state.quarter,
    time: formatTime(state.timeRemaining),
    down: state.down,
    distance: state.distance,
    fieldPosition: state.fieldPosition,
    possession: state.possession,
    playType: actualPlayType,
    result: outcome.result,
    yards: outcome.yards,
    playerName: outcome.playerName,
    isTurnover: outcome.isTurnover,
    isScore: outcome.isScore,
    scoreType: outcome.scoreType,
    commentary: outcome.commentary,
    homeScore: newState.homeScore,
    awayScore: newState.awayScore,
  };

  newState.plays.push(play);

  return { newState, play };
}

export function createInitialState(
  homeTeamId: string,
  awayTeamId: string
): SimulationState {
  return {
    quarter: 1,
    timeRemaining: QUARTER_LENGTH_SECONDS,
    down: 1,
    distance: 10,
    fieldPosition: 25,
    possession: "home",
    homeScore: 0,
    awayScore: 0,
    plays: [],
    homeStats: createEmptyStats(),
    awayStats: createEmptyStats(),
    drivePlays: 0,
    driveYards: 0,
    driveStartPosition: 25,
    lastPlayTime: Date.now(),
    isFinished: false,
    homeTeamId,
    awayTeamId,
    momentum: 0,
    pendingPostScoreReset: undefined,
    gameEvent: createQuarterEvent(1, "start"),
  };
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatGameTime(seconds: number): string {
  return formatTime(seconds);
}

export function getWinProbability(
  homeScore: number,
  awayScore: number,
  quarter: number,
  timeRemaining: number
): number {
  const scoreDiff = homeScore - awayScore;
  const elapsed =
    (quarter - 1) * QUARTER_LENGTH_SECONDS +
    (QUARTER_LENGTH_SECONDS - timeRemaining);
  const totalTime = QUARTER_LENGTH_SECONDS * 4;
  const timeWeight = elapsed / totalTime;

  let baseProb = 0.5 + scoreDiff * 0.045;
  baseProb = baseProb * timeWeight + 0.5 * (1 - timeWeight);

  return clamp(baseProb, 0.05, 0.95);
}

export function getFieldPositionLabel(position: number): string {
  if (position <= 0) return "Own Endzone";
  if (position >= 99) return "Opponent Endzone";
  if (position === 50) return "Midfield";
  if (position < 50) return `Own ${position}`;

  return `Opponent ${100 - position}`;
}

export function getDownLabel(down: number): string {
  if (down === 0) return "Kickoff";
  if (down === 1) return "1st";
  if (down === 2) return "2nd";
  if (down === 3) return "3rd";
  if (down === 4) return "4th";

  return "";
}