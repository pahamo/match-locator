import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Checking upcoming Premier League fixtures...\n');

const { data: fixtures, error } = await supabase
  .from('fixtures_with_teams')
  .select('id, home_team, away_team, utc_kickoff, round, broadcaster')
  .eq('competition_id', 1)
  .gte('utc_kickoff', new Date().toISOString())
  .order('utc_kickoff')
  .limit(20);

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`Found ${fixtures.length} upcoming fixtures:\n`);

fixtures.forEach(f => {
  const date = new Date(f.utc_kickoff);
  const mw = f.round?.name || 'Unknown';
  console.log(`${date.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London'
  })} MW${mw.padStart(2)} ${f.home_team} vs ${f.away_team} - ${f.broadcaster || 'TBD'}`);
});

console.log('\n📊 Summary:');
const withBroadcaster = fixtures.filter(f => f.broadcaster).length;
console.log(`With broadcaster: ${withBroadcaster} (${((withBroadcaster/fixtures.length)*100).toFixed(1)}%)`);
console.log(`TBD: ${fixtures.length - withBroadcaster} (${(((fixtures.length - withBroadcaster)/fixtures.length)*100).toFixed(1)}%)`);
