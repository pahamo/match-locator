#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const leagues = [
  { id: 3, name: 'Bundesliga' },
  { id: 4, name: 'La Liga' },
  { id: 5, name: 'Serie A' },
  { id: 6, name: 'Ligue 1' },
  { id: 9, name: 'Championship' },
];

for (const league of leagues) {
  console.log(`\n📅 ${league.name}:`);

  // SportMonks date range
  const { data: smFixtures } = await supabase
    .from('fixtures')
    .select('utc_kickoff')
    .eq('competition_id', league.id)
    .eq('data_source', 'sportmonks')
    .order('utc_kickoff', { ascending: true });

  if (smFixtures && smFixtures.length > 0) {
    console.log(`  SportMonks: ${smFixtures[0].utc_kickoff.slice(0, 10)} → ${smFixtures[smFixtures.length - 1].utc_kickoff.slice(0, 10)} (${smFixtures.length} fixtures)`);
  } else {
    console.log(`  SportMonks: No fixtures`);
  }

  // Manual date range
  const { data: manualFixtures } = await supabase
    .from('fixtures')
    .select('utc_kickoff')
    .eq('competition_id', league.id)
    .eq('data_source', 'manual')
    .order('utc_kickoff', { ascending: true });

  if (manualFixtures && manualFixtures.length > 0) {
    console.log(`  Manual: ${manualFixtures[0].utc_kickoff.slice(0, 10)} → ${manualFixtures[manualFixtures.length - 1].utc_kickoff.slice(0, 10)} (${manualFixtures.length} fixtures)`);
  } else {
    console.log(`  Manual: No fixtures`);
  }
}

console.log();
