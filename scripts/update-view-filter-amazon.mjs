import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('📝 Updating fixtures_with_teams view to filter Amazon for all competitions...\n');

// Read the SQL file
const sql = fs.readFileSync('docs/migrations/add-3pm-blackout.sql', 'utf8');

// Execute the SQL
const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

if (error) {
  console.error('❌ Error updating view:', error);
  process.exit(1);
}

console.log('✅ View updated successfully!');
console.log('\nThis will now filter out Amazon Prime for ALL competitions (not just Premier League)');
console.log('Arsenal vs Atletico should now show "Sky Go" instead of "Amazon Prime Video"\n');
