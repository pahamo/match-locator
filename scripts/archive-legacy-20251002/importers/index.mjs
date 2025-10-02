#!/usr/bin/env node

/**
 * Universal Competition Importer
 * Import any competition by slug or run all active competitions
 */

import { getCompetition, getActiveCompetitions } from '../config/competitions.mjs';
import { BaseCompetitionImporter } from './base-importer.mjs';

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    competition: null,
    all: false,
    teamsOnly: false,
    fixturesOnly: false,
    dryRun: false
  };

  for (const arg of args) {
    if (arg.startsWith('--competition=')) {
      options.competition = arg.split('=')[1];
    } else if (arg === '--all') {
      options.all = true;
    } else if (arg === '--teams-only') {
      options.teamsOnly = true;
    } else if (arg === '--fixtures-only') {
      options.fixturesOnly = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--help') {
      showUsage();
      process.exit(0);
    }
  }

  return options;
}

/**
 * Show usage information
 */
function showUsage() {
  console.log(`
🚀 Competition Data Importer

Usage:
  node scripts/importers/index.mjs [options]

Options:
  --competition=SLUG    Import specific competition (e.g., premier-league, champions-league)
  --all                 Import all active competitions
  --teams-only          Import only teams (skip fixtures)
  --fixtures-only       Import only fixtures (skip teams)
  --dry-run             Show what would be imported without making changes
  --help                Show this help message

Examples:
  node scripts/importers/index.mjs --competition=premier-league
  node scripts/importers/index.mjs --competition=champions-league --teams-only
  node scripts/importers/index.mjs --all
  node scripts/importers/index.mjs --competition=premier-league --dry-run

Available Competitions:
${getActiveCompetitions().map(comp => `  ${comp.slug.padEnd(20)} - ${comp.name}`).join('\n')}
`);
}

/**
 * Import a single competition
 */
async function importCompetition(competitionSlug, options) {
  const config = getCompetition(competitionSlug);

  if (!config) {
    throw new Error(`Unknown competition: ${competitionSlug}`);
  }

  if (!config.isActive) {
    throw new Error(`Competition ${competitionSlug} is not active (requires paid API tier)`);
  }

  if (options.dryRun) {
    console.log(`🔍 DRY RUN - Would import ${config.name}:`);
    console.log(`   Database ID: ${config.id}`);
    console.log(`   Football-Data ID: ${config.fdId}`);
    console.log(`   Season: ${config.season}`);
    console.log(`   Teams: ${config.teams || 'Variable'}`);
    console.log(`   Type: ${config.type}`);
    return { teams: 0, fixtures: 0 };
  }

  const importer = new BaseCompetitionImporter(config);

  if (options.teamsOnly) {
    await importer.ensureCompetition();
    const teams = await importer.importTeams();
    return { teams, fixtures: 0 };
  }

  if (options.fixturesOnly) {
    const fixtures = await importer.importFixtures();
    return { teams: 0, fixtures };
  }

  return await importer.importAll();
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  try {
    let results = [];

    if (options.all) {
      const activeCompetitions = getActiveCompetitions();
      console.log(`🌍 Importing all active competitions (${activeCompetitions.length}):\n`);

      for (const config of activeCompetitions) {
        console.log(`\n${'='.repeat(60)}`);
        const result = await importCompetition(config.slug, options);
        results.push({ competition: config.name, ...result });
      }

    } else if (options.competition) {
      const result = await importCompetition(options.competition, options);
      results.push({ competition: options.competition, ...result });

    } else {
      console.error('❌ Please specify --competition=SLUG or --all');
      showUsage();
      process.exit(1);
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎉 Import Summary:`);
    console.log(`${'='.repeat(60)}`);

    let totalTeams = 0;
    let totalFixtures = 0;

    results.forEach(result => {
      console.log(`${result.competition}:`);
      console.log(`   Teams: ${result.teams}`);
      console.log(`   Fixtures: ${result.fixtures}`);
      totalTeams += result.teams;
      totalFixtures += result.fixtures;
    });

    console.log(`\nTotal:`);
    console.log(`   Teams: ${totalTeams}`);
    console.log(`   Fixtures: ${totalFixtures}`);

  } catch (error) {
    console.error(`💥 Import failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}