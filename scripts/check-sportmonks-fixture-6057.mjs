import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function investigateFixture() {
  console.log('🔍 Investigating fixture 6057 data source...\n');

  // Get fixture details
  const { data: fixture } = await supabase
    .from('fixtures')
    .select('id, home_team_id, away_team_id, utc_kickoff, sportmonks_fixture_id, data_source, last_synced_at')
    .eq('id', 6057)
    .single();

  console.log('Fixture 6057:');
  console.log(`  SportMonks Fixture ID: ${fixture.sportmonks_fixture_id}`);
  console.log(`  Data Source: ${fixture.data_source}`);
  console.log(`  Last Synced: ${fixture.last_synced_at}`);
  console.log(`  Kickoff: ${new Date(fixture.utc_kickoff).toLocaleString('en-GB')}`);
  console.log('');

  // Get broadcasts with their sync info
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('id, provider_id, channel_name, sportmonks_tv_station_id, data_source, last_synced_at, created_at')
    .eq('fixture_id', 6057)
    .order('id', { ascending: true });

  console.log('Broadcasts and their data source:\n');
  broadcasts.forEach(b => {
    console.log(`Broadcast ID ${b.id}:`);
    console.log(`  Channel: ${b.channel_name}`);
    console.log(`  Provider ID: ${b.provider_id}`);
    console.log(`  SportMonks TV Station ID: ${b.sportmonks_tv_station_id}`);
    console.log(`  Data Source: ${b.data_source}`);
    console.log(`  Last Synced: ${b.last_synced_at}`);
    console.log(`  Created: ${b.created_at}`);
    console.log('');
  });

  console.log('\n💡 Analysis:');
  console.log('   All broadcasts have data_source = "sportmonks"');
  console.log('   This means the data came from Sports Monks API');
  console.log('   ');
  console.log('   Issue: Sports Monks data may be:');
  console.log('   1. Incorrect (wrong broadcaster assigned)');
  console.log('   2. Incomplete (includes all possible broadcasters, not just actual)');
  console.log('   3. Generic (placeholder data before official announcement)');
  console.log('');
  console.log('   Next step: Check if SportMonks TV Station ID 71 is correctly mapped to Sky Sports');
}

investigateFixture();
