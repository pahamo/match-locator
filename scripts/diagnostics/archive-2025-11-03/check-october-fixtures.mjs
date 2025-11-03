import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkOctoberFixtures() {
  console.log('🔍 Checking October Premier League fixtures...\n');

  // Check specific fixtures from the page
  const fixtureIds = [6672, 6074, 5976, 6666, 6668, 6670];

  const { data: fixtures, error } = await supabase
    .from('fixtures_with_teams')
    .select('id, home_team, away_team, utc_kickoff, broadcaster, broadcaster_id')
    .in('id', fixtureIds);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Fixtures from view:');
  fixtures.forEach(f => {
    console.log(`  ${f.id}: ${f.home_team} vs ${f.away_team}`);
    console.log(`    Date: ${new Date(f.utc_kickoff).toLocaleDateString('en-GB')}`);
    console.log(`    Broadcaster: ${f.broadcaster || 'NULL'}`);
    console.log(`    Broadcaster ID: ${f.broadcaster_id || 'NULL'}`);
  });

  // Check broadcasts table
  console.log('\n🔍 Checking broadcasts table for these fixtures...\n');

  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('fixture_id, provider_id, country_code')
    .in('fixture_id', fixtureIds);

  console.log(`Found ${broadcasts?.length || 0} broadcast records`);

  if (broadcasts && broadcasts.length > 0) {
    broadcasts.forEach(b => {
      console.log(`  Fixture ${b.fixture_id}: provider_id=${b.provider_id}, country=${b.country_code}`);
    });
  }
}

checkOctoberFixtures();
