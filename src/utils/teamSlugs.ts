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
 * Normalize user input to canonical SEO slug
 */
export function normalizeTeamSlug(userSlug: string): string {
  const normalized = userSlug.toLowerCase().trim();
  return TEAM_VARIATIONS[normalized] || normalized;
}