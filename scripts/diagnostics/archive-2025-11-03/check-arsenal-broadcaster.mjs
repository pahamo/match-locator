import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get Arsenal Champions League fixtures
const { data: fixtures } = await supabase
  .from('fixtures_with_teams')
  .select('id, home_team, away_team, utc_kickoff, broadcaster, competition_id')
  .eq('competition_id', 2)
  .or('home_team.ilike.%arsenal%,away_team.ilike.%arsenal%')
  .order('utc_kickoff')
  .limit(5);

console.log('\n🔍 Arsenal Champions League Fixtures:\n');
for (const f of fixtures || []) {
  const date = new Date(f.utc_kickoff);
  console.log(`ID ${f.id}: ${f.home_team} vs ${f.away_team}`);
  console.log(`  Date: ${date.toLocaleString('en-GB')}`);
  console.log(`  View Broadcaster: ${f.broadcaster || 'NULL'}\n`);
}

// Check broadcasts table for these fixtures
for (const fixture of fixtures || []) {
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('channel_name, country_code, sportmonks_tv_station_id')
    .eq('fixture_id', fixture.id)
    .order('channel_name');

  console.log(`📺 All broadcasts for fixture ${fixture.id}:`);
  if (broadcasts && broadcasts.length > 0) {
    for (const b of broadcasts) {
      console.log(`  - ${b.channel_name} (country: ${b.country_code}, ID: ${b.sportmonks_tv_station_id})`);
    }
  } else {
    console.log('  No broadcasts found');
  }
  console.log('');
}
