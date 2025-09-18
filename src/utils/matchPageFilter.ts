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
 * SIMPLIFIED: Should we create an H2H page for this fixture?
 *
 * RULES:
 * - Premier League: ALWAYS show View button
 * - Champions League: ALWAYS show View button
 * - Everything else: NO View button
 * - "No UK Broadcast" only for explicitly marked blackout games
 */
export function shouldCreateMatchPage(fixture: Fixture | SimpleFixture): boolean {
  // 1. Only check competition - simple and clear
  const competitionSlug = getCompetitionSlug(fixture);

  // 2. Premier League and Champions League ALWAYS get H2H pages
  if (competitionSlug === 'premier-league' || competitionSlug === 'champions-league') {
    return true;
  }

  // 3. Everything else gets no H2H page
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