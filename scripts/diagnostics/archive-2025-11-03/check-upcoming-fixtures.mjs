import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const today = new Date();
console.log('🗓️  Today:', today.toISOString().split('T')[0]);
console.log('📅 System date:', today.toLocaleString());

// Check upcoming fixtures (after today)
const { data: upcoming, count: upcomingCount } = await supabase
  .from('fixtures_with_teams')
  .select('id, utc_kickoff, home_team, away_team, broadcaster, round', { count: 'exact' })
  .eq('competition_id', 1)
  .gte('utc_kickoff', today.toISOString())
  .order('utc_kickoff', { ascending: true })
  .limit(10);

console.log(`\n📊 Total upcoming PL fixtures: ${upcomingCount}`);

if (upcoming && upcoming.length > 0) {
  console.log('\n✅ Next 10 upcoming fixtures:');
  upcoming.forEach(f => {
    const date = new Date(f.utc_kickoff).toLocaleString();
    const round = f.round?.name || 'NO ROUND';
    console.log(`  ${date} - ${f.home_team} vs ${f.away_team} - Round ${round} - ${f.broadcaster || 'No broadcaster'}`);
  });
} else {
  console.log('\n❌ NO upcoming fixtures found!');
}

// Check past fixtures
const { count: pastCount } = await supabase
  .from('fixtures_with_teams')
  .select('*', { count: 'exact', head: true })
  .eq('competition_id', 1)
  .lt('utc_kickoff', today.toISOString());

console.log(`\n📊 Past PL fixtures: ${pastCount}`);

// Check all fixtures date range
const { data: firstFixture } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff')
  .eq('competition_id', 1)
  .order('utc_kickoff', { ascending: true })
  .limit(1);

const { data: lastFixture } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff')
  .eq('competition_id', 1)
  .order('utc_kickoff', { ascending: false })
  .limit(1);

console.log('\n📅 Fixture date range:');
console.log(`  First: ${new Date(firstFixture[0].utc_kickoff).toLocaleDateString()}`);
console.log(`  Last: ${new Date(lastFixture[0].utc_kickoff).toLocaleDateString()}`);
