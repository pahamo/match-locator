#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const { data: fixtures, error } = await supabase
  .from('fixtures')
  .select('id, matchday, competition_id, utc_kickoff')
  .eq('competition_id', 1)
  .order('utc_kickoff', { ascending: true })
  .limit(20);

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

if (!fixtures || fixtures.length === 0) {
  console.log('No fixtures found');
  process.exit(0);
}

console.log('\n📊 Premier League fixtures with matchweek data:\n');

fixtures.forEach((f, i) => {
  console.log(`${i+1}. ${f.utc_kickoff.slice(0, 10)} - Matchday: ${f.matchday || 'NULL'}`);
});

const withMatchweek = fixtures.filter(f => f.matchday !== null).length;
const withoutMatchweek = fixtures.filter(f => f.matchday === null).length;

console.log(`\n✅ With matchweek: ${withMatchweek}`);
console.log(`❌ Without matchweek: ${withoutMatchweek}\n`);
