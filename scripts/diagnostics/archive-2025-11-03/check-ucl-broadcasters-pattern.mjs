import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Checking Champions League broadcaster patterns...\n');

// Get all Champions League fixtures with broadcasters
const { data: fixtures } = await supabase
  .from('fixtures_with_teams')
  .select('id, home_team, away_team, broadcaster')
  .eq('competition_id', 2)
  .not('broadcaster', 'is', null)
  .order('utc_kickoff')
  .limit(20);

console.log(`Found ${fixtures?.length || 0} Champions League fixtures with broadcasters:\n`);

const broadcasterCounts = {};

fixtures?.forEach(f => {
  const broadcaster = f.broadcaster;
  broadcasterCounts[broadcaster] = (broadcasterCounts[broadcaster] || 0) + 1;
  console.log(`${f.home_team} vs ${f.away_team}: ${broadcaster}`);
});

console.log('\n📊 Broadcaster frequency:');
Object.entries(broadcasterCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([name, count]) => {
    console.log(`  ${name}: ${count} matches`);
  });
