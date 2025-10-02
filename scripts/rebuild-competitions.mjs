#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

console.log('🔄 Rebuilding Competition Mappings\n');
console.log('='.repeat(80));

// Step 1: Get all leagues from Sports Monks
console.log('\n📊 Step 1: Fetching Sports Monks leagues...\n');

const response = await fetch(`https://api.sportmonks.com/v3/football/leagues?api_token=${SPORTMONKS_TOKEN}`);
const leaguesData = await response.json();
const allLeagues = leaguesData.data || [];

// Focus on category 1 (top tier) and major cup competitions
const majorLeagues = allLeagues.filter(l => {
  return l.category === '1' || 
         l.id === 2 ||   // Champions League
         l.id === 5 ||   // Europa League  
         l.id === 24 ||  // FA Cup
         l.id === 27 ||  // Carabao Cup
         l.id === 2286;  // Conference League
});

console.log('Major leagues available:');
majorLeagues.forEach(l => {
  console.log(`  ${l.id}: ${l.name}`);
});

// Step 2: Check current competitions
console.log('\n\n📋 Step 2: Current competitions table...\n');

const { data: currentComps } = await supabase
  .from('competitions')
  .select('*')
  .order('id');

console.log('Current competitions:');
currentComps?.forEach(c => {
  console.log(`  ${c.id}: ${c.name} (${c.slug})`);
});

// Step 3: Show recommended mapping
console.log('\n\n✅ Step 3: Recommended Sports Monks Mappings:\n');

const recommendations = [
  { ourId: 1, smId: 8, name: 'Premier League' },
  { ourId: 2, smId: 2, name: 'Champions League' },
  { ourId: 3, smId: 82, name: 'Bundesliga' },
  { ourId: 4, smId: 564, name: 'La Liga' },
  { ourId: 5, smId: 384, name: 'Serie A' },
  { ourId: 6, smId: 301, name: 'Ligue 1' },
  { ourId: 7, smId: 462, name: 'Liga Portugal' },
  { ourId: 8, smId: 72, name: 'Eredivisie' },
  { ourId: 9, smId: 9, name: 'Championship' },
  { ourId: 11, smId: 5, name: 'Europa League' },
];

recommendations.forEach(r => {
  const comp = currentComps?.find(c => c.id === r.ourId);
  const match = comp?.name === r.name ? '✅' : '❌';
  console.log(`  ${match} Competition ${r.ourId}: ${comp?.name || 'MISSING'} → Sports Monks ${r.smId} (${r.name})`);
});

console.log('\n' + '='.repeat(80));
console.log('\n💡 Next Steps:');
console.log('  1. Clean up competitions table (remove duplicates)');
console.log('  2. Update api_competition_mapping with correct Sports Monks IDs');
console.log('  3. Delete all existing Sports Monks fixtures');
console.log('  4. Re-sync with correct mappings');
