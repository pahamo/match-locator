import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  console.log('Checking API competition mappings...\n');

  const { data, error } = await supabase
    .from('api_competition_mapping')
    .select('*')
    .order('our_competition_id');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('All API mappings:');
  data.forEach(m => {
    const active = m.is_active ? '✅' : '❌';
    console.log(`${active} CompID ${m.our_competition_id} → SportMonks ${m.sportmonks_league_id} (${m.sportmonks_league_name})`);
  });

  const europa = data.find(m => m.our_competition_id === 11);
  if (europa) {
    console.log('\n📌 Europa League Mapping:');
    console.log(JSON.stringify(europa, null, 2));
  } else {
    console.log('\n❌ Europa League mapping NOT found');
    console.log('Need to add it to api_competition_mapping table');
  }
}

main();
