import type { Team } from '../types';

/**
 * Get the slug for a team (consolidated single slug system after Phase 3)
 */
export function getTeamUrlSlug(team: Team): string {
  return team.slug;
}

/**
 * Check if a team matches a given slug (single slug system after Phase 3)
 */
export function teamMatchesSlug(team: Team, slug: string): boolean {
  return team.slug === slug;
}

/**
 * Get the slug for routing (consolidated single slug system after Phase 3)
 */
export function getPreferredSlug(team: Team): string {
  return team.slug;
}