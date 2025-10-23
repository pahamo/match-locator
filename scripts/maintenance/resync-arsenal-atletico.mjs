import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🧹 Deleting existing broadcasts for fixture 6187 (Arsenal vs Atletico)...\n');

const { error } = await supabase
  .from('broadcasts')
  .delete()
  .eq('fixture_id', 6187);

if (error) {
  console.error('Error:', error);
} else {
  console.log('✅ Deleted existing broadcasts for fixture 6187');
  console.log('\nNow run: node scripts/sync-upcoming-broadcasters.mjs --competition-id=2');
  console.log('to re-sync Champions League with the updated filter\n');
}
