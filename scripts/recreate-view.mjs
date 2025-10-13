import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Read the view SQL from the migration file
const viewSQL = fs.readFileSync('./docs/migrations/clean-view-migration.sql', 'utf8');

// Extract just the CREATE VIEW statement (between DROP and first verification query)
const createViewMatch = viewSQL.match(/CREATE VIEW[\s\S]+?FROM fixtures f[\s\S]+?LEFT JOIN teams at ON f\.away_team_id = at\.id;/);

if (!createViewMatch) {
  console.error('Could not extract CREATE VIEW statement');
  process.exit(1);
}

const createViewSQL = `
DROP VIEW IF EXISTS fixtures_with_teams CASCADE;

${createViewMatch[0]}
`;

console.log('Recreating fixtures_with_teams view...');
console.log('SQL:', createViewSQL.substring(0, 200) + '...');

const { error } = await supabase.rpc('exec_sql', { sql: createViewSQL });

if (error) {
  console.error('Error creating view:', error);
  process.exit(1);
}

console.log('✅ View created successfully');

// Verify fixture 6057
const { data: fixture } = await supabase
  .from('fixtures_with_teams')
  .select('id, home_team, away_team, broadcaster')
  .eq('id', 6057)
  .single();

console.log('\n📊 Fixture 6057:', fixture);
console.log('✅ Broadcaster:', fixture.broadcaster);
