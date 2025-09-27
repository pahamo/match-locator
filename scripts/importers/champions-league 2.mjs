#!/usr/bin/env node

/**
 * Champions League Data Importer
 * Imports Champions League teams and fixtures from Football-Data.org
 */

import { BaseCompetitionImporter } from './base-importer.mjs';
import { getCompetition } from '../config/competitions.mjs';

class ChampionsLeagueImporter extends BaseCompetitionImporter {
  constructor() {
    const config = getCompetition('champions-league');
    super(config);
  }

  /**
   * Override team transformation for Champions League specific needs
   */
  transformTeam(apiTeam) {
    const baseTeam = super.transformTeam(apiTeam);

    // Champions League teams might need special handling
    // e.g., setting competition_id to 2 for UCL teams
    return {
      ...baseTeam,
      // Add any UCL-specific transformations here
    };
  }

  /**
   * Override fixture transformation for Champions League specific needs
   */
  async transformFixtures(apiMatches) {
    const fixtures = await super.transformFixtures(apiMatches);

    // Champions League specific fixture processing
    return fixtures.map(fixture => ({
      ...fixture,
      // UCL fixtures don't have traditional matchday numbers
      matchday: null,
      // Use stage for round info (e.g., "GROUP_STAGE", "ROUND_OF_16", etc.)
      round: fixture.stage || fixture.round
    }));
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const importer = new ChampionsLeagueImporter();
    const result = await importer.importAll();

    console.log(`\n📊 Champions League Import Summary:`);
    console.log(`   Teams: ${result.teams}`);
    console.log(`   Fixtures: ${result.fixtures}`);

  } catch (error) {
    console.error('💥 Champions League import failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ChampionsLeagueImporter };