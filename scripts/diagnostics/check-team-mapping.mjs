import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMapping() {
  console.log('🔍 Checking team mapping and fixture counts...\n');

  const teams = ['arsenal', 'bournemouth', 'brighton', 'man-city', 'man-united', 'forest', 'tottenham', 'wolves'];

  for (const slug of teams) {
    const { data: team } = await supabase
      .from('teams')
      .select('id, name, sportmonks_team_id')
      .eq('slug', slug)
      .single();

    if (!team) continue;

    // Count fixtures
    const { count } = await supabase
      .from('fixtures')
      .select('*', { count: 'exact', head: true })
      .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`);

    console.log(`${team.name.padEnd(30)} | Sportmonks: ${String(team.sportmonks_team_id || 'NONE').padEnd(6)} | Fixtures: ${count || 0}`);
  }
}

checkMapping().catch(console.error);
