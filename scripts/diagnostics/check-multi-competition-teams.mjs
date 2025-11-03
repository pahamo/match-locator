import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMultiCompetitionTeams() {
  console.log('🔍 Checking teams with fixtures in multiple competitions...\n');

  // Get all teams
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, slug, competition_id')
    .eq('is_active', true)
    .order('name');

  if (!teams) return;

  const teamsWithMultipleComps = [];

  for (const team of teams) {
    const { data: fixtures } = await supabase
      .from('fixtures_with_teams')
      .select('competition_id')
      .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
      .gte('utc_kickoff', new Date().toISOString())
      .limit(500);

    if (fixtures && fixtures.length > 0) {
      const competitions = [...new Set(fixtures.map(f => f.competition_id))];

      if (competitions.length > 1) {
        const compCounts = fixtures.reduce((acc, fx) => {
          acc[fx.competition_id] = (acc[fx.competition_id] || 0) + 1;
          return acc;
        }, {});

        teamsWithMultipleComps.push({
          team: team.name,
          slug: team.slug,
          primaryComp: team.competition_id,
          competitions: competitions,
          counts: compCounts
        });
      }
    }
  }

  console.log(`Found ${teamsWithMultipleComps.length} teams with fixtures in multiple competitions:\n`);

  teamsWithMultipleComps.forEach(t => {
    console.log(`${t.team} (/${t.slug})`);
    console.log(`   Primary competition: ${t.primaryComp}`);
    console.log(`   Fixtures by competition:`);
    Object.entries(t.counts).forEach(([comp, count]) => {
      console.log(`      Competition ${comp}: ${count} fixtures`);
    });
    console.log('');
  });

  // Sample one team to see the detailed fixture breakdown
  if (teamsWithMultipleComps.length > 0) {
    const sampleTeam = teamsWithMultipleComps[0];
    console.log(`\n📋 Sample fixtures for ${sampleTeam.team}:\n`);

    const teamData = teams.find(t => t.slug === sampleTeam.slug);

    const { data: sampleFixtures } = await supabase
      .from('fixtures_with_teams')
      .select('home_team, away_team, competition_id, utc_kickoff, broadcaster')
      .or(`home_team_id.eq.${teamData.id},away_team_id.eq.${teamData.id}`)
      .gte('utc_kickoff', new Date().toISOString())
      .order('utc_kickoff', { ascending: true })
      .limit(10);

    if (sampleFixtures) {
      sampleFixtures.forEach(fx => {
        console.log(`${fx.home_team} vs ${fx.away_team}`);
        console.log(`   Competition: ${fx.competition_id}`);
        console.log(`   Date: ${new Date(fx.utc_kickoff).toLocaleDateString('en-GB')}`);
        console.log(`   Broadcaster: ${fx.broadcaster || 'TBC'}`);
        console.log('');
      });
    }
  }
}

checkMultiCompetitionTeams().catch(console.error);
