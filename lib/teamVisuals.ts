import { type StoredFranchiseTeam } from "@/lib/gameHub";
import { type AiTeamTemplate } from "@/lib/defaultAiTeams";

export type TeamVisualIdentity = {
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
};

export type VisualTeam = Partial<StoredFranchiseTeam | AiTeamTemplate> & {
  id?: string;
  city?: string;
  nickname?: string;
  name?: string;
  abbreviation?: string;
  primaryColor?: string;
  secondaryColor?: string;
  helmetAssetPath?: string;
  logoAssetPath?: string;
  cardAssetPath?: string;
  logoUrl?: string;
  helmetUrl?: string;
  overallRating?: number;
  offensiveRating?: number;
  defensiveRating?: number;
  specialTeamsRating?: number;
  visualIdentity?: TeamVisualIdentity;
};

export type TeamVisualKey =
  | "memphis"
  | "kansas"
  | "dallas"
  | "miami"
  | "chicago"
  | "ai_dastardly_devils"
  | "ai_vikings"
  | "ai_wolves"
  | "ai_wemmers"
  | "ai_raiders"
  | "ai_incredibles"
  | "ai_apocalypse"
  | "ai_sea_devils"
  | "ai_jokers"
  | "ai_titans"
  | "fallback";

type UserTeamVisualKey =
  | "memphis"
  | "kansas"
  | "dallas"
  | "miami"
  | "chicago"
  | "fallback";

type AiTeamVisualKey =
  | "ai_dastardly_devils"
  | "ai_vikings"
  | "ai_wolves"
  | "ai_wemmers"
  | "ai_raiders"
  | "ai_incredibles"
  | "ai_apocalypse"
  | "ai_sea_devils"
  | "ai_jokers"
  | "ai_titans";

export const teamVisualAssets = {
  helmets: {
    memphis: "/assets/dashboard/primary-franchise-helmet.png",
    kansas: "/assets/teams/helmets/default-helmet-kansas.png",
    dallas: "/assets/teams/helmets/default-helmet-dallas.png",
    miami: "/assets/teams/helmets/default-helmet-miami.png",
    chicago: "/assets/teams/helmets/default-helmet-chicago.png",

    ai_dastardly_devils: "/assets/teams/helmets/ai/ai_dastardly_devils.png",
    ai_vikings: "/assets/teams/helmets/ai/ai_vikings.png",
    ai_wolves: "/assets/teams/helmets/ai/ai_wolves.png",
    ai_wemmers: "/assets/teams/helmets/ai/ai_wemmers.png",
    ai_raiders: "/assets/teams/helmets/ai/ai_raiders.png",
    ai_incredibles: "/assets/teams/helmets/ai/ai_incredibles.png",
    ai_apocalypse: "/assets/teams/helmets/ai/ai_apocalypse.png",
    ai_sea_devils: "/assets/teams/helmets/ai/ai_sea_devils.png",
    ai_jokers: "/assets/teams/helmets/ai/ai_jokers.png",
    ai_titans: "/assets/teams/helmets/ai/ai_titans.png",

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

  backgrounds: {
    field: "/assets/dashboard/dashboard-field-bg.jpg",
    stadiumFlare: "/assets/dashboard/dashboard-stadium-flare.png",
    commandCenter: "/assets/dashboard/command-center-bg.jpg",
  },

  builder: {
    baseHelmet: "/assets/franchise-builder/helmets/base-white-helmet.png",
    helmetGlow: "/assets/franchise-builder/helmets/helmet-shadow-glow.png",
    defaultCard: "/assets/franchise-builder/cards/card-bg-premium-city.png",
    defaultLogo: "/assets/franchise-builder/logos/bulldog.png",
  },
};

export function getTeamDisplayName(team?: VisualTeam) {
  if (!team) return "Unknown Team";

  const city = team.city?.trim();
  const nickname = team.nickname?.trim();

  if (city && nickname) return `${city} ${nickname}`;

  return team.name ?? nickname ?? city ?? "Unknown Team";
}

export function getTeamInitials(team?: VisualTeam) {
  if (!team) return "GM";

  const abbreviation = team.abbreviation?.trim();

  if (abbreviation) return abbreviation.slice(0, 3).toUpperCase();

  return getTeamDisplayName(team)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function isAiTeamVisualKey(key: TeamVisualKey): key is AiTeamVisualKey {
  return (
    key === "ai_dastardly_devils" ||
    key === "ai_vikings" ||
    key === "ai_wolves" ||
    key === "ai_wemmers" ||
    key === "ai_raiders" ||
    key === "ai_incredibles" ||
    key === "ai_apocalypse" ||
    key === "ai_sea_devils" ||
    key === "ai_jokers" ||
    key === "ai_titans"
  );
}

function isUserTeamVisualKey(key: TeamVisualKey): key is UserTeamVisualKey {
  return (
    key === "memphis" ||
    key === "kansas" ||
    key === "dallas" ||
    key === "miami" ||
    key === "chicago" ||
    key === "fallback"
  );
}

export function hasCustomVisualIdentity(team?: VisualTeam) {
  return Boolean(
    team?.visualIdentity?.helmetBaseSrc &&
      team?.visualIdentity?.logoSrc &&
      team?.visualIdentity?.primaryColor
  );
}

export function getTeamVisualKey(team?: VisualTeam): TeamVisualKey {
  const id = String(team?.id ?? "").toLowerCase();

  if (id === "ai_dastardly_devils") return "ai_dastardly_devils";
  if (id === "ai_vikings") return "ai_vikings";
  if (id === "ai_wolves") return "ai_wolves";
  if (id === "ai_wemmers") return "ai_wemmers";
  if (id === "ai_raiders") return "ai_raiders";
  if (id === "ai_incredibles") return "ai_incredibles";
  if (id === "ai_apocalypse") return "ai_apocalypse";
  if (id === "ai_sea_devils") return "ai_sea_devils";
  if (id === "ai_jokers") return "ai_jokers";
  if (id === "ai_titans") return "ai_titans";

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

  if (
    text.includes("kansas") ||
    text.includes("king") ||
    text.includes("fighter")
  ) {
    return "kansas";
  }

  if (text.includes("dallas") || text.includes("storm")) return "dallas";
  if (text.includes("miami") || text.includes("shark")) return "miami";
  if (text.includes("chicago") || text.includes("bruiser")) return "chicago";

  return "fallback";
}

export function getTeamHelmetSrc(team?: VisualTeam) {
  if (team?.visualIdentity?.helmetBaseSrc) {
    return team.visualIdentity.helmetBaseSrc;
  }

  if (team?.helmetAssetPath) return team.helmetAssetPath;
  if (team?.helmetUrl) return team.helmetUrl;

  const key = getTeamVisualKey(team);

  return teamVisualAssets.helmets[key] ?? teamVisualAssets.helmets.fallback;
}

export function getTeamLogoSrc(team?: VisualTeam) {
  if (team?.visualIdentity?.customLogoDataUrl) {
    return team.visualIdentity.customLogoDataUrl;
  }

  if (team?.visualIdentity?.logoSrc) {
    return team.visualIdentity.logoSrc;
  }

  if (team?.logoAssetPath) return team.logoAssetPath;
  if (team?.logoUrl) return team.logoUrl;

  return teamVisualAssets.builder.defaultLogo;
}

export function getTeamCardSrc(team?: VisualTeam) {
  if (team?.visualIdentity?.cardBgSrc) {
    return team.visualIdentity.cardBgSrc;
  }

  if (team?.cardAssetPath) return team.cardAssetPath;

  const key = getTeamVisualKey(team);

  if (isAiTeamVisualKey(key)) {
    return teamVisualAssets.backgrounds.field;
  }

  if (isUserTeamVisualKey(key)) {
    return teamVisualAssets.cards[key] ?? teamVisualAssets.cards.fallback;
  }

  return teamVisualAssets.cards.fallback;
}

export function getTeamColorStyle(team?: VisualTeam) {
  return {
    background: `linear-gradient(135deg, ${
      team?.visualIdentity?.primaryColor ?? team?.primaryColor ?? "#F5C542"
    }, ${team?.visualIdentity?.secondaryColor ?? team?.secondaryColor ?? "#16283A"})`,
  };
}

export function getTeamPrimaryColor(team?: VisualTeam) {
  return team?.visualIdentity?.primaryColor ?? team?.primaryColor ?? "#F5C542";
}

export function getTeamSecondaryColor(team?: VisualTeam) {
  return team?.visualIdentity?.secondaryColor ?? team?.secondaryColor ?? "#16283A";
}

export function getTeamBorderColor(team?: VisualTeam) {
  return getTeamPrimaryColor(team);
}