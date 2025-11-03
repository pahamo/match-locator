import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAllPLTeams() {
  console.log('🔍 Checking all Premier League teams...\n');

  // Get all PL teams (competition_id = 1)
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, name, slug, crest')
    .eq('competition_id', 1)
    .order('name');

  if (teamsError) {
    console.error('❌ Error:', teamsError);
    return;
  }

  console.log(`Found ${teams.length} Premier League teams\n`);

  const teamsWithoutFixtures = [];
  const teamsWithoutCrests = [];

  for (const team of teams) {
    // Count fixtures
    const { count } = await supabase
      .from('fixtures')
      .select('*', { count: 'exact', head: true })
      .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`);

    const fixtureCount = count || 0;
    const hasCrest = !!team.crest;

    console.log(`${team.name.padEnd(30)} | Fixtures: ${String(fixtureCount).padStart(3)} | Crest: ${hasCrest ? '✓' : '✗'}`);

    if (fixtureCount === 0) {
      teamsWithoutFixtures.push(team);
    }
    if (!hasCrest) {
      teamsWithoutCrests.push(team);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   Teams without fixtures: ${teamsWithoutFixtures.length}`);
  if (teamsWithoutFixtures.length > 0) {
    teamsWithoutFixtures.forEach(t => console.log(`      - ${t.name} (${t.slug})`));
  }

  console.log(`\n   Teams without crests: ${teamsWithoutCrests.length}`);
  if (teamsWithoutCrests.length > 0) {
    teamsWithoutCrests.forEach(t => console.log(`      - ${t.name} (${t.slug})`));
  }
}

checkAllPLTeams().catch(console.error);
