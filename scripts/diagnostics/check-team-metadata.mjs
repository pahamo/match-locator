import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTeamMetadata() {
  console.log('🔍 Checking Bournemouth team metadata...\n');

  const { data: team, error } = await supabase
    .from('teams')
    .select('*')
    .eq('slug', 'bournemouth')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('✅ Team metadata available:');
  Object.entries(team).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      console.log(`   ${key}: ${String(value).substring(0, 100)}`);
    }
  });

  console.log('\n📊 Missing data:');
  Object.entries(team).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      console.log(`   ${key}: ❌ NULL/EMPTY`);
    }
  });

  // Check if we have fixtures across multiple competitions
  console.log('\n🔍 Checking fixtures across competitions...\n');

  const { data: fixtures } = await supabase
    .from('fixtures_with_teams')
    .select('competition_id')
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
    .gte('utc_kickoff', new Date().toISOString());

  if (fixtures) {
    const competitionCounts = fixtures.reduce((acc, fx) => {
      acc[fx.competition_id] = (acc[fx.competition_id] || 0) + 1;
      return acc;
    }, {});

    console.log('Upcoming fixtures by competition:');
    Object.entries(competitionCounts).forEach(([compId, count]) => {
      console.log(`   Competition ${compId}: ${count} fixtures`);
    });
  }
}

checkTeamMetadata().catch(console.error);
