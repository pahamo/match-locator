import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('🔍 Checking teams table...\n');

  // Get one team to see available columns
  const { data: team, error } = await supabase
    .from('teams')
    .select('*')
    .eq('slug', 'arsenal')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Available columns in teams table:');
  Object.keys(team).forEach(key => {
    console.log(`   - ${key}: ${typeof team[key]} ${team[key] ? `(e.g., "${String(team[key]).substring(0, 50)}")` : '(null)'}`);
  });

  console.log('\n🔍 Now checking all PL teams for fixture data...\n');

  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .eq('competition_id', 1)
    .order('name');

  const teamsWithoutFixtures = [];

  for (const t of teams) {
    const { count } = await supabase
      .from('fixtures')
      .select('*', { count: 'exact', head: true })
      .or(`home_team_id.eq.${t.id},away_team_id.eq.${t.id}`);

    const fixtureCount = count || 0;
    console.log(`${t.name.padEnd(30)} | Fixtures: ${String(fixtureCount).padStart(3)}`);

    if (fixtureCount === 0) {
      teamsWithoutFixtures.push(t);
    }
  }

  console.log('\n📊 Teams without fixtures:');
  if (teamsWithoutFixtures.length > 0) {
    teamsWithoutFixtures.forEach(t => console.log(`   - ${t.name} (ID: ${t.id}, slug: ${t.slug})`));
  } else {
    console.log('   None! All teams have fixtures.');
  }
}

checkSchema().catch(console.error);
