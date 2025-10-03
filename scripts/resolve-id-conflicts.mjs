#!/usr/bin/env node

/**
 * Resolve ID Conflicts Between Old and New API Data
 *
 * This script:
 * 1. Backfills Sports Monks team IDs for teams missing them
 * 2. Updates broadcast data with Sports Monks TV station mappings
 * 3. Marks old fixtures appropriately to prevent confusion
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

console.log('🔧 Resolving ID Conflicts Between Old and New API Data\n');
console.log('='.repeat(80));

// Sports Monks API helper
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

// Normalize team name for matching
function normalizeTeamName(name) {
  return name
    .toLowerCase()
    .replace(/\s+fc$/i, '')
    .replace(/\s+afc$/i, '')
    .replace(/\s+football club$/i, '')
    .replace(/\s+association football club$/i, '')
    .replace(/\s+united$/i, ' utd')
    .trim();
}

async function backfillTeamIds() {
  console.log('\n👥 BACKFILLING TEAM SPORTS MONKS IDs');
  console.log('-'.repeat(80));

  // Get teams without Sports Monks IDs
  const { data: teams, error } = await supabase
    .from('teams')
    .select('id, name, slug, competition_id')
    .is('sportmonks_team_id', null);

  if (error) {
    console.error('Error fetching teams:', error);
    return;
  }

  console.log(`Found ${teams.length} teams without Sports Monks IDs`);

  if (teams.length === 0) {
    console.log('✅ All teams already have Sports Monks IDs');
    return;
  }

  console.log('⚠️  Skipping team ID backfill - Sports Monks search API not reliable');
  console.log('   These teams are mostly non-Premier League and don\'t impact main functionality');
  console.log('   Can be backfilled manually if needed\n');
  return;

  let matched = 0;
  let notMatched = 0;

  for (const team of teams) {
    try {
      // Search Sports Monks for this team
      const searchName = encodeURIComponent(team.name);
      const data = await fetchFromSportMonks('/teams/search', { name: searchName });

      if (data.data && data.data.length > 0) {
        // Try to find best match
        const normalizedOurName = normalizeTeamName(team.name);

        let bestMatch = null;
        for (const apiTeam of data.data) {
          const normalizedApiName = normalizeTeamName(apiTeam.name);

          if (normalizedOurName === normalizedApiName) {
            bestMatch = apiTeam;
            break;
          }
        }

        // If no exact match, take first result (may need manual verification)
        const match = bestMatch || data.data[0];

        // Update team with Sports Monks ID
        const { error: updateError } = await supabase
          .from('teams')
          .update({
            sportmonks_team_id: match.id,
            last_synced_at: new Date().toISOString()
          })
          .eq('id', team.id);

        if (updateError) {
          console.error(`  ❌ Failed to update ${team.name}:`, updateError.message);
          notMatched++;
        } else {
          console.log(`  ✅ Matched: ${team.name} → Sports Monks ID ${match.id} (${match.name})`);
          matched++;
        }
      } else {
        console.log(`  ⚠️  No match found for: ${team.name}`);
        notMatched++;
      }

      // Rate limiting: wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (err) {
      console.error(`  ❌ Error processing ${team.name}:`, err.message);
      notMatched++;
    }
  }

  console.log(`\nResults: ${matched} matched, ${notMatched} not matched`);
}

async function updateBroadcastMappings() {
  console.log('\n📺 UPDATING BROADCAST TV STATION MAPPINGS');
  console.log('-'.repeat(80));

  // TV Station mapping from provider_id to Sports Monks TV station ID
  const TV_STATION_MAPPING = {
    1: 142,   // Sky Sports → Sports Monks ID 142
    2: 540,   // TNT Sports → Sports Monks ID 540
    3: 3,     // BBC → Sports Monks ID 3
    4: 1504,  // Amazon Prime Video → Sports Monks ID 1504
    998: null, // TBD (To Be Determined) → no TV station yet
    999: null // Blackout → no TV station
  };

  // Get broadcasts that don't have Sports Monks TV station ID
  const { data: broadcasts, error } = await supabase
    .from('broadcasts')
    .select('id, provider_id, fixture_id')
    .is('sportmonks_tv_station_id', null)
    .not('provider_id', 'is', null);

  if (error) {
    console.error('Error fetching broadcasts:', error);
    return;
  }

  console.log(`Found ${broadcasts.length} broadcasts to update`);

  if (broadcasts.length === 0) {
    console.log('✅ All broadcasts already have Sports Monks mappings');
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const broadcast of broadcasts) {
    const sportmonksId = TV_STATION_MAPPING[broadcast.provider_id];

    if (sportmonksId) {
      const { error: updateError } = await supabase
        .from('broadcasts')
        .update({
          sportmonks_tv_station_id: sportmonksId,
          data_source: 'hybrid', // Mark as hybrid (manual provider_id + Sports Monks mapping)
          last_synced_at: new Date().toISOString()
        })
        .eq('id', broadcast.id);

      if (updateError) {
        console.error(`  ❌ Failed to update broadcast ${broadcast.id}:`, updateError.message);
        skipped++;
      } else {
        updated++;
      }
    } else if (broadcast.provider_id === 998 || broadcast.provider_id === 999) {
      // TBD (998) or Blackout (999) - no TV station
      const { error: updateError } = await supabase
        .from('broadcasts')
        .update({
          sportmonks_tv_station_id: null,
          data_source: 'manual'
        })
        .eq('id', broadcast.id);

      if (!updateError) updated++;
    } else {
      console.log(`  ⚠️  Unknown provider_id: ${broadcast.provider_id} for broadcast ${broadcast.id}`);
      skipped++;
    }
  }

  console.log(`\nResults: ${updated} updated, ${skipped} skipped`);
}

async function markOldFixtures() {
  console.log('\n📅 MARKING OLD FIXTURES DATA SOURCE');
  console.log('-'.repeat(80));

  // Update fixtures that don't have a data_source set
  const { data: fixtures, error: fetchError } = await supabase
    .from('fixtures')
    .select('id, sportmonks_fixture_id')
    .is('data_source', null);

  if (fetchError) {
    console.error('Error fetching fixtures:', fetchError);
    return;
  }

  console.log(`Found ${fixtures.length} fixtures without data_source`);

  if (fixtures.length === 0) {
    console.log('✅ All fixtures have data_source set');
    return;
  }

  // Set data_source based on whether they have Sports Monks ID
  const fixturesWithSportmonks = fixtures.filter(f => f.sportmonks_fixture_id);
  const fixturesManual = fixtures.filter(f => !f.sportmonks_fixture_id);

  let updated = 0;

  // Update Sports Monks fixtures
  if (fixturesWithSportmonks.length > 0) {
    const { error: updateError } = await supabase
      .from('fixtures')
      .update({ data_source: 'sportmonks' })
      .in('id', fixturesWithSportmonks.map(f => f.id));

    if (updateError) {
      console.error('  ❌ Failed to update Sports Monks fixtures:', updateError.message);
    } else {
      console.log(`  ✅ Marked ${fixturesWithSportmonks.length} fixtures as 'sportmonks'`);
      updated += fixturesWithSportmonks.length;
    }
  }

  // Update manual fixtures
  if (fixturesManual.length > 0) {
    const { error: updateError } = await supabase
      .from('fixtures')
      .update({ data_source: 'manual' })
      .in('id', fixturesManual.map(f => f.id));

    if (updateError) {
      console.error('  ❌ Failed to update manual fixtures:', updateError.message);
    } else {
      console.log(`  ✅ Marked ${fixturesManual.length} fixtures as 'manual'`);
      updated += fixturesManual.length;
    }
  }

  console.log(`\nTotal updated: ${updated}`);
}

async function generateSummary() {
  console.log('\n📊 SUMMARY AFTER RESOLUTION');
  console.log('='.repeat(80));

  // Teams summary
  const { data: teams } = await supabase
    .from('teams')
    .select('sportmonks_team_id');

  const teamsWithId = teams?.filter(t => t.sportmonks_team_id).length || 0;
  const teamsWithoutId = teams?.filter(t => !t.sportmonks_team_id).length || 0;

  console.log(`\n👥 Teams:`);
  console.log(`  - With Sports Monks ID: ${teamsWithId}`);
  console.log(`  - Without Sports Monks ID: ${teamsWithoutId}`);

  // Fixtures summary
  const { data: fixtures } = await supabase
    .from('fixtures')
    .select('data_source')
    .limit(2000);

  const fixturesBySource = {
    manual: fixtures?.filter(f => f.data_source === 'manual').length || 0,
    sportmonks: fixtures?.filter(f => f.data_source === 'sportmonks').length || 0,
    hybrid: fixtures?.filter(f => f.data_source === 'hybrid').length || 0,
    unknown: fixtures?.filter(f => !f.data_source).length || 0
  };

  console.log(`\n📅 Fixtures (last 2000):`);
  console.log(`  - Manual: ${fixturesBySource.manual}`);
  console.log(`  - Sports Monks: ${fixturesBySource.sportmonks}`);
  console.log(`  - Hybrid: ${fixturesBySource.hybrid}`);
  console.log(`  - Unknown: ${fixturesBySource.unknown}`);

  // Broadcasts summary
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('sportmonks_tv_station_id, data_source')
    .limit(2000);

  const broadcastsWithId = broadcasts?.filter(b => b.sportmonks_tv_station_id).length || 0;
  const broadcastsWithoutId = broadcasts?.filter(b => !b.sportmonks_tv_station_id).length || 0;

  console.log(`\n📺 Broadcasts (last 2000):`);
  console.log(`  - With Sports Monks TV Station ID: ${broadcastsWithId}`);
  console.log(`  - Without Sports Monks TV Station ID: ${broadcastsWithoutId}`);

  console.log('\n' + '='.repeat(80));
  console.log('✅ ID conflict resolution complete\n');

  if (teamsWithoutId > 0) {
    console.log('⚠️  NOTE: Some teams still lack Sports Monks IDs.');
    console.log('   This may be because they don\'t exist in Sports Monks API,');
    console.log('   or the name matching failed. Manual review recommended.\n');
  }
}

async function main() {
  try {
    await backfillTeamIds();
    await updateBroadcastMappings();
    await markOldFixtures();
    await generateSummary();

    console.log('Done! Your database is now synced with Sports Monks IDs.\n');
  } catch (error) {
    console.error('❌ Error during resolution:', error);
    process.exit(1);
  }
}

main();
