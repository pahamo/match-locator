import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Check date range of fixtures
const { data, error } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff, round')
  .eq('competition_id', 1)
  .order('utc_kickoff', { ascending: false })
  .limit(10);

if (error) {
  console.error('Error:', error);
} else {
  console.log('Most recent fixtures:');
  data.forEach(f => {
    const date = new Date(f.utc_kickoff);
    console.log(`  ${date.toISOString().split('T')[0]} - ID: ${f.id} - Round: ${f.round ? 'YES' : 'NO'}`);
  });
}

// Check oldest
const { data: oldest } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff, round')
  .eq('competition_id', 1)
  .order('utc_kickoff', { ascending: true })
  .limit(10);

console.log('\nOldest fixtures:');
oldest?.forEach(f => {
  const date = new Date(f.utc_kickoff);
  console.log(`  ${date.toISOString().split('T')[0]} - ID: ${f.id} - Round: ${f.round ? 'YES' : 'NO'}`);
});
