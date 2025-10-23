#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Accept competition ID as argument (default to PL)
const compId = process.argv[2] ? parseInt(process.argv[2]) : 1;
const compNames = { 1: 'Premier League', 2: 'Champions League', 11: 'Europa League' };

console.log(`🔄 Syncing missing broadcaster data for ${compNames[compId] || 'Competition ' + compId}...\n`);

// Get all fixtures in October
const { data: fixturesNeedingBroadcasts } = await supabase
  .from('fixtures')
  .select('id, sportmonks_fixture_id, competition_id')
  .eq('competition_id', compId)
  .gte('utc_kickoff', '2025-10-01')
  .lt('utc_kickoff', '2025-11-01');

console.log(`Found ${fixturesNeedingBroadcasts.length} fixtures to check\n`);

let updated = 0;
let skipped = 0;
let errors = 0;

for (const fixture of fixturesNeedingBroadcasts) {
  try {
    // Check if broadcasts already exist
    const { data: existingBroadcasts } = await supabase
      .from('broadcasts')
      .select('id')
      .eq('fixture_id', fixture.id);

    if (existingBroadcasts && existingBroadcasts.length > 0) {
      skipped++;
      continue;
    }

    // Fetch fixture with TV stations from SportMonks
    const url = `https://api.sportmonks.com/v3/football/fixtures/${fixture.sportmonks_fixture_id}?api_token=${SPORTMONKS_TOKEN}&include=tvstations.tvstation`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.data) {
      console.log(`⚠️  No data for fixture ${fixture.id}`);
      continue;
    }

    const tvStations = data.data.tvstations || [];

    if (tvStations.length === 0) {
      console.log(`  Fixture ${fixture.id}: No TV stations`);
      continue;
    }

    // Filter for UK broadcasts (country_id: 11, 455, 462)
    const ukStations = tvStations.filter(ts => {
      if (!ts.tvstation) return false;
      return [11, 455, 462].includes(ts.country_id);
    });

    if (ukStations.length === 0) {
      console.log(`  Fixture ${fixture.id}: No UK broadcasts`);
      continue;
    }

    console.log(`📺 Fixture ${fixture.id}: Adding ${ukStations.length} UK broadcasts`);

    // Insert broadcasts
    for (const ts of ukStations) {
      const station = ts.tvstation;

      // Skip Amazon for Premier League
      if (fixture.competition_id === 1 && station.name.toLowerCase().includes('amazon')) {
        continue;
      }

      const { error: insertError } = await supabase
        .from('broadcasts')
        .insert({
          fixture_id: fixture.id,
          channel_name: station.name,
          broadcaster_type: station.type || 'tv',
          country_code: 'GB',
          sportmonks_tv_station_id: station.id,
          data_source: 'sportmonks',
          last_synced_at: new Date().toISOString()
        });

      if (insertError && !insertError.message.includes('duplicate key')) {
        console.log(`   ⚠️  Error: ${station.name}: ${insertError.message}`);
      }
    }

    updated++;

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 350));

  } catch (err) {
    console.error(`❌ Error syncing fixture ${fixture.id}:`, err.message);
    errors++;
  }
}

console.log(`\n✅ Done!`);
console.log(`   Updated: ${updated}`);
console.log(`   Skipped (already have broadcasts): ${skipped}`);
console.log(`   Errors: ${errors}`);
