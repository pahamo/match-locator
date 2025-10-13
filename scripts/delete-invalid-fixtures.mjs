import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get all PL fixtures without round data (invalid fixtures)
const { data: invalidFixtures, error } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff, home_team_id, away_team_id')
  .eq('competition_id', 1)
  .is('round', null);

if (error) {
  console.error('Error fetching fixtures:', error);
  process.exit(1);
}

console.log(`Found ${invalidFixtures.length} fixtures without round data`);
console.log('Sample fixtures:');
invalidFixtures.slice(0, 5).forEach(f => {
  console.log(`  ID ${f.id}: ${f.utc_kickoff}`);
});

const fixtureIds = invalidFixtures.map(f => f.id);

// Delete broadcasts first (FK constraint)
console.log('\nDeleting broadcasts for invalid fixtures...');
const { error: broadcastError } = await supabase
  .from('broadcasts')
  .delete()
  .in('fixture_id', fixtureIds);

if (broadcastError) {
  console.error('Error deleting broadcasts:', broadcastError);
  process.exit(1);
}

console.log('✅ Broadcasts deleted');

// Delete fixtures
console.log('\nDeleting invalid fixtures...');
const { error: fixtureError } = await supabase
  .from('fixtures')
  .delete()
  .in('id', fixtureIds);

if (fixtureError) {
  console.error('Error deleting fixtures:', fixtureError);
  process.exit(1);
}

console.log(`✅ Deleted ${invalidFixtures.length} invalid fixtures`);

// Verify
const { count } = await supabase
  .from('fixtures')
  .select('*', { count: 'exact', head: true })
  .eq('competition_id', 1);

console.log(`\n📊 Remaining PL fixtures: ${count}`);
