#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('🔍 Competition Mapping Debug\n');
console.log('='.repeat(80));

// Check competition mappings
const { data: mappings } = await supabase
  .from('api_competition_mapping')
  .select('*')
  .order('our_competition_id');

console.log('\n📋 Competition Mappings:\n');
mappings?.forEach(m => {
  console.log(`  ID ${m.our_competition_id}: ${m.our_competition_name}`);
  console.log(`    → Sports Monks: ${m.sportmonks_league_id} (${m.sportmonks_league_name})`);
  console.log(`    → Active: ${m.is_active ? '✅' : '❌'}`);
  console.log('');
});

// Check Sports Monks fixtures by competition
const { data: fixtures } = await supabase
  .from('fixtures')
  .select(`
    id,
    competition_id,
    sportmonks_fixture_id,
    data_source,
    competitions(name)
  `)
  .eq('data_source', 'sportmonks');

console.log('\n📊 Sports Monks Fixtures by Competition:\n');
const byComp = {};
fixtures?.forEach(f => {
  const compId = f.competition_id;
  const compName = f.competitions?.name || 'Unknown';
  if (!byComp[compId]) {
    byComp[compId] = { name: compName, count: 0 };
  }
  byComp[compId].count++;
});

Object.entries(byComp)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([id, data]) => {
    console.log(`  Competition ${id}: ${data.name.padEnd(30)} ${data.count} fixtures`);
  });

// Check specific fixtures
console.log('\n\n🔍 Sample Sports Monks Fixtures:\n');
const { data: samples } = await supabase
  .from('fixtures')
  .select(`
    id,
    sportmonks_fixture_id,
    competition_id,
    utc_kickoff,
    competitions(id, name, slug)
  `)
  .eq('data_source', 'sportmonks')
  .limit(10);

samples?.forEach(f => {
  console.log(`  Fixture ${f.sportmonks_fixture_id}:`);
  console.log(`    Competition: ${f.competitions?.name} (ID: ${f.competition_id})`);
  console.log(`    Kickoff: ${f.utc_kickoff}`);
  console.log('');
});

console.log('='.repeat(80));
