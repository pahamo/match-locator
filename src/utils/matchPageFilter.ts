import type { Fixture, SimpleFixture } from '../types';
import { generateCleanSlug } from './seo';
import { mapCompetitionIdToSlug } from './competitionMapping';

// UK-relevant competitions that should have individual match pages
const UK_RELEVANT_COMPETITIONS = [
  'premier-league',
  'champions-league',
  'europa-league',
  'championship',
  'fa-cup',
  'carabao-cup',
  'league-cup',
  'europa-conference-league'
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
 * Determine if we should create an individual match page for this fixture
 *
 * CRITICAL: This function determines which matches get individual pages.
 * Only create pages for matches that have real UK relevance and value.
 */
export function shouldCreateMatchPage(fixture: Fixture | SimpleFixture): boolean {
  // 1. Check competition relevance
  const competitionSlug = getCompetitionSlug(fixture);

  if (!UK_RELEVANT_COMPETITIONS.includes(competitionSlug)) {
    // Exception: Allow big teams in other leagues
    if (!hasBigTeam(fixture)) {
      return false; // Don't create page for random foreign league matches
    }
  }

  // 2. Must have confirmed UK broadcaster (not TBC)
  if (!hasConfirmedBroadcaster(fixture)) {
    return false; // Don't create page if no confirmed broadcaster
  }

  // 3. Must be within reasonable timeframe
  const daysUntilMatch = getDaysUntil(fixture.kickoff_utc);
  if (daysUntilMatch > 30 || daysUntilMatch < -7) {
    return false; // Don't create page for matches too far in future or past
  }

  // 4. If all checks pass, create the page
  return true;
}

/**
 * Get the reason why a match page should not be created (for debugging)
 */
export function getMatchPageFilterReason(fixture: Fixture | SimpleFixture): string {
  const competitionSlug = getCompetitionSlug(fixture);

  if (!UK_RELEVANT_COMPETITIONS.includes(competitionSlug) && !hasBigTeam(fixture)) {
    return `Competition '${competitionSlug}' not UK-relevant and no big teams involved`;
  }

  if (!hasConfirmedBroadcaster(fixture)) {
    return 'No confirmed UK broadcaster (TBC or empty)';
  }

  const daysUntilMatch = getDaysUntil(fixture.kickoff_utc);
  if (daysUntilMatch > 30) {
    return `Match is too far in future (${daysUntilMatch} days)`;
  }

  if (daysUntilMatch < -7) {
    return `Match is too far in past (${Math.abs(daysUntilMatch)} days ago)`;
  }

  return 'Match should have a page created';
}