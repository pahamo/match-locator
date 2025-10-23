import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Checking fixture 6187 details...\n');

const { data: fixture, error } = await supabase
  .from('fixtures')
  .select('id, sportmonks_fixture_id, home_team_id, away_team_id, utc_kickoff, round, competition_id')
  .eq('id', 6187)
  .single();

if (error) {
  console.error('Error:', error);
} else if (!fixture) {
  console.log('❌ Fixture 6187 not found');
} else {
  console.log('Fixture details:');
  console.log(`  ID: ${fixture.id}`);
  console.log(`  SportMonks ID: ${fixture.sportmonks_fixture_id}`);
  console.log(`  Competition ID: ${fixture.competition_id}`);
  console.log(`  Home Team ID: ${fixture.home_team_id}`);
  console.log(`  Away Team ID: ${fixture.away_team_id}`);
  console.log(`  UTC Kickoff: ${fixture.utc_kickoff}`);
  console.log(`  Round: ${JSON.stringify(fixture.round)}`);

  const now = new Date().toISOString();
  const kickoff = new Date(fixture.utc_kickoff).toISOString();
  console.log(`\nCurrent time: ${now}`);
  console.log(`Kickoff time: ${kickoff}`);
  console.log(`Is upcoming? ${kickoff >= now}`);

  // Check if it would be included in sync query
  const { data: queryTest } = await supabase
    .from('fixtures')
    .select('id')
    .eq('id', 6187)
    .eq('competition_id', 2)
    .gte('utc_kickoff', now)
    .not('sportmonks_fixture_id', 'is', null);

  console.log(`\nWould be included in sync query? ${queryTest && queryTest.length > 0 ? 'YES' : 'NO'}`);
}
