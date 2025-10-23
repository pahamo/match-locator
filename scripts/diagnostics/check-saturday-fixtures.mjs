import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Checking Saturday 3pm fixtures...\n');

// Newcastle vs Fulham
const { data: newcastleBroadcasts } = await supabase
  .from('broadcasts')
  .select('*')
  .eq('fixture_id', 6077);

console.log('Newcastle vs Fulham (fixture 6077):');
console.log(`  Broadcasts in database: ${newcastleBroadcasts?.length || 0}`);
if (newcastleBroadcasts && newcastleBroadcasts.length > 0) {
  newcastleBroadcasts.forEach(b => {
    console.log(`    - ${b.channel_name}`);
  });
}

// Chelsea vs Sunderland
const { data: chelseaBroadcasts } = await supabase
  .from('broadcasts')
  .select('*')
  .eq('fixture_id', 6076);

console.log('\nChelsea vs Sunderland (fixture 6076):');
console.log(`  Broadcasts in database: ${chelseaBroadcasts?.length || 0}`);
if (chelseaBroadcasts && chelseaBroadcasts.length > 0) {
  chelseaBroadcasts.forEach(b => {
    console.log(`    - ${b.channel_name}`);
  });
}

// Check the view
const { data: viewData } = await supabase
  .from('fixtures_with_teams')
  .select('id, home_team, away_team, utc_kickoff, broadcaster')
  .in('id', [6077, 6076]);

console.log('\n📺 What the view shows:');
viewData?.forEach(f => {
  const kickoff = new Date(f.utc_kickoff);
  console.log(`  ${f.home_team} vs ${f.away_team}`);
  console.log(`    Kickoff: ${kickoff.toLocaleString('en-GB', { timeZone: 'Europe/London' })}`);
  console.log(`    Broadcaster: ${f.broadcaster || 'TBD'}`);
});
