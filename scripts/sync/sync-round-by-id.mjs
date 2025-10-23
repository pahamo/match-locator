#!/usr/bin/env node

/**
 * Sync a specific round by ID from Sports Monks API
 *
 * Usage:
 *   node scripts/sync-round-by-id.mjs --round-id=372202 --competition-id=1
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Environment validation
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN || process.env.REACT_APP_SPORTMONKS_TOKEN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SPORTMONKS_TOKEN) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Parse CLI arguments
const args = process.argv.slice(2);
let roundId = null;
let competitionId = null;

args.forEach(arg => {
  if (arg.startsWith('--round-id=')) {
    roundId = parseInt(arg.split('=')[1], 10);
  }
  if (arg.startsWith('--competition-id=')) {
    competitionId = parseInt(arg.split('=')[1], 10);
  }
});

if (!roundId || !competitionId) {
  console.error('❌ Missing required arguments: --round-id and --competition-id');
  process.exit(1);
}

// Competition mapping
const COMPETITION_MAPPING = {
  1: { sportmonksId: 8, name: 'Premier League' }
};

const config = COMPETITION_MAPPING[competitionId];
if (!config) {
  console.error(`❌ Unknown competition ID: ${competitionId}`);
  process.exit(1);
}

console.log(`🔄 Syncing ${config.name} Round ${roundId}...`);

// Fetch round with fixtures
const url = `https://api.sportmonks.com/v3/football/rounds/${roundId}?api_token=${SPORTMONKS_TOKEN}&include=fixtures.participants;fixtures.tvstations.tvstation;fixtures.scores;fixtures.state`;

try {
  const response = await fetch(url);
  const data = await response.json();

  if (!data.data) {
    console.error('❌ No data returned from API');
    process.exit(1);
  }

  const round = data.data;
  const fixtures = round.fixtures || [];

  console.log(`📊 Found ${fixtures.length} fixtures in Round ${round.name}`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const fixture of fixtures) {
    try {
      // Extract participants
      const participants = fixture.participants || [];
      const homeParticipant = participants.find(p => p.meta?.location === 'home');
      const awayParticipant = participants.find(p => p.meta?.location === 'away');

      if (!homeParticipant || !awayParticipant) {
        console.log(`⚠️  Skipping ${fixture.name} - missing participants`);
        continue;
      }

      // Find teams in database
      const { data: homeTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('sportmonks_id', homeParticipant.id)
        .single();

      const { data: awayTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('sportmonks_id', awayParticipant.id)
        .single();

      if (!homeTeam || !awayTeam) {
        console.log(`⚠️  Skipping ${fixture.name} - teams not in database`);
        continue;
      }

      // Extract scores
      const scores = fixture.scores || [];
      const ftScore = scores.find(s => s.description === 'CURRENT');

      // Build fixture object
      const fixtureData = {
        sportmonks_id: fixture.id,
        competition_id: competitionId,
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        utc_kickoff: new Date(fixture.starting_at).toISOString(),
        venue: fixture.venue_id || null,
        status: fixture.state?.short || 'NS',
        stage: fixture.stage_id || null,
        round: {
          id: round.id,
          name: round.name
        },
        home_score: ftScore?.score?.participant === 'home' ? ftScore?.score?.goals : null,
        away_score: ftScore?.score?.participant === 'away' ? ftScore?.score?.goals : null
      };

      // Upsert fixture
      const { data: upsertedFixture, error: upsertError } = await supabase
        .from('fixtures')
        .upsert(fixtureData, {
          onConflict: 'sportmonks_id'
        })
        .select()
        .single();

      if (upsertError) {
        console.error(`❌ Error upserting ${fixture.name}:`, upsertError);
        errors++;
        continue;
      }

      const isNew = !fixtures.find(f => f.sportmonks_id === fixture.id);
      if (isNew) {
        console.log(`✅ Created: ${fixture.name}`);
        created++;
      } else {
        console.log(`✅ Updated: ${fixture.name}`);
        updated++;
      }

      // Process TV stations
      const tvStations = fixture.tvstations || [];
      const ukStations = tvStations.filter(ts => {
        const station = ts.tvstation;
        return station && ['EN', 'GB', 'GBR'].includes(station.country_code);
      });

      if (ukStations.length > 0) {
        // Delete existing broadcasts
        await supabase
          .from('broadcasts')
          .delete()
          .eq('fixture_id', upsertedFixture.id);

        // Insert new broadcasts
        for (const ts of ukStations) {
          const station = ts.tvstation;

          // Skip Amazon for Premier League (no rights this season)
          if (competitionId === 1 && station.name.toLowerCase().includes('amazon')) {
            console.log(`   ⚠️  Filtering out ${station.name} for PL (no rights this season)`);
            continue;
          }

          await supabase
            .from('broadcasts')
            .insert({
              fixture_id: upsertedFixture.id,
              channel_name: station.name,
              channel_type: station.type || 'tv',
              country_code: station.country_code,
              sportmonks_tv_station_id: station.id
            });

          console.log(`   📺 Added broadcast: ${station.name} (${station.type || 'tv'})`);
        }
      }

    } catch (err) {
      console.error(`❌ Error processing ${fixture.name}:`, err.message);
      errors++;
    }
  }

  console.log(`\n✅ Sync Complete!`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);

} catch (error) {
  console.error('❌ Failed to fetch round:', error.message);
  process.exit(1);
}
