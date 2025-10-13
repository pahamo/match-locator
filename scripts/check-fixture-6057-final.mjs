import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Check fixture 6057 broadcasters
const { data: broadcasts } = await supabase
  .from('broadcasts')
  .select('channel_name, last_synced_at')
  .eq('fixture_id', 6057)
  .order('last_synced_at', { ascending: false });

console.log('📺 Fixture 6057 Broadcasters:');
broadcasts.forEach(b => {
  const time = new Date(b.last_synced_at).toLocaleTimeString();
  console.log(`   ${b.channel_name} (synced at ${time})`);
});

// Check view
const { data: fixtureView } = await supabase
  .from('fixtures_with_teams')
  .select('id, home_name, away_name, broadcaster')
  .eq('id', 6057)
  .single();

console.log('\n📊 View shows broadcaster:', fixtureView.broadcaster || 'NONE');

// Verify no Amazon
const hasAmazon = broadcasts.some(b => b.channel_name.toLowerCase().includes('amazon'));
console.log('\n✅ Amazon Prime present:', hasAmazon ? '❌ YES (BAD)' : '✅ NO (GOOD)');
