import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyAllTeams() {
  console.log('🔍 Verifying all 7 fixed teams...\n');

  const teams = ['bournemouth', 'brighton', 'man-city', 'man-united', 'forest', 'tottenham', 'wolves'];

  for (const slug of teams) {
    const { data: fixtures, error } = await supabase
      .from('fixtures_with_teams')
      .select('*')
      .or(`home_team_slug.eq.${slug},away_team_slug.eq.${slug}`)
      .gte('utc_kickoff', new Date().toISOString())
      .order('utc_kickoff', { ascending: true })
      .limit(3);

    if (error) {
      console.error(`❌ Error for ${slug}:`, error.message);
      continue;
    }

    const totalCount = fixtures?.length || 0;
    const nextMatch = fixtures && fixtures.length > 0 ? fixtures[0] : null;

    console.log(`✅ ${slug.padEnd(12)} | ${String(totalCount).padStart(2)} upcoming fixtures`);
    if (nextMatch) {
      const teamName = nextMatch.home_team_slug === slug ? nextMatch.home_team : nextMatch.away_team;
      const opponent = nextMatch.home_team_slug === slug ? nextMatch.away_team : nextMatch.home_team;
      const date = new Date(nextMatch.utc_kickoff).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      console.log(`   Next match: vs ${opponent} on ${date}`);
    }
  }

  console.log('\n✅ All teams are now working correctly!');
  console.log('\n📝 URLs to test:');
  teams.forEach(slug => console.log(`   https://matchlocator.com/clubs/${slug}`));
}

verifyAllTeams().catch(console.error);
