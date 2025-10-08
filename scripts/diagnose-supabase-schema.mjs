#!/usr/bin/env node
/**
 * Comprehensive Supabase Schema & Data Diagnostic
 *
 * This script checks:
 * 1. Table schemas (fixtures, broadcasts, providers)
 * 2. View definition (fixtures_with_teams)
 * 3. Fixture 6057 specifically
 * 4. Matchweek 4 data
 * 5. Data relationships and consistency
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('═══════════════════════════════════════════════════════════════');
console.log('  SUPABASE SCHEMA & DATA DIAGNOSTIC');
console.log('═══════════════════════════════════════════════════════════════\n');

// Helper to run raw SQL
async function runSQL(query) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    console.log('⚠️  SQL query failed, using alternative method');
    return null;
  }

  return await response.json();
}

async function checkFixturesTable() {
  console.log('📋 FIXTURES TABLE SCHEMA');
  console.log('─────────────────────────────────────────────────────────────\n');

  const { data, error } = await supabase
    .from('fixtures')
    .select('*')
    .limit(1);

  if (data && data[0]) {
    console.log('Columns in fixtures table:');
    Object.keys(data[0]).forEach(col => {
      console.log(`   - ${col}: ${typeof data[0][col]}`);
    });
  }

  console.log('\n');
}

async function checkBroadcastsTable() {
  console.log('📺 BROADCASTS TABLE SCHEMA & DATA');
  console.log('─────────────────────────────────────────────────────────────\n');

  const { data, error } = await supabase
    .from('broadcasts')
    .select('*')
    .limit(1);

  if (data && data[0]) {
    console.log('Columns in broadcasts table:');
    Object.keys(data[0]).forEach(col => {
      console.log(`   - ${col}: ${typeof data[0][col]}`);
    });
  }

  // Count total
  const { count } = await supabase
    .from('broadcasts')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal broadcasts: ${count}`);

  console.log('\n');
}

async function checkProvidersTable() {
  console.log('🏢 PROVIDERS TABLE');
  console.log('─────────────────────────────────────────────────────────────\n');

  const { data } = await supabase
    .from('providers')
    .select('*')
    .order('id');

  if (data) {
    console.log('All providers:');
    data.forEach(p => {
      console.log(`   ${p.id}: ${p.name} (${p.slug})`);
    });
  }

  console.log('\n');
}

async function checkFixture6057() {
  console.log('🔍 FIXTURE 6057 DETAILED ANALYSIS');
  console.log('─────────────────────────────────────────────────────────────\n');

  // Get fixture basic data
  const { data: fixture } = await supabase
    .from('fixtures')
    .select('*')
    .eq('id', 6057)
    .single();

  console.log('Fixture 6057 basic data:');
  console.log(JSON.stringify(fixture, null, 2));

  // Get broadcasts for this fixture
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('fixture_id', 6057)
    .order('id');

  console.log(`\n\nBroadcasts for fixture 6057 (${broadcasts?.length || 0} records):`);
  broadcasts?.forEach((b, i) => {
    console.log(`\n   Broadcast #${i + 1}:`);
    console.log(`   - ID: ${b.id}`);
    console.log(`   - Channel: ${b.channel_name}`);
    console.log(`   - Provider ID: ${b.provider_id}`);
    console.log(`   - SportMonks TV Station ID: ${b.sportmonks_tv_station_id}`);
    console.log(`   - Country: ${b.country_code}`);
    console.log(`   - Type: ${b.broadcaster_type}`);
  });

  // Get from view
  const { data: viewData } = await supabase
    .from('fixtures_with_teams')
    .select('id, home_team, away_team, broadcaster, broadcaster_id, matchweek')
    .eq('id', 6057)
    .single();

  console.log('\n\nFixture 6057 from fixtures_with_teams view:');
  console.log(JSON.stringify(viewData, null, 2));

  console.log('\n');
}

async function checkMatchweek4() {
  console.log('📅 MATCHWEEK 4 FIXTURES');
  console.log('─────────────────────────────────────────────────────────────\n');

  const { data: fixtures } = await supabase
    .from('fixtures_with_teams')
    .select('id, home_team, away_team, broadcaster, matchweek, competition_id')
    .eq('matchweek', 4)
    .eq('competition_id', 1) // Premier League
    .order('id');

  console.log(`Found ${fixtures?.length || 0} fixtures for Matchweek 4:\n`);

  fixtures?.forEach(f => {
    console.log(`   Fixture ${f.id}: ${f.home_team} vs ${f.away_team}`);
    console.log(`      Broadcaster: ${f.broadcaster || 'NULL'}`);
    console.log('');
  });

  // Check if there are more fixtures in base table
  const { data: baseFixtures } = await supabase
    .from('fixtures')
    .select('id, home_team_id, away_team_id, matchweek, competition_id')
    .eq('matchweek', 4)
    .eq('competition_id', 1)
    .order('id');

  console.log(`Base fixtures table has ${baseFixtures?.length || 0} fixtures for Matchweek 4\n`);

  console.log('\n');
}

async function checkViewDefinition() {
  console.log('👁️  FIXTURES_WITH_TEAMS VIEW DEFINITION');
  console.log('─────────────────────────────────────────────────────────────\n');

  console.log('Attempting to get view definition...\n');

  // Sample query to understand the view
  const { data } = await supabase
    .from('fixtures_with_teams')
    .select('*')
    .limit(1);

  if (data && data[0]) {
    console.log('View columns:');
    Object.keys(data[0]).forEach(col => {
      console.log(`   - ${col}`);
    });
  }

  console.log('\n');
}

async function checkBroadcasterLogic() {
  console.log('🧮 BROADCASTER SELECTION LOGIC');
  console.log('─────────────────────────────────────────────────────────────\n');

  // Find fixtures with multiple broadcasts
  const { data: allBroadcasts } = await supabase
    .from('broadcasts')
    .select('fixture_id, channel_name, provider_id, id')
    .order('fixture_id')
    .order('id');

  const fixtureMap = {};
  allBroadcasts?.forEach(b => {
    if (!fixtureMap[b.fixture_id]) {
      fixtureMap[b.fixture_id] = [];
    }
    fixtureMap[b.fixture_id].push(b);
  });

  const multipleFixtures = Object.entries(fixtureMap)
    .filter(([_, broadcasts]) => broadcasts.length > 1)
    .slice(0, 5);

  console.log('Sample fixtures with multiple broadcasts:');
  console.log('(Shows which broadcaster is selected by the view)\n');

  for (const [fixtureId, broadcasts] of multipleFixtures) {
    const { data: viewData } = await supabase
      .from('fixtures_with_teams')
      .select('id, home_team, away_team, broadcaster')
      .eq('id', fixtureId)
      .single();

    console.log(`Fixture ${fixtureId}: ${viewData?.home_team} vs ${viewData?.away_team}`);
    console.log(`   View shows: ${viewData?.broadcaster || 'NULL'}`);
    console.log(`   All broadcasts (${broadcasts.length}):`);
    broadcasts.forEach(b => {
      console.log(`      - ${b.channel_name} (ID: ${b.id}, Provider: ${b.provider_id})`);
    });
    console.log('');
  }

  console.log('\n');
}

async function main() {
  try {
    await checkFixturesTable();
    await checkBroadcastsTable();
    await checkProvidersTable();
    await checkFixture6057();
    await checkMatchweek4();
    await checkViewDefinition();
    await checkBroadcasterLogic();

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  DIAGNOSTIC COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
