import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Checking all upcoming UCL fixtures score data...\n');

const { data: fixtures } = await supabase
  .from('fixtures')
  .select('id, home_team_id, away_team_id, utc_kickoff, home_score, away_score, status')
  .eq('competition_id', 2)
  .gte('utc_kickoff', new Date().toISOString())
  .order('utc_kickoff')
  .limit(20);

console.log(`Found ${fixtures?.length || 0} upcoming Champions League fixtures:\n`);

const withScores = [];
const withoutScores = [];

for (const f of fixtures || []) {
  const { data: homeTeam } = await supabase.from('teams').select('name').eq('id', f.home_team_id).single();
  const { data: awayTeam } = await supabase.from('teams').select('name').eq('id', f.away_team_id).single();

  const kickoff = new Date(f.utc_kickoff);
  const ukTime = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London'
  }).format(kickoff);

  const hasScores = f.home_score !== null && f.away_score !== null;

  const info = {
    id: f.id,
    match: `${homeTeam?.name} vs ${awayTeam?.name}`,
    kickoff: ukTime,
    status: f.status || 'NULL',
    home_score: f.home_score,
    away_score: f.away_score,
    hasScores
  };

  if (hasScores) {
    withScores.push(info);
  } else {
    withoutScores.push(info);
  }
}

console.log(`✅ Fixtures WITH scores (${withScores.length}):\n`);
withScores.forEach(f => {
  console.log(`  ${f.match}`);
  console.log(`    Kickoff: ${f.kickoff}, Status: ${f.status}, Score: ${f.home_score}-${f.away_score}`);
});

console.log(`\n❌ Fixtures WITHOUT scores (${withoutScores.length}):\n`);
withoutScores.forEach(f => {
  console.log(`  ${f.match}`);
  console.log(`    Kickoff: ${f.kickoff}, Status: ${f.status}, Score: NULL`);
});
