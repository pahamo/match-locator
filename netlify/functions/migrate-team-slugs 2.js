const { createClient } = require('@supabase/supabase-js');

// Smart slug generation function
function generateSmartSlug(name, shortName) {
  let baseText = shortName || name;
  baseText = baseText.toLowerCase();

  // Special cases
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

  for (const [teamName, slug] of Object.entries(specialCases)) {
    if (name.toLowerCase().includes(teamName) || (shortName && shortName.toLowerCase().includes(teamName))) {
      return slug;
    }
  }

  // Clean up
  baseText = baseText
    .replace(/^(ac|fc|as|cf|sc)\s+/i, '')
    .replace(/\s+(fc|ac|cf|sc)$/i, '')
    .replace(/\s+f\.?c\.?$/i, '')
    .replace(/^f\.?c\.?\s+/i, '');

  return baseText
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

exports.handler = async (event, context) => {
  const logs = [];
  const log = (message) => {
    console.log(message);
    logs.push(message);
  };

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    log('=== SMART SLUG MIGRATION START ===');

    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Step 1: Add url_slug column
    log('Step 1: Adding url_slug column...');

    try {
      await supabase.rpc('exec_sql', {
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name='teams' AND column_name='url_slug') THEN
              ALTER TABLE teams ADD COLUMN url_slug TEXT;
              CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_url_slug ON teams(url_slug) WHERE url_slug IS NOT NULL;
              RAISE NOTICE 'Added url_slug column and index';
            END IF;
          END $$;
        `
      });
      log('✓ Column added successfully');
    } catch (err) {
      log(`Column creation error: ${err.message}`);
      // Continue anyway - column might already exist
    }

    // Step 2: Get all teams
    log('Step 2: Fetching teams...');
    const { data: teams, error: fetchError } = await supabase
      .from('teams')
      .select('id, name, slug, short_name')
      .order('name');

    if (fetchError) {
      throw new Error(`Failed to fetch teams: ${fetchError.message}`);
    }

    log(`Found ${teams.length} teams to process`);

    // Step 3: Generate and apply slugs
    let successCount = 0;
    const results = [];

    for (const team of teams) {
      const newSlug = generateSmartSlug(team.name, team.short_name);

      const { error: updateError } = await supabase
        .from('teams')
        .update({ url_slug: newSlug })
        .eq('id', team.id);

      if (updateError) {
        log(`✗ ${team.name}: ${updateError.message}`);
        results.push({ team: team.name, success: false, error: updateError.message });
      } else {
        log(`✓ ${team.name}: ${team.slug} → ${newSlug}`);
        results.push({ team: team.name, success: true, oldSlug: team.slug, newSlug });
        successCount++;
      }
    }

    log(`=== MIGRATION COMPLETE: ${successCount}/${teams.length} successful ===`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Successfully migrated ${successCount} out of ${teams.length} teams`,
        logs,
        results: results.slice(0, 10) // Show first 10 results
      })
    };

  } catch (error) {
    log(`MIGRATION FAILED: ${error.message}`);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        logs
      })
    };
  }
};