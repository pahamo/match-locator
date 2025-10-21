import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const today = new Date();
const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

console.log('🔍 Checking Champions League fixtures for today...\n');

const { data: fixtures, error } = await supabase
  .from('fixtures_with_teams')
  .select('*')
  .eq('competition_id', 2) // Champions League
  .gte('utc_kickoff', startOfDay.toISOString())
  .lt('utc_kickoff', endOfDay.toISOString())
  .order('utc_kickoff');

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

if (!fixtures || fixtures.length === 0) {
  console.log('❌ No Champions League fixtures found for today');
  process.exit(0);
}

console.log(`Found ${fixtures.length} Champions League fixtures:\n`);

fixtures.forEach(f => {
  console.log(`${f.home_team} vs ${f.away_team}`);
  console.log(`  Fixture ID: ${f.id}`);
  console.log(`  SportMonks ID: ${f.sportmonks_fixture_id}`);
  console.log(`  Kickoff: ${new Date(f.utc_kickoff).toLocaleString('en-GB')}`);
  console.log(`  Broadcaster: ${f.broadcaster || 'NULL'}`);
  console.log(`  Broadcaster ID: ${f.broadcaster_id || 'NULL'}`);
  console.log('');
});
