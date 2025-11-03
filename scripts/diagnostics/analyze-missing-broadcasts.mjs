#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('🔍 Analyzing Nov fixtures without broadcasts...\n');

// Get Nov fixtures WITHOUT broadcasts
const { data: novFixtures } = await supabase
  .from('fixtures')
  .select(`
    id,
    utc_kickoff,
    last_synced_at,
    sportmonks_fixture_id,
    competition_id,
    competitions(name)
  `)
  .gte('utc_kickoff', '2025-11-01')
  .lte('utc_kickoff', '2025-11-30')
  .order('utc_kickoff', { ascending: true });

console.log(`Total Nov fixtures: ${novFixtures?.length || 0}\n`);

// Check which have broadcasts
const withoutBroadcasts = [];
const withBroadcasts = [];

for (const fixture of novFixtures || []) {
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('id')
    .eq('fixture_id', fixture.id);

  if (!broadcasts || broadcasts.length === 0) {
    withoutBroadcasts.push(fixture);
  } else {
    withBroadcasts.push(fixture);
  }
}

console.log(`With broadcasts: ${withBroadcasts.length}`);
console.log(`Without broadcasts: ${withoutBroadcasts.length}\n`);

// Group missing by competition
const missingByComp = {};
withoutBroadcasts.forEach(f => {
  const comp = f.competitions?.name || 'Unknown';
  if (!missingByComp[comp]) missingByComp[comp] = 0;
  missingByComp[comp]++;
});

console.log('Missing broadcasts by competition:');
Object.entries(missingByComp)
  .sort((a, b) => b[1] - a[1])
  .forEach(([comp, count]) => {
    console.log(`  ${comp}: ${count} fixtures`);
  });

// Show sample fixtures missing broadcasts
console.log('\n=== SAMPLE FIXTURES WITHOUT BROADCASTS ===');
withoutBroadcasts.slice(0, 5).forEach(f => {
  console.log(`\nFixture ${f.id} (${f.competitions?.name || 'Unknown'})`);
  console.log(`  Date: ${f.utc_kickoff}`);
  console.log(`  Last synced: ${f.last_synced_at}`);
  console.log(`  SportMonks ID: ${f.sportmonks_fixture_id}`);
});

// Now check SportMonks API for one of these fixtures to see if it HAS broadcaster data
console.log('\n=== CHECKING SPORTMONKS API ===');
const testFixture = withoutBroadcasts[0];
if (testFixture && testFixture.sportmonks_fixture_id) {
  console.log(`\nFetching SportMonks data for fixture ${testFixture.sportmonks_fixture_id}...`);

  const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;
  const url = `https://api.sportmonks.com/v3/football/fixtures/${testFixture.sportmonks_fixture_id}?api_token=${SPORTMONKS_TOKEN}&include=tvstations.tvstation`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (json.data) {
      const tvStations = json.data.tvstations || [];
      console.log(`  TV stations in API: ${tvStations.length}`);

      if (tvStations.length > 0) {
        console.log('  Sample stations:');
        tvStations.slice(0, 5).forEach(ts => {
          console.log(`    - ${ts.tvstation?.name || 'Unknown'} (country: ${ts.country_id})`);
        });

        // Check for UK stations (country 462, 455, 11)
        const ukStations = tvStations.filter(ts => [11, 455, 462].includes(ts.country_id));
        console.log(`\n  UK stations (11, 455, 462): ${ukStations.length}`);
        if (ukStations.length > 0) {
          ukStations.forEach(ts => {
            console.log(`    - ${ts.tvstation?.name || 'Unknown'} (country: ${ts.country_id})`);
          });
        }
      } else {
        console.log('  ✅ No TV stations in API (this is expected for some fixtures)');
      }
    } else {
      console.log('  ⚠️  No data returned from API');
    }
  } catch (error) {
    console.log('  ❌ Error fetching from API:', error.message);
  }
}

// Check when the sync script was last run with TV stations enabled
console.log('\n=== FEATURE FLAGS CHECK ===');
console.log(`REACT_APP_FF_SPORTMONKS_TV_STATIONS: ${process.env.REACT_APP_FF_SPORTMONKS_TV_STATIONS || 'NOT SET'}`);

// Check if sync was run without TV stations flag
const { data: recentLog } = await supabase
  .from('api_sync_log')
  .select('*')
  .eq('sync_type', 'fixtures')
  .order('completed_at', { ascending: false })
  .limit(1)
  .single();

if (recentLog) {
  console.log('\nMost recent sync log:');
  console.log(`  Date: ${recentLog.completed_at}`);
  console.log(`  Fixtures created: ${recentLog.fixtures_created}`);
  console.log(`  Fixtures updated: ${recentLog.fixtures_updated}`);
  console.log(`  Metadata:`, JSON.stringify(recentLog.sync_metadata || {}));
}
