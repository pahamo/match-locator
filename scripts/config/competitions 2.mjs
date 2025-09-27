/**
 * Competition Configuration
 * Central config for all supported football competitions
 */

export const COMPETITIONS = {
  // Premier League (Free Tier - Available)
  'premier-league': {
    id: 1,                           // Database competition_id
    fdId: 2021,                      // Football-Data.org API ID
    code: 'PL',                      // Football-Data.org code
    name: 'Premier League',
    slug: 'premier-league',
    shortName: 'EPL',
    country: 'England',
    countryCode: 'ENG',
    type: 'LEAGUE',
    teams: 20,
    rounds: 38,
    season: '2025',
    isActive: true,
    isProductionVisible: true,
    colors: {
      primary: '#37003c',
      secondary: '#00ff87'
    }
  },

  // Champions League (Free Tier - Available)
  'champions-league': {
    id: 2,
    fdId: 2001,
    code: 'CL',
    name: 'UEFA Champions League',
    slug: 'champions-league',
    shortName: 'UCL',
    country: 'Europe',
    countryCode: 'EU',
    type: 'CUP',
    teams: 36,
    rounds: null, // Variable knockout rounds
    season: '2025',
    isActive: true,
    isProductionVisible: true,
    colors: {
      primary: '#0d1c4b',
      secondary: '#ffffff'
    }
  },

  // Major European Leagues (Available on current API plan)
  'bundesliga': {
    id: 3,
    fdId: 2002,
    code: 'BL1',
    name: 'Bundesliga',
    slug: 'bundesliga',
    shortName: 'BUN',
    country: 'Germany',
    countryCode: 'DEU',
    type: 'LEAGUE',
    teams: 18,
    rounds: 34,
    season: '2025',
    isActive: true, // Available on current plan
    isProductionVisible: true,
    colors: {
      primary: '#d20515',
      secondary: '#000000'
    }
  },

  'la-liga': {
    id: 4,
    fdId: 2014,
    code: 'PD',
    name: 'La Liga',
    slug: 'la-liga',
    shortName: 'LAL',
    country: 'Spain',
    countryCode: 'ESP',
    type: 'LEAGUE',
    teams: 20,
    rounds: 38,
    season: '2025',
    isActive: true,
    isProductionVisible: true,
    colors: {
      primary: '#ee8707',
      secondary: '#ffffff'
    }
  },

  'serie-a': {
    id: 5,
    fdId: 2019,
    code: 'SA',
    name: 'Serie A',
    slug: 'serie-a',
    shortName: 'SER',
    country: 'Italy',
    countryCode: 'ITA',
    type: 'LEAGUE',
    teams: 20,
    rounds: 38,
    season: '2025',
    isActive: true,
    isProductionVisible: true,
    colors: {
      primary: '#004c99',
      secondary: '#ffffff'
    }
  },

  'ligue-1': {
    id: 6,
    fdId: 2015,
    code: 'FL1',
    name: 'Ligue 1',
    slug: 'ligue-1',
    shortName: 'L1',
    country: 'France',
    countryCode: 'FRA',
    type: 'LEAGUE',
    teams: 18,
    rounds: 34,
    season: '2025',
    isActive: true,
    isProductionVisible: true,
    colors: {
      primary: '#dae025',
      secondary: '#000000'
    }
  },

  // Additional European Leagues (Free Tier)
  'primeira-liga': {
    id: 7,
    fdId: 2017,
    code: 'PPL',
    name: 'Primeira Liga',
    slug: 'primeira-liga',
    shortName: 'POR',
    country: 'Portugal',
    countryCode: 'POR',
    type: 'LEAGUE',
    teams: 18,
    rounds: 34,
    season: '2025',
    isActive: true,
    isProductionVisible: true,
    colors: {
      primary: '#ff6b35',
      secondary: '#ffffff'
    }
  },

  'eredivisie': {
    id: 8,
    fdId: 2003,
    code: 'DED',
    name: 'Eredivisie',
    slug: 'eredivisie',
    shortName: 'ERE',
    country: 'Netherlands',
    countryCode: 'NLD',
    type: 'LEAGUE',
    teams: 18,
    rounds: 34,
    season: '2025',
    isActive: true,
    isProductionVisible: true,
    colors: {
      primary: '#ff6200',
      secondary: '#ffffff'
    }
  },

  'championship': {
    id: 9,
    fdId: 2016,
    code: 'ELC',
    name: 'Championship',
    slug: 'championship',
    shortName: 'CHA',
    country: 'England',
    countryCode: 'ENG',
    type: 'LEAGUE',
    teams: 24,
    rounds: 46,
    season: '2025',
    isActive: true,
    isProductionVisible: true,
    colors: {
      primary: '#1e3a8a',
      secondary: '#ffffff'
    }
  }
};

/**
 * Get competition config by slug
 */
export function getCompetition(slug) {
  return COMPETITIONS[slug] || null;
}

/**
 * Get all active competitions
 */
export function getActiveCompetitions() {
  return Object.values(COMPETITIONS).filter(comp => comp.isActive);
}

/**
 * Get production-visible competitions
 */
export function getProductionCompetitions() {
  return Object.values(COMPETITIONS).filter(comp => comp.isProductionVisible);
}

/**
 * Map Football-Data.org ID to our config
 */
export function getCompetitionByFdId(fdId) {
  return Object.values(COMPETITIONS).find(comp => comp.fdId === fdId) || null;
}