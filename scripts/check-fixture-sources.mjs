import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const now = new Date().toISOString();
const { data: fixtures } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff, home_team_id, away_team_id, matchday, data_source, sportmonks_fixture_id')
  .eq('competition_id', 1)
  .gte('utc_kickoff', now)
  .order('utc_kickoff', { ascending: true })
  .limit(15);

console.log('Data sources for upcoming fixtures:\n');
fixtures.forEach((f, i) => {
  const date = new Date(f.utc_kickoff).toISOString().split('T')[0];
  const mw = f.matchday || 'NULL';
  const source = f.data_source || 'unknown';
  const smId = f.sportmonks_fixture_id || 'none';
  console.log(`${i+1}. ${date} - MW${mw} - Source: ${source} - SM ID: ${smId}`);
});
