/**
 * SEO-friendly team slug utilities
 * Generates slugs that match how users actually search for teams
 */

/**
 * Generate SEO-friendly team slug from team name
 * Removes FC/AFC suffixes and follows SEO best practices
 */
export function generateSeoTeamSlug(teamName: string): string {
  let slug = teamName.toLowerCase().trim();

  // Remove common suffixes that users don't search for
  slug = slug
    .replace(/\s+(fc|f\.c\.)$/i, '') // Remove FC/F.C. at end
    .replace(/\s+afc$/i, '') // Remove AFC at end (except for AFC Bournemouth)
    .replace(/\s+football club$/i, '') // Remove "Football Club"
    .replace(/\s+association football club$/i, ''); // Remove "Association Football Club"

  // Special cases to preserve
  if (teamName.toLowerCase().includes('afc bournemouth')) {
    slug = 'afc-bournemouth';
  }

  // Handle specific team naming rules
  const nameHandlers: Record<string, string> = {
    'west ham united': 'west-ham',
    'tottenham hotspur': 'tottenham-hotspur', // Keep both words
    'crystal palace': 'crystal-palace', // Keep both words
    'brighton & hove albion': 'brighton-hove-albion',
    'wolverhampton wanderers': 'wolverhampton-wanderers',
    'nottingham forest': 'nottingham-forest',
    'sheffield united': 'sheffield-united'
  };

  if (nameHandlers[slug]) {
    slug = nameHandlers[slug];
  }

  // Standard slug formatting
  return slug
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Map SEO-friendly slug to database slug
 * Database slugs have -fc suffix, SEO slugs don't
 */
export function mapSeoSlugToDbSlug(seoSlug: string): string {
  // Direct mappings for teams that don't follow the simple +fc rule
  const specialMappings: Record<string, string> = {
    'afc-bournemouth': 'afc-bournemouth-fc',
    'west-ham': 'west-ham-united-fc',
    'brighton-hove-albion': 'brighton-hove-albion-fc',
    'wolverhampton-wanderers': 'wolverhampton-wanderers-fc',
    'nottingham-forest': 'nottingham-forest-fc',
    'sheffield-united': 'sheffield-united-fc',
    'leicester-city': 'leicester-city-fc'
  };

  if (specialMappings[seoSlug]) {
    return specialMappings[seoSlug];
  }

  // For most teams, just add -fc suffix
  return `${seoSlug}-fc`;
}

/**
 * Map database slug back to SEO-friendly slug
 */
export function mapDbSlugToSeoSlug(dbSlug: string): string {
  // Remove -fc suffix if present
  const seoSlug = dbSlug.replace(/-fc$/, '');

  // Handle special cases that need different SEO slugs
  const specialReverseMappings: Record<string, string> = {
    'west-ham-united': 'west-ham',
    'afc-bournemouth': 'afc-bournemouth' // Keep AFC for Bournemouth
  };

  return specialReverseMappings[seoSlug] || seoSlug;
}

/**
 * Premier League teams with their SEO-friendly slugs
 * Used for static generation and validation
 */
export const PREMIER_LEAGUE_TEAMS = [
  { name: 'Arsenal', seoSlug: 'arsenal', dbSlug: 'arsenal-fc' },
  { name: 'Liverpool', seoSlug: 'liverpool', dbSlug: 'liverpool-fc' },
  { name: 'Chelsea', seoSlug: 'chelsea', dbSlug: 'chelsea-fc' },
  { name: 'Manchester United', seoSlug: 'manchester-united', dbSlug: 'manchester-united-fc' },
  { name: 'Manchester City', seoSlug: 'manchester-city', dbSlug: 'manchester-city-fc' },
  { name: 'Tottenham Hotspur', seoSlug: 'tottenham-hotspur', dbSlug: 'tottenham-hotspur-fc' },
  { name: 'Newcastle United', seoSlug: 'newcastle-united', dbSlug: 'newcastle-united-fc' },
  { name: 'Brighton & Hove Albion', seoSlug: 'brighton-hove-albion', dbSlug: 'brighton-hove-albion-fc' },
  { name: 'West Ham United', seoSlug: 'west-ham', dbSlug: 'west-ham-united-fc' },
  { name: 'Aston Villa', seoSlug: 'aston-villa', dbSlug: 'aston-villa-fc' },
  { name: 'Crystal Palace', seoSlug: 'crystal-palace', dbSlug: 'crystal-palace-fc' },
  { name: 'Everton', seoSlug: 'everton', dbSlug: 'everton-fc' }
];

/**
 * Common team name variations that users might type in URLs
 */
export const TEAM_VARIATIONS: Record<string, string> = {
  // Common abbreviations
  'man-city': 'manchester-city',
  'man-utd': 'manchester-united',
  'man-united': 'manchester-united',
  'spurs': 'tottenham-hotspur',
  'tottenham': 'tottenham-hotspur',
  'newcastle': 'newcastle-united',
  'wolves': 'wolverhampton-wanderers',
  'brighton': 'brighton-hove-albion',
  'palace': 'crystal-palace',
  'leicester': 'leicester-city',
  'west-ham-united': 'west-ham',
  'nottm-forest': 'nottingham-forest',
  'sheffield-utd': 'sheffield-united'
};

/**
 * SIMPLIFIED: All team variations map to canonical slugs
 * Supports common names, abbreviations, and database variations
 */
export const ALL_TEAM_MAPPINGS: Record<string, string> = {
  // === PREMIER LEAGUE TEAMS ===
  // Arsenal
  'arsenal': 'arsenal',
  'arsenal-fc': 'arsenal',

  // Liverpool
  'liverpool': 'liverpool',
  'liverpool-fc': 'liverpool',

  // Chelsea
  'chelsea': 'chelsea',
  'chelsea-fc': 'chelsea',

  // Manchester United
  'manchester-united': 'manchester-united',
  'manchester-united-fc': 'manchester-united',
  'man-united': 'manchester-united',
  'man-utd': 'manchester-united',

  // Manchester City
  'manchester-city': 'manchester-city',
  'manchester-city-fc': 'manchester-city',
  'man-city': 'manchester-city',

  // Tottenham
  'tottenham-hotspur': 'tottenham-hotspur',
  'tottenham-hotspur-fc': 'tottenham-hotspur',
  'tottenham': 'tottenham-hotspur',
  'spurs': 'tottenham-hotspur',

  // Newcastle
  'newcastle-united': 'newcastle-united',
  'newcastle-united-fc': 'newcastle-united',
  'newcastle': 'newcastle-united',

  // Brighton
  'brighton-hove-albion': 'brighton-hove-albion',
  'brighton-hove-albion-fc': 'brighton-hove-albion',
  'brighton': 'brighton-hove-albion',

  // West Ham
  'west-ham': 'west-ham',
  'west-ham-united': 'west-ham',
  'west-ham-united-fc': 'west-ham',

  // Aston Villa
  'aston-villa': 'aston-villa',
  'aston-villa-fc': 'aston-villa',

  // AFC Bournemouth
  'afc-bournemouth': 'afc-bournemouth',
  'afc-bournemouth-fc': 'afc-bournemouth',
  'bournemouth': 'afc-bournemouth',

  // Crystal Palace
  'crystal-palace': 'crystal-palace',
  'crystal-palace-fc': 'crystal-palace',
  'palace': 'crystal-palace',

  // Everton
  'everton': 'everton',
  'everton-fc': 'everton',

  // Brentford
  'brentford': 'brentford',
  'brentford-fc': 'brentford',

  // Burnley (relegated but keeping for legacy H2H links)
  'burnley': 'burnley',
  'burnley-fc': 'burnley',

  // Fulham
  'fulham': 'fulham',
  'fulham-fc': 'fulham',

  // Ipswich Town
  'ipswich-town': 'ipswich-town',
  'ipswich-town-fc': 'ipswich-town',
  'ipswich': 'ipswich-town',

  // Leicester City
  'leicester-city': 'leicester-city',
  'leicester-city-fc': 'leicester-city',
  'leicester': 'leicester-city',

  // Nottingham Forest
  'nottingham-forest': 'nottingham-forest',
  'nottingham-forest-fc': 'nottingham-forest',
  'nottm-forest': 'nottingham-forest',

  // Southampton
  'southampton': 'southampton',
  'southampton-fc': 'southampton',

  // Wolverhampton Wanderers
  'wolverhampton-wanderers': 'wolverhampton-wanderers',
  'wolverhampton-wanderers-fc': 'wolverhampton-wanderers',
  'wolves': 'wolverhampton-wanderers',

  // === CHAMPIONS LEAGUE TEAMS (Common names first) ===
  // Spanish teams
  'real-madrid': 'real-madrid',
  'real-madrid-cf': 'real-madrid',
  'madrid': 'real-madrid',

  'barcelona': 'barcelona',
  'fc-barcelona': 'barcelona',
  'barca': 'barcelona',

  'atletico-madrid': 'atletico-madrid',
  'club-atletico-de-madrid': 'atletico-madrid',
  'atletico': 'atletico-madrid',

  'athletic-bilbao': 'athletic-bilbao',
  'athletic-club': 'athletic-bilbao',

  // German teams
  'bayern-munich': 'bayern-munich',
  'fc-bayern-munchen': 'bayern-munich',
  'bayern': 'bayern-munich',

  'borussia-dortmund': 'borussia-dortmund',
  'dortmund': 'borussia-dortmund',
  'bvb': 'borussia-dortmund',

  'bayer-leverkusen': 'bayer-leverkusen',
  'bayer-04-leverkusen': 'bayer-leverkusen',
  'leverkusen': 'bayer-leverkusen',

  'rb-leipzig': 'rb-leipzig',
  'leipzig': 'rb-leipzig',

  // Italian teams
  'juventus': 'juventus',
  'juventus-fc': 'juventus',
  'juve': 'juventus',

  'ac-milan': 'ac-milan',
  'milan': 'ac-milan',

  'inter-milan': 'inter-milan',
  'fc-internazionale-milano': 'inter-milan',
  'inter': 'inter-milan',

  'napoli': 'napoli',
  'ssc-napoli': 'napoli',

  'atalanta': 'atalanta',
  'atalanta-bc': 'atalanta',

  'roma': 'roma',
  'as-roma': 'roma',

  'lazio': 'lazio',
  'ss-lazio': 'lazio',

  // French teams
  'psg': 'psg',
  'paris-saint-germain': 'psg',
  'paris-saint-germain-fc': 'psg',
  'paris-sg': 'psg',

  'monaco': 'monaco',
  'as-monaco': 'monaco',
  'as-monaco-fc': 'monaco',

  'lille': 'lille',
  'lille-osc': 'lille',

  'lyon': 'lyon',
  'olympique-lyonnais': 'lyon',
  'ol': 'lyon',

  'marseille': 'marseille',
  'olympique-de-marseille': 'marseille',
  'om': 'marseille',

  // Dutch teams
  'ajax': 'ajax',
  'afc-ajax': 'ajax',

  'psv': 'psv',
  'psv-eindhoven': 'psv',

  'feyenoord': 'feyenoord',

  // Portuguese teams
  'porto': 'porto',
  'fc-porto': 'porto',

  'benfica': 'benfica',
  'sl-benfica': 'benfica',

  'sporting': 'sporting',
  'sporting-cp': 'sporting',
  'sporting-clube-de-portugal': 'sporting',

  // Other European teams
  'red-bull-salzburg': 'red-bull-salzburg',
  'fc-red-bull-salzburg': 'red-bull-salzburg',
  'salzburg': 'red-bull-salzburg',

  'dinamo-zagreb': 'dinamo-zagreb',
  'gnk-dinamo-zagreb': 'dinamo-zagreb',
  'zagreb': 'dinamo-zagreb',

  'shakhtar-donetsk': 'shakhtar-donetsk',
  'fc-shakhtar-donetsk': 'shakhtar-donetsk',
  'shakhtar': 'shakhtar-donetsk',

  'celtic': 'celtic',
  'celtic-fc': 'celtic',

  'rangers': 'rangers',
  'rangers-fc': 'rangers',
};

/**
 * SIMPLIFIED: Get canonical team slug from any variation
 */
export function getCanonicalTeamSlug(teamName: string): string {
  // Convert team name to lowercase slug format
  const slug = teamName.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // Return canonical mapping or the slug itself
  return ALL_TEAM_MAPPINGS[slug] || slug;
}

/**
 * Check if a team is supported (EPL or UCL)
 */
export function isSupportedTeam(teamSlug: string): boolean {
  const canonical = getCanonicalTeamSlug(teamSlug);
  return !!ALL_TEAM_MAPPINGS[canonical] || !!ALL_TEAM_MAPPINGS[teamSlug];
}

/**
 * Get database slug for a team (for backwards compatibility)
 */
export function getDbSlugForTeam(teamSlug: string): string {
  const canonical = getCanonicalTeamSlug(teamSlug);

  // Premier League teams need -fc suffix for database
  const plTeams = [
    'arsenal', 'liverpool', 'chelsea', 'manchester-united', 'manchester-city',
    'tottenham-hotspur', 'newcastle-united', 'brighton-hove-albion', 'west-ham',
    'aston-villa', 'afc-bournemouth', 'crystal-palace', 'everton', 'brentford',
    'fulham', 'ipswich-town', 'leicester-city', 'nottingham-forest',
    'southampton', 'wolverhampton-wanderers'
  ];

  if (plTeams.includes(canonical)) {
    // Special cases for Premier League
    if (canonical === 'west-ham') return 'west-ham-united-fc';
    if (canonical === 'afc-bournemouth') return 'afc-bournemouth-fc';
    return `${canonical}-fc`;
  }

  // Champions League teams use canonical names as database slugs
  return canonical;
}

/**
 * Legacy compatibility functions
 */
export function mapSeoSlugToDbSlugEnhanced(seoSlug: string): string {
  return getDbSlugForTeam(seoSlug);
}

export function normalizeTeamSlug(userSlug: string): string {
  return getCanonicalTeamSlug(userSlug);
}