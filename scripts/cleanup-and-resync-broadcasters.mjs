#!/usr/bin/env node

/**
 * Cleanup bad broadcaster data and re-sync with correct data
 *
 * This script:
 * 1. Deletes all existing broadcasts (they were synced incorrectly)
 * 2. Re-runs the fixture sync to get correct broadcaster data
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function cleanup() {
  console.log('🧹 Cleaning up incorrect broadcaster data...\n');

  // Count existing broadcasts
  const { count: beforeCount } = await supabase
    .from('broadcasts')
    .select('*', { count: 'exact', head: true });

  console.log(`   Found ${beforeCount} existing broadcast records`);
  console.log('   These were synced from /tv-stations/fixtures/ endpoint (WRONG)');
  console.log('   Deleting all...\n');

  // Delete all broadcasts
  const { error } = await supabase
    .from('broadcasts')
    .delete()
    .neq('id', 0); // Delete all

  if (error) {
    console.error('❌ Error deleting broadcasts:', error);
    process.exit(1);
  }

  console.log('   ✅ Deleted all broadcast records\n');
}

async function resync() {
  console.log('🔄 Re-syncing fixtures with correct broadcaster data...\n');
  console.log('   This will use fixture.tvstations (correct data source)');
  console.log('   Running sync for Premier League only as a test...\n');

  try {
    // Run sync for Premier League with a small date range
    const dateFrom = '2025-08-15';
    const dateTo = '2025-08-25';

    execSync(
      `node scripts/sync-sportmonks-fixtures.mjs --competition-id=1 --date-from=${dateFrom} --date-to=${dateTo} --verbose`,
      { stdio: 'inherit' }
    );

    console.log('\n✅ Sync complete!\n');
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

async function verify() {
  console.log('🔍 Verifying results...\n');

  // Count new broadcasts
  const { count: afterCount } = await supabase
    .from('broadcasts')
    .select('*', { count: 'exact', head: true });

  console.log(`   New broadcast records: ${afterCount}`);

  // Check fixture 6057 specifically
  const { data: fixture6057 } = await supabase
    .from('fixtures_with_teams')
    .select('id, home_team, away_team, broadcaster, broadcaster_id')
    .eq('id', 6057)
    .single();

  if (fixture6057) {
    console.log(`\n   Fixture 6057 verification:`);
    console.log(`   ${fixture6057.home_team} vs ${fixture6057.away_team}`);
    console.log(`   Broadcaster: ${fixture6057.broadcaster || 'NULL'}`);
    console.log(`   Broadcaster ID: ${fixture6057.broadcaster_id || 'NULL'}`);

    if (fixture6057.broadcaster === 'TNT Sports') {
      console.log('\n   ✅ SUCCESS! Broadcaster is now correct (TNT Sports)');
    } else if (fixture6057.broadcaster) {
      console.log(`\n   ⚠️  Broadcaster is ${fixture6057.broadcaster} (expected TNT Sports)`);
    } else {
      console.log('\n   ⚠️  No broadcaster data yet (may need full re-sync)');
    }
  }

  console.log('\n📊 Check http://localhost:3000/admin/matches to see all results');
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  BROADCASTER DATA CLEANUP & RE-SYNC');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await cleanup();
  await resync();
  await verify();

  console.log('\n✅ All done!\n');
}

main();
