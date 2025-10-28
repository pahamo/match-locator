/**
 * Custom hooks for team data management
 */

import { useMemo } from 'react';
import type { Fixture, Team } from '../types';
import {
  groupFixturesByCompetition,
  getOverallNextMatch,
  getNextDaysFixtures,
  getBroadcastCoverage,
  type CompetitionFixtureGroup
} from '../utils/teamFixtures';
import { teamMatchesSlug } from '../utils/slugUtils';

export interface TeamMetadata {
  team: Team;
  venue?: string;
  city?: string;
  founded?: number;
  clubColors?: string;
  website?: string;
  crestUrl?: string;
}

export interface TeamFixturesData {
  allFixtures: Fixture[];
  competitionGroups: CompetitionFixtureGroup[];
  nextMatch?: Fixture;
  next7Days: Fixture[];
  broadcastCoverage: {
    total: number;
    confirmed: number;
    percentage: number;
  };
  hasMultipleCompetitions: boolean;
}

/**
 * Hook to extract and enhance team metadata from fixtures
 */
export function useTeamMetadata(fixtures: Fixture[], teamSlug: string): TeamMetadata | null {
  return useMemo(() => {
    if (!fixtures.length) return null;

    const firstFixture = fixtures[0];
    if (!firstFixture) return null;

    // Find the team from fixtures
    const team = teamMatchesSlug(firstFixture.home, teamSlug)
      ? firstFixture.home
      : teamMatchesSlug(firstFixture.away, teamSlug)
        ? firstFixture.away
        : null;

    if (!team) return null;

    // Extract additional metadata (available from team object)
    return {
      team,
      venue: team.venue || team.home_venue || undefined,
      city: team.city || undefined,
      founded: team.founded || undefined,
      clubColors: team.club_colors || undefined,
      website: team.website || undefined,
      crestUrl: team.crest || undefined
    };
  }, [fixtures, teamSlug]);
}

/**
 * Hook to process and group team fixtures
 */
export function useTeamFixtures(fixtures: Fixture[]): TeamFixturesData {
  return useMemo(() => {
    const competitionGroups = groupFixturesByCompetition(fixtures);
    const nextMatch = getOverallNextMatch(fixtures);
    const next7Days = getNextDaysFixtures(fixtures, 7);
    const broadcastCoverage = getBroadcastCoverage(fixtures);
    const hasMultipleCompetitions = competitionGroups.length > 1;

    return {
      allFixtures: fixtures,
      competitionGroups,
      nextMatch,
      next7Days,
      broadcastCoverage,
      hasMultipleCompetitions
    };
  }, [fixtures]);
}
