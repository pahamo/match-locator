import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('🔍 Checking broadcasts table structure...\n');

  // Get a sample broadcast to see all fields
  const { data: sample } = await supabase
    .from('broadcasts')
    .select('*')
    .limit(1)
    .single();

  console.log('Sample broadcast record:');
  console.log(JSON.stringify(sample, null, 2));
  console.log('');

  console.log('Fields in broadcasts table:');
  Object.keys(sample).forEach(key => {
    console.log(`  - ${key}: ${typeof sample[key]} = ${sample[key]}`);
  });
}

checkSchema();
