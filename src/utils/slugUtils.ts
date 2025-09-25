import type { Team } from '../types';

/**
 * Get the current URL slug for a team, preferring url_slug over legacy slug
 */
export function getTeamUrlSlug(team: Team): string {
  return team.url_slug || team.slug;
}

/**
 * Check if a team matches a given slug (checking both url_slug and legacy slug)
 */
export function teamMatchesSlug(team: Team, slug: string): boolean {
  return team.url_slug === slug || team.slug === slug;
}

/**
 * Get the preferred slug for routing (url_slug if available, otherwise slug)
 */
export function getPreferredSlug(team: Team): string {
  return team.url_slug || team.slug;
}