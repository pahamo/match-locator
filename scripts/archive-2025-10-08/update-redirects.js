// Script to update _redirects file with team slug mappings
// Run with: node scripts/update-redirects.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get environment variables
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables. Please set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

async function updateRedirects() {
  console.log('=== UPDATING _REDIRECTS FILE ===');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Get all teams with both old and new slugs
    const { data: teams, error } = await supabase
      .from('teams')
      .select('id, name, slug, url_slug')
      .order('name');

    if (error) {
      console.error('Fetch Error:', error);
      return;
    }

    console.log(`Found ${teams.length} teams`);

    // Generate redirect mappings
    const redirects = [];
    const redirectsSet = new Set();

    // Add base redirects first
    redirects.push('# Team URL Redirects');
    redirects.push('# Redirect old /clubs/ paths to new /club/ paths');
    redirects.push('/clubs/:slug /club/:slug 301!');
    redirects.push('');
    redirects.push('# Specific team slug redirects');

    let redirectCount = 0;

    for (const team of teams) {
      if (team.url_slug && team.slug !== team.url_slug) {
        // Create redirects from old slug to new url_slug
        const oldPath = `/club/${team.slug}`;
        const newPath = `/club/${team.url_slug}`;
        const redirectLine = `${oldPath} ${newPath} 301!`;

        // Also redirect the old /clubs/ path to new /club/ path with new slug
        const oldClubsPath = `/clubs/${team.slug}`;
        const redirectClubsLine = `${oldClubsPath} ${newPath} 301!`;

        if (!redirectsSet.has(redirectLine)) {
          redirects.push(`# ${team.name}`);
          redirects.push(redirectLine);
          redirectsSet.add(redirectLine);
          redirectCount++;
        }

        if (!redirectsSet.has(redirectClubsLine)) {
          redirects.push(redirectClubsLine);
          redirectsSet.add(redirectClubsLine);
        }

        console.log(`✓ ${team.name}: ${team.slug} → ${team.url_slug}`);
      }
    }

    // Write the redirects file
    const redirectsPath = path.join(__dirname, '..', 'public', '_redirects');
    const redirectsContent = redirects.join('\n') + '\n';

    fs.writeFileSync(redirectsPath, redirectsContent, 'utf8');

    console.log(`\n=== COMPLETE ===`);
    console.log(`Generated ${redirectCount} team-specific redirect rules`);
    console.log(`Updated: ${redirectsPath}`);
    console.log(`Total redirects in file: ${redirects.length} lines`);

  } catch (error) {
    console.error('Script error:', error);
  }
}

// Run the script
updateRedirects();