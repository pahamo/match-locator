import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSportmonksIds() {
  console.log('🔍 Checking Sportmonks team IDs for teams without fixtures...\n');

  const teamsWithoutFixtures = [
    'bournemouth',
    'brighton',
    'man-city',
    'man-united',
    'forest',
    'tottenham',
    'wolves'
  ];

  for (const slug of teamsWithoutFixtures) {
    const { data: team, error } = await supabase
      .from('teams')
      .select('id, name, slug, sportmonks_team_id, external_id, crest_url')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(`❌ Error fetching ${slug}:`, error);
      continue;
    }

    console.log(`${team.name.padEnd(30)}`);
    console.log(`   Slug: ${team.slug}`);
    console.log(`   Sportmonks ID: ${team.sportmonks_team_id || 'MISSING ⚠️'}`);
    console.log(`   External ID: ${team.external_id || 'N/A'}`);
    console.log(`   Crest URL: ${team.crest_url ? '✓' : '✗'}`);
    console.log('');
  }

  // Also check a team that HAS fixtures for comparison
  console.log('📊 For comparison, checking Arsenal (has fixtures):');
  const { data: arsenal } = await supabase
    .from('teams')
    .select('id, name, slug, sportmonks_team_id, external_id, crest_url')
    .eq('slug', 'arsenal')
    .single();

  if (arsenal) {
    console.log(`${arsenal.name.padEnd(30)}`);
    console.log(`   Sportmonks ID: ${arsenal.sportmonks_team_id}`);
    console.log(`   External ID: ${arsenal.external_id}`);
    console.log(`   Crest URL: ${arsenal.crest_url ? '✓' : '✗'}`);
  }
}

checkSportmonksIds().catch(console.error);
