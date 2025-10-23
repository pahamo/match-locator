import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Check specific fixtures
const fixtureIds = [6187, 6193]; // Arsenal vs Atletico, Villarreal vs Man City

console.log('🔍 Checking broadcasts table for Champions League fixtures...\n');

for (const fixtureId of fixtureIds) {
  const { data: fixture } = await supabase
    .from('fixtures')
    .select('*')
    .eq('id', fixtureId)
    .single();

  console.log(`Fixture ${fixtureId}: ${fixture?.sportmonks_fixture_id}`);

  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('fixture_id', fixtureId);

  if (!broadcasts || broadcasts.length === 0) {
    console.log('  ❌ No broadcasts found in database\n');
  } else {
    console.log(`  ✅ Found ${broadcasts.length} broadcast(s):`);
    broadcasts.forEach(b => {
      console.log(`    - ${b.channel_name} (country: ${b.country_code})`);
      console.log(`      SportMonks TV ID: ${b.sportmonks_tv_station_id}`);
    });
    console.log('');
  }
}
