import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFixtureTeamIds() {
  console.log('🔍 Checking fixtures for Bournemouth...\n');

  // Get a fixture that should include Bournemouth
  const { data: fixtures, error } = await supabase
    .from('fixtures')
    .select('id, home_team_id, away_team_id, utc_kickoff')
    .or('home_team_id.eq.52,away_team_id.eq.52') // Sportmonks ID for Bournemouth
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${fixtures?.length || 0} fixtures with Sportmonks team ID 52`);

  // Now check by team name in fixtures_with_teams view
  const { data: viewFixtures } = await supabase
    .from('fixtures_with_teams')
    .select('*')
    .or('home_team.ilike.%Bournemouth%,away_team.ilike.%Bournemouth%')
    .limit(5);

  console.log(`\nFixtures with "Bournemouth" in team name (from view):`);
  if (viewFixtures && viewFixtures.length > 0) {
    viewFixtures.forEach(fx => {
      console.log(`   ${fx.home_team} (ID: ${fx.home_team_id}) vs ${fx.away_team} (ID: ${fx.away_team_id})`);
      console.log(`      Date: ${new Date(fx.utc_kickoff).toLocaleDateString()}`);
    });
  } else {
    console.log('   None found');
  }

  // Check all teams to see if there are duplicate Bournemouth entries
  const { data: allTeams } = await supabase
    .from('teams')
    .select('id, name, slug, sportmonks_team_id')
    .ilike('name', '%Bournemouth%');

  console.log(`\n📋 All teams with "Bournemouth" in name:`);
  allTeams?.forEach(t => {
    console.log(`   ID: ${t.id}, Name: ${t.name}, Slug: ${t.slug}, Sportmonks: ${t.sportmonks_team_id || 'NULL'}`);
  });
}

checkFixtureTeamIds().catch(console.error);
