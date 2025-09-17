/**
 * Utilities for Head-to-Head pages
 */

// Import SEO-friendly team slug utilities
import { normalizeTeamSlug, mapSeoSlugToDbSlug } from './teamSlugs';

export interface TeamPair {
  team1Slug: string;
  team2Slug: string;
}

/**
 * Parse H2H URL slug and return team slugs
 * Handles: arsenal-vs-chelsea or chelsea-vs-arsenal
 */
export function parseH2HSlug(slug: string): TeamPair | null {
  if (!slug) return null;

  const parts = slug.split('-vs-');
  if (parts.length !== 2) return null;

  const team1Slug = parts[0].trim();
  const team2Slug = parts[1].trim();

  if (!team1Slug || !team2Slug) return null;

  return {
    team1Slug,
    team2Slug
  };
}

/**
 * Generate canonical H2H URL (alphabetical order)
 * Example: chelsea-vs-arsenal becomes arsenal-vs-chelsea
 */
export function generateCanonicalH2HSlug(team1Slug: string, team2Slug: string): string {
  const slugs = [team1Slug, team2Slug].sort();
  return `${slugs[0]}-vs-${slugs[1]}`;
}

/**
 * Check if H2H URL needs redirect to canonical form
 */
export function needsCanonicalRedirect(currentSlug: string): string | null {
  const parsed = parseH2HSlug(currentSlug);
  if (!parsed) return null;

  const canonical = generateCanonicalH2HSlug(parsed.team1Slug, parsed.team2Slug);

  return currentSlug !== canonical ? canonical : null;
}

/**
 * Generate H2H page URL
 */
export function generateH2HUrl(team1Slug: string, team2Slug: string): string {
  const canonicalSlug = generateCanonicalH2HSlug(team1Slug, team2Slug);
  return `/fixtures/${canonicalSlug}`;
}

/**
 * Generate H2H SEO meta tags
 */
export function generateH2HMeta(team1Name: string, team2Name: string, fixtureCount: number = 0) {
  const canonicalSlug = generateCanonicalH2HSlug(
    team1Name.toLowerCase().replace(/\s+/g, '-'),
    team2Name.toLowerCase().replace(/\s+/g, '-')
  );

  const currentYear = new Date().getFullYear();
  const season = `${currentYear}/${(currentYear + 1).toString().slice(-2)}`;

  const title = `${team1Name} vs ${team2Name} Fixtures ${season} - TV Schedule | Match Locator`;
  const description = `All ${team1Name} vs ${team2Name} fixtures with UK TV info. Find out when and where to watch the matches.${fixtureCount > 0 ? ` ${fixtureCount} fixtures this season.` : ''}`;

  const canonicalBase = process.env.REACT_APP_CANONICAL_BASE || 'https://matchlocator.com';
  const canonical = `${canonicalBase}/fixtures/${canonicalSlug}`;

  return {
    title,
    description,
    canonical,
    ogTitle: `${team1Name} vs ${team2Name} Fixtures ${season}`,
    ogDescription: description,
    ogImage: `${canonicalBase}/og-h2h-${canonicalSlug}.jpg`
  };
}

/**
 * Clean team name for display (capitalize properly)
 */
export function cleanTeamNameForDisplay(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Calculate H2H statistics from fixtures
 */
export function calculateH2HStats(fixtures: any[], team1Name: string, team2Name: string) {
  const stats = {
    totalMatches: fixtures.length,
    team1Wins: 0,
    team2Wins: 0,
    draws: 0,
    team1Goals: 0,
    team2Goals: 0,
    lastMeetings: fixtures.slice(0, 5) // Most recent 5
  };

  fixtures.forEach(fixture => {
    // Only count finished matches for stats
    if (!fixture.score || fixture.score.home === null || fixture.score.away === null) {
      return;
    }

    const homeScore = fixture.score.home;
    const awayScore = fixture.score.away;

    // Determine which team was home/away
    const isTeam1Home = fixture.home.name === team1Name;

    if (isTeam1Home) {
      stats.team1Goals += homeScore;
      stats.team2Goals += awayScore;

      if (homeScore > awayScore) {
        stats.team1Wins++;
      } else if (homeScore < awayScore) {
        stats.team2Wins++;
      } else {
        stats.draws++;
      }
    } else {
      stats.team1Goals += awayScore;
      stats.team2Goals += homeScore;

      if (awayScore > homeScore) {
        stats.team1Wins++;
      } else if (awayScore < homeScore) {
        stats.team2Wins++;
      } else {
        stats.draws++;
      }
    }
  });

  return stats;
}

/**
 * Top team combinations for static generation (based on Premier League popularity)
 */
export const TOP_TEAM_COMBINATIONS = [
  ['arsenal', 'chelsea'],
  ['arsenal', 'manchester-united'],
  ['arsenal', 'tottenham-hotspur'],
  ['arsenal', 'liverpool'],
  ['arsenal', 'manchester-city'],
  ['chelsea', 'manchester-united'],
  ['chelsea', 'tottenham-hotspur'],
  ['chelsea', 'liverpool'],
  ['chelsea', 'manchester-city'],
  ['manchester-united', 'manchester-city'],
  ['manchester-united', 'liverpool'],
  ['manchester-united', 'tottenham-hotspur'],
  ['manchester-city', 'liverpool'],
  ['manchester-city', 'tottenham-hotspur'],
  ['liverpool', 'tottenham-hotspur'],
  ['arsenal', 'newcastle-united'],
  ['chelsea', 'newcastle-united'],
  ['manchester-united', 'newcastle-united'],
  ['liverpool', 'newcastle-united'],
  ['arsenal', 'west-ham-united'],
  ['chelsea', 'west-ham-united'],
  ['arsenal', 'aston-villa'],
  ['chelsea', 'aston-villa'],
  ['manchester-united', 'aston-villa'],
  ['liverpool', 'brighton-hove-albion'],
  ['arsenal', 'brighton-hove-albion'],
  ['chelsea', 'brighton-hove-albion'],
  ['manchester-city', 'brighton-hove-albion'],
  ['arsenal', 'crystal-palace'],
  ['chelsea', 'crystal-palace'],
  ['manchester-united', 'crystal-palace'],
  ['tottenham-hotspur', 'crystal-palace'],
  ['arsenal', 'leicester-city'],
  ['chelsea', 'leicester-city'],
  ['manchester-united', 'leicester-city'],
  ['liverpool', 'leicester-city'],
  ['arsenal', 'everton'],
  ['chelsea', 'everton'],
  ['manchester-united', 'everton'],
  ['liverpool', 'everton'],
  ['manchester-city', 'everton'],
  ['tottenham-hotspur', 'everton'],
  ['arsenal', 'wolverhampton-wanderers'],
  ['chelsea', 'wolverhampton-wanderers'],
  ['manchester-united', 'wolverhampton-wanderers'],
  ['liverpool', 'wolverhampton-wanderers'],
  ['manchester-city', 'wolverhampton-wanderers'],
  ['tottenham-hotspur', 'wolverhampton-wanderers'],
  ['arsenal', 'nottingham-forest'],
  ['chelsea', 'nottingham-forest'],
  ['manchester-united', 'nottingham-forest']
].map(([team1, team2]) => generateCanonicalH2HSlug(team1, team2));