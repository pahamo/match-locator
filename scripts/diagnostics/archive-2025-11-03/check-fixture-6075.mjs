import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Checking fixture 6075 (Leeds vs West Ham)...\n');

const { data: broadcasts, error } = await supabase
  .from('broadcasts')
  .select('*')
  .eq('fixture_id', 6075)
  .order('channel_name');

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`Found ${broadcasts.length} broadcasters:\n`);

broadcasts.forEach(b => {
  console.log(`- ${b.channel_name} (${b.country_code}, type: ${b.broadcaster_type})`);
});
