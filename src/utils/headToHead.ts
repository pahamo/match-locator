/**
 * Utilities for Head-to-Head pages
 */

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
  return `/h2h/${canonicalSlug}`;
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
  const canonical = `${canonicalBase}/h2h/${canonicalSlug}`;

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
 * Enhanced H2H statistics interface
 */
export interface H2HStats {
  totalMatches: number;
  completedMatches: number;
  team1Wins: number;
  team2Wins: number;
  draws: number;
  team1Goals: number;
  team2Goals: number;
  team1HomeWins: number;
  team1AwayWins: number;
  team2HomeWins: number;
  team2AwayWins: number;
  homeDraws: number;
  awayDraws: number;
  averageGoalsPerGame: number;
  biggestWinMargin: number;
  mostGoalsInGame: number;
  lastMeetings: any[];
  recentForm: string[]; // Last 5 results from team1 perspective: ['W', 'L', 'D', 'W', 'L']
}

/**
 * Calculate enhanced H2H statistics from fixtures
 */
export function calculateH2HStats(fixtures: any[], team1Name: string, team2Name: string): H2HStats {
  const completedFixtures = fixtures.filter(f =>
    f.score && f.score.home !== null && f.score.away !== null
  );

  const stats: H2HStats = {
    totalMatches: fixtures.length,
    completedMatches: completedFixtures.length,
    team1Wins: 0,
    team2Wins: 0,
    draws: 0,
    team1Goals: 0,
    team2Goals: 0,
    team1HomeWins: 0,
    team1AwayWins: 0,
    team2HomeWins: 0,
    team2AwayWins: 0,
    homeDraws: 0,
    awayDraws: 0,
    averageGoalsPerGame: 0,
    biggestWinMargin: 0,
    mostGoalsInGame: 0,
    lastMeetings: fixtures.slice(0, 5),
    recentForm: []
  };

  let totalGoals = 0;
  const recentResults: string[] = [];

  completedFixtures.forEach(fixture => {
    const homeScore = fixture.score.home;
    const awayScore = fixture.score.away;
    const gameGoals = homeScore + awayScore;
    const winMargin = Math.abs(homeScore - awayScore);

    totalGoals += gameGoals;

    // Track biggest win and highest scoring game
    if (winMargin > stats.biggestWinMargin) {
      stats.biggestWinMargin = winMargin;
    }
    if (gameGoals > stats.mostGoalsInGame) {
      stats.mostGoalsInGame = gameGoals;
    }

    // Determine which team was home/away
    const isTeam1Home = fixture.home.name === team1Name;

    if (isTeam1Home) {
      stats.team1Goals += homeScore;
      stats.team2Goals += awayScore;

      if (homeScore > awayScore) {
        stats.team1Wins++;
        stats.team1HomeWins++;
        recentResults.unshift('W'); // Add to front for chronological order
      } else if (homeScore < awayScore) {
        stats.team2Wins++;
        stats.team2AwayWins++;
        recentResults.unshift('L');
      } else {
        stats.draws++;
        stats.homeDraws++;
        recentResults.unshift('D');
      }
    } else {
      stats.team1Goals += awayScore;
      stats.team2Goals += homeScore;

      if (awayScore > homeScore) {
        stats.team1Wins++;
        stats.team1AwayWins++;
        recentResults.unshift('W');
      } else if (awayScore < homeScore) {
        stats.team2Wins++;
        stats.team2HomeWins++;
        recentResults.unshift('L');
      } else {
        stats.draws++;
        stats.awayDraws++;
        recentResults.unshift('D');
      }
    }
  });

  // Calculate averages
  if (completedFixtures.length > 0) {
    stats.averageGoalsPerGame = Math.round((totalGoals / completedFixtures.length) * 10) / 10;
  }

  // Keep only last 5 results for recent form
  stats.recentForm = recentResults.slice(0, 5);

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