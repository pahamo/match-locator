#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('📊 Fixture Data Sources\n');

const { count: sportmonks } = await supabase
  .from('fixtures')
  .select('*', { count: 'exact', head: true })
  .eq('data_source', 'sportmonks');

const { count: manual } = await supabase
  .from('fixtures')
  .select('*', { count: 'exact', head: true })
  .eq('data_source', 'manual');

const { count: nullSource } = await supabase
  .from('fixtures')
  .select('*', { count: 'exact', head: true })
  .is('data_source', null);

const { count: total } = await supabase
  .from('fixtures')
  .select('*', { count: 'exact', head: true });

console.log('Fixtures by Source:');
console.log(`  🤖 Sports Monks:  ${sportmonks || 0}`);
console.log(`  ✋ Manual Entry:   ${manual || 0}`);
console.log(`  📦 Legacy (null):  ${nullSource || 0}`);
console.log(`  ━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  📊 Total:          ${total || 0}`);

console.log('\n' + '='.repeat(50));
console.log('\n💡 Recommendation:');

if (sportmonks > 0) {
  const percentage = ((sportmonks / total) * 100).toFixed(1);
  console.log(`✅ Sports Monks is working! (${percentage}% of fixtures)`);

  if (nullSource > 0 || manual > 0) {
    console.log(`\n⚠️  You still have ${(nullSource || 0) + (manual || 0)} non-Sports Monks fixtures.`);
    console.log('   These are either:');
    console.log('   - Legacy fixtures (before Sports Monks integration)');
    console.log('   - Manual entries');
    console.log('   - Competitions not in Sports Monks');
  }
} else {
  console.log('❌ No Sports Monks fixtures found.');
  console.log('   Run: node scripts/sync-sportmonks-fixtures.mjs');
}
