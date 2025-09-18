import type { Fixture, SimpleFixture } from '../types';
import { generateCleanSlug } from './seo';
import { mapCompetitionIdToSlug } from './competitionMapping';

// UK-relevant competitions that should have H2H pages
const UK_RELEVANT_COMPETITIONS = [
  'premier-league',
  'champions-league', // ✅ ACTIVATED: Full international team mapping support
  // TODO: Add other competitions when team mapping is expanded
  // 'europa-league',
  // 'championship',
  // 'fa-cup',
  // 'carabao-cup',
  // 'league-cup',
  // 'europa-conference-league'
];

// Big teams that warrant pages even in other leagues
const BIG_TEAMS = [
  'manchester-united', 'liverpool', 'arsenal', 'chelsea',
  'manchester-city', 'tottenham', 'barcelona', 'real-madrid',
  'bayern-munich', 'paris-saint-germain', 'juventus', 'ac-milan',
  'inter-milan', 'atletico-madrid', 'borussia-dortmund'
];

/**
 * Calculate days until a match
 */
function getDaysUntil(kickoffUtc: string): number {
  const now = new Date();
  const kickoff = new Date(kickoffUtc);

  // Check if the date is valid
  if (isNaN(kickoff.getTime())) {
    console.warn(`Invalid date format: ${kickoffUtc}`);
    return 0; // Default to 0 days if date is invalid
  }

  const diffTime = kickoff.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if a fixture has confirmed UK broadcaster (not TBC or empty)
 */
function hasConfirmedBroadcaster(fixture: Fixture | SimpleFixture): boolean {
  if ('providers_uk' in fixture) {
    // Full Fixture type
    return fixture.providers_uk && fixture.providers_uk.length > 0;
  } else {
    // SimpleFixture type
    return fixture.broadcaster !== null &&
           fixture.broadcaster !== undefined &&
           fixture.broadcaster !== 'TBC' &&
           fixture.broadcaster.trim() !== '';
  }
}


/**
 * Get competition slug from fixture
 */
function getCompetitionSlug(fixture: Fixture | SimpleFixture): string {
  if ('competition_id' in fixture && fixture.competition_id) {
    return mapCompetitionIdToSlug(fixture.competition_id);
  }
  return 'unknown';
}

/**
 * Check if home or away team is a "big team" that warrants individual pages
 */
function hasBigTeam(fixture: Fixture | SimpleFixture): boolean {
  let homeTeam: string;
  let awayTeam: string;

  if ('home' in fixture) {
    // Full Fixture type
    homeTeam = fixture.home.name;
    awayTeam = fixture.away.name;
  } else {
    // SimpleFixture type
    homeTeam = fixture.home_team;
    awayTeam = fixture.away_team;
  }

  const homeSlug = generateCleanSlug(homeTeam);
  const awaySlug = generateCleanSlug(awayTeam);

  return BIG_TEAMS.includes(homeSlug) || BIG_TEAMS.includes(awaySlug);
}

/**
 * Determine if we should create an H2H page for this fixture
 *
 * UPDATED FOR H2H ARCHITECTURE: Now creates H2H pages instead of individual match pages.
 * H2H pages provide value even for blackout matches (historical stats, future fixtures).
 */
export function shouldCreateMatchPage(fixture: Fixture | SimpleFixture): boolean {
  // 1. Check competition relevance
  const competitionSlug = getCompetitionSlug(fixture);
  const isUKRelevant = UK_RELEVANT_COMPETITIONS.includes(competitionSlug);
  const hasPopularTeams = hasBigTeam(fixture);

  if (!isUKRelevant && !hasPopularTeams) {
    return false; // Don't create H2H page for random foreign league matches
  }

  // 2. Must be within reasonable timeframe
  const daysUntilMatch = getDaysUntil(fixture.kickoff_utc);
  if (daysUntilMatch > 30 || daysUntilMatch < -7) {
    return false; // Don't create page for matches too far in future or past
  }

  // 3. H2H pages are valuable for UK-relevant competitions even without broadcaster
  if (isUKRelevant) {
    // Allow H2H pages for UK competitions (Premier League, etc.) regardless of broadcast status
    // This includes blackout matches - users still want to see H2H stats and future fixtures
    return true;
  }

  // 4. For non-UK competitions with big teams, require confirmed broadcaster
  if (hasPopularTeams && hasConfirmedBroadcaster(fixture)) {
    return true;
  }

  return false;
}

/**
 * Get the reason why an H2H page should not be created (for debugging)
 */
export function getMatchPageFilterReason(fixture: Fixture | SimpleFixture): string {
  const competitionSlug = getCompetitionSlug(fixture);
  const isUKRelevant = UK_RELEVANT_COMPETITIONS.includes(competitionSlug);
  const hasPopularTeams = hasBigTeam(fixture);

  if (!isUKRelevant && !hasPopularTeams) {
    return `Competition '${competitionSlug}' not UK-relevant and no big teams involved`;
  }

  const daysUntilMatch = getDaysUntil(fixture.kickoff_utc);
  if (daysUntilMatch > 30) {
    return `Match is too far in future (${daysUntilMatch} days)`;
  }

  if (daysUntilMatch < -7) {
    return `Match is too far in past (${Math.abs(daysUntilMatch)} days ago)`;
  }

  if (isUKRelevant) {
    return 'H2H page should be created (UK-relevant competition)';
  }

  if (hasPopularTeams && hasConfirmedBroadcaster(fixture)) {
    return 'H2H page should be created (popular teams with broadcaster)';
  }

  if (hasPopularTeams && !hasConfirmedBroadcaster(fixture)) {
    return 'No H2H page: Popular teams but no confirmed UK broadcaster';
  }

  return 'H2H page should be created';
}