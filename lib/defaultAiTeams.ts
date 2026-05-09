import { Team } from "@/lib/types";

export interface FranchisePlayer {
  id: string;
  teamId: string;
  name: string;
  position: string;
  number: number;
  age: number;
  overall: number;
  speed: number;
  strength: number;
  intelligence: number;
  consistency: number;
  stamina: number;
  trait: string;
}

export interface AiTeamTemplate extends Team {
  difficulty: "easy" | "medium" | "hard" | "elite";
  archetype: string;
  helmetAssetPath?: string;
  logoAssetPath?: string;
  players: FranchisePlayer[];
}

const positions = [
  "QB",
  "RB",
  "WR",
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
  "CB",
  "FS",
  "SS",
  "K",
];

const firstNames = [
  "Jaxon",
  "Maddox",
  "Kieran",
  "Dante",
  "Malik",
  "Troy",
  "Austin",
  "Roman",
  "Carter",
  "Blake",
  "Eli",
  "Marcus",
  "Darius",
  "Kenny",
  "Jaylen",
  "Zion",
  "Andre",
  "Cole",
  "Ryder",
  "Miles",
];

const lastNames = [
  "Storm",
  "Knight",
  "Wolfe",
  "Carter",
  "Bishop",
  "Stone",
  "Rivers",
  "Banks",
  "Harris",
  "Mason",
  "Hunter",
  "Reed",
  "Walker",
  "Cross",
  "Hayes",
  "Foster",
  "Brooks",
  "Wade",
  "Pierce",
  "Coleman",
];

const traits = [
  "Clutch",
  "High Motor",
  "Field General",
  "Deep Threat",
  "Power Back",
  "Coverage Hawk",
  "Run Stopper",
  "Smart Veteran",
  "Explosive",
  "Red Zone Threat",
];

function seededValue(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000;
  const random = x - Math.floor(x);
  return Math.floor(random * (max - min + 1)) + min;
}

export function generateFranchisePlayers(
  teamId: string,
  baseOverall = 60,
  seed = 1
): FranchisePlayer[] {
  return positions.map((position, index) => {
    const playerSeed = seed * 100 + index * 9;
    const overall = seededValue(playerSeed, baseOverall - 7, baseOverall + 9);

    return {
      id: `${teamId}_player_${index + 1}`,
      teamId,
      name: `${firstNames[seededValue(playerSeed + 1, 0, firstNames.length - 1)]} ${
        lastNames[seededValue(playerSeed + 2, 0, lastNames.length - 1)]
      }`,
      position,
      number:
        position === "QB"
          ? seededValue(playerSeed + 3, 1, 19)
          : position === "K"
            ? seededValue(playerSeed + 4, 2, 19)
            : seededValue(playerSeed + 5, 20, 99),
      age: seededValue(playerSeed + 6, 21, 31),
      overall,
      speed: seededValue(playerSeed + 7, Math.max(45, overall - 12), Math.min(99, overall + 12)),
      strength: seededValue(playerSeed + 8, Math.max(45, overall - 12), Math.min(99, overall + 12)),
      intelligence: seededValue(playerSeed + 9, Math.max(45, overall - 10), Math.min(99, overall + 10)),
      consistency: seededValue(playerSeed + 10, Math.max(45, overall - 10), Math.min(99, overall + 10)),
      stamina: seededValue(playerSeed + 11, Math.max(45, overall - 8), Math.min(99, overall + 10)),
      trait: traits[seededValue(playerSeed + 12, 0, traits.length - 1)],
    };
  });
}

function createAiTeam(input: {
  id: string;
  city: string;
  nickname: string;
  abbreviation: string;
  primaryColor: string;
  secondaryColor: string;
  overall: number;
  offense: number;
  defense: number;
  specialTeams: number;
  difficulty: "easy" | "medium" | "hard" | "elite";
  archetype: string;
  seed: number;
}): AiTeamTemplate {
  return {
    id: input.id,
    ownerId: "ai",
    name: `${input.city} ${input.nickname}`,
    city: input.city,
    nickname: input.nickname,
    abbreviation: input.abbreviation,
    primaryColor: input.primaryColor,
    secondaryColor: input.secondaryColor,

    // Later you can add real files like:
    // logoAssetPath: "/assets/ai-teams/dastardly-devils/logo.png",
    // helmetAssetPath: "/assets/ai-teams/dastardly-devils/helmet.png",

    overallRating: input.overall,
    offensiveRating: input.offense,
    defensiveRating: input.defense,
    specialTeamsRating: input.specialTeams,
    record: {
      wins: seededValue(input.seed + 1, 1, 11),
      losses: seededValue(input.seed + 2, 1, 9),
      ties: 0,
    },
    prestige: seededValue(input.seed + 3, 250, 2500),
    fanBase: seededValue(input.seed + 4, 8000, 120000),
    leagueRank: seededValue(input.seed + 5, 1, 32),
    division: "AI League",
    conference: "Simulation Conference",
    nflSync: {
      enabled: false,
    },
    createdAt: new Date().toISOString(),
    isActive: true,
    difficulty: input.difficulty,
    archetype: input.archetype,
    players: generateFranchisePlayers(input.id, input.overall, input.seed),
  };
}

export const defaultAiTeams: AiTeamTemplate[] = [
  createAiTeam({
    id: "ai_dastardly_devils",
    city: "Doom City",
    nickname: "Dastardly Devils",
    abbreviation: "DDD",
    primaryColor: "#7F1D1D",
    secondaryColor: "#F97316",
    overall: 47,
    offense: 49,
    defense: 45,
    specialTeams: 46,
    difficulty: "easy",
    archetype: "Chaotic rookie team with risky playcalling",
    seed: 11,
  }),
  createAiTeam({
    id: "ai_vikings",
    city: "Northern Bay",
    nickname: "Vikings",
    abbreviation: "VIK",
    primaryColor: "#4C1D95",
    secondaryColor: "#FACC15",
    overall: 55,
    offense: 57,
    defense: 53,
    specialTeams: 54,
    difficulty: "easy",
    archetype: "Balanced starter team",
    seed: 12,
  }),
  createAiTeam({
    id: "ai_wolves",
    city: "Ironwood",
    nickname: "Wolves",
    abbreviation: "WOL",
    primaryColor: "#1F2937",
    secondaryColor: "#9CA3AF",
    overall: 61,
    offense: 59,
    defense: 64,
    specialTeams: 58,
    difficulty: "medium",
    archetype: "Physical defensive team",
    seed: 13,
  }),
  createAiTeam({
    id: "ai_wemmers",
    city: "Westmoor",
    nickname: "Wemmers",
    abbreviation: "WEM",
    primaryColor: "#064E3B",
    secondaryColor: "#34D399",
    overall: 64,
    offense: 66,
    defense: 61,
    specialTeams: 63,
    difficulty: "medium",
    archetype: "Tempo offense with good passing",
    seed: 14,
  }),
  createAiTeam({
    id: "ai_raiders",
    city: "Blackrock",
    nickname: "Raiders",
    abbreviation: "RAI",
    primaryColor: "#111827",
    secondaryColor: "#D1D5DB",
    overall: 68,
    offense: 67,
    defense: 70,
    specialTeams: 65,
    difficulty: "medium",
    archetype: "Aggressive defense and vertical offense",
    seed: 15,
  }),
  createAiTeam({
    id: "ai_incredibles",
    city: "Metroville",
    nickname: "The Incredibles",
    abbreviation: "INC",
    primaryColor: "#B91C1C",
    secondaryColor: "#F59E0B",
    overall: 72,
    offense: 75,
    defense: 69,
    specialTeams: 70,
    difficulty: "hard",
    archetype: "Explosive offense with star receivers",
    seed: 16,
  }),
  createAiTeam({
    id: "ai_apocalypse",
    city: "Ash Valley",
    nickname: "Apocalypse",
    abbreviation: "APX",
    primaryColor: "#3F1D1D",
    secondaryColor: "#EF4444",
    overall: 76,
    offense: 73,
    defense: 80,
    specialTeams: 72,
    difficulty: "hard",
    archetype: "Elite pass rush and turnover pressure",
    seed: 17,
  }),
  createAiTeam({
    id: "ai_sea_devils",
    city: "Oceanside",
    nickname: "Sea Devils",
    abbreviation: "SDV",
    primaryColor: "#0F766E",
    secondaryColor: "#22D3EE",
    overall: 80,
    offense: 78,
    defense: 82,
    specialTeams: 77,
    difficulty: "hard",
    archetype: "Disciplined playoff-level team",
    seed: 18,
  }),
  createAiTeam({
    id: "ai_jokers",
    city: "Neon City",
    nickname: "Jokers",
    abbreviation: "JOK",
    primaryColor: "#581C87",
    secondaryColor: "#22C55E",
    overall: 85,
    offense: 88,
    defense: 80,
    specialTeams: 82,
    difficulty: "elite",
    archetype: "Unpredictable elite offense",
    seed: 19,
  }),
  createAiTeam({
    id: "ai_titans",
    city: "Titan Ridge",
    nickname: "Titans",
    abbreviation: "TTN",
    primaryColor: "#1E3A8A",
    secondaryColor: "#E5E7EB",
    overall: 91,
    offense: 90,
    defense: 92,
    specialTeams: 88,
    difficulty: "elite",
    archetype: "Complete championship-level AI team",
    seed: 20,
  }),
];

export function getAiTeamById(teamId?: string | null) {
  if (!teamId) return undefined;
  return defaultAiTeams.find((team) => team.id === teamId);
}

export function getAiTeamForDifficulty(
  difficulty: "easy" | "medium" | "hard" | "elite"
) {
  const pool = defaultAiTeams.filter((team) => team.difficulty === difficulty);
  return pool[Math.floor(Math.random() * pool.length)] ?? defaultAiTeams[0];
}

export function getRandomAiTeam(excludeTeamId?: string) {
  const pool = defaultAiTeams.filter((team) => team.id !== excludeTeamId);
  return pool[Math.floor(Math.random() * pool.length)] ?? defaultAiTeams[0];
}