import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🧹 Cleaning up scores for NS (Not Started) fixtures...\n');

// Find all fixtures with status 'NS' that have score data
const { data: fixtures } = await supabase
  .from('fixtures')
  .select('id, home_team_id, away_team_id, home_score, away_score, status, utc_kickoff')
  .eq('status', 'NS')
  .not('home_score', 'is', null)
  .not('away_score', 'is', null);

console.log(`Found ${fixtures?.length || 0} NS fixtures with score data\n`);

if (!fixtures || fixtures.length === 0) {
  console.log('✅ No cleanup needed - all NS fixtures already have NULL scores\n');
  process.exit(0);
}

// Get team names for display
for (const f of fixtures) {
  const { data: homeTeam } = await supabase.from('teams').select('name').eq('id', f.home_team_id).single();
  const { data: awayTeam } = await supabase.from('teams').select('name').eq('id', f.away_team_id).single();

  console.log(`Fixture ${f.id}: ${homeTeam?.name} vs ${awayTeam?.name}`);
  console.log(`  Current: ${f.home_score}-${f.away_score}, Status: ${f.status}`);
}

console.log(`\n🔄 Setting scores to NULL for ${fixtures.length} fixtures...\n`);

// Update all these fixtures to have NULL scores
const { error } = await supabase
  .from('fixtures')
  .update({ home_score: null, away_score: null })
  .eq('status', 'NS')
  .not('home_score', 'is', null)
  .not('away_score', 'is', null);

if (error) {
  console.error('❌ Error updating fixtures:', error);
} else {
  console.log(`✅ Successfully cleaned up ${fixtures.length} fixtures\n`);
  console.log('Scores set to NULL for all NS (Not Started) fixtures');
}
