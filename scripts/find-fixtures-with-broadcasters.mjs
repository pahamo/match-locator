import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function findFixturesWithBroadcasters() {
  console.log('🔍 Finding fixtures with broadcaster data...\n');

  // Get upcoming fixtures with broadcasters
  const { data: fixtures, error } = await supabase
    .from('fixtures_with_teams')
    .select('id, home_team, away_team, utc_kickoff, broadcaster, broadcaster_id, competition_id')
    .eq('competition_id', 1) // Premier League
    .gte('utc_kickoff', '2024-08-01')
    .not('broadcaster', 'is', null)
    .order('utc_kickoff', { ascending: true })
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${fixtures.length} Premier League fixtures with broadcaster data:\n`);

  fixtures.forEach((f, idx) => {
    console.log(`${idx + 1}. ${f.home_team} vs ${f.away_team}`);
    console.log(`   ID: ${f.id}`);
    console.log(`   Date: ${new Date(f.utc_kickoff).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}`);
    console.log(`   Broadcaster: ${f.broadcaster}`);
    console.log('');
  });

  // Check date range
  if (fixtures.length > 0) {
    const firstDate = new Date(fixtures[0].utc_kickoff);
    const lastDate = new Date(fixtures[fixtures.length - 1].utc_kickoff);
    console.log(`\nDate range: ${firstDate.toLocaleDateString('en-GB')} to ${lastDate.toLocaleDateString('en-GB')}`);
  }
}

findFixturesWithBroadcasters();
