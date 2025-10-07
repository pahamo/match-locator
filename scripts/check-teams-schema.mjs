import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Get one team to see column names
const { data, error } = await supabase
  .from('teams')
  .select('*')
  .limit(1);

if (error) {
  console.error('Error:', error);
} else if (data && data.length > 0) {
  console.log('Teams table columns:');
  console.log(Object.keys(data[0]).join(', '));
} else {
  console.log('No data returned');
}
