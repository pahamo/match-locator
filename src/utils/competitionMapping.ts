/**
 * Competition ID to Slug Mapping Utilities
 * Centralized mapping between database competition IDs and slugs
 */

import { COMPETITION_CONFIGS } from '../config/competitions';

/**
 * Map competition ID to slug
 */
export function mapCompetitionIdToSlug(competitionId: number): string {
  // Find the competition config by ID
  const config = Object.values(COMPETITION_CONFIGS).find(c => c.id === competitionId);
  return config?.slug || 'unknown';
}

/**
 * Map competition slug to ID
 */
export function mapCompetitionSlugToId(slug: string): number | null {
  const config = COMPETITION_CONFIGS[slug];
  return config?.id || null;
}

/**
 * Map competition slug to display name
 */
export function mapCompetitionSlugToName(slug: string): string {
  const config = COMPETITION_CONFIGS[slug];
  return config?.name || slug.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

/**
 * Get all competition ID to slug mappings
 */
export function getAllCompetitionMappings(): Record<number, string> {
  const mappings: Record<number, string> = {};
  Object.values(COMPETITION_CONFIGS).forEach(config => {
    mappings[config.id] = config.slug;
  });
  return mappings;
}

/**
 * Legacy function for backward compatibility
 * This replaces the hardcoded logic in supabase.ts
 */
export function mapCompetitionIdToSlugLegacy(competitionId: number): string {
  switch (competitionId) {
    case 1:
      return 'premier-league';
    case 2:
      return 'champions-league';
    case 3:
      return 'bundesliga';
    case 4:
      return 'la-liga';
    case 5:
      return 'serie-a';
    case 6:
      return 'ligue-1';
    case 7:
      return 'europa-league';
    case 8:
      return 'fa-cup';
    case 9:
      return 'league-cup';
    default:
      return 'unknown';
  }
}