#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('🔍 Checking Competition Mappings\n');

// Get actual competitions from competitions table
const { data: competitions } = await supabase
  .from('competitions')
  .select('*')
  .order('id');

console.log('📊 Competitions Table:\n');
competitions?.forEach(c => {
  console.log(`  ${c.id}: ${c.name} (${c.slug})`);
});

// Get mappings
const { data: mappings } = await supabase
  .from('api_competition_mapping')
  .select('*')
  .order('our_competition_id');

console.log('\n\n📋 API Competition Mappings:\n');
mappings?.forEach(m => {
  const comp = competitions?.find(c => c.id === m.our_competition_id);
  console.log(`  Mapping ID: ${m.id}`);
  console.log(`    Our Competition: ${m.our_competition_id} - ${comp?.name || 'NOT FOUND'}`);
  console.log(`    Sports Monks: ${m.sportmonks_league_id} - ${m.sportmonks_league_name}`);
  console.log(`    Active: ${m.is_active}`);
  console.log('');
});

// Check for mismatches
console.log('\n⚠️  Checking for Mismatches:\n');
mappings?.forEach(m => {
  const comp = competitions?.find(c => c.id === m.our_competition_id);
  if (comp && m.our_competition_name !== comp.name) {
    console.log(`  ❌ Mismatch for ID ${m.our_competition_id}:`);
    console.log(`     Mapping says: "${m.our_competition_name}"`);
    console.log(`     Competition table says: "${comp.name}"`);
  }
});
