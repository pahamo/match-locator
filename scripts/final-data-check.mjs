import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Final Data Quality Check\n');

// 1. Total PL fixtures
const { count: totalFixtures } = await supabase
  .from('fixtures')
  .select('*', { count: 'exact', head: true })
  .eq('competition_id', 1);

console.log(`📊 Total PL fixtures: ${totalFixtures}`);

// 2. Fixtures with round data
const { count: withRound } = await supabase
  .from('fixtures')
  .select('*', { count: 'exact', head: true })
  .eq('competition_id', 1)
  .not('round', 'is', null);

console.log(`✅ Fixtures with round data: ${withRound}/${totalFixtures}`);

// 3. Fixture 6057 details
const { data: fixture6057 } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff, round, home_team_id, away_team_id')
  .eq('id', 6057)
  .single();

console.log(`\n📺 Fixture 6057:`);
console.log(`   Date: ${new Date(fixture6057.utc_kickoff).toLocaleString()}`);
console.log(`   Round: ${fixture6057.round?.name || 'NO ROUND'}`);

const { data: broadcasts6057 } = await supabase
  .from('broadcasts')
  .select('channel_name, last_synced_at')
  .eq('fixture_id', 6057)
  .order('channel_name');

console.log(`   Broadcasters (${broadcasts6057.length}):`);
broadcasts6057.forEach(b => {
  console.log(`     - ${b.channel_name}`);
});

const hasAmazon = broadcasts6057.some(b => b.channel_name.toLowerCase().includes('amazon'));
console.log(`   Has Amazon Prime: ${hasAmazon ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);

// 4. Check if view exists
const { data: viewExists, error: viewError } = await supabase
  .from('fixtures_with_teams')
  .select('id')
  .limit(1);

if (viewError) {
  console.log(`\n❌ View fixtures_with_teams error: ${viewError.message}`);
} else {
  console.log(`\n✅ View fixtures_with_teams exists and is queryable`);

  // Check fixture 6057 in view
  const { data: fixture6057View } = await supabase
    .from('fixtures_with_teams')
    .select('id, home_team, away_team, broadcaster')
    .eq('id', 6057)
    .single();

  if (fixture6057View) {
    console.log(`   Fixture 6057 in view:`);
    console.log(`     ${fixture6057View.home_team} vs ${fixture6057View.away_team}`);
    console.log(`     Broadcaster: ${fixture6057View.broadcaster || 'NONE'}`);
  }
}

// 5. Sample of all fixtures
const { data: sampleFixtures } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff, round')
  .eq('competition_id', 1)
  .order('utc_kickoff', { ascending: true })
  .limit(5);

console.log(`\n📋 Sample fixtures (first 5):`);
sampleFixtures.forEach(f => {
  const date = new Date(f.utc_kickoff).toLocaleDateString();
  const round = f.round?.name || 'NO ROUND';
  console.log(`   ${date} - Fixture ${f.id} - Round ${round}`);
});

console.log('\n✅ Data check complete');
