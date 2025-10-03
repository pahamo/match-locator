#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const leagues = [
  { id: 2, name: 'Champions League' },
  { id: 3, name: 'Bundesliga' },
  { id: 4, name: 'La Liga' },
  { id: 5, name: 'Serie A' },
  { id: 6, name: 'Ligue 1' },
  { id: 9, name: 'Championship' },
];

console.log('\n🧹 Cleaning up manual fixtures...\n');

for (const league of leagues) {
  // Get manual fixtures
  const { data: manualFixtures } = await supabase
    .from('fixtures')
    .select('id')
    .eq('competition_id', league.id)
    .eq('data_source', 'manual');

  if (!manualFixtures || manualFixtures.length === 0) {
    console.log(`✅ ${league.name}: No manual fixtures to delete`);
    continue;
  }

  const ids = manualFixtures.map(f => f.id);
  console.log(`🔍 ${league.name}: Found ${ids.length} manual fixtures`);

  // Delete broadcasts first (foreign key constraint)
  const { error: broadcastError } = await supabase
    .from('broadcasts')
    .delete()
    .in('fixture_id', ids);

  if (broadcastError) {
    console.log(`  ❌ Error deleting broadcasts: ${broadcastError.message}`);
    continue;
  }

  // Delete fixtures
  const { error: fixtureError } = await supabase
    .from('fixtures')
    .delete()
    .in('id', ids);

  if (fixtureError) {
    console.log(`  ❌ Error deleting fixtures: ${fixtureError.message}`);
  } else {
    console.log(`  ✅ Deleted ${ids.length} manual fixtures`);
  }
}

console.log('\n✨ Cleanup complete!\n');
