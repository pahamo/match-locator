import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkFixture() {
  console.log('🔍 Checking fixture 6057 broadcasts in detail...\n');

  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('id, provider_id, country_code, channel_name, broadcaster_type, sportmonks_tv_station_id, created_at')
    .eq('fixture_id', 6057)
    .order('id', { ascending: true });

  // Get provider names
  const providerIds = broadcasts.map(b => b.provider_id).filter(Boolean);
  const { data: providers } = await supabase
    .from('providers')
    .select('id, name')
    .in('id', providerIds);

  const providerMap = new Map(providers.map(p => [p.id, p.name]));

  console.log('All broadcasts for fixture 6057:\n');
  broadcasts.forEach(b => {
    const providerName = b.provider_id ? providerMap.get(b.provider_id) : 'NULL';
    console.log(`ID ${b.id}:`);
    console.log(`  Provider: ${providerName} (ID ${b.provider_id})`);
    console.log(`  Channel: ${b.channel_name || 'N/A'}`);
    console.log(`  Type: ${b.broadcaster_type || 'N/A'}`);
    console.log(`  SportMonks ID: ${b.sportmonks_tv_station_id || 'N/A'}`);
    console.log(`  Country: ${b.country_code}`);
    console.log(`  Created: ${b.created_at}`);
    console.log('');
  });

  console.log('\n💡 Question: Which one should be the "primary" broadcaster?');
  console.log('   Expected: TNT Sports');
  console.log('   Current logic picks: Sky Sports (lowest broadcast ID)');
}

checkFixture();
