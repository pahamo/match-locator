import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Checking broadcasts table for upcoming PL fixtures...\n');

// Get upcoming fixtures
const { data: fixtures, error: fixturesError } = await supabase
  .from('fixtures')
  .select('id, home_team_id, away_team_id, utc_kickoff, round, sportmonks_fixture_id')
  .eq('competition_id', 1)
  .gte('utc_kickoff', new Date().toISOString())
  .order('utc_kickoff')
  .limit(10);

if (fixturesError) {
  console.error('Error fetching fixtures:', fixturesError);
  process.exit(1);
}

console.log(`Found ${fixtures.length} upcoming fixtures\n`);

for (const fixture of fixtures) {
  const { data: broadcasts, error: broadcastsError } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('fixture_id', fixture.id);

  const mw = fixture.round?.name || '?';
  const date = new Date(fixture.utc_kickoff).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  });

  console.log(`Fixture ${fixture.id} (MW${mw}, ${date})`);
  console.log(`  SportMonks ID: ${fixture.sportmonks_fixture_id || 'MISSING!'}`);
  console.log(`  Broadcasts: ${broadcasts?.length || 0}`);
  if (broadcasts && broadcasts.length > 0) {
    broadcasts.forEach(b => {
      console.log(`    - ${b.channel_name} (${b.country_code})`);
    });
  }
  console.log('');
}
