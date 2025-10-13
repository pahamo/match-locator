/**
 * Fixture Utility Functions
 *
 * Helper functions for working with fixture data from the API.
 * Follows the clean data architecture principle: store API data as-is (round object),
 * transform only when displaying to users.
 *
 * Terminology:
 * - "round" = API terminology (stored as RoundData object)
 * - "Matchweek" = UK user-facing display term for league competitions
 * - Internally use "round" everywhere, display as "Matchweek X" for users when appropriate
 */

import type { Fixture, SimpleFixture } from '../types';

/**
 * Extract round number from fixture round data
 *
 * The API provides round as an object with a 'name' field.
 * For league competitions, the name is typically a number (e.g., "4").
 * For cup competitions, it might be a string (e.g., "Round of 16").
 *
 * @param fixture - Fixture object with optional round data
 * @returns Round number if it can be parsed, null otherwise
 *
 * @example
 * const roundNumber = getRoundNumber(fixture);
 * // Returns: 4 (for Premier League round 4)
 * // Returns: null (for Champions League "Round of 16")
 */
export function getRoundNumber(fixture: Fixture | SimpleFixture): number | null {
  // Handle both Fixture and SimpleFixture types
  const round = 'round' in fixture ? fixture.round : undefined;

  if (!round) return null;

  // Handle both object and string formats (for backwards compatibility)
  const roundName = typeof round === 'object' && 'name' in round
    ? round.name
    : typeof round === 'string'
    ? round
    : null;

  if (!roundName) return null;

  const parsed = parseInt(roundName, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Get display-friendly round label for UK users
 *
 * For league competitions (numeric rounds), displays as "Matchweek X" (UK terminology)
 * For cup competitions, displays the round name as-is (e.g., "Round of 16")
 *
 * @param fixture - Fixture object with optional round data
 * @returns Formatted string like "Matchweek 4" or "Round of 16"
 *
 * @example
 * const label = getRoundLabel(fixture);
 * // Returns: "Matchweek 4" (for league competitions)
 * // Returns: "Round of 16" (for cup competitions)
 */
export function getRoundLabel(fixture: Fixture | SimpleFixture): string {
  const round = 'round' in fixture ? fixture.round : undefined;

  if (!round) return '';

  const roundName = typeof round === 'object' && 'name' in round
    ? round.name
    : typeof round === 'string'
    ? round
    : '';

  if (!roundName) return '';

  // If it's a number, format as "Matchweek X" for UK users
  const roundNumber = parseInt(roundName, 10);
  if (!isNaN(roundNumber)) {
    return `Matchweek ${roundNumber}`;
  }

  // Otherwise return the round name as-is (e.g., "Round of 16")
  return roundName;
}

/**
 * Backwards compatibility alias for getRoundNumber
 * @deprecated Use getRoundNumber instead
 */
export const getMatchweek = getRoundNumber;

/**
 * Get round ID from fixture
 *
 * @param fixture - Fixture object with optional round data
 * @returns Round ID number if available, null otherwise
 */
export function getRoundId(fixture: Fixture): number | null {
  const round = fixture.round;

  if (!round || typeof round !== 'object') return null;
  if (!('id' in round)) return null;

  return round.id;
}

/**
 * Check if a fixture is in a specific round (by number)
 *
 * @param fixture - Fixture object
 * @param roundNumber - Round number to check
 * @returns true if fixture is in the specified round
 *
 * @example
 * if (isInRound(fixture, 4)) {
 *   // This fixture is in round 4
 * }
 */
export function isInRound(fixture: Fixture | SimpleFixture, roundNumber: number): boolean {
  const fixtureRound = getRoundNumber(fixture);
  return fixtureRound === roundNumber;
}

/**
 * Group fixtures by round number
 *
 * @param fixtures - Array of fixtures
 * @returns Object with round numbers as keys and fixture arrays as values
 *
 * @example
 * const grouped = groupByRound(fixtures);
 * // Returns: { 1: [...], 2: [...], 3: [...] }
 */
export function groupByRound(fixtures: Fixture[]): Record<number, Fixture[]> {
  return fixtures.reduce((acc, fixture) => {
    const roundNumber = getRoundNumber(fixture);
    if (roundNumber !== null) {
      if (!acc[roundNumber]) {
        acc[roundNumber] = [];
      }
      acc[roundNumber].push(fixture);
    }
    return acc;
  }, {} as Record<number, Fixture[]>);
}

/**
 * Get the current round from a list of fixtures
 * (finds the earliest upcoming or most recent completed round)
 *
 * @param fixtures - Array of fixtures
 * @returns Current round number, or null if cannot be determined
 */
export function getCurrentRound(fixtures: Fixture[]): number | null {
  const now = new Date();
  const grouped = groupByRound(fixtures);
  const rounds = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  // Find first round with an upcoming fixture
  for (const roundNum of rounds) {
    const fixturesInRound = grouped[roundNum];
    const hasUpcoming = fixturesInRound.some(f => new Date(f.kickoff_utc) > now);
    if (hasUpcoming) {
      return roundNum;
    }
  }

  // If all fixtures are in the past, return the last round
  return rounds.length > 0 ? rounds[rounds.length - 1] : null;
}

/**
 * Backwards compatibility aliases
 * @deprecated Use round-based functions instead
 */
export const isInMatchweek = isInRound;
export const groupByMatchweek = groupByRound;
export const getCurrentMatchweek = getCurrentRound;
