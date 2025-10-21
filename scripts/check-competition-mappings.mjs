import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Checking competition mappings...\n');

const { data, error } = await supabase
  .from('api_competition_mapping')
  .select('*')
  .order('our_competition_id');

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`Found ${data.length} competition mappings:\n`);

data.forEach(m => {
  console.log(`Competition ID ${m.our_competition_id}: ${m.sportmonks_league_name}`);
  console.log(`  SportMonks League ID: ${m.sportmonks_league_id}`);
  console.log(`  Active: ${m.is_active ? '✅' : '❌'}`);
  console.log('');
});
