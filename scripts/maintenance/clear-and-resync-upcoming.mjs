import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🗑️  Clearing broadcaster data for upcoming PL fixtures...\n');

// Get all upcoming PL fixtures
const { data: upcomingFixtures, error } = await supabase
  .from('fixtures')
  .select('id')
  .eq('competition_id', 1)
  .gte('utc_kickoff', new Date().toISOString());

if (error) {
  console.error('Error fetching fixtures:', error);
  process.exit(1);
}

console.log(`Found ${upcomingFixtures.length} upcoming fixtures\n`);

// Delete broadcasts for these fixtures
const fixtureIds = upcomingFixtures.map(f => f.id);

const { error: deleteError } = await supabase
  .from('broadcasts')
  .delete()
  .in('fixture_id', fixtureIds);

if (deleteError) {
  console.error('Error deleting broadcasts:', deleteError);
  process.exit(1);
}

console.log('✅ Cleared all broadcaster data for upcoming fixtures\n');
console.log('Now run: node scripts/sync-upcoming-pl.mjs\n');
