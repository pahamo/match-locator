import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function debugFixtureData() {
  console.log('🔍 Fetching fixtures to debug broadcaster data...\n');

  const { data: rows, error } = await supabase
    .from('fixtures_with_teams')
    .select(`
      id,matchday,utc_kickoff,venue,status,competition_id,stage,round,
      home_team_id,home_team,home_slug,home_crest,home_score,
      away_team_id,away_team,away_slug,away_crest,away_score,
      broadcaster,broadcaster_id
    `)
    .gte('utc_kickoff', new Date().toISOString())
    .order('utc_kickoff', { ascending: true })
    .limit(10);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${rows.length} fixtures\n`);

  rows.forEach((row, idx) => {
    console.log(`${idx + 1}. ${row.home_team} vs ${row.away_team}`);
    console.log(`   Date: ${new Date(row.utc_kickoff).toLocaleString('en-GB')}`);
    console.log(`   Broadcaster: ${row.broadcaster || 'NULL'}`);
    console.log(`   Broadcaster ID: ${row.broadcaster_id || 'NULL'}`);
    console.log('');
  });

  const withBroadcaster = rows.filter(r => r.broadcaster);
  console.log(`\n✅ ${withBroadcaster.length}/${rows.length} fixtures have broadcaster data`);
}

debugFixtureData();
