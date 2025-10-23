// Script to add url_slug column and generate smart slugs for teams
// Run with: node scripts/update-team-slugs.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get environment variables with fallback
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL) {
  console.error('Missing SUPABASE_URL. Please set REACT_APP_SUPABASE_URL or SUPABASE_URL environment variable.');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY. Please set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY environment variable.');
  process.exit(1);
}

// Smart slug generation rules
function generateSmartSlug(name, shortName) {
  console.log(`Generating slug for: "${name}" with short_name: "${shortName}"`);

  // Use short_name as starting point if available, otherwise use name
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

  // Remove common prefixes (AC, FC, AS, etc.)
  baseText = baseText
    .replace(/^(ac|fc|as|cf|sc)\s+/i, '') // Remove prefixes
    .replace(/\s+(fc|ac|cf|sc)$/i, ''); // Remove suffixes

  // Keep important suffixes that are part of identity
  // Don't remove: united, city, town, rovers, wanderers
  baseText = baseText
    .replace(/\s+f\.?c\.?$/i, '') // Remove trailing FC variations
    .replace(/^f\.?c\.?\s+/i, ''); // Remove leading FC variations

  // Clean up and create slug
  let slug = baseText
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  console.log(`Generated slug: "${name}" → "${slug}"`);
  return slug;
}

async function updateTeamSlugs() {
  console.log('=== UPDATING TEAM SLUGS ===');

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

    // Step 3: Generate new slugs and track changes
    const updates = [];
    const slugTracker = new Map();

    for (const team of teams) {
      const newSlug = generateSmartSlug(team.name, team.short_name);

      // Check for conflicts
      if (slugTracker.has(newSlug)) {
        console.warn(`CONFLICT: ${newSlug} already used by team ${slugTracker.get(newSlug)}. Current team: ${team.name}`);
        // For conflicts, append team ID to make unique
        const uniqueSlug = `${newSlug}-${team.id}`;
        updates.push({
          id: team.id,
          name: team.name,
          oldSlug: team.slug,
          newSlug: uniqueSlug
        });
        slugTracker.set(uniqueSlug, team.name);
      } else {
        updates.push({
          id: team.id,
          name: team.name,
          oldSlug: team.slug,
          newSlug
        });
        slugTracker.set(newSlug, team.name);
      }
    }

    // Step 4: Show preview of changes
    console.log('\n=== PREVIEW OF CHANGES ===');
    updates.slice(0, 10).forEach(update => {
      console.log(`${update.name}: ${update.oldSlug} → ${update.newSlug}`);
    });
    if (updates.length > 10) {
      console.log(`... and ${updates.length - 10} more teams`);
    }

    // Step 5: Update teams in batches
    console.log('\n=== APPLYING UPDATES ===');
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(updates.length/batchSize)}`);

      for (const update of batch) {
        const { error } = await supabase
          .from('teams')
          .update({ url_slug: update.newSlug })
          .eq('id', update.id);

        if (error) {
          console.error(`✗ Failed to update ${update.name}:`, error.message);
          errorCount++;
        } else {
          console.log(`✓ ${update.name}: ${update.oldSlug} → ${update.newSlug}`);
          successCount++;
        }
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n=== COMPLETE ===`);
    console.log(`Success: ${successCount}, Errors: ${errorCount}`);

  } catch (error) {
    console.error('Script error:', error);
  }
}

// Run the script
updateTeamSlugs();