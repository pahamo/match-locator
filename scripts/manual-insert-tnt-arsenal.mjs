import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('📺 Manually inserting TNT Sports for Arsenal vs Atletico...\n');

const { error } = await supabase
  .from('broadcasts')
  .insert({
    fixture_id: 6187,
    channel_name: 'TNT Sports',
    broadcaster_type: 'tv',
    country_code: 'GB',
    sportmonks_tv_station_id: 860, // TNT Sports ID from API
    data_source: 'sportmonks',
    last_synced_at: new Date().toISOString()
  });

if (error) {
  console.error('Error:', error);
} else {
  console.log('✅ Inserted TNT Sports for fixture 6187\n');
}
