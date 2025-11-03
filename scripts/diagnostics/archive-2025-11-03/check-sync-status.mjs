#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('📊 Sports Monks Sync Status\n');
console.log('='.repeat(80));

// Check synced fixtures by competition
const { data: fixtures } = await supabase
  .from('fixtures')
  .select(`
    id,
    data_source,
    sportmonks_fixture_id,
    competition_id,
    competitions(name)
  `)
  .eq('data_source', 'sportmonks');

// Check broadcasts
const { data: broadcasts } = await supabase
  .from('broadcasts')
  .select('id, fixture_id, channel_name, country_code')
  .eq('data_source', 'sportmonks');

// Group by competition
const byCompetition = {};
fixtures?.forEach(f => {
  const compName = f.competitions?.name || 'Unknown';
  if (!byCompetition[compName]) {
    byCompetition[compName] = { fixtures: 0, fixtureIds: new Set() };
  }
  byCompetition[compName].fixtures++;
  byCompetition[compName].fixtureIds.add(f.id);
});

// Count broadcasts per competition
broadcasts?.forEach(b => {
  const fixture = fixtures?.find(f => f.id === b.fixture_id);
  const compName = fixture?.competitions?.name || 'Unknown';
  if (byCompetition[compName]) {
    byCompetition[compName].broadcasts = (byCompetition[compName].broadcasts || 0) + 1;
  }
});

console.log('\n📅 Fixtures Synced by Competition:\n');
Object.entries(byCompetition)
  .sort((a, b) => b[1].fixtures - a[1].fixtures)
  .forEach(([comp, data]) => {
    console.log(`  ${comp.padEnd(30)} ${data.fixtures.toString().padStart(3)} fixtures, ${(data.broadcasts || 0).toString().padStart(3)} broadcasts`);
  });

console.log(`\n📺 Total Broadcasts: ${broadcasts?.length || 0}`);
console.log(`📊 Total Synced Fixtures: ${fixtures?.length || 0}`);

// Sample broadcasts
if (broadcasts && broadcasts.length > 0) {
  console.log('\n📺 Sample Broadcasts:\n');
  broadcasts.slice(0, 10).forEach(b => {
    console.log(`  ${b.channel_name} (${b.country_code})`);
  });
  if (broadcasts.length > 10) {
    console.log(`  ... and ${broadcasts.length - 10} more`);
  }
}

console.log('\n' + '='.repeat(80));
