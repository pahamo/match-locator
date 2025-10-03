import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const now = new Date().toISOString();
const { data: fixtures } = await supabase
  .from('fixtures_with_teams')
  .select('id, utc_kickoff, home_team, away_team, matchday, competition_id')
  .eq('competition_id', 1)
  .gte('utc_kickoff', now)
  .order('utc_kickoff', { ascending: true })
  .limit(15);

console.log('Next 15 upcoming Premier League fixtures:');
fixtures.forEach((f, i) => {
  const date = new Date(f.utc_kickoff).toISOString().split('T')[0];
  const mw = f.matchday || 'NULL';
  console.log(`${i+1}. ${date} - MW${mw} - ${f.home_team} vs ${f.away_team}`);
});

const byMatchday = {};
fixtures.forEach(f => {
  const mw = f.matchday || 'NULL';
  if (!byMatchday[mw]) byMatchday[mw] = [];
  byMatchday[mw].push(f);
});

console.log('\nGrouped by matchday:');
Object.entries(byMatchday).forEach(([mw, games]) => {
  console.log(`  Matchweek ${mw}: ${games.length} games`);
});
