/**
 * Team-Competition Relationship Utilities
 *
 * Determines which teams participate in which competitions
 * based on actual fixture data (single source of truth)
 */

import { supabase } from '../services/supabase';
import type { Team, Competition } from '../types';

export interface TeamInCompetition extends Team {
  fixtureCount?: number;
  upcomingCount?: number;
  lastFixture?: string;
}

/**
 * Get teams actively participating in a competition
 * Based on fixture data within a time range
 *
 * @param competitionId - Competition ID
 * @param options - Query options
 * @returns Array of teams with fixture counts
 */
export async function getTeamsInCompetition(
  competitionId: number,
  options: {
    pastMonths?: number;      // Default: 3 (current season)
    includeMetadata?: boolean; // Include fixture counts
  } = {}
): Promise<TeamInCompetition[]> {
  const { pastMonths = 3, includeMetadata = false } = options;

  try {
    // Calculate time range
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - pastMonths);

    // Query fixtures in this competition within time range
    const { data: fixtures, error } = await supabase
      .from('fixtures_with_teams')
      .select(`
        home_team_id, home_team, home_team_slug, home_crest,
        away_team_id, away_team, away_team_slug, away_crest,
        utc_kickoff, competition_id
      `)
      .eq('competition_id', competitionId)
      .gte('utc_kickoff', startDate.toISOString())
      .order('utc_kickoff', { ascending: true });

    if (error) {
      console.error('[teamCompetitions] Error fetching fixtures:', error);
      return [];
    }

    if (!fixtures || fixtures.length === 0) {
      return [];
    }

    // Extract unique teams from fixtures
    const teamsMap = new Map<number, TeamInCompetition>();
    const now = new Date();

    fixtures.forEach(fixture => {
      // Process home team
      if (!teamsMap.has(fixture.home_team_id)) {
        teamsMap.set(fixture.home_team_id, {
          id: fixture.home_team_id,
          name: fixture.home_team,
          slug: fixture.home_team_slug,
          crest: fixture.home_crest,
          competition_id: competitionId, // Set to this competition
          fixtureCount: 0,
          upcomingCount: 0,
          lastFixture: undefined
        });
      }

      // Process away team
      if (!teamsMap.has(fixture.away_team_id)) {
        teamsMap.set(fixture.away_team_id, {
          id: fixture.away_team_id,
          name: fixture.away_team,
          slug: fixture.away_team_slug,
          crest: fixture.away_crest,
          competition_id: competitionId,
          fixtureCount: 0,
          upcomingCount: 0,
          lastFixture: undefined
        });
      }

      // Update metadata if requested
      if (includeMetadata) {
        const fixtureDate = new Date(fixture.utc_kickoff);
        const isUpcoming = fixtureDate > now;

        // Update home team
        const homeTeam = teamsMap.get(fixture.home_team_id)!;
        homeTeam.fixtureCount = (homeTeam.fixtureCount || 0) + 1;
        if (isUpcoming) homeTeam.upcomingCount = (homeTeam.upcomingCount || 0) + 1;
        if (!homeTeam.lastFixture || fixture.utc_kickoff > homeTeam.lastFixture) {
          homeTeam.lastFixture = fixture.utc_kickoff;
        }

        // Update away team
        const awayTeam = teamsMap.get(fixture.away_team_id)!;
        awayTeam.fixtureCount = (awayTeam.fixtureCount || 0) + 1;
        if (isUpcoming) awayTeam.upcomingCount = (awayTeam.upcomingCount || 0) + 1;
        if (!awayTeam.lastFixture || fixture.utc_kickoff > awayTeam.lastFixture) {
          awayTeam.lastFixture = fixture.utc_kickoff;
        }
      }
    });

    // Convert to array and sort by name
    const teams = Array.from(teamsMap.values());
    teams.sort((a, b) => a.name.localeCompare(b.name));

    return teams;
  } catch (error) {
    console.error('[teamCompetitions] Error in getTeamsInCompetition:', error);
    return [];
  }
}

/**
 * Get all competitions a team is currently participating in
 *
 * @param teamSlug - Team slug
 * @param options - Query options
 * @returns Array of competition IDs
 */
export async function getTeamCompetitionIds(
  teamSlug: string,
  options: {
    pastMonths?: number; // Default: 3
  } = {}
): Promise<number[]> {
  const { pastMonths = 3 } = options;

  try {
    // Calculate time range
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - pastMonths);

    // Query fixtures for this team
    const { data: fixtures, error } = await supabase
      .from('fixtures_with_teams')
      .select('competition_id')
      .or(`home_team_slug.eq.${teamSlug},away_team_slug.eq.${teamSlug}`)
      .gte('utc_kickoff', startDate.toISOString());

    if (error) {
      console.error('[teamCompetitions] Error fetching team competitions:', error);
      return [];
    }

    if (!fixtures || fixtures.length === 0) {
      return [];
    }

    // Extract unique competition IDs
    const competitionIds = Array.from(
      new Set(fixtures.map(f => f.competition_id).filter(Boolean))
    );

    return competitionIds;
  } catch (error) {
    console.error('[teamCompetitions] Error in getTeamCompetitionIds:', error);
    return [];
  }
}

/**
 * Get participation summary for all competitions
 * Returns a map of competition ID to team count
 *
 * @param options - Query options
 * @returns Map of competition ID to team count
 */
export async function getCompetitionParticipation(
  options: {
    pastMonths?: number;
    competitionIds?: number[]; // Filter to specific competitions
  } = {}
): Promise<Map<number, number>> {
  const { pastMonths = 3, competitionIds } = options;

  try {
    // Calculate time range
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - pastMonths);

    // Build query
    let query = supabase
      .from('fixtures_with_teams')
      .select('competition_id, home_team_id, away_team_id')
      .gte('utc_kickoff', startDate.toISOString());

    if (competitionIds && competitionIds.length > 0) {
      query = query.in('competition_id', competitionIds);
    }

    const { data: fixtures, error } = await query;

    if (error) {
      console.error('[teamCompetitions] Error fetching participation:', error);
      return new Map();
    }

    if (!fixtures || fixtures.length === 0) {
      return new Map();
    }

    // Count unique teams per competition
    const participationMap = new Map<number, Set<number>>();

    fixtures.forEach(fixture => {
      const compId = fixture.competition_id;
      if (!compId) return;

      if (!participationMap.has(compId)) {
        participationMap.set(compId, new Set());
      }

      participationMap.get(compId)!.add(fixture.home_team_id);
      participationMap.get(compId)!.add(fixture.away_team_id);
    });

    // Convert to count map
    const countMap = new Map<number, number>();
    participationMap.forEach((teams, compId) => {
      countMap.set(compId, teams.size);
    });

    return countMap;
  } catch (error) {
    console.error('[teamCompetitions] Error in getCompetitionParticipation:', error);
    return new Map();
  }
}
