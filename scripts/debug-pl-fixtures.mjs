import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function debugPLFixtures() {
  console.log('🔍 Checking Premier League fixtures for broadcaster data...\n');

  // Premier League is competition_id 8
  const { data: rows, error } = await supabase
    .from('fixtures_with_teams')
    .select(`
      id,matchday,utc_kickoff,
      home_team,away_team,
      broadcaster,broadcaster_id
    `)
    .eq('competition_id', 8)
    .gte('utc_kickoff', new Date().toISOString())
    .order('utc_kickoff', { ascending: true })
    .limit(20);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${rows.length} Premier League fixtures\n`);

  rows.forEach((row, idx) => {
    console.log(`${idx + 1}. ${row.home_team} vs ${row.away_team}`);
    console.log(`   Fixture ID: ${row.id}`);
    console.log(`   Date: ${new Date(row.utc_kickoff).toLocaleString('en-GB')}`);
    console.log(`   Broadcaster: ${row.broadcaster || 'NULL'}`);
    console.log(`   Broadcaster ID: ${row.broadcaster_id || 'NULL'}`);
    console.log('');
  });

  const withBroadcaster = rows.filter(r => r.broadcaster);
  console.log(`\n✅ ${withBroadcaster.length}/${rows.length} fixtures have broadcaster data`);

  // Now let's check if one of these fixtures has broadcast data in the broadcasts table
  if (rows.length > 0) {
    const fixtureId = rows[0].id;
    console.log(`\n🔍 Checking broadcasts table for fixture ${fixtureId}...`);

    const { data: broadcasts } = await supabase
      .from('broadcasts')
      .select('id, fixture_id, provider_id, country_code')
      .eq('fixture_id', fixtureId);

    console.log('Broadcasts:', broadcasts);

    if (broadcasts && broadcasts.length > 0) {
      console.log(`\n🔍 Checking provider for broadcast ${broadcasts[0].id}...`);
      const { data: provider } = await supabase
        .from('providers')
        .select('id, name')
        .eq('id', broadcasts[0].provider_id)
        .single();

      console.log('Provider:', provider);
    }
  }
}

debugPLFixtures();
