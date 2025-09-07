#!/usr/bin/env node

/**
 * Multi-Competition Team Import Script
 * 
 * Imports teams from TheSportsDB API for multiple football leagues
 * Handles duplicates, creates slugs, and manages competition assignments
 * 
 * @version 1.0.0
 * @created 2025-09-07
 */

const https = require('https');
const fs = require('fs').promises;

// ============================================
// CONFIGURATION
// ============================================

const COMPETITION_CONFIG = {
  'premier-league': {
    id: 1,
    name: 'Premier League',
    theSportsDbId: 4328,
    country: 'England',
    countryCode: 'ENG'
  },
  'bundesliga': {
    id: 2,
    name: 'Bundesliga',
    theSportsDbId: 4331,
    country: 'Germany',
    countryCode: 'GER'
  },
  'la-liga': {
    id: 3,
    name: 'La Liga',
    theSportsDbId: 4335,
    country: 'Spain',
    countryCode: 'ESP'
  },
  'serie-a': {
    id: 4,
    name: 'Serie A',
    theSportsDbId: 4332,
    country: 'Italy',
    countryCode: 'ITA'
  },
  'ligue-1': {
    id: 5,
    name: 'Ligue 1',
    theSportsDbId: 4334,
    country: 'France',
    countryCode: 'FRA'
  }
};

const THESPORTSDB_CONFIG = {
  baseUrl: 'https://www.thesportsdb.com/api/v1/json/123',
  rateLimit: 30, // requests per minute for free tier
  requestDelay: 2000 // 2 seconds between requests
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create URL-friendly slug from team name
 * @param {string} name - Team name
 * @returns {string} URL-friendly slug
 */
function slugify(name) {
  return String(name)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/**
 * Delay execution for rate limiting
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make HTTP GET request
 * @param {string} url - URL to fetch
 * @returns {Promise<Object>} Parsed JSON response
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    console.log(`🌐 Fetching: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`HTTP request failed: ${error.message}`));
    });
  });
}

/**
 * Log with timestamp
 * @param {string} message - Log message
 */
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// ============================================
// TEAM DATA PROCESSING
// ============================================

/**
 * Normalize team name for duplicate detection
 * @param {string} name - Team name
 * @returns {string} Normalized name
 */
function normalizeTeamName(name) {
  return String(name)
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/fc|cf|ac|sc|fc\b/g, '') // Remove common prefixes/suffixes
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Map TheSportsDB team data to our schema
 * @param {Object} apiTeam - Team data from TheSportsDB API
 * @param {Object} competition - Competition configuration
 * @returns {Object} Mapped team data
 */
function mapTeamData(apiTeam, competition) {
  const name = apiTeam.strTeam;
  const alternativeNames = [
    apiTeam.strTeamShort,
    apiTeam.strTeamAlternate,
    apiTeam.strKeywords
  ].filter(Boolean);

  return {
    // Basic info
    name: name,
    slug: slugify(name),
    normalizedName: normalizeTeamName(name),
    
    // Competition info
    competition_id: competition.id,
    country_code: competition.countryCode,
    
    // External references
    thesportsdb_id: parseInt(apiTeam.idTeam),
    external_ref: `thesportsdb_${apiTeam.idTeam}`,
    
    // Visual assets
    crest_url: apiTeam.strTeamBadge || apiTeam.strLogo || null,
    
    // Metadata
    founded_year: apiTeam.intFormedYear ? parseInt(apiTeam.intFormedYear) : null,
    venue: apiTeam.strStadium || null,
    website: apiTeam.strWebsite || null,
    
    // Alternative names for aliases table
    alternativeNames: alternativeNames,
    
    // API source data (for debugging)
    sourceData: {
      apiId: apiTeam.idTeam,
      league: apiTeam.strLeague,
      country: apiTeam.strCountry,
      sport: apiTeam.strSport
    }
  };
}

/**
 * Detect duplicate teams across competitions
 * @param {Array} allTeams - All processed team data
 * @returns {Object} Duplicate detection results
 */
function detectDuplicates(allTeams) {
  const duplicates = new Map();
  const nameToTeams = new Map();
  
  // Group teams by normalized name
  allTeams.forEach(team => {
    const normalizedName = team.normalizedName;
    if (!nameToTeams.has(normalizedName)) {
      nameToTeams.set(normalizedName, []);
    }
    nameToTeams.get(normalizedName).push(team);
  });
  
  // Find duplicates
  nameToTeams.forEach((teams, normalizedName) => {
    if (teams.length > 1) {
      duplicates.set(normalizedName, teams);
    }
  });
  
  log(`🔍 Found ${duplicates.size} potential duplicate team groups`);
  
  // Log duplicates for review
  duplicates.forEach((teams, normalizedName) => {
    log(`   Duplicate group: "${normalizedName}"`);
    teams.forEach(team => {
      log(`     - ${team.name} (${team.competition_id}: ${COMPETITION_CONFIG[Object.keys(COMPETITION_CONFIG)[team.competition_id - 1]].name})`);
    });
  });
  
  return {
    duplicates: Array.from(duplicates.values()),
    uniqueTeams: allTeams.filter(team => 
      !duplicates.has(team.normalizedName) || 
      duplicates.get(team.normalizedName)[0] === team // Keep first occurrence
    )
  };
}

// ============================================
// API FETCHING
// ============================================

/**
 * Fetch teams for a specific competition
 * @param {Object} competition - Competition configuration
 * @returns {Promise<Array>} Array of team data
 */
async function fetchTeamsForCompetition(competition) {
  const url = `${THESPORTSDB_CONFIG.baseUrl}/lookup_all_teams.php?id=${competition.theSportsDbId}`;
  
  try {
    const response = await httpGet(url);
    
    if (!response.teams || !Array.isArray(response.teams)) {
      log(`⚠️  No teams found for ${competition.name}`);
      return [];
    }
    
    const teams = response.teams.map(apiTeam => mapTeamData(apiTeam, competition));
    log(`✅ Fetched ${teams.length} teams for ${competition.name}`);
    
    return teams;
  } catch (error) {
    log(`❌ Error fetching teams for ${competition.name}: ${error.message}`);
    return [];
  }
}

/**
 * Fetch teams from all competitions
 * @returns {Promise<Array>} All team data
 */
async function fetchAllTeams() {
  const allTeams = [];
  
  log('🚀 Starting team import from TheSportsDB...');
  
  for (const [slug, competition] of Object.entries(COMPETITION_CONFIG)) {
    log(`\n📥 Importing teams for ${competition.name}...`);
    
    const teams = await fetchTeamsForCompetition(competition);
    allTeams.push(...teams);
    
    // Rate limiting delay
    if (Object.keys(COMPETITION_CONFIG).indexOf(slug) < Object.keys(COMPETITION_CONFIG).length - 1) {
      log(`⏳ Waiting ${THESPORTSDB_CONFIG.requestDelay}ms for rate limiting...`);
      await delay(THESPORTSDB_CONFIG.requestDelay);
    }
  }
  
  log(`\n📊 Total teams fetched: ${allTeams.length}`);
  return allTeams;
}

// ============================================
// SQL GENERATION
// ============================================

/**
 * Generate SQL INSERT statement for teams
 * @param {Array} teams - Team data to insert
 * @returns {string} SQL INSERT statement
 */
function generateTeamsSQL(teams) {
  if (teams.length === 0) {
    return '-- No teams to insert\n';
  }
  
  const values = teams.map(team => {
    const name = team.name.replace(/'/g, "''"); // Escape single quotes
    const slug = team.slug.replace(/'/g, "''");
    const crestUrl = team.crest_url ? `'${team.crest_url.replace(/'/g, "''")}'` : 'NULL';
    const venue = team.venue ? `'${team.venue.replace(/'/g, "''")}'` : 'NULL';
    const website = team.website ? `'${team.website.replace(/'/g, "''")}'` : 'NULL';
    const foundedYear = team.founded_year || 'NULL';
    
    return `('${name}', '${slug}', ${crestUrl}, ${team.competition_id}, '${team.country_code}', ${team.thesportsdb_id}, '${team.external_ref}', ${venue}, ${website}, ${foundedYear})`;
  }).join(',\n  ');
  
  return `-- Insert teams (${teams.length} records)
INSERT INTO teams (
  name, slug, crest_url, competition_id, country_code, 
  thesportsdb_id, external_ref, venue, website, founded_year
) VALUES
  ${values}
ON CONFLICT (slug) DO UPDATE SET
  crest_url = EXCLUDED.crest_url,
  competition_id = EXCLUDED.competition_id,
  country_code = EXCLUDED.country_code,
  thesportsdb_id = EXCLUDED.thesportsdb_id,
  external_ref = EXCLUDED.external_ref,
  venue = EXCLUDED.venue,
  website = EXCLUDED.website,
  founded_year = EXCLUDED.founded_year,
  updated_at = NOW();
`;
}

/**
 * Generate SQL INSERT statements for team aliases
 * @param {Array} teams - Team data with alternative names
 * @returns {string} SQL INSERT statement for aliases
 */
function generateTeamAliasesSQL(teams) {
  const aliases = [];
  
  teams.forEach(team => {
    if (team.alternativeNames && team.alternativeNames.length > 0) {
      team.alternativeNames.forEach(alias => {
        if (alias && alias.trim() && alias !== team.name) {
          aliases.push({
            teamSlug: team.slug,
            alias: alias.trim()
          });
        }
      });
    }
  });
  
  if (aliases.length === 0) {
    return '-- No team aliases to insert\n';
  }
  
  const values = aliases.map(({ teamSlug, alias }) => {
    const escapedAlias = alias.replace(/'/g, "''");
    return `('${teamSlug}', '${escapedAlias}')`;
  }).join(',\n  ');
  
  return `-- Insert team aliases (${aliases.length} records)
INSERT INTO team_aliases (team_slug, alias_name)
SELECT t.slug, aliases.alias_name
FROM (VALUES
  ${values}
) AS aliases(team_slug, alias_name)
JOIN teams t ON t.slug = aliases.team_slug
ON CONFLICT (team_slug, alias_name) DO NOTHING;
`;
}

// ============================================
// FILE OPERATIONS
// ============================================

/**
 * Save team data to JSON file
 * @param {Array} teams - Team data
 * @param {string} filename - Output filename
 */
async function saveTeamData(teams, filename) {
  try {
    const data = {
      generatedAt: new Date().toISOString(),
      totalTeams: teams.length,
      competitions: Object.keys(COMPETITION_CONFIG),
      teams: teams
    };
    
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    log(`💾 Team data saved to ${filename}`);
  } catch (error) {
    log(`❌ Error saving team data: ${error.message}`);
  }
}

/**
 * Save SQL scripts to file
 * @param {string} sql - SQL content
 * @param {string} filename - Output filename
 */
async function saveSQLScript(sql, filename) {
  try {
    const header = `-- Multi-Competition Team Import SQL
-- Generated: ${new Date().toISOString()}
-- Source: TheSportsDB API
-- Competitions: ${Object.keys(COMPETITION_CONFIG).join(', ')}

`;
    
    await fs.writeFile(filename, header + sql);
    log(`📝 SQL script saved to ${filename}`);
  } catch (error) {
    log(`❌ Error saving SQL script: ${error.message}`);
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

/**
 * Main import function
 */
async function main() {
  try {
    log('🏟️  Multi-Competition Team Import Starting...');
    
    // Fetch all team data
    const allTeams = await fetchAllTeams();
    
    if (allTeams.length === 0) {
      log('❌ No teams fetched. Exiting.');
      process.exit(1);
    }
    
    // Detect and handle duplicates
    log('\n🔍 Processing duplicates...');
    const { duplicates, uniqueTeams } = detectDuplicates(allTeams);
    
    // Generate SQL
    log('\n📝 Generating SQL scripts...');
    const teamsSQL = generateTeamsSQL(uniqueTeams);
    const aliasesSQL = generateTeamAliasesSQL(uniqueTeams);
    const fullSQL = teamsSQL + '\n\n' + aliasesSQL;
    
    // Save files
    log('\n💾 Saving output files...');
    await saveTeamData(allTeams, 'teams-import-data.json');
    await saveSQLScript(fullSQL, 'teams-import.sql');
    
    // Summary
    log('\n📊 Import Summary:');
    log(`   Total teams fetched: ${allTeams.length}`);
    log(`   Duplicate groups found: ${duplicates.length}`);
    log(`   Unique teams to import: ${uniqueTeams.length}`);
    log(`   Files generated: teams-import-data.json, teams-import.sql`);
    
    // Competition breakdown
    log('\n📈 Teams per competition:');
    Object.values(COMPETITION_CONFIG).forEach(comp => {
      const count = uniqueTeams.filter(t => t.competition_id === comp.id).length;
      log(`   ${comp.name}: ${count} teams`);
    });
    
    log('\n✅ Team import completed successfully!');
    log('\n🚀 Next steps:');
    log('   1. Review teams-import-data.json for data accuracy');
    log('   2. Execute teams-import.sql in your Supabase database');
    log('   3. Verify team import with: SELECT COUNT(*) FROM teams GROUP BY competition_id;');
    
  } catch (error) {
    log(`❌ Import failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// ============================================
// SCRIPT EXECUTION
// ============================================

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  fetchAllTeams,
  detectDuplicates,
  generateTeamsSQL,
  generateTeamAliasesSQL,
  COMPETITION_CONFIG
};