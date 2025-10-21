import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN || 'lNX5lqJtQo2FSsKfM4PvDzhgkS4AkGLkjRtYZWjNmSZvdGHJxxtD0HyHoazs';

console.log('🔄 Syncing broadcaster data for upcoming Premier League fixtures...\n');

// Get all upcoming PL fixtures that need broadcaster data
const { data: fixtures, error: fixturesError } = await supabase
  .from('fixtures')
  .select('id, sportmonks_fixture_id, home_team_id, away_team_id, utc_kickoff, round')
  .eq('competition_id', 1)
  .gte('utc_kickoff', new Date().toISOString())
  .not('sportmonks_fixture_id', 'is', null)
  .order('utc_kickoff')
  .limit(50);

if (fixturesError) {
  console.error('Error fetching fixtures:', fixturesError);
  process.exit(1);
}

console.log(`Found ${fixtures.length} upcoming fixtures to sync\n`);

let synced = 0;
let skipped = 0;
let errors = 0;

for (const fixture of fixtures) {
  const mw = fixture.round?.name || '?';
  const date = new Date(fixture.utc_kickoff).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  });

  // Check if we already have broadcasts for this fixture
  const { data: existingBroadcasts } = await supabase
    .from('broadcasts')
    .select('id')
    .eq('fixture_id', fixture.id);

  if (existingBroadcasts && existingBroadcasts.length > 0) {
    console.log(`⏭️  Fixture ${fixture.id} (MW${mw}, ${date}) - Already has broadcasts`);
    skipped++;
    continue;
  }

  // Fetch TV stations from SportMonks
  const url = `https://api.sportmonks.com/v3/football/fixtures/${fixture.sportmonks_fixture_id}?api_token=${SPORTMONKS_TOKEN}&include=tvstations.tvstation`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (!json.data) {
      console.log(`⚠️  Fixture ${fixture.id} (MW${mw}, ${date}) - No data from API`);
      errors++;
      continue;
    }

    const tvStations = json.data.tvstations || [];

    // Filter for UK broadcasts (country_id: 11, 455, 462)
    // Note: 455 is Ireland, but Sky Sports UK broadcasts are labeled with this ID
    // We include 455 but filter out channels with "ROI" in the name
    const ukStations = tvStations.filter(ts => {
      if (!ts.tvstation) return false;

      // Include England (462) and Ireland (455) country IDs
      // Sky Sports UK is labeled as country_id 455 by SportMonks
      if (![11, 455, 462].includes(ts.country_id)) {
        return false;
      }

      // Filter out Irish-specific channels (have "ROI" in name)
      if (ts.tvstation.name && ts.tvstation.name.includes('ROI')) {
        return false;
      }

      return true;
    });

    if (ukStations.length === 0) {
      console.log(`📺 Fixture ${fixture.id} (MW${mw}, ${date}) - No UK broadcasters found`);
      synced++;
      continue;
    }

    // Insert broadcasts
    for (const ts of ukStations) {
      const station = ts.tvstation;

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

      if (insertError) {
        console.error(`❌ Error inserting broadcast for fixture ${fixture.id}:`, insertError);
      }
    }

    console.log(`✅ Fixture ${fixture.id} (MW${mw}, ${date}) - Synced ${ukStations.length} broadcaster(s)`);
    synced++;

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));

  } catch (error) {
    console.error(`❌ Error fetching fixture ${fixture.id}:`, error.message);
    errors++;
  }
}

console.log('\n📊 Summary:');
console.log(`  Synced: ${synced}`);
console.log(`  Skipped: ${skipped}`);
console.log(`  Errors: ${errors}`);
console.log(`\n✅ Done!`);
