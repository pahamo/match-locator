#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Helper functions
function normName(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\b(fc|afc|football club)\b/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cityFromAddress(address) {
  if (!address) return null;
  const segments = address.split(',').map(s => s.trim());
  return segments.length > 1 ? segments[segments.length - 1] : null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    fdCode: 'PL',
    compId: 1,
    dryRun: false
  };

  for (const arg of args) {
    if (arg.startsWith('--fd=')) {
      options.fdCode = arg.split('=')[1];
    } else if (arg.startsWith('--comp-id=')) {
      options.compId = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }

  return options;
}

// Manual mapping for edge cases
const MANUAL_MAPPING = {
  // slug: 'Official FD name'
  'brighton-hove-albion': 'Brighton & Hove Albion FC',
  'wolverhampton-wanderers': 'Wolverhampton Wanderers FC',
  'nottingham-forest': 'Nottingham Forest FC',
  'manchester-city': 'Manchester City FC',
  'manchester-united': 'Manchester United FC',
  'tottenham-hotspur': 'Tottenham Hotspur FC'
};

async function main() {
  console.log('🚀 Team Data Backfill Script');
  console.log('============================\n');

  // Parse CLI arguments
  const options = parseArgs();
  console.log(`📋 Configuration:`);
  console.log(`   Football-Data Competition: ${options.fdCode}`);
  console.log(`   Database Competition ID: ${options.compId}`);
  console.log(`   Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE UPDATE'}\n`);

  // Validate environment
  const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'FOOTBALL_DATA_TOKEN'];
  const missing = requiredEnv.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please ensure your .env file contains all required variables.');
    process.exit(1);
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    // Step 1: Fetch teams from database
    console.log(`📊 Fetching teams from database (competition_id=${options.compId})...`);
    const { data: dbTeams, error: dbError } = await supabase
      .from('teams')
      .select('id, name, slug, short_name, club_colors, website, venue, home_venue, city')
      .eq('competition_id', options.compId);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log(`   Found ${dbTeams.length} teams in database\n`);

    // Step 2: Fetch teams from Football-Data.org
    console.log(`🌐 Fetching teams from Football-Data.org (${options.fdCode})...`);
    const fdResponse = await fetch(`https://api.football-data.org/v4/competitions/${options.fdCode}/teams`, {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN
      }
    });

    if (!fdResponse.ok) {
      throw new Error(`Football-Data.org API error: ${fdResponse.status} ${fdResponse.statusText}`);
    }

    const fdData = await fdResponse.json();
    const fdTeams = fdData.teams;
    console.log(`   Found ${fdTeams.length} teams from Football-Data.org\n`);

    // Step 3: Match teams and prepare updates
    console.log(`🔄 Matching teams and preparing updates...`);
    const updates = [];
    const unmatched = [];

    for (const dbTeam of dbTeams) {
      let matchedFdTeam = null;

      // Try manual mapping first
      if (MANUAL_MAPPING[dbTeam.slug]) {
        matchedFdTeam = fdTeams.find(fd => fd.name === MANUAL_MAPPING[dbTeam.slug]);
      }

      // Try name matching
      if (!matchedFdTeam) {
        const normDbName = normName(dbTeam.name);
        matchedFdTeam = fdTeams.find(fd => normName(fd.name) === normDbName);
      }

      // Try short name matching if we have it
      if (!matchedFdTeam && dbTeam.short_name) {
        const normDbShortName = normName(dbTeam.short_name);
        matchedFdTeam = fdTeams.find(fd => normName(fd.shortName) === normDbShortName);
      }

      if (matchedFdTeam) {
        // Build update object for NULL fields only
        const update = { id: dbTeam.id };
        const changes = [];

        if (!dbTeam.short_name && matchedFdTeam.shortName) {
          update.short_name = matchedFdTeam.shortName;
          changes.push(`short_name: null → "${matchedFdTeam.shortName}"`);
        }

        if (!dbTeam.club_colors && matchedFdTeam.clubColors) {
          update.club_colors = matchedFdTeam.clubColors;
          changes.push(`club_colors: null → "${matchedFdTeam.clubColors}"`);
        }

        if (!dbTeam.website && matchedFdTeam.website) {
          update.website = matchedFdTeam.website;
          changes.push(`website: null → "${matchedFdTeam.website}"`);
        }

        if (!dbTeam.venue && matchedFdTeam.venue) {
          update.venue = matchedFdTeam.venue;
          changes.push(`venue: null → "${matchedFdTeam.venue}"`);
        }

        if (!dbTeam.home_venue && matchedFdTeam.venue) {
          update.home_venue = matchedFdTeam.venue;
          changes.push(`home_venue: null → "${matchedFdTeam.venue}"`);
        }

        if (!dbTeam.city && matchedFdTeam.address) {
          const city = cityFromAddress(matchedFdTeam.address);
          if (city) {
            update.city = city;
            changes.push(`city: null → "${city}"`);
          }
        }

        if (changes.length > 0) {
          update.changes = changes;
          update.slug = dbTeam.slug;
          update.name = dbTeam.name;
          updates.push(update);
        }
      } else {
        unmatched.push({
          name: dbTeam.name,
          slug: dbTeam.slug
        });
      }
    }

    console.log(`   Teams to update: ${updates.length}`);
    console.log(`   Unmatched teams: ${unmatched.length}\n`);

    // Step 4: Handle dry run
    if (options.dryRun) {
      console.log('📋 DRY RUN - Preview of changes:\n');

      if (updates.length > 0) {
        console.log('Teams to be updated:');
        console.log('====================');
        updates.forEach((update, index) => {
          console.log(`${index + 1}. ${update.name} (${update.slug})`);
          update.changes.forEach(change => console.log(`   - ${change}`));
          console.log();
        });

        // Write CSV preview
        const csvPath = '/tmp/team_backfill_preview.csv';
        const csvHeader = 'id,slug,name,changes\n';
        const csvRows = updates.map(update =>
          `${update.id},"${update.slug}","${update.name}","${update.changes.join('; ')}"`
        ).join('\n');

        fs.writeFileSync(csvPath, csvHeader + csvRows);
        console.log(`📄 Preview saved to: ${csvPath}\n`);
      }

      if (unmatched.length > 0) {
        console.log('Unmatched teams (consider adding to manual mapping):');
        console.log('===================================================');
        unmatched.forEach(team => {
          console.log(`   ${team.name} (${team.slug})`);
        });
        console.log();
      }

      console.log('✅ Dry run complete - no database changes made');
      return;
    }

    // Step 5: Apply updates
    console.log('💾 Applying updates to database...\n');
    let updated = 0;
    let skipped = 0;

    for (const update of updates) {
      try {
        const updateData = { ...update };
        delete updateData.changes;
        delete updateData.slug;
        delete updateData.name;
        delete updateData.id;

        const { error } = await supabase
          .from('teams')
          .update(updateData)
          .eq('id', update.id);

        if (error) {
          console.error(`   ❌ Failed to update ${update.name}: ${error.message}`);
          skipped++;
        } else {
          console.log(`   ✅ Updated ${update.name}`);
          updated++;
        }

        // Rate limiting
        await sleep(Math.floor(Math.random() * 100) + 150); // 150-250ms
      } catch (err) {
        console.error(`   ❌ Error updating ${update.name}: ${err.message}`);
        skipped++;
      }
    }

    // Step 6: Summary
    console.log('\n📊 Summary:');
    console.log('===========');
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Unmatched: ${unmatched.length}`);

    if (unmatched.length > 0) {
      console.log('\n❓ Unmatched teams (consider adding to manual mapping):');
      unmatched.forEach(team => {
        console.log(`   ${team.name} (${team.slug})`);
      });
    }

    console.log('\n✅ Backfill complete!');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Show usage examples
function showUsage() {
  console.log('\n📚 Usage Examples:');
  console.log('==================');
  console.log('npm run teams:backfill:dry                    # Dry run for Premier League');
  console.log('npm run teams:backfill                        # Live update for Premier League');
  console.log('node scripts/backfill_teams_from_fd.mjs --fd=CL --comp-id=2 --dry-run  # Champions League dry run');
  console.log('node scripts/backfill_teams_from_fd.mjs --fd=BL1 --comp-id=3           # Bundesliga live update');
  console.log('\n📋 Supported Football-Data Competition Codes:');
  console.log('   PL  - Premier League');
  console.log('   CL  - Champions League');
  console.log('   BL1 - Bundesliga');
  console.log('   PD  - La Liga');
  console.log('   SA  - Serie A');
  console.log('   FL1 - Ligue 1');
  console.log('\n🔧 What this script does:');
  console.log('   • Fetches team data from Football-Data.org API');
  console.log('   • Matches teams using intelligent name normalization');
  console.log('   • Only fills NULL fields (never overwrites existing data)');
  console.log('   • Updates: short_name, club_colors, website, venue, home_venue, city');
  console.log('   • Respects rate limits with 150-250ms delays between updates');
}

// Run the script
main().then(() => {
  showUsage();
}).catch(error => {
  console.error(`💥 Fatal error: ${error.message}`);
  process.exit(1);
});