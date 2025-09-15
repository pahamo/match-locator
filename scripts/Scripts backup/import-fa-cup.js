#!/usr/bin/env node

/**
 * FA Cup Data Import Script
 * Imports teams and fixtures from Football-Data.org API into Supabase
 */

const https = require('https');
const fs = require('fs');
require('dotenv').config({ path: './config/.env' });

// Configuration
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY || 'YOUR_API_KEY_HERE';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Basic CLI arg parser (supports --key=value and flags)
function parseArgs(argv = []) {
  const args = {};
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, v] = a.replace(/^--/, '').split('=');
      const key = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (typeof v === 'undefined') args[key] = true; else args[key] = v;
    }
  }
  return args;
}
const ARGS = parseArgs(process.argv.slice(2));

// Competition configuration (overridable via CLI)
let FA_CUP_ID = Number(ARGS.compId) || 2055; // Football-Data.org competition ID
let FA_CUP_INTERNAL_ID = Number(ARGS.internalId) || 6; // Our internal competition ID
let COMP_NAME = ARGS.name || 'FA Cup';
let COMP_SLUG = ARGS.slug || 'fa-cup';
let COMP_SHORT_NAME = ARGS.shortName || 'FAC';
let COMP_COUNTRY = ARGS.country || 'England';
let COMP_COUNTRY_CODE = ARGS.countryCode || 'ENG';
let COMP_SEASON = ARGS.season || '2024-25';
let COMP_CODE = ARGS.code || 'FAC';
let COMP_TYPE = (ARGS.type || 'CUP').toUpperCase(); // 'CUP' or 'LEAGUE'

// API endpoints
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
 * POST request to Supabase
 */
function supabasePost(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      method: 'POST',
      headers: {
        ...supabaseHeaders,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const cleanEndpoint = String(endpoint || '').replace(/^\/+/, '');
    const url = new URL(cleanEndpoint, SUPABASE_BASE);
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
 * Upsert request to Supabase
 */
function supabaseUpsert(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      method: 'POST',
      headers: {
        ...supabaseHeaders,
        'Content-Length': Buffer.byteLength(postData),
        'Prefer': 'resolution=merge-duplicates'
      }
    };

    const cleanEndpoint = String(endpoint || '').replace(/^\/+/, '');
    const url = new URL(cleanEndpoint, SUPABASE_BASE);
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
 * Import competition teams
 */
async function importFACupTeams() {
  console.log('🏴󠁧󠁢󠁥󠁮󠁧󠁿 Importing FA Cup teams...');
  
  try {
    const url = `${FOOTBALL_DATA_BASE}/competitions/${FA_CUP_ID}/teams`;
    console.log(`Fetching teams from: ${url}`);
    
    const response = await makeRequest(url, footballDataHeaders);
    const teams = response.teams || [];
    
    console.log(`Found ${teams.length} teams in ${COMP_NAME}`);
    
    // Transform teams for our database
    const transformedTeams = teams.map(team => ({
      id: team.id, // Use Football-Data.org ID
      name: team.name,
      short_name: team.shortName || team.tla,
      tla: team.tla,
      slug: team.name.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, ''),
      crest_url: team.crest,
      competition_id: FA_CUP_INTERNAL_ID,
      venue: team.venue,
      founded: team.founded,
      club_colors: team.clubColors,
      website: team.website,
      external_id: team.id,
      last_updated: new Date().toISOString()
    }));
    
    // Import in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < transformedTeams.length; i += batchSize) {
      const batch = transformedTeams.slice(i, i + batchSize);
      console.log(`Importing teams ${i + 1}-${Math.min(i + batchSize, transformedTeams.length)}...`);
      
      await supabaseUpsert('teams', batch);
    }
    
    console.log(`✅ Successfully imported ${transformedTeams.length} ${COMP_NAME} teams`);
    return transformedTeams.length;
    
  } catch (error) {
    console.error('❌ Error importing FA Cup teams:', error.message);
    throw error;
  }
}

/**
 * Import competition fixtures
 */
async function importFACupFixtures() {
  console.log(`⚽ Importing ${COMP_NAME} fixtures...`);
  
  try {
    const url = `${FOOTBALL_DATA_BASE}/competitions/${FA_CUP_ID}/matches`;
    console.log(`Fetching fixtures from: ${url}`);
    
    const response = await makeRequest(url, footballDataHeaders);
    const matches = response.matches || [];
    
    console.log(`Found ${matches.length} fixtures in ${COMP_NAME}`);
    
    // Transform fixtures for our database
    const transformedFixtures = matches.map(match => {
      const base = {
        id: match.id,
        competition_id: FA_CUP_INTERNAL_ID,
        home_team_id: match.homeTeam?.id,
        away_team_id: match.awayTeam?.id,
        home_team: match.homeTeam?.name,
        away_team: match.awayTeam?.name,
        utc_kickoff: match.utcDate,
        status: match.status,
        season: match.season?.id,
        venue: match.venue,
        external_id: match.id,
        last_updated: new Date().toISOString()
      };
      if (COMP_TYPE === 'LEAGUE') {
        return {
          ...base,
          matchday: match.matchday ?? match.match?.matchday ?? null,
          stage: match.stage || null,
          round: match.round || null,
        };
      }
      // Default CUP mapping
      return {
        ...base,
        matchday: null,
        stage: match.stage || null,
        round: match.stage || match.round || null,
      };
    });
    
    // Filter out matches without proper team data
    const validFixtures = transformedFixtures.filter(f => 
      f.home_team_id && f.away_team_id && f.utc_kickoff
    );
    
    console.log(`${validFixtures.length} valid fixtures after filtering`);
    
    // Import in batches
    const batchSize = 100;
    for (let i = 0; i < validFixtures.length; i += batchSize) {
      const batch = validFixtures.slice(i, i + batchSize);
      console.log(`Importing fixtures ${i + 1}-${Math.min(i + batchSize, validFixtures.length)}...`);
      
      await supabaseUpsert('fixtures', batch);
    }
    
    console.log(`✅ Successfully imported ${validFixtures.length} ${COMP_NAME} fixtures`);
    return validFixtures.length;
    
  } catch (error) {
    console.error('❌ Error importing FA Cup fixtures:', error.message);
    throw error;
  }
}

/**
 * Add FA Cup competition to database
 */
async function ensureFACupCompetition() {
  console.log(`🏆 Ensuring ${COMP_NAME} competition exists...`);
  
  const facupCompetition = {
    id: FA_CUP_INTERNAL_ID,
    name: COMP_NAME,
    slug: COMP_SLUG,
    short_name: (ARGS.shortName || 'FAC'),
    country: (ARGS.country || 'England'),
    country_code: (ARGS.countryCode || 'ENG'),
    season: (ARGS.season || '2024-25'),
    total_teams: null, // Variable for FA Cup
    total_rounds: null, // Variable for FA Cup
    type: COMP_TYPE,
    is_active: true,
    external_id: FA_CUP_ID,
    external_code: (ARGS.code || 'FAC'),
    colors_primary: '#003366',
    colors_secondary: '#ffffff',
    last_updated: new Date().toISOString()
  };
  
  try {
    console.log('Attempting to upsert competition to:', `${SUPABASE_BASE}/competitions`);
    await supabaseUpsert('competitions', [facupCompetition]);
    console.log(`✅ ${COMP_NAME} competition ready`);
  } catch (error) {
    console.error('❌ Error ensuring FA Cup competition:', error.message);
    console.log('Trying alternative endpoint...');
    // Try alternative endpoint
    try {
      await supabasePost('competitions', facupCompetition);
      console.log(`✅ ${COMP_NAME} competition ready (via POST)`);
    } catch (error2) {
      console.error('❌ Alternative endpoint also failed:', error2.message);
      // If competitions table/route doesn't exist, proceed with teams/fixtures
      if ((/404/.test(String(error)) || /404/.test(String(error2)))) {
        console.warn('⚠️  competitions table not found; continuing without ensuring competition.');
        return;
      }
      throw error;
    }
  }
}

/**
 * Main import function
 */
async function main() {
  console.log(`🚀 Starting ${COMP_NAME} data import...\n`);
  
  // Check API key
  if (FOOTBALL_DATA_API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('❌ Please set your Football-Data.org API key in .env file');
    console.log('   Get your key at: https://www.football-data.org/client/register');
    console.log('   Add: FOOTBALL_DATA_API_KEY=your_key_here');
    process.exit(1);
  }
  // Validate Supabase env
  if (!SUPABASE_URL || !/^https?:\/\//.test(SUPABASE_URL)) {
    console.error('❌ Missing or invalid SUPABASE_URL in config/.env');
    process.exit(1);
  }
  if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY.length < 60) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in config/.env');
    process.exit(1);
  }
  
  const teamsOnly = !!ARGS.teamsOnly;
  const fixturesOnly = !!ARGS.fixturesOnly;
  const skipCompetition = !!ARGS.skipCompetition;

  try {
    // Step 1: Ensure competition exists (unless skipped)
    if (!skipCompetition) {
      await ensureFACupCompetition();
    } else {
      console.log('⏭️  Skipping competition ensure step');
    }

    let teamsCount = 0;
    if (!fixturesOnly) {
      try {
        teamsCount = await importFACupTeams();
      } catch (e) {
        if (/403/.test(String(e))) {
          console.error('❌ Football-Data.org returned 403 (restricted).');
          console.error('   Your plan may not include this competition (ID:', FA_CUP_ID, ').');
          console.error('   Options: upgrade plan, or re-run with --comp-id for a supported league.');
          throw e;
        }
        throw e;
      }
    }

    // Respect rate limits if we made a fetch
    if (!fixturesOnly) {
      console.log('⏳ Waiting 10 seconds for rate limiting...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    let fixturesCount = 0;
    if (!teamsOnly) {
      fixturesCount = await importFACupFixtures();
    }

    console.log(`\n🎉 ${COMP_NAME} import completed successfully!`);
    console.log(`📊 Summary:`);
    if (!fixturesOnly) console.log(`   Teams imported: ${teamsCount}`);
    if (!teamsOnly) console.log(`   Fixtures imported: ${fixturesCount}`);
    console.log(`\n🔍 Test your import:`);
    console.log(`   Visit: #/${COMP_SLUG}/debug to see the imported data`);
    
  } catch (error) {
    console.error('\n💥 Import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  main();
}

module.exports = { importFACupTeams, importFACupFixtures };
