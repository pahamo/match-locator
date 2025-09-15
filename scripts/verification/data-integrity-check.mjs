#!/usr/bin/env node

/**
 * Data Integrity Verification Script
 * Checks the integrity and consistency of imported competition data
 */

import { createSupabaseClient } from '../utils/common.mjs';
import { getActiveCompetitions } from '../config/competitions.mjs';

class DataIntegrityChecker {
  constructor() {
    this.supabase = createSupabaseClient();
  }

  /**
   * Run all integrity checks
   */
  async runAllChecks() {
    console.log('🔍 Running data integrity checks...\n');

    const checks = [
      this.checkCompetitions.bind(this),
      this.checkTeams.bind(this),
      this.checkFixtures.bind(this),
      this.checkOrphanedRecords.bind(this),
      this.checkDuplicates.bind(this)
    ];

    let totalIssues = 0;

    for (const check of checks) {
      try {
        const issues = await check();
        totalIssues += issues;
      } catch (error) {
        console.error(`❌ Check failed: ${error.message}\n`);
        totalIssues++;
      }
    }

    console.log(`${'='.repeat(50)}`);
    if (totalIssues === 0) {
      console.log('✅ All integrity checks passed!');
    } else {
      console.log(`⚠️  Found ${totalIssues} integrity issues that need attention.`);
    }

    return totalIssues;
  }

  /**
   * Check competition data integrity
   */
  async checkCompetitions() {
    console.log('📋 Checking competitions...');

    const { data: competitions, error } = await this.supabase
      .from('competitions')
      .select('*');

    if (error) throw error;

    let issues = 0;

    // Check for missing required fields
    competitions.forEach(comp => {
      if (!comp.name || !comp.slug) {
        console.log(`   ❌ Competition ${comp.id} missing name or slug`);
        issues++;
      }
    });

    // Check for active competitions that should exist
    const activeConfigs = getActiveCompetitions();
    const dbCompIds = new Set(competitions.map(c => c.id));

    activeConfigs.forEach(config => {
      if (!dbCompIds.has(config.id)) {
        console.log(`   ⚠️  Active competition ${config.name} (ID: ${config.id}) not found in database`);
        issues++;
      }
    });

    console.log(`   Found ${competitions.length} competitions, ${issues} issues\n`);
    return issues;
  }

  /**
   * Check team data integrity
   */
  async checkTeams() {
    console.log('👥 Checking teams...');

    const { data: teams, error } = await this.supabase
      .from('teams')
      .select('id, name, slug, competition_id');

    if (error) throw error;

    let issues = 0;

    // Check for missing required fields
    teams.forEach(team => {
      if (!team.name || !team.slug) {
        console.log(`   ❌ Team ${team.id} missing name or slug`);
        issues++;
      }
      if (!team.competition_id) {
        console.log(`   ❌ Team ${team.id} (${team.name}) missing competition_id`);
        issues++;
      }
    });

    // Check team counts per competition
    const teamsByComp = {};
    teams.forEach(team => {
      if (team.competition_id) {
        teamsByComp[team.competition_id] = (teamsByComp[team.competition_id] || 0) + 1;
      }
    });

    const activeConfigs = getActiveCompetitions();
    activeConfigs.forEach(config => {
      const actualCount = teamsByComp[config.id] || 0;
      const expectedCount = config.teams;

      if (expectedCount && actualCount !== expectedCount) {
        console.log(`   ⚠️  ${config.name}: has ${actualCount} teams, expected ${expectedCount}`);
        issues++;
      }
    });

    console.log(`   Found ${teams.length} teams, ${issues} issues\n`);
    return issues;
  }

  /**
   * Check fixture data integrity
   */
  async checkFixtures() {
    console.log('⚽ Checking fixtures...');

    const { data: fixtures, error } = await this.supabase
      .from('fixtures')
      .select('id, competition_id, home_team_id, away_team_id, utc_kickoff');

    if (error) throw error;

    let issues = 0;

    // Check for missing required fields
    fixtures.forEach(fixture => {
      if (!fixture.home_team_id || !fixture.away_team_id) {
        console.log(`   ❌ Fixture ${fixture.id} missing team IDs`);
        issues++;
      }
      if (!fixture.utc_kickoff) {
        console.log(`   ❌ Fixture ${fixture.id} missing kickoff time`);
        issues++;
      }
      if (!fixture.competition_id) {
        console.log(`   ❌ Fixture ${fixture.id} missing competition_id`);
        issues++;
      }
    });

    // Check for fixtures with same teams
    fixtures.forEach(fixture => {
      if (fixture.home_team_id === fixture.away_team_id) {
        console.log(`   ❌ Fixture ${fixture.id} has same home and away team`);
        issues++;
      }
    });

    console.log(`   Found ${fixtures.length} fixtures, ${issues} issues\n`);
    return issues;
  }

  /**
   * Check for orphaned records
   */
  async checkOrphanedRecords() {
    console.log('🔗 Checking for orphaned records...');

    let issues = 0;

    // Check for fixtures with non-existent teams
    const { data: orphanedFixtures, error: fixtureError } = await this.supabase
      .rpc('find_orphaned_fixtures'); // You'd need to create this function in Supabase

    if (fixtureError && !fixtureError.message.includes('does not exist')) {
      throw fixtureError;
    }

    if (orphanedFixtures && orphanedFixtures.length > 0) {
      console.log(`   ❌ Found ${orphanedFixtures.length} fixtures with non-existent teams`);
      issues += orphanedFixtures.length;
    }

    // Check for teams with non-existent competitions
    const { data: orphanedTeams, error: teamError } = await this.supabase
      .from('teams')
      .select('id, name, competition_id')
      .not('competition_id', 'in', `(${getActiveCompetitions().map(c => c.id).join(',')})`);

    if (teamError) throw teamError;

    if (orphanedTeams.length > 0) {
      console.log(`   ⚠️  Found ${orphanedTeams.length} teams with inactive competition_ids`);
      orphanedTeams.forEach(team => {
        console.log(`      Team ${team.name} (ID: ${team.id}) in competition ${team.competition_id}`);
      });
      issues += orphanedTeams.length;
    }

    console.log(`   ${issues} orphaned records found\n`);
    return issues;
  }

  /**
   * Check for duplicate records
   */
  async checkDuplicates() {
    console.log('🔄 Checking for duplicates...');

    let issues = 0;

    // Check for duplicate team slugs within competitions
    const { data: duplicateTeams, error: teamError } = await this.supabase
      .rpc('find_duplicate_team_slugs'); // You'd need to create this function

    if (teamError && !teamError.message.includes('does not exist')) {
      throw teamError;
    }

    if (duplicateTeams && duplicateTeams.length > 0) {
      console.log(`   ❌ Found teams with duplicate slugs within competitions`);
      issues += duplicateTeams.length;
    }

    // Check for duplicate fixtures (same teams, same kickoff)
    const { data: duplicateFixtures, error: fixtureError } = await this.supabase
      .rpc('find_duplicate_fixtures'); // You'd need to create this function

    if (fixtureError && !fixtureError.message.includes('does not exist')) {
      throw fixtureError;
    }

    if (duplicateFixtures && duplicateFixtures.length > 0) {
      console.log(`   ❌ Found ${duplicateFixtures.length} duplicate fixtures`);
      issues += duplicateFixtures.length;
    }

    console.log(`   ${issues} duplicate records found\n`);
    return issues;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const checker = new DataIntegrityChecker();
    const totalIssues = await checker.runAllChecks();

    process.exit(totalIssues > 0 ? 1 : 0);

  } catch (error) {
    console.error('💥 Integrity check failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DataIntegrityChecker };