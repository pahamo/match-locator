import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBournemouthData() {
  console.log('🔍 Checking Bournemouth team data...\n');

  // 1. Check team record
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('slug', 'bournemouth')
    .single();

  if (teamError) {
    console.error('❌ Error fetching team:', teamError);
    return;
  }

  console.log('✅ Team found:');
  console.log('   ID:', team.id);
  console.log('   Name:', team.name);
  console.log('   Slug:', team.slug);
  console.log('   Competition ID:', team.competition_id);
  console.log('   Crest:', team.crest ? '✓' : '✗');
  console.log('');

  // 2. Check upcoming fixtures
  const { data: fixtures, error: fixturesError } = await supabase
    .from('fixtures_with_teams')
    .select('*')
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
    .gte('utc_kickoff', new Date().toISOString())
    .order('utc_kickoff', { ascending: true })
    .limit(10);

  if (fixturesError) {
    console.error('❌ Error fetching fixtures:', fixturesError);
    return;
  }

  console.log(`📅 Upcoming fixtures: ${fixtures?.length || 0}\n`);

  if (fixtures && fixtures.length > 0) {
    fixtures.forEach((fx, idx) => {
      console.log(`${idx + 1}. ${fx.home_team} vs ${fx.away_team}`);
      console.log(`   Date: ${new Date(fx.utc_kickoff).toLocaleString('en-GB')}`);
      console.log(`   Broadcaster: ${fx.broadcaster || 'TBC'}`);
      console.log(`   Competition: ${fx.competition_id}`);
      console.log('');
    });
  } else {
    console.log('⚠️  No upcoming fixtures found!');
    console.log('');

    // Check recent past fixtures
    const { data: pastFixtures } = await supabase
      .from('fixtures_with_teams')
      .select('*')
      .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
      .lt('utc_kickoff', new Date().toISOString())
      .order('utc_kickoff', { ascending: false })
      .limit(5);

    if (pastFixtures && pastFixtures.length > 0) {
      console.log('📋 Recent past fixtures:');
      pastFixtures.forEach((fx, idx) => {
        console.log(`${idx + 1}. ${fx.home_team} vs ${fx.away_team}`);
        console.log(`   Date: ${new Date(fx.utc_kickoff).toLocaleString('en-GB')}`);
        console.log('');
      });
    }
  }

  // 3. Check if there are any fixtures at all
  const { count } = await supabase
    .from('fixtures')
    .select('*', { count: 'exact', head: true })
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`);

  console.log(`📊 Total fixtures in database: ${count || 0}`);
}

checkBournemouthData().catch(console.error);
