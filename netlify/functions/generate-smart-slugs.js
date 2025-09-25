const { createClient } = require('@supabase/supabase-js');

// Smart slug generation rules based on requirements
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
  for (const [teamName, slug] of Object.entries(specialCases)) {
    if (name.toLowerCase().includes(teamName) || (shortName && shortName.toLowerCase().includes(teamName))) {
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

exports.handler = async (event, context) => {
  console.log('=== GENERATE SMART SLUGS START ===');

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // First, get all teams
    console.log('Fetching all teams...');
    const { data: teams, error: fetchError } = await supabase
      .from('teams')
      .select('id, name, slug, short_name')
      .order('name');

    if (fetchError) {
      console.error('Fetch Error:', fetchError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch teams', details: fetchError.message })
      };
    }

    console.log(`Found ${teams.length} teams to process`);

    // Generate new slugs and track changes
    const updates = [];
    const slugTracker = new Map(); // Track slug conflicts

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

    // Update teams in batches
    console.log('Starting batch updates...');
    const batchSize = 10;
    const results = [];

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(updates.length/batchSize)}`);

      for (const update of batch) {
        const { error } = await supabase
          .from('teams')
          .update({ url_slug: update.newSlug })
          .eq('id', update.id);

        if (error) {
          console.error(`Failed to update team ${update.name}:`, error);
          results.push({ ...update, success: false, error: error.message });
        } else {
          console.log(`✓ Updated ${update.name}: ${update.oldSlug} → ${update.newSlug}`);
          results.push({ ...update, success: true });
        }
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    console.log(`Batch update complete. Success: ${successCount}, Errors: ${errorCount}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        message: `Generated smart slugs for ${successCount} teams`,
        successCount,
        errorCount,
        results: results.slice(0, 20) // Return first 20 results as sample
      })
    };

  } catch (error) {
    console.error('Exception:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};