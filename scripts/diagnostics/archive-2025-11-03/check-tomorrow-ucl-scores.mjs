import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Checking tomorrow\'s UCL fixtures with scores...\n');

// Get tomorrow's date range
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);
const tomorrowEnd = new Date(tomorrow);
tomorrowEnd.setHours(23, 59, 59, 999);

const { data: fixtures } = await supabase
  .from('fixtures')
  .select('id, home_team_id, away_team_id, utc_kickoff, home_score, away_score, status')
  .eq('competition_id', 2)
  .gte('utc_kickoff', tomorrow.toISOString())
  .lt('utc_kickoff', tomorrowEnd.toISOString())
  .order('utc_kickoff');

console.log(`Found ${fixtures?.length || 0} Champions League fixtures for tomorrow:\n`);

for (const f of fixtures || []) {
  const { data: homeTeam } = await supabase.from('teams').select('name').eq('id', f.home_team_id).single();
  const { data: awayTeam } = await supabase.from('teams').select('name').eq('id', f.away_team_id).single();

  const kickoff = new Date(f.utc_kickoff);
  const ukTime = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London'
  }).format(kickoff);

  console.log(`Fixture ${f.id}: ${homeTeam?.name} vs ${awayTeam?.name}`);
  console.log(`  Kickoff: ${ukTime} UK time`);
  console.log(`  Status: ${f.status || 'NULL'}`);
  console.log(`  home_score: ${f.home_score !== null ? f.home_score : 'NULL'}`);
  console.log(`  away_score: ${f.away_score !== null ? f.away_score : 'NULL'}`);
  console.log('');
}
