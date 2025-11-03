#!/usr/bin/env node
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('📺 Fixture 6057 - All Broadcast Records\n');

const { data: broadcasts } = await supabase
  .from('broadcasts')
  .select('*')
  .eq('fixture_id', 6057)
  .order('channel_name');

console.log(`Found ${broadcasts?.length || 0} broadcasts:\n`);

broadcasts?.forEach((b, i) => {
  console.log(`${i + 1}. ${b.channel_name}`);
  console.log(`   - SportMonks TV Station ID: ${b.sportmonks_tv_station_id}`);
  console.log(`   - Provider ID: ${b.provider_id}`);
  console.log(`   - Country Code: ${b.country_code}`);
  console.log('');
});

// Check what the view returns
const { data: view } = await supabase
  .from('fixtures_with_teams')
  .select('broadcaster, broadcaster_id')
  .eq('id', 6057)
  .single();

console.log('View returns:');
console.log(`   broadcaster: ${view?.broadcaster}`);
console.log(`   broadcaster_id: ${view?.broadcaster_id}`);
