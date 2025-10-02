#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('🔍 Checking Competition Mappings\n');

const { data: mappings } = await supabase
  .from('api_competition_mapping')
  .select('*')
  .eq('is_active', true);

console.log('Competition Mappings:');
mappings?.forEach(m => {
  console.log(`  ${m.our_competition_id}: ${m.sportmonks_league_name.padEnd(30)} → Sports Monks ID: ${m.sportmonks_league_id}`);
});

console.log('\n');

const { data: competitions } = await supabase
  .from('competitions')
  .select('id, name');

console.log('Our Competitions:');
competitions?.forEach(c => {
  const mapped = mappings?.find(m => m.our_competition_id === c.id);
  const status = mapped ? `✅ Mapped to SM ${mapped.sportmonks_league_id}` : '❌ Not mapped';
  console.log(`  ${c.id}: ${c.name.padEnd(30)} ${status}`);
});
