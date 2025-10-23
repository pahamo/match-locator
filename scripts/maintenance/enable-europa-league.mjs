import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function enableEuropaLeague() {
  console.log('Enabling Europa League...\n');

  // Update Europa League to make it active and visible
  const { data, error } = await supabase
    .from('competitions')
    .update({
      is_active: true,
      is_production_visible: true
    })
    .eq('id', 11)
    .select();

  if (error) {
    console.error('❌ Error enabling Europa League:', error);
    return;
  }

  console.log('✅ Europa League enabled successfully!');
  console.log(JSON.stringify(data, null, 2));

  console.log('\n📋 Next steps:');
  console.log('1. Sync Europa League fixtures from SportMonks');
  console.log('   node scripts/sync/sync-europa-league.mjs');
  console.log('2. Rebuild and deploy the site');
  console.log('   npm run build && netlify deploy --prod');
}

enableEuropaLeague();
