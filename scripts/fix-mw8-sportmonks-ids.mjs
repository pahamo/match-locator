#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔄 Fixing MW8 SportMonks IDs and syncing broadcasters...\n');

// Correct mapping from SportMonks API
const correctMappings = [
  { homeTeam: 'Nottingham Forest', awayTeam: 'Chelsea', correctId: 19427531 },
  { homeTeam: 'Sunderland', awayTeam: 'Wolverhampton Wanderers', correctId: 19427532 },
  { homeTeam: 'Brighton', awayTeam: 'Newcastle United', correctId: 19427525 },
  { homeTeam: 'Burnley', awayTeam: 'Leeds United', correctId: 19427526 },
  { homeTeam: 'Crystal Palace', awayTeam: 'Bournemouth', correctId: 19427527 },
  { homeTeam: 'Manchester City', awayTeam: 'Everton', correctId: 19427530 },
  { homeTeam: 'Fulham', awayTeam: 'Arsenal', correctId: 19427528 },
  { homeTeam: 'Tottenham', awayTeam: 'Aston Villa', correctId: 19427534 },
  { homeTeam: 'Liverpool', awayTeam: 'Manchester United', correctId: 19427529 },
  { homeTeam: 'West Ham', awayTeam: 'Brentford', correctId: 19427535 }
];

for (const mapping of correctMappings) {
  try {
    // Find fixture by team names (partial match)
    const { data: fixture } = await supabase
      .from('fixtures_with_teams')
      .select('id, home_team, away_team, sportmonks_fixture_id, competition_id')
      .eq('competition_id', 1)
      .eq('round->>name', '8')
      .ilike('home_team', `%${mapping.homeTeam}%`)
      .ilike('away_team', `%${mapping.awayTeam}%`)
      .maybeSingle();

    if (!fixture) {
      console.log(`⚠️  Fixture not found: ${mapping.homeTeam} vs ${mapping.awayTeam}`);
      continue;
    }

    console.log(`\n📌 ${fixture.home_team} vs ${fixture.away_team}`);
    console.log(`   Old SM ID: ${fixture.sportmonks_fixture_id}`);
    console.log(`   New SM ID: ${mapping.correctId}`);

    // Update SportMonks ID
    await supabase
      .from('fixtures')
      .update({ sportmonks_fixture_id: mapping.correctId })
      .eq('id', fixture.id);

    console.log(`   ✅ Updated ID`);

    // Fetch broadcaster data from SportMonks
    const url = `https://api.sportmonks.com/v3/football/fixtures/${mapping.correctId}?api_token=${SPORTMONKS_TOKEN}&include=tvstations.tvstation`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.data) {
      console.log(`   ⚠️  No fixture data from API`);
      continue;
    }

    const tvStations = data.data.tvstations || [];

    // Filter for UK broadcasts (country_id: 11, 455, 462)
    const ukStations = tvStations.filter(ts => {
      if (!ts.tvstation) return false;
      return [11, 455, 462].includes(ts.country_id);
    });

    if (ukStations.length === 0) {
      console.log(`   ⚠️  No UK broadcasts found`);
      continue;
    }

    // Delete existing broadcasts
    await supabase
      .from('broadcasts')
      .delete()
      .eq('fixture_id', fixture.id);

    // Insert new broadcasts
    for (const ts of ukStations) {
      const station = ts.tvstation;

      // Skip Amazon for PL
      if (station.name.toLowerCase().includes('amazon')) {
        continue;
      }

      const { error: insertError } = await supabase
        .from('broadcasts')
        .insert({
          fixture_id: fixture.id,
          channel_name: station.name,
          broadcaster_type: station.type || 'tv',
          country_code: 'GB',  // UK broadcasts
          sportmonks_tv_station_id: station.id,
          data_source: 'sportmonks',
          last_synced_at: new Date().toISOString()
        });

      if (insertError) {
        console.log(`     ⚠️  Error inserting ${station.name}:`, insertError.message);
      }
    }

    console.log(`   📺 Added ${ukStations.length} UK broadcasts`);

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 350));

  } catch (err) {
    console.error(`❌ Error: ${mapping.homeTeam} vs ${mapping.awayTeam}:`, err.message);
  }
}

console.log('\n✅ Done!');
