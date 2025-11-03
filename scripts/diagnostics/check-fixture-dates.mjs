#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('🔍 Checking fixture dates and sync status...\n');

// Count fixtures by month
const { data: allFixtures } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff, last_synced_at, data_source, competition_id')
  .gte('utc_kickoff', '2025-08-01')
  .lte('utc_kickoff', '2025-12-31')
  .order('utc_kickoff', { ascending: true });

console.log(`Total fixtures Aug-Dec 2025: ${allFixtures?.length || 0}\n`);

// Group by month
const byMonth = {};
allFixtures?.forEach(f => {
  const month = f.utc_kickoff.substring(0, 7); // YYYY-MM
  if (!byMonth[month]) {
    byMonth[month] = { total: 0, synced: 0, sportmonks: 0 };
  }
  byMonth[month].total++;
  if (f.last_synced_at) byMonth[month].synced++;
  if (f.data_source === 'sportmonks') byMonth[month].sportmonks++;
});

console.log('Fixtures by month:');
Object.entries(byMonth).forEach(([month, data]) => {
  console.log(`  ${month}: ${data.total} fixtures, ${data.synced} synced, ${data.sportmonks} from SportMonks`);
});

// Check broadcasts for Nov/Dec fixtures
console.log('\n=== BROADCASTS FOR NOV/DEC 2025 ===');
const novDecFixtures = allFixtures?.filter(f => f.utc_kickoff >= '2025-11-01') || [];
console.log(`Nov/Dec fixtures: ${novDecFixtures.length}`);

let withBroadcasts = 0;
let withoutBroadcasts = 0;

for (const fixture of novDecFixtures) {
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('id')
    .eq('fixture_id', fixture.id);

  if (broadcasts && broadcasts.length > 0) {
    withBroadcasts++;
  } else {
    withoutBroadcasts++;
  }
}

console.log(`  With broadcasts: ${withBroadcasts}`);
console.log(`  Without broadcasts: ${withoutBroadcasts}`);

// Check sync logs
console.log('\n=== RECENT SYNC LOGS ===');
const { data: logs } = await supabase
  .from('api_sync_log')
  .select('*')
  .eq('sync_type', 'fixtures')
  .order('completed_at', { ascending: false })
  .limit(3);

if (logs && logs.length > 0) {
  logs.forEach(log => {
    const date = new Date(log.completed_at).toLocaleString();
    console.log(`\n${date}`);
    console.log(`  Status: ${log.status}`);
    console.log(`  Fixtures: ${log.fixtures_created} created, ${log.fixtures_updated} updated`);
    console.log(`  API calls: ${log.api_calls_made}`);
  });
} else {
  console.log('No sync logs found');
}

// Sample Nov fixture
console.log('\n=== SAMPLE NOV FIXTURE ===');
const { data: sampleNov } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff, last_synced_at, data_source, sportmonks_fixture_id, competition_id')
  .gte('utc_kickoff', '2025-11-01')
  .lte('utc_kickoff', '2025-11-30')
  .eq('competition_id', 1) // Premier League
  .limit(1);

if (sampleNov && sampleNov.length > 0) {
  const fixture = sampleNov[0];
  console.log(`Fixture ${fixture.id}:`);
  console.log(`  Date: ${fixture.utc_kickoff}`);
  console.log(`  Last synced: ${fixture.last_synced_at || 'NEVER'}`);
  console.log(`  Data source: ${fixture.data_source || 'NONE'}`);
  console.log(`  SportMonks ID: ${fixture.sportmonks_fixture_id || 'NONE'}`);

  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('fixture_id', fixture.id);

  console.log(`  Broadcasts: ${broadcasts?.length || 0}`);
  if (broadcasts && broadcasts.length > 0) {
    broadcasts.forEach(b => {
      console.log(`    - ${b.channel_name} (${b.country_code})`);
    });
  }
} else {
  console.log('No Premier League fixtures found for Nov 2025');
}

// Sample Aug fixture (should have broadcasts)
console.log('\n=== SAMPLE AUG FIXTURE (for comparison) ===');
const { data: sampleAug } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff, last_synced_at, data_source, sportmonks_fixture_id, competition_id')
  .gte('utc_kickoff', '2025-08-01')
  .lte('utc_kickoff', '2025-08-31')
  .eq('competition_id', 1) // Premier League
  .limit(1);

if (sampleAug && sampleAug.length > 0) {
  const fixture = sampleAug[0];
  console.log(`Fixture ${fixture.id}:`);
  console.log(`  Date: ${fixture.utc_kickoff}`);
  console.log(`  Last synced: ${fixture.last_synced_at || 'NEVER'}`);
  console.log(`  Data source: ${fixture.data_source || 'NONE'}`);
  console.log(`  SportMonks ID: ${fixture.sportmonks_fixture_id || 'NONE'}`);

  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('fixture_id', fixture.id);

  console.log(`  Broadcasts: ${broadcasts?.length || 0}`);
  if (broadcasts && broadcasts.length > 0) {
    broadcasts.forEach(b => {
      console.log(`    - ${b.channel_name} (${b.country_code})`);
    });
  }
}
