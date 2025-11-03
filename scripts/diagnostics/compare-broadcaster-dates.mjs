import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

console.log('Checking fixtures by date range...\n');

// Check old fixtures (Aug/Sep 2025)
const { data: oldFixtures } = await supabase
  .from('fixtures_with_teams')
  .select('id, utc_kickoff, home_team, away_team, broadcaster, broadcaster_id, competition_id')
  .gte('utc_kickoff', '2025-08-01')
  .lte('utc_kickoff', '2025-09-30')
  .not('broadcaster', 'is', null)
  .limit(5);

console.log('=== OLD FIXTURES (Aug/Sep 2025) WITH BROADCASTERS ===');
oldFixtures?.forEach(f => {
  console.log(`${f.utc_kickoff.substring(0, 10)}: ${f.home_team} vs ${f.away_team}`);
  console.log(`  Broadcaster: ${f.broadcaster}`);
  console.log(`  Broadcaster ID: ${f.broadcaster_id}`);
});

// Check new fixtures (Nov/Dec 2025)
const { data: newFixtures } = await supabase
  .from('fixtures_with_teams')
  .select('id, utc_kickoff, home_team, away_team, broadcaster, broadcaster_id, competition_id')
  .gte('utc_kickoff', '2025-11-01')
  .lte('utc_kickoff', '2025-12-31')
  .limit(10);

console.log('\n=== NEW FIXTURES (Nov/Dec 2025) ===');
const withBroadcaster = newFixtures?.filter(f => f.broadcaster);
const withoutBroadcaster = newFixtures?.filter(f => !f.broadcaster);

console.log(`With broadcaster: ${withBroadcaster?.length || 0}`);
console.log(`Without broadcaster: ${withoutBroadcaster?.length || 0}`);

console.log('\nSample fixtures WITHOUT broadcaster:');
withoutBroadcaster?.slice(0, 3).forEach(f => {
  console.log(`  ${f.utc_kickoff.substring(0, 10)}: ${f.home_team} vs ${f.away_team}`);
});

// Check broadcasts table directly
console.log('\n=== CHECKING BROADCASTS TABLE ===');

// Sample old fixture
if (oldFixtures && oldFixtures.length > 0) {
  const oldFixtureId = oldFixtures[0].id;
  const { data: oldBroadcasts } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('fixture_id', oldFixtureId)
    .limit(3);

  console.log(`\nOld fixture (${oldFixtureId}) broadcasts:`, oldBroadcasts?.length || 0);
  oldBroadcasts?.forEach(b => {
    console.log(`  - ${b.channel_name} (country: ${b.country_code}, type: ${b.broadcaster_type})`);
  });
}

// Sample new fixture
if (withoutBroadcaster && withoutBroadcaster.length > 0) {
  const newFixtureId = withoutBroadcaster[0].id;
  const { data: newBroadcasts } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('fixture_id', newFixtureId);

  console.log(`\nNew fixture (${newFixtureId}) broadcasts:`, newBroadcasts?.length || 0);
  if (newBroadcasts && newBroadcasts.length > 0) {
    newBroadcasts?.forEach(b => {
      console.log(`  - ${b.channel_name} (country: ${b.country_code}, type: ${b.broadcaster_type})`);
    });
  } else {
    console.log('  No broadcasts found in broadcasts table!');
  }
}
