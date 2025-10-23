#!/usr/bin/env node

/**
 * Fix Missing Team Crests
 *
 * This script:
 * 1. Identifies teams with missing crest_url
 * 2. Fetches team logos from Sports Monks API
 * 3. Updates the teams table with crest URLs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

if (!SPORTMONKS_TOKEN) {
  console.error('❌ Missing SPORTMONKS_TOKEN');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🖼️  Fixing Missing Team Crests\n');
console.log('='.repeat(80));

async function fetchFromSportMonks(endpoint, params = {}) {
  const url = new URL(`https://api.sportmonks.com/v3/football${endpoint}`);
  url.searchParams.append('api_token', SPORTMONKS_TOKEN);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Sports Monks API error: ${response.status}`);
  }

  return response.json();
}

async function checkMissingCrests() {
  console.log('\n🔍 CHECKING FOR MISSING CRESTS');
  console.log('-'.repeat(80));

  // Get teams with missing crests
  const { data: teams, error } = await supabase
    .from('teams')
    .select('id, name, slug, sportmonks_team_id, crest_url, competition_id')
    .or('crest_url.is.null,crest_url.eq.')
    .order('name');

  if (error) {
    console.error('Error fetching teams:', error);
    return [];
  }

  console.log(`Found ${teams.length} teams with missing crests:`);
  teams.forEach(t => {
    console.log(`  - ${t.name} (ID: ${t.id}, Sports Monks ID: ${t.sportmonks_team_id || 'N/A'})`);
  });

  return teams;
}

async function fixCrests(teams) {
  console.log('\n🔧 FIXING TEAM CRESTS');
  console.log('-'.repeat(80));

  let fixed = 0;
  let failed = 0;

  for (const team of teams) {
    try {
      let imagePath = null;

      // Try to get image from Sports Monks if we have the team ID
      if (team.sportmonks_team_id) {
        try {
          const data = await fetchFromSportMonks(`/teams/${team.sportmonks_team_id}`);
          imagePath = data.data?.image_path || null;
        } catch (err) {
          console.log(`  ⚠️  Failed to fetch from Sports Monks for ${team.name}: ${err.message}`);
        }
      }

      // If no Sports Monks ID or no image found, try searching by name
      if (!imagePath) {
        try {
          const searchName = encodeURIComponent(team.name);
          const data = await fetchFromSportMonks('/teams/search', { name: searchName });

          if (data.data && data.data.length > 0) {
            imagePath = data.data[0].image_path || null;
          }
        } catch (err) {
          console.log(`  ⚠️  Failed to search for ${team.name}: ${err.message}`);
        }
      }

      if (imagePath) {
        // Update team with crest URL
        const { error: updateError } = await supabase
          .from('teams')
          .update({
            crest_url: imagePath
          })
          .eq('id', team.id);

        if (updateError) {
          console.error(`  ❌ Failed to update ${team.name}:`, updateError.message);
          failed++;
        } else {
          console.log(`  ✅ Fixed: ${team.name} → ${imagePath}`);
          fixed++;
        }
      } else {
        console.log(`  ⚠️  No crest found for: ${team.name}`);
        failed++;
      }

      // Rate limiting: wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (err) {
      console.error(`  ❌ Error processing ${team.name}:`, err.message);
      failed++;
    }
  }

  console.log(`\n✅ Fixed: ${fixed} teams`);
  console.log(`❌ Failed: ${failed} teams`);
}

async function verifyFixes() {
  console.log('\n📊 VERIFICATION');
  console.log('-'.repeat(80));

  // Check teams with missing crests
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, crest_url')
    .or('crest_url.is.null,crest_url.eq.');

  console.log(`\nTeams still missing crests: ${teams?.length || 0}`);

  if (teams && teams.length > 0 && teams.length <= 10) {
    teams.forEach(t => {
      console.log(`  - ${t.name} (ID: ${t.id})`);
    });
  }

  // Check Premier League teams specifically
  const { data: plTeams } = await supabase
    .from('teams')
    .select('id, name, crest_url')
    .eq('competition_id', 1)
    .or('crest_url.is.null,crest_url.eq.');

  if (plTeams && plTeams.length > 0) {
    console.log(`\n⚠️  Premier League teams still missing crests: ${plTeams.length}`);
    plTeams.forEach(t => {
      console.log(`  - ${t.name}`);
    });
  } else {
    console.log('\n✅ All Premier League teams have crests!');
  }
}

async function main() {
  try {
    const teams = await checkMissingCrests();

    if (teams.length === 0) {
      console.log('\n✅ All teams already have crests!');
      return;
    }

    await fixCrests(teams);
    await verifyFixes();

    console.log('\n' + '='.repeat(80));
    console.log('✅ Crest fixing complete\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
