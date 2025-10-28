/**
 * Team Fixtures Utility Functions
 *
 * Functions for grouping, filtering, and analyzing team fixtures
 * across multiple competitions.
 */

import type { Fixture } from '../types';
import { getMatchStatus } from './matchStatus';
import { getAllCompetitionConfigs, type CompetitionConfig } from '../config/competitions';

export interface CompetitionFixtureGroup {
  competition: CompetitionConfig;
  fixtures: Fixture[];
  upcoming: Fixture[];
  results: Fixture[];
  nextMatch?: Fixture;
  stats: {
    total: number;
    upcoming: number;
    completed: number;
    withBroadcaster: number;
  };
}

/**
 * Group fixtures by competition
 */
export function groupFixturesByCompetition(fixtures: Fixture[]): CompetitionFixtureGroup[] {
  const allCompetitions = getAllCompetitionConfigs();
  const competitionMap = new Map<number, Fixture[]>();

  // Group fixtures by competition ID
  fixtures.forEach(fixture => {
    if (!fixture.competition_id) return;

    if (!competitionMap.has(fixture.competition_id)) {
      competitionMap.set(fixture.competition_id, []);
    }
    competitionMap.get(fixture.competition_id)!.push(fixture);
  });

  // Create groups with stats
  const groups: CompetitionFixtureGroup[] = [];

  competitionMap.forEach((fixtures, competitionId) => {
    const competition = allCompetitions.find(c => c.id === competitionId);
    if (!competition) return;

    // Split into upcoming and results
    const now = new Date();
    const upcoming: Fixture[] = [];
    const results: Fixture[] = [];

    fixtures.forEach(fixture => {
      const status = getMatchStatus(fixture.kickoff_utc).status;
      if (status === 'upcoming' || status === 'upNext' || status === 'live') {
        upcoming.push(fixture);
      } else if (status === 'finished') {
        results.push(fixture);
      }
    });

    // Sort
    upcoming.sort((a, b) => new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime());
    results.sort((a, b) => new Date(b.kickoff_utc).getTime() - new Date(a.kickoff_utc).getTime());

    // Find next match
    const nextMatch = upcoming[0];

    // Calculate stats
    const withBroadcaster = fixtures.filter(f => f.broadcaster).length;

    groups.push({
      competition,
      fixtures,
      upcoming,
      results: results.slice(0, 5), // Last 5 results
      nextMatch,
      stats: {
        total: fixtures.length,
        upcoming: upcoming.length,
        completed: results.length,
        withBroadcaster
      }
    });
  });

  // Sort groups by priority: Primary league, then Champions League, then others
  return groups.sort((a, b) => {
    const priorityOrder = [1, 2, 11, 3, 4, 5, 6, 7, 8, 9, 10, 12]; // EPL, UCL, UEL, then others
    const aPriority = priorityOrder.indexOf(a.competition.id);
    const bPriority = priorityOrder.indexOf(b.competition.id);
    return (aPriority === -1 ? 999 : aPriority) - (bPriority === -1 ? 999 : bPriority);
  });
}

/**
 * Get competition statistics for a team
 */
export function getCompetitionStats(fixtures: Fixture[], competitionId: number) {
  const competitionFixtures = fixtures.filter(f => f.competition_id === competitionId);

  const upcoming = competitionFixtures.filter(f => {
    const status = getMatchStatus(f.kickoff_utc).status;
    return status === 'upcoming' || status === 'upNext' || status === 'live';
  });

  const completed = competitionFixtures.filter(f => {
    const status = getMatchStatus(f.kickoff_utc).status;
    return status === 'finished';
  });

  return {
    total: competitionFixtures.length,
    upcoming: upcoming.length,
    completed: completed.length,
    withBroadcaster: competitionFixtures.filter(f => f.broadcaster).length,
    broadcastCoverage: competitionFixtures.length > 0
      ? Math.round((competitionFixtures.filter(f => f.broadcaster).length / competitionFixtures.length) * 100)
      : 0
  };
}

/**
 * Get fixtures in the next N days
 */
export function getNextDaysFixtures(fixtures: Fixture[], days: number = 7): Fixture[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return fixtures.filter(f => {
    const fixtureDate = new Date(f.kickoff_utc);
    return fixtureDate >= now && fixtureDate <= futureDate;
  }).sort((a, b) => new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime());
}

/**
 * Get the overall next match across all competitions
 */
export function getOverallNextMatch(fixtures: Fixture[]): Fixture | undefined {
  const now = new Date();
  const upcomingFixtures = fixtures
    .filter(f => {
      const status = getMatchStatus(f.kickoff_utc).status;
      return status === 'upcoming' || status === 'upNext' || status === 'live';
    })
    .sort((a, b) => new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime());

  return upcomingFixtures[0];
}

/**
 * Calculate broadcast coverage percentage for a team
 */
export function getBroadcastCoverage(fixtures: Fixture[]): {
  total: number;
  confirmed: number;
  percentage: number;
} {
  const upcomingFixtures = fixtures.filter(f => {
    const status = getMatchStatus(f.kickoff_utc).status;
    return status === 'upcoming' || status === 'upNext' || status === 'live';
  });

  const confirmed = upcomingFixtures.filter(f => f.broadcaster).length;

  return {
    total: upcomingFixtures.length,
    confirmed,
    percentage: upcomingFixtures.length > 0
      ? Math.round((confirmed / upcomingFixtures.length) * 100)
      : 0
  };
}
