import type { SimpleFixture, Fixture } from '../types';

/**
 * Determines whether a match should have a dedicated match page created.
 * Only matches with UK broadcast information or special circumstances should have pages.
 */
export const shouldCreateMatchPage = (fixture: SimpleFixture | Fixture): boolean => {
  // Check if it's a SimpleFixture
  if ('home_team' in fixture) {
    const simpleFixture = fixture as SimpleFixture;

    // Has broadcaster information
    if (simpleFixture.broadcaster && simpleFixture.broadcaster.trim() !== '') {
      return true;
    }

    // Is marked as blackout (still useful for users to know)
    if (simpleFixture.isBlackout) {
      return true;
    }

    // Default to false for fixtures without UK broadcast info
    return false;
  } else {
    // It's a full Fixture
    const fullFixture = fixture as Fixture;

    // Has UK providers
    if (fullFixture.providers_uk && fullFixture.providers_uk.length > 0) {
      return true;
    }

    // Is marked as blackout (still useful for users to know)
    if (fullFixture.blackout?.is_blackout) {
      return true;
    }

    // For major competitions, create pages even without broadcaster info
    const majorCompetitions = ['Premier League', 'UEFA Champions League', 'UEFA Europa League'];
    if (fullFixture.competition && majorCompetitions.includes(fullFixture.competition)) {
      return true;
    }

    // Default to false for fixtures without UK broadcast info
    return false;
  }
};

/**
 * Gets a human-readable reason why a match page would or wouldn't be created
 */
export const getMatchPageReason = (fixture: SimpleFixture | Fixture): string => {
  if ('home_team' in fixture) {
    const simpleFixture = fixture as SimpleFixture;

    if (simpleFixture.broadcaster && simpleFixture.broadcaster.trim() !== '') {
      return `Has UK broadcaster: ${simpleFixture.broadcaster}`;
    }

    if (simpleFixture.isBlackout) {
      return 'Marked as blackout match';
    }

    return 'No UK broadcast information available';
  } else {
    const fullFixture = fixture as Fixture;

    if (fullFixture.providers_uk && fullFixture.providers_uk.length > 0) {
      return `Has UK providers: ${fullFixture.providers_uk.map(p => p.name).join(', ')}`;
    }

    if (fullFixture.blackout?.is_blackout) {
      return 'Marked as blackout match';
    }

    const majorCompetitions = ['Premier League', 'UEFA Champions League', 'UEFA Europa League'];
    if (fullFixture.competition && majorCompetitions.includes(fullFixture.competition)) {
      return `Major competition: ${fullFixture.competition}`;
    }

    return 'No UK broadcast information available';
  }
};