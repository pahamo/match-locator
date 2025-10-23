// Production migration script that can be run via curl
import { createClient } from '@supabase/supabase-js';

// Use environment variables that match Netlify setup
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment check:');
console.log('SUPABASE_URL:', SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SERVICE_KEY:', SUPABASE_SERVICE_KEY ? 'SET' : 'NOT SET');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables');
  process.exit(1);
}

// Smart slug generation function
function generateSmartSlug(name, shortName) {
  console.log(`Generating slug for: "${name}" with short_name: "${shortName}"`);

  let baseText = shortName || name;
  baseText = baseText.toLowerCase();

  // Special cases for specific teams
  const specialCases = {
    'manchester united': 'man-united',
    'manchester city': 'man-city',
    'newcastle united': 'newcastle-united',
    'leeds united': 'leeds-united',
    'sheffield united': 'sheffield-united',
    'west ham united': 'west-ham-united',
    'wolverhampton wanderers': 'wolves',
    'tottenham hotspur': 'tottenham',
    'nottingham forest': 'forest',
    'crystal palace': 'crystal-palace',
    'brighton & hove albion': 'brighton',
    'leicester city': 'leicester-city'
  };

  // Check for exact special case matches first
  const nameKey = name.toLowerCase();
  const shortKey = shortName ? shortName.toLowerCase() : '';

  for (const [teamName, slug] of Object.entries(specialCases)) {
    if (nameKey.includes(teamName) || shortKey.includes(teamName)) {
      console.log(`Special case match: ${teamName} → ${slug}`);
      return slug;
    }
  }

  // Remove common prefixes and suffixes
  baseText = baseText
    .replace(/^(ac|fc|as|cf|sc)\s+/i, '')
    .replace(/\s+(fc|ac|cf|sc)$/i, '')
    .replace(/\s+f\.?c\.?$/i, '')
    .replace(/^f\.?c\.?\s+/i, '');

  // Clean up and create slug
  let slug = baseText
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  console.log(`Generated slug: "${name}" → "${slug}"`);
  return slug;
}

async function runMigration() {
  console.log('=== STARTING SLUG MIGRATION ===');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Step 1: Add url_slug column if it doesn't exist
    console.log('Step 1: Adding url_slug column...');

    const { error: columnError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                        WHERE table_name='teams' AND column_name='url_slug') THEN
            ALTER TABLE teams ADD COLUMN url_slug TEXT;
            CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_url_slug ON teams(url_slug) WHERE url_slug IS NOT NULL;
            RAISE NOTICE 'Added url_slug column and index';
          ELSE
            RAISE NOTICE 'url_slug column already exists';
          END IF;
        END $$;
      `
    });

    if (columnError) {
      console.error('Error adding column:', columnError);
      return;
    }
    console.log('✓ Column setup complete');

    // Step 2: Fetch all teams
    console.log('Step 2: Fetching all teams...');
    const { data: teams, error: fetchError } = await supabase
      .from('teams')
      .select('id, name, slug, short_name')
      .order('name');

    if (fetchError) {
      console.error('Fetch Error:', fetchError);
      return;
    }

    console.log(`Found ${teams.length} teams to process`);

    // Step 3: Generate and apply new slugs
    let successCount = 0;
    let errorCount = 0;

    for (const team of teams) {
      const newSlug = generateSmartSlug(team.name, team.short_name);

      const { error } = await supabase
        .from('teams')
        .update({ url_slug: newSlug })
        .eq('id', team.id);

      if (error) {
        console.error(`✗ Failed to update ${team.name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✓ ${team.name}: ${team.slug} → ${newSlug}`);
        successCount++;
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`\n=== MIGRATION COMPLETE ===`);
    console.log(`Success: ${successCount}, Errors: ${errorCount}`);

  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Run the migration
runMigration();