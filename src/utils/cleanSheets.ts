/**
 * Clean sheets calculation utilities
 * A clean sheet occurs when a team doesn't concede any goals in a match
 */

import type { Fixture } from '../types';

export interface CleanSheetStats {
  totalMatches: number;
  cleanSheets: number;
  homeCleanSheets: number;
  awayCleanSheets: number;
  cleanSheetPercentage: number;
}

/**
 * Calculate clean sheets for a specific team from completed fixtures
 *
 * @param fixtures - Array of completed fixtures
 * @param teamName - Name of the team to calculate clean sheets for
 * @returns Clean sheet statistics
 */
export function calculateCleanSheets(fixtures: Fixture[], teamName: string): CleanSheetStats {
  const completedFixtures = fixtures.filter(f =>
    f.score && f.score.home !== null && f.score.away !== null
  );

  let cleanSheets = 0;
  let homeCleanSheets = 0;
  let awayCleanSheets = 0;

  completedFixtures.forEach(fixture => {
    if (!fixture.score) return;

    const isHome = fixture.home.name === teamName;
    const isAway = fixture.away.name === teamName;

    if (!isHome && !isAway) return;

    // Home team clean sheet: away score is 0
    if (isHome && fixture.score.away === 0) {
      cleanSheets++;
      homeCleanSheets++;
    }

    // Away team clean sheet: home score is 0
    if (isAway && fixture.score.home === 0) {
      cleanSheets++;
      awayCleanSheets++;
    }
  });

  const cleanSheetPercentage = completedFixtures.length > 0
    ? Math.round((cleanSheets / completedFixtures.length) * 100)
    : 0;

  return {
    totalMatches: completedFixtures.length,
    cleanSheets,
    homeCleanSheets,
    awayCleanSheets,
    cleanSheetPercentage
  };
}

/**
 * Check if a specific fixture was a clean sheet for a team
 *
 * @param fixture - The fixture to check
 * @param teamName - Name of the team
 * @returns true if the team kept a clean sheet, false otherwise
 */
export function isCleanSheet(fixture: Fixture, teamName: string): boolean {
  if (!fixture.score || fixture.score.home === null || fixture.score.away === null) {
    return false;
  }

  const isHome = fixture.home.name === teamName;
  const isAway = fixture.away.name === teamName;

  if (!isHome && !isAway) return false;

  // Home team: check away score
  if (isHome) {
    return fixture.score.away === 0;
  }

  // Away team: check home score
  if (isAway) {
    return fixture.score.home === 0;
  }

  return false;
}

/**
 * Get clean sheet count for multiple teams (useful for league tables)
 *
 * @param fixtures - Array of completed fixtures
 * @param teamNames - Array of team names to calculate for
 * @returns Map of team name to clean sheet count
 */
export function getCleanSheetsByTeam(
  fixtures: Fixture[],
  teamNames: string[]
): Map<string, number> {
  const cleanSheetMap = new Map<string, number>();

  teamNames.forEach(teamName => {
    const stats = calculateCleanSheets(fixtures, teamName);
    cleanSheetMap.set(teamName, stats.cleanSheets);
  });

  return cleanSheetMap;
}
