#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

async function makeRequest(endpoint) {
  const url = `https://api.sportmonks.com/v3/football${endpoint}`;
  const separator = endpoint.includes('?') ? '&' : '?';

  const response = await fetch(`${url}${separator}api_token=${SPORTMONKS_TOKEN}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

console.log('Fetching Sports Monks competition logos...\n');

// Get all mappings
const { data: mappings, error } = await supabase
  .from('api_competition_mapping')
  .select('*')
  .eq('is_active', true);

if (error) {
  console.error('Error fetching mappings:', error);
  process.exit(1);
}

console.log(`Found ${mappings.length} active competition mappings\n`);

// Store logos to update in api_competition_mapping instead
const updates = [];

// Fetch logos
for (const mapping of mappings) {
  const leagueId = mapping.sportmonks_league_id;
  const competitionId = mapping.our_competition_id;

  try {
    console.log(`Fetching logo for ${mapping.sportmonks_league_name} (SM ID: ${leagueId})...`);

    const response = await makeRequest(`/leagues/${leagueId}`);
    const league = response.data;

    if (league.image_path) {
      console.log(`  Logo URL: ${league.image_path}`);

      updates.push({
        competitionId,
        competitionName: mapping.sportmonks_league_name,
        leagueId,
        logoUrl: league.image_path
      });

      console.log(`  ✅ Found logo`);
    } else {
      console.log('  ⚠️  No image_path in API response');
    }

    console.log('');

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));

  } catch (err) {
    console.log(`  ❌ Error: ${err.message}\n`);
  }
}

console.log('\n=== SPORTS MONKS COMPETITION LOGOS ===\n');
updates.forEach(u => {
  console.log(`Competition ${u.competitionId}: ${u.competitionName}`);
  console.log(`  Sports Monks ID: ${u.leagueId}`);
  console.log(`  Logo URL: ${u.logoUrl}`);
  console.log('');
});

console.log(`\n✅ Found ${updates.length} competition logos from Sports Monks`);
console.log('\nTo use these in the frontend, you can either:');
console.log('1. Add a sportmonks_image_url column to the competitions table');
console.log('2. Add a logo_url column to api_competition_mapping table');
console.log('3. Update src/config/competitions.ts with these URLs');
