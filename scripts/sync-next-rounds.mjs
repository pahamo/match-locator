import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TOKEN = process.env.SPORTMONKS_TOKEN || 'lNX5lqJtQo2FSsKfM4PvDzhgkS4AkGLkjRtYZWjNmSZvdGHJxxtD0HyHoazs';
const PL_LEAGUE_ID = 8;
const SEASON_ID = 25583;
const PL_COMPETITION_ID = 1;

// Rounds to sync (MW10, MW11, MW12)
const ROUND_IDS = {
  '10': 372204,
  '11': 372205,
  '12': 372206
};

console.log('🔄 Syncing next Premier League rounds...\n');

let totalCreated = 0;
let totalUpdated = 0;
let totalBroadcasters = 0;
let errors = 0;

for (const [roundName, roundId] of Object.entries(ROUND_IDS)) {
  console.log(`\n🏁 Round ${roundName} (ID: ${roundId})...`);

  // Fetch fixtures for this round
  const response = await fetch(
    `https://api.sportmonks.com/v3/football/rounds/${roundId}?api_token=${TOKEN}&include=fixtures.participants;fixtures.tvstations.tvstation;fixtures.scores;fixtures.state`
  );
  const data = await response.json();

  if (!data.data || !data.data.fixtures) {
    console.log('  ⚠️  No fixtures found');
    continue;
  }

  const fixtures = data.data.fixtures;
  console.log(`  Found ${fixtures.length} fixtures`);

  for (const fixture of fixtures) {
    try {
      const home = fixture.participants?.find(p => p.meta?.location === 'home');
      const away = fixture.participants?.find(p => p.meta?.location === 'away');

      if (!home || !away) {
        console.log(`  ⚠️  Skipping fixture ${fixture.id} - missing participants`);
        errors++;
        continue;
      }

      // Get team IDs
      const { data: homeTeam } = await supabase
        .from('teams')
        .select('id')
        .or(`sportmonks_team_id.eq.${home.id},name.ilike.%${home.name}%`)
        .limit(1)
        .single();

      const { data: awayTeam } = await supabase
        .from('teams')
        .select('id')
        .or(`sportmonks_team_id.eq.${away.id},name.ilike.%${away.name}%`)
        .limit(1)
        .single();

      if (!homeTeam || !awayTeam) {
        console.log(`  ⚠️  Teams not found: ${home.name} vs ${away.name}`);
        errors++;
        continue;
      }

      // Extract scores
      const currentScores = fixture.scores?.filter(s => s.description === 'CURRENT') || [];
      const homeScore = currentScores.find(s => s.score?.participant === 'home')?.score?.goals;
      const awayScore = currentScores.find(s => s.score?.participant === 'away')?.score?.goals;

      // Check if fixture exists
      const { data: existingFixture } = await supabase
        .from('fixtures')
        .select('id')
        .eq('sportmonks_fixture_id', fixture.id)
        .maybeSingle();

      const fixtureData = {
        utc_kickoff: fixture.starting_at,
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        competition_id: PL_COMPETITION_ID,
        round: { id: roundId, name: roundName },
        home_score: homeScore !== undefined ? homeScore : null,
        away_score: awayScore !== undefined ? awayScore : null,
        status: fixture.state?.state || null,
        sportmonks_fixture_id: fixture.id,
        data_source: 'sportmonks',
        last_synced_at: new Date().toISOString(),
        sync_status: 'synced'
      };

      let fixtureDbId;

      if (existingFixture) {
        await supabase
          .from('fixtures')
          .update(fixtureData)
          .eq('id', existingFixture.id);
        fixtureDbId = existingFixture.id;
        totalUpdated++;
        console.log(`  ✅ Updated: ${home.name} vs ${away.name}`);
      } else {
        const { data: newFixture } = await supabase
          .from('fixtures')
          .insert(fixtureData)
          .select('id')
          .single();
        fixtureDbId = newFixture.id;
        totalCreated++;
        console.log(`  ✨ Created: ${home.name} vs ${away.name}`);
      }

      // Sync broadcasters
      if (fixture.tvstations && fixture.tvstations.length > 0) {
        // Delete existing broadcasts
        await supabase
          .from('broadcasts')
          .delete()
          .eq('fixture_id', fixtureDbId);

        // Insert new broadcasts
        const ukStations = fixture.tvstations.filter(ts =>
          ts.tvstation &&
          [11, 455, 462].includes(ts.country_id) &&
          !ts.tvstation.name?.includes('ROI')
        );

        for (const ts of ukStations) {
          await supabase
            .from('broadcasts')
            .insert({
              fixture_id: fixtureDbId,
              channel_name: ts.tvstation.name,
              broadcaster_type: ts.tvstation.type || 'tv',
              country_code: 'GB',
              sportmonks_tv_station_id: ts.tvstation_id,
              data_source: 'sportmonks',
              last_synced_at: new Date().toISOString()
            });
          totalBroadcasters++;
        }

        if (ukStations.length > 0) {
          console.log(`    📺 Added ${ukStations.length} broadcaster(s)`);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`  ❌ Error:`, error.message);
      errors++;
    }
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log('📊 Summary:');
console.log(`  Fixtures created: ${totalCreated}`);
console.log(`  Fixtures updated: ${totalUpdated}`);
console.log(`  Broadcasters added: ${totalBroadcasters}`);
console.log(`  Errors: ${errors}`);
console.log(`${'='.repeat(60)}\n`);
