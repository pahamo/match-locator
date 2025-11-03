#!/usr/bin/env node

/**
 * Test TeamResolver to debug H2H link failures
 */

import { TeamResolver } from '../src/services/TeamResolver.js';

// Mock the supabase connection for testing
global.process = {
  ...process,
  env: {
    ...process.env,
    // Add any needed env vars
  }
};

async function testTeamResolver() {
  console.log('🧪 Testing TeamResolver for H2H failures');
  console.log('=' .repeat(50));

  // Test common H2H combinations that should work
  const testCases = [
    'nottingham-forest-vs-sunderland-afc',
    'manchester-united-vs-chelsea',
    'arsenal-vs-liverpool',
    'man-city-vs-tottenham',
    'brighton-vs-newcastle',
    'aston-villa-vs-west-ham'
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase}`);

    try {
      const result = await TeamResolver.parseH2HSlug(testCase);

      if (result) {
        console.log(`  ✅ SUCCESS`);
        console.log(`    Team 1: ${result.team1.name} (${result.team1.slug})`);
        console.log(`    Team 2: ${result.team2.name} (${result.team2.slug})`);
        console.log(`    Canonical: ${TeamResolver.generateH2HSlug(result.team1, result.team2)}`);
      } else {
        console.log(`  ❌ FAILED - parseH2HSlug returned null`);

        // Try to debug which part failed
        const parts = testCase.split('-vs-');
        if (parts.length === 2) {
          const [team1Slug, team2Slug] = parts;
          console.log(`    Testing individual slugs:`);

          const team1 = await TeamResolver.resolve(team1Slug);
          const team2 = await TeamResolver.resolve(team2Slug);

          console.log(`      ${team1Slug}: ${team1 ? '✅' : '❌'} ${team1?.name || 'NOT FOUND'}`);
          console.log(`      ${team2Slug}: ${team2 ? '✅' : '❌'} ${team2?.name || 'NOT FOUND'}`);
        }
      }
    } catch (error) {
      console.log(`  💥 ERROR: ${error.message}`);
    }
  }

  console.log('\n🏁 TeamResolver test complete');
}

// Run the test
testTeamResolver().catch(console.error);