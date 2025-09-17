#!/usr/bin/env node

/**
 * Score Import Script
 * Imports match results from Football-Data.org API into Supabase
 * Updates existing fixtures with score data and triggers league table calculation
 */

const https = require('https');
const fs = require('fs');
require('dotenv').config();

// Configuration
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_TOKEN;
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Competition mappings (Football-Data.org ID -> Our internal ID)
const COMPETITION_MAPPINGS = {
  2021: 1,  // Premier League
  2001: 2,  // Champions League
  2002: 3,  // Bundesliga
  2014: 4,  // La Liga
  2019: 5,  // Serie A
  2015: 6,  // Ligue 1
  2003: 7,  // Primeira Liga
  2003: 8,  // Eredivisie (placeholder - check actual ID)
  2016: 9   // Championship
};

// Season mapping
const CURRENT_SEASON = '2025';

// API configuration
const FOOTBALL_DATA_BASE = 'https://api.football-data.org/v4';
const SUPABASE_BASE = `${SUPABASE_URL}/rest/v1`;

// Headers
const footballDataHeaders = {
  'X-Auth-Token': FOOTBALL_DATA_API_KEY
};

const supabaseHeaders = {
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json'
};

/**
 * Make HTTP request
 */
function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || data}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });
    req.on('error', reject);
  });
}

/**
 * PATCH request to Supabase
 */
function supabasePatch(endpoint, data, filterColumn, filterValue) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      method: 'PATCH',
      headers: {
        ...supabaseHeaders,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    // Add filter to URL
    const cleanEndpoint = String(endpoint || '').replace(/^\/+/, '');
    const url = new URL(cleanEndpoint, SUPABASE_BASE);
    url.searchParams.set(filterColumn, `eq.${filterValue}`);

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`Supabase error ${res.statusCode}: ${responseData}`));
        } else {
          resolve(responseData ? JSON.parse(responseData) : {});
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Import scores for a specific competition
 */
async function importScoresForCompetition(footballDataCompId, internalCompId, competitionName) {
  console.log(`⚽ Importing scores for ${competitionName}...`);

  try {
    // Get all finished matches for this competition
    const url = `${FOOTBALL_DATA_BASE}/competitions/${footballDataCompId}/matches?status=FINISHED`;
    console.log(`Fetching finished matches from: ${url}`);

    const response = await makeRequest(url, footballDataHeaders);
    const matches = response.matches || [];

    console.log(`Found ${matches.length} finished matches`);

    let updatedCount = 0;
    let errorCount = 0;

    // Process matches in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < matches.length; i += batchSize) {
      const batch = matches.slice(i, i + batchSize);

      console.log(`Processing matches ${i + 1}-${Math.min(i + batchSize, matches.length)}...`);

      for (const match of batch) {
        try {
          // Extract score data
          const scoreData = {
            status: match.status,
            full_time_home_score: match.score?.fullTime?.home || null,
            full_time_away_score: match.score?.fullTime?.away || null,
            half_time_home_score: match.score?.halfTime?.home || null,
            half_time_away_score: match.score?.halfTime?.away || null,
            extra_time_home_score: match.score?.extraTime?.home || null,
            extra_time_away_score: match.score?.extraTime?.away || null,
            penalty_home_score: match.score?.penalties?.home || null,
            penalty_away_score: match.score?.penalties?.away || null,
            winner: match.score?.winner || null,
            duration: match.score?.duration || 'REGULAR',
            last_updated: new Date().toISOString()
          };

          // Also update legacy score columns for backward compatibility
          scoreData.home_score = scoreData.full_time_home_score;
          scoreData.away_score = scoreData.full_time_away_score;

          // Update fixture by external_id (Football-Data.org match ID)
          await supabasePatch('fixtures', scoreData, 'external_id', match.id);
          updatedCount++;

          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 50));

        } catch (error) {
          console.error(`Error updating match ${match.id}:`, error.message);
          errorCount++;
        }
      }

      // Longer delay between batches
      if (i + batchSize < matches.length) {
        console.log('Waiting 2 seconds between batches...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`✅ ${competitionName} completed:`);
    console.log(`   Updated: ${updatedCount} matches`);
    console.log(`   Errors: ${errorCount} matches`);

    return { updated: updatedCount, errors: errorCount };

  } catch (error) {
    console.error(`❌ Error importing ${competitionName} scores:`, error.message);
    throw error;
  }
}

/**
 * Trigger league table recalculation
 */
async function triggerLeagueTableUpdate(competitionId, competitionName) {
  console.log(`🏆 Triggering league table update for ${competitionName}...`);

  try {
    // Call the PostgreSQL function via Supabase RPC
    const response = await new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        comp_id: competitionId,
        season_str: CURRENT_SEASON
      });

      const options = {
        method: 'POST',
        headers: {
          ...supabaseHeaders,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const url = new URL('rpc/calculate_league_standings', SUPABASE_BASE);
      const req = https.request(url, options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          if (res.statusCode >= 400) {
            reject(new Error(`Supabase RPC error ${res.statusCode}: ${responseData}`));
          } else {
            resolve(responseData);
          }
        });
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    console.log(`✅ League table updated for ${competitionName}`);

  } catch (error) {
    console.error(`❌ Error updating league table for ${competitionName}:`, error.message);
    // Don't throw - league tables can be calculated manually if needed
  }
}

/**
 * Main import function
 */
async function main() {
  console.log('🚀 Starting score import from Football-Data.org...\n');

  // Validate configuration
  if (!FOOTBALL_DATA_API_KEY) {
    console.log('❌ Missing FOOTBALL_DATA_TOKEN in .env file');
    console.log('   Get your key at: https://www.football-data.org/client/register');
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase configuration in .env file');
    process.exit(1);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  const competitionFilter = args.find(arg => arg.startsWith('--competition='))?.split('=')[1];

  let totalUpdated = 0;
  let totalErrors = 0;

  try {
    // Import scores for each competition
    for (const [footballDataId, internalId] of Object.entries(COMPETITION_MAPPINGS)) {
      const competitionName = getCompetitionName(footballDataId);

      // Skip if filtering for specific competition
      if (competitionFilter && competitionFilter !== competitionName.toLowerCase().replace(/\s+/g, '-')) {
        continue;
      }

      try {
        console.log(`\n📊 Processing ${competitionName} (${footballDataId} -> ${internalId})`);

        const result = await importScoresForCompetition(
          parseInt(footballDataId),
          internalId,
          competitionName
        );

        totalUpdated += result.updated;
        totalErrors += result.errors;

        // Trigger league table calculation for league competitions
        if (isLeagueCompetition(footballDataId)) {
          await triggerLeagueTableUpdate(internalId, competitionName);
        }

        // Rate limiting between competitions
        console.log('⏳ Waiting 10 seconds before next competition...');
        await new Promise(resolve => setTimeout(resolve, 10000));

      } catch (error) {
        console.error(`Failed to import ${competitionName}:`, error.message);
        totalErrors++;
      }
    }

    console.log(`\n🎉 Score import completed!`);
    console.log(`📊 Summary:`);
    console.log(`   Total updated: ${totalUpdated} matches`);
    console.log(`   Total errors: ${totalErrors} matches`);
    console.log(`\n🔍 Check your data:`);
    console.log(`   Database: SELECT * FROM fixtures WHERE full_time_home_score IS NOT NULL LIMIT 10;`);
    console.log(`   League tables: SELECT * FROM current_league_tables WHERE competition_id = 1;`);

  } catch (error) {
    console.error('\n💥 Import failed:', error.message);
    process.exit(1);
  }
}

/**
 * Helper functions
 */
function getCompetitionName(footballDataId) {
  const names = {
    '2021': 'Premier League',
    '2001': 'Champions League',
    '2002': 'Bundesliga',
    '2014': 'La Liga',
    '2019': 'Serie A',
    '2015': 'Ligue 1',
    '2003': 'Primeira Liga',
    '2016': 'Championship'
  };
  return names[footballDataId] || `Competition ${footballDataId}`;
}

function isLeagueCompetition(footballDataId) {
  // Leagues (not cups) that need league table calculation
  const leagues = ['2021', '2002', '2014', '2019', '2015', '2003', '2016'];
  return leagues.includes(footballDataId);
}

// Run the import
if (require.main === module) {
  main();
}

module.exports = { importScoresForCompetition, triggerLeagueTableUpdate };