import type { Fixture, SimpleFixture } from '../types';
import { mapCompetitionIdToSlug } from './competitionMapping';

// Helper functions removed - simplified logic only checks competition


/**
 * Get competition slug from fixture
 */
function getCompetitionSlug(fixture: Fixture | SimpleFixture): string {
  if ('competition_id' in fixture && fixture.competition_id) {
    return mapCompetitionIdToSlug(fixture.competition_id);
  }
  return 'unknown';
}

// hasBigTeam function removed - simplified logic only checks competition

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

  if (competitionSlug === 'premier-league' || competitionSlug === 'champions-league') {
    return 'H2H page should be created (Premier League or Champions League)';
  }

  return `Competition '${competitionSlug}' not supported - only Premier League and Champions League have H2H pages`;
}