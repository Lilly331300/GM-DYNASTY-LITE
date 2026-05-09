export const brandAssets = {
  logo: "/assets/brand/gm-logo.png",
  mark: "/assets/brand/gm-logo-mark.png",
  goldLogo: "/assets/brand/gm-logo-gold.png",
};

export const landingAssets = {
  hero: {
    stadiumBg: "/assets/landing/hero/hero-stadium-bg.jpg",
    coachPlayers: "/assets/landing/hero/hero-coach-players.png",
    fieldGlow: "/assets/landing/hero/hero-field-glow.png",
    tunnel: "/assets/landing/hero/tunnel-entry.jpg",
  },
  sections: {
    franchisePreview: "/assets/landing/sections/franchise-card-preview.png",
    liveGamePreview: "/assets/landing/sections/live-game-preview.png",
    gamePlanPreview: "/assets/landing/sections/gameplan-preview.png",
    challengeHubPreview: "/assets/landing/sections/challenge-hub-preview.png",
    walletPreview: "/assets/landing/sections/wallet-preview.png",
  },
  players: {
    qb: "/assets/landing/players/landing-player-qb.png",
    rb: "/assets/landing/players/landing-player-rb.png",
    wr: "/assets/landing/players/landing-player-wr.png",
  },
  effects: {
    goldGlow: "/assets/landing/effects/gold-glow.png",
    smokeOverlay: "/assets/landing/effects/smoke-overlay.png",
    stadiumLights: "/assets/landing/effects/stadium-lights.png",
  },
};

export const teamAssets = {
  helmets: {
    default: "/assets/teams/helmets/default-helmet.png",
    kansasCityKings: "/assets/teams/helmets/default-helmet-kansas.png",
    dallasStorm: "/assets/teams/helmets/default-helmet-dallas.png",
    miamiSharks: "/assets/teams/helmets/default-helmet-miami.png",
    chicagoBruisers: "/assets/teams/helmets/default-helmet-chicago.png",
  },
  logos: {
    default: "/assets/teams/logos/default-logo.png",
    kansasCityKings: "/assets/teams/logos/kansas-city-kings-logo.png",
    dallasStorm: "/assets/teams/logos/dallas-storm-logo.png",
    miamiSharks: "/assets/teams/logos/miami-sharks-logo.png",
    chicagoBruisers: "/assets/teams/logos/chicago-bruisers-logo.png",
  },
  cards: {
    kansasCityKings: "/assets/teams/cards/kansas-city-kings-card.png",
    dallasStorm: "/assets/teams/cards/dallas-storm-card.png",
    miamiSharks: "/assets/teams/cards/miami-sharks-card.png",
    chicagoBruisers: "/assets/teams/cards/chicago-bruisers-card.png",
  },
};

export const playerAssets = {
  faces: {
    default: "/assets/players/faces/default-player.png",
    qb001: "/assets/players/faces/player-qb-001.png",
    rb001: "/assets/players/faces/player-rb-001.png",
    wr001: "/assets/players/faces/player-wr-001.png",
    cb001: "/assets/players/faces/player-cb-001.png",
    lb001: "/assets/players/faces/player-lb-001.png",
  },
};

export const stadiumAssets = {
  premiumNight: "/assets/stadiums/premium-night-stadium.jpg",
  trainingField: "/assets/stadiums/training-field.jpg",
  broadcastField: "/assets/stadiums/broadcast-field.jpg",
  tunnelEntry: "/assets/stadiums/tunnel-entry.jpg",
};

export const fieldAssets = {
  topView: "/assets/fields/field-top-view.png",
  perspective: "/assets/fields/field-perspective.png",
  redZone: "/assets/fields/red-zone-field.png",
};

export function getTeamHelmetSrc(team?: { helmetKey?: string }) {
  if (!team?.helmetKey) return teamAssets.helmets.default;

  return (
    teamAssets.helmets[team.helmetKey as keyof typeof teamAssets.helmets] ??
    teamAssets.helmets.default
  );
}

export function getTeamLogoSrc(team?: { logoKey?: string }) {
  if (!team?.logoKey) return teamAssets.logos.default;

  return (
    teamAssets.logos[team.logoKey as keyof typeof teamAssets.logos] ??
    teamAssets.logos.default
  );
}

export function getTeamCardSrc(team?: { cardKey?: string }) {
  if (!team?.cardKey) return teamAssets.cards.kansasCityKings;

  return (
    teamAssets.cards[team.cardKey as keyof typeof teamAssets.cards] ??
    teamAssets.cards.kansasCityKings
  );
}

export function getPlayerFaceSrc(player?: { faceKey?: string }) {
  if (!player?.faceKey) return playerAssets.faces.default;

  return (
    playerAssets.faces[player.faceKey as keyof typeof playerAssets.faces] ??
    playerAssets.faces.default
  );
}