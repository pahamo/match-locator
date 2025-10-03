#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const { data: fixtures } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff, data_source, sportmonks_fixture_id')
  .eq('competition_id', 3)
  .order('utc_kickoff', { ascending: true });

const sportmonks = fixtures.filter(f => f.data_source === 'sportmonks');
const manual = fixtures.filter(f => f.data_source === 'manual');

console.log(`\nBundesliga fixtures:`);
console.log(`  SportMonks: ${sportmonks.length}`);
console.log(`  Manual: ${manual.length}`);
console.log(`  Total: ${fixtures.length}\n`);

if (sportmonks.length > 0) {
  console.log('First 5 SportMonks fixtures:');
  sportmonks.slice(0, 5).forEach((f, i) => {
    console.log(`  ${i+1}. ${f.utc_kickoff} (SM ID: ${f.sportmonks_fixture_id})`);
  });
  console.log('');
}

if (manual.length > 0) {
  console.log('First 5 manual fixtures:');
  manual.slice(0, 5).forEach((f, i) => {
    console.log(`  ${i+1}. ${f.utc_kickoff}`);
  });
}
