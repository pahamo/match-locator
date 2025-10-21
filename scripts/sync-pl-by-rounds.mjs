import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TOKEN = process.env.SPORTMONKS_TOKEN || 'lNX5lqJtQo2FSsKfM4PvDzhgkS4AkGLkjRtYZWjNmSZvdGHJxxtD0HyHoazs';
const PL_LEAGUE_ID = 8;
const SEASON_ID = 25583; // 2025/2026 season
const PL_COMPETITION_ID = 1; // Our database competition ID

console.log('🔄 Syncing Premier League fixtures by ROUNDS...\n');
console.log(`Season: 2025/2026 (ID: ${SEASON_ID})`);
console.log(`League: Premier League (ID: ${PL_LEAGUE_ID})\n`);

// Get all rounds for the season
console.log('📋 Fetching rounds...\n');
const seasonResponse = await fetch(
  `https://api.sportmonks.com/v3/football/seasons/${SEASON_ID}?api_token=${TOKEN}&include=rounds`
);
const seasonData = await seasonResponse.json();

const rounds = seasonData.data.rounds;
console.log(`Found ${rounds.length} rounds\n`);

let stats = {
  roundsProcessed: 0,
  fixturesCreated: 0,
  fixturesUpdated: 0,
  fixturesSkipped: 0,
  broadcastsCreated: 0,
  errors: []
};

// Process each round
for (const round of rounds) {
  console.log(`\n🏁 Round ${round.name} (ID: ${round.id})...`);

  // Fetch fixtures for this round
  const roundResponse = await fetch(
    `https://api.sportmonks.com/v3/football/rounds/${round.id}?api_token=${TOKEN}&include=fixtures.participants;fixtures.tvstations.tvstation;fixtures.scores;fixtures.state`
  );
  const roundData = await roundResponse.json();

  if (!roundData.data) {
    console.log(`  ⚠️  No data returned for round ${round.id}`);
    continue;
  }

  const fixtures = roundData.data.fixtures || [];
  console.log(`  Found ${fixtures.length} fixtures`);

  for (const fixture of fixtures) {
    try {
      // Get participants
      const home = fixture.participants?.find(p => p.meta?.location === 'home');
      const away = fixture.participants?.find(p => p.meta?.location === 'away');

      if (!home || !away) {
        console.log(`  ⚠️  Skipping fixture ${fixture.id} - missing participants`);
        stats.fixturesSkipped++;
        continue;
      }

      // Get or create team mappings
      const homeTeamId = await getOrCreateTeam(home.id, home.name);
      const awayTeamId = await getOrCreateTeam(away.id, away.name);

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
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        competition_id: PL_COMPETITION_ID,
        round: { id: round.id, name: round.name },
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
        // Update existing
        await supabase
          .from('fixtures')
          .update(fixtureData)
          .eq('id', existingFixture.id);

        fixtureDbId = existingFixture.id;
        stats.fixturesUpdated++;
        console.log(`  ✅ Updated: ${home.name} vs ${away.name}`);
      } else {
        // Create new
        const { data: newFixture } = await supabase
          .from('fixtures')
          .insert(fixtureData)
          .select('id')
          .single();

        fixtureDbId = newFixture.id;
        stats.fixturesCreated++;
        console.log(`  ✨ Created: ${home.name} vs ${away.name}`);
      }

      // Sync broadcasters
      if (fixture.tvstations && fixture.tvstations.length > 0) {
        const broadcastCount = await syncBroadcasters(fixtureDbId, fixture.tvstations);
        stats.broadcastsCreated += broadcastCount;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`  ❌ Error with fixture ${fixture.id}:`, error.message);
      stats.errors.push({ fixture: fixture.id, error: error.message });
    }
  }

  stats.roundsProcessed++;
  await new Promise(resolve => setTimeout(resolve, 200));
}

console.log('\n' + '='.repeat(80));
console.log('✅ Sync Complete!');
console.log('='.repeat(80));
console.log(`\n📊 Summary:`);
console.log(`  Rounds processed: ${stats.roundsProcessed}`);
console.log(`  Fixtures created: ${stats.fixturesCreated}`);
console.log(`  Fixtures updated: ${stats.fixturesUpdated}`);
console.log(`  Fixtures skipped: ${stats.fixturesSkipped}`);
console.log(`  Broadcasts created: ${stats.broadcastsCreated}`);
console.log(`  Errors: ${stats.errors.length}`);

if (stats.errors.length > 0) {
  console.log('\n❌ Errors:');
  stats.errors.forEach(e => {
    console.log(`  - Fixture ${e.fixture}: ${e.error}`);
  });
}

// Helper: Get or create team
async function getOrCreateTeam(sportmonksId, name) {
  // Check if team exists
  let { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('sportmonks_team_id', sportmonksId)
    .maybeSingle();

  if (team) return team.id;

  // Try by name
  let { data: teamByName } = await supabase
    .from('teams')
    .select('id')
    .ilike('name', name)
    .maybeSingle();

  if (teamByName) {
    // Update with SportMonks ID
    await supabase
      .from('teams')
      .update({ sportmonks_team_id: sportmonksId })
      .eq('id', teamByName.id);
    return teamByName.id;
  }

  // Create new team
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const { data: newTeam } = await supabase
    .from('teams')
    .insert({
      name,
      slug,
      sportmonks_team_id: sportmonksId,
      last_synced_at: new Date().toISOString()
    })
    .select('id')
    .single();

  return newTeam.id;
}

// Helper: Sync broadcasters for a fixture
async function syncBroadcasters(fixtureId, tvStations) {
  // Delete existing broadcasts
  await supabase
    .from('broadcasts')
    .delete()
    .eq('fixture_id', fixtureId);

  let count = 0;

  for (const ts of tvStations) {
    if (!ts.tvstation) continue;

    // Include country_id 455 and 462 (UK), exclude ROI channels
    if (![11, 455, 462].includes(ts.country_id)) continue;
    if (ts.tvstation.name && ts.tvstation.name.includes('ROI')) continue;

    await supabase
      .from('broadcasts')
      .insert({
        fixture_id: fixtureId,
        channel_name: ts.tvstation.name,
        broadcaster_type: ts.tvstation.type || 'tv',
        country_code: 'GB',
        sportmonks_tv_station_id: ts.tvstation_id,
        data_source: 'sportmonks',
        last_synced_at: new Date().toISOString()
      });

    count++;
  }

  return count;
}
