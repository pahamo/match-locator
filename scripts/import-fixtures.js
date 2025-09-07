#!/usr/bin/env node

/**
 * Multi-Competition Fixture Import Script
 * 
 * Imports fixtures from TheSportsDB API for multiple football leagues
 * Handles different season formats and generates fixture schedules
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
    countryCode: 'ENG',
    season: '2024-2025',
    format: 'round-robin',
    totalRounds: 38,
    totalTeams: 20,
    timezone: 'Europe/London'
  },
  'bundesliga': {
    id: 2,
    name: 'Bundesliga',
    theSportsDbId: 4331,
    country: 'Germany',
    countryCode: 'GER',
    season: '2024-2025',
    format: 'round-robin',
    totalRounds: 34,
    totalTeams: 18,
    timezone: 'Europe/Berlin'
  },
  'la-liga': {
    id: 3,
    name: 'La Liga',
    theSportsDbId: 4335,
    country: 'Spain',
    countryCode: 'ESP',
    season: '2024-2025',
    format: 'round-robin',
    totalRounds: 38,
    totalTeams: 20,
    timezone: 'Europe/Madrid'
  },
  'serie-a': {
    id: 4,
    name: 'Serie A',
    theSportsDbId: 4332,
    country: 'Italy',
    countryCode: 'ITA',
    season: '2024-2025',
    format: 'round-robin',
    totalRounds: 38,
    totalTeams: 20,
    timezone: 'Europe/Rome'
  },
  'ligue-1': {
    id: 5,
    name: 'Ligue 1',
    theSportsDbId: 4334,
    country: 'France',
    countryCode: 'FRA',
    season: '2024-2025',
    format: 'round-robin',
    totalRounds: 34,
    totalTeams: 18,
    timezone: 'Europe/Paris'
  }
};

const THESPORTSDB_CONFIG = {
  baseUrl: 'https://www.thesportsdb.com/api/v1/json/123',
  rateLimit: 30, // requests per minute for free tier
  requestDelay: 2000, // 2 seconds between requests
  endpoints: {
    fixtures: '/eventsseason.php?id=',
    nextFixtures: '/eventsnextleague.php?id=',
    lastResults: '/eventspastleague.php?id='
  }
};

// Season date ranges for 2024-25
const SEASON_DATES = {
  'premier-league': {
    startDate: '2024-08-17',
    endDate: '2025-05-25'
  },
  'bundesliga': {
    startDate: '2024-08-24',
    endDate: '2025-05-24'
  },
  'la-liga': {
    startDate: '2024-08-18',
    endDate: '2025-05-25'
  },
  'serie-a': {
    startDate: '2024-08-18',
    endDate: '2025-05-25'
  },
  'ligue-1': {
    startDate: '2024-08-17',
    endDate: '2025-05-25'
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

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

/**
 * Convert local time to UTC
 * @param {string} dateStr - Date string
 * @param {string} timeStr - Time string  
 * @param {string} timezone - Timezone identifier
 * @returns {string} UTC ISO string
 */
function convertToUTC(dateStr, timeStr, timezone) {
  try {
    // Handle various date/time formats from API
    let dateTime;
    
    if (dateStr && timeStr) {
      // Separate date and time
      dateTime = `${dateStr} ${timeStr}`;
    } else if (dateStr) {
      // Date string might contain time
      dateTime = dateStr;
    } else {
      throw new Error('No date provided');
    }
    
    // Create date object and convert to UTC
    const localDate = new Date(dateTime + ' ' + timezone.replace('/', ' '));
    return localDate.toISOString();
  } catch (error) {
    log(`⚠️  Date conversion error: ${error.message} - Input: ${dateStr} ${timeStr}`);
    return null;
  }
}

/**
 * Calculate matchweek from fixture date and season start
 * @param {string} utcKickoff - UTC kickoff time
 * @param {string} seasonStart - Season start date
 * @param {number} totalRounds - Total rounds in season
 * @returns {number} Matchweek number
 */
function calculateMatchweek(utcKickoff, seasonStart, totalRounds) {
  const kickoffDate = new Date(utcKickoff);
  const startDate = new Date(seasonStart);
  
  const daysSinceStart = Math.floor((kickoffDate - startDate) / (1000 * 60 * 60 * 24));
  const weeksSinceStart = Math.floor(daysSinceStart / 7);
  
  // Estimate matchweek (rough calculation)
  const estimatedWeek = Math.min(Math.max(1, weeksSinceStart + 1), totalRounds);
  return estimatedWeek;
}

// ============================================
// FIXTURE DATA PROCESSING
// ============================================

/**
 * Map TheSportsDB fixture data to our schema
 * @param {Object} apiFixture - Fixture data from API
 * @param {Object} competition - Competition configuration
 * @returns {Object} Mapped fixture data
 */
function mapFixtureData(apiFixture, competition) {
  const homeTeam = apiFixture.strHomeTeam;
  const awayTeam = apiFixture.strAwayTeam;
  
  // Convert date/time to UTC
  const utcKickoff = convertToUTC(
    apiFixture.dateEvent,
    apiFixture.strTime,
    competition.timezone
  );
  
  if (!utcKickoff) {
    return null; // Skip fixtures with invalid dates
  }
  
  // Calculate matchweek
  const seasonDates = SEASON_DATES[Object.keys(COMPETITION_CONFIG).find(k => COMPETITION_CONFIG[k].id === competition.id)];
  const matchweek = calculateMatchweek(utcKickoff, seasonDates.startDate, competition.totalRounds);
  
  return {
    // Basic fixture info
    external_ref: `thesportsdb_${apiFixture.idEvent}`,
    utc_kickoff: utcKickoff,
    matchday: matchweek,
    venue: apiFixture.strVenue || null,
    status: mapFixtureStatus(apiFixture.strStatus),
    
    // Competition
    competition_id: competition.id,
    
    // Teams (will need to be resolved to IDs later)
    home_team_name: homeTeam,
    away_team_name: awayTeam,
    
    // Metadata
    season: competition.season,
    round_name: apiFixture.intRound ? `Round ${apiFixture.intRound}` : null,
    
    // Source data for debugging
    sourceData: {
      apiId: apiFixture.idEvent,
      originalDate: apiFixture.dateEvent,
      originalTime: apiFixture.strTime,
      status: apiFixture.strStatus
    }
  };
}

/**
 * Map fixture status from API to our format
 * @param {string} apiStatus - Status from API
 * @returns {string} Normalized status
 */
function mapFixtureStatus(apiStatus) {
  if (!apiStatus) return 'scheduled';
  
  const status = apiStatus.toLowerCase();
  
  if (status.includes('finished') || status.includes('ft')) return 'finished';
  if (status.includes('live') || status.includes('playing')) return 'live';
  if (status.includes('postponed')) return 'postponed';
  if (status.includes('cancelled')) return 'cancelled';
  
  return 'scheduled';
}

// ============================================
// API FETCHING
// ============================================

/**
 * Fetch fixtures for a specific competition
 * @param {Object} competition - Competition configuration
 * @returns {Promise<Array>} Array of fixture data
 */
async function fetchFixturesForCompetition(competition) {
  const url = `${THESPORTSDB_CONFIG.baseUrl}${THESPORTSDB_CONFIG.endpoints.fixtures}${competition.theSportsDbId}&s=${competition.season}`;
  
  try {
    const response = await httpGet(url);
    
    if (!response.events || !Array.isArray(response.events)) {
      log(`⚠️  No fixtures found for ${competition.name}`);
      return [];
    }
    
    const fixtures = response.events
      .map(apiFixture => mapFixtureData(apiFixture, competition))
      .filter(fixture => fixture !== null); // Remove invalid fixtures
    
    log(`✅ Fetched ${fixtures.length} fixtures for ${competition.name}`);
    
    return fixtures;
  } catch (error) {
    log(`❌ Error fetching fixtures for ${competition.name}: ${error.message}`);
    return [];
  }
}

/**
 * Fetch fixtures from all competitions
 * @returns {Promise<Array>} All fixture data
 */
async function fetchAllFixtures() {
  const allFixtures = [];
  
  log('🚀 Starting fixture import from TheSportsDB...');
  
  for (const [slug, competition] of Object.entries(COMPETITION_CONFIG)) {
    log(`\n📥 Importing fixtures for ${competition.name}...`);
    
    const fixtures = await fetchFixturesForCompetition(competition);
    allFixtures.push(...fixtures);
    
    // Rate limiting delay
    if (Object.keys(COMPETITION_CONFIG).indexOf(slug) < Object.keys(COMPETITION_CONFIG).length - 1) {
      log(`⏳ Waiting ${THESPORTSDB_CONFIG.requestDelay}ms for rate limiting...`);
      await delay(THESPORTSDB_CONFIG.requestDelay);
    }
  }
  
  log(`\n📊 Total fixtures fetched: ${allFixtures.length}`);
  return allFixtures;
}

// ============================================
// MANUAL FIXTURE GENERATION (FALLBACK)
// ============================================

/**
 * Generate sample fixtures for testing when API data is unavailable
 * @param {Object} competition - Competition configuration
 * @param {Array} teamNames - Array of team names
 * @returns {Array} Generated fixtures
 */
function generateSampleFixtures(competition, teamNames) {
  log(`🏗️  Generating sample fixtures for ${competition.name}...`);
  
  const fixtures = [];
  const seasonDates = SEASON_DATES[Object.keys(COMPETITION_CONFIG).find(k => COMPETITION_CONFIG[k].id === competition.id)];
  const startDate = new Date(seasonDates.startDate);
  
  // Generate some sample fixtures for testing
  const sampleFixtures = Math.min(10, Math.floor(teamNames.length / 2)); // Max 10 sample fixtures
  
  for (let i = 0; i < sampleFixtures; i++) {
    const homeTeamIndex = i % teamNames.length;
    const awayTeamIndex = (i + 1) % teamNames.length;
    
    // Space fixtures weekly
    const fixtureDate = new Date(startDate);
    fixtureDate.setDate(startDate.getDate() + (i * 7));
    fixtureDate.setHours(15, 0, 0, 0); // 3pm kickoff
    
    const fixture = {
      external_ref: `sample_${competition.id}_${i + 1}`,
      utc_kickoff: fixtureDate.toISOString(),
      matchday: i + 1,
      venue: `Sample Stadium ${i + 1}`,
      status: 'scheduled',
      competition_id: competition.id,
      home_team_name: teamNames[homeTeamIndex],
      away_team_name: teamNames[awayTeamIndex],
      season: competition.season,
      round_name: `Matchday ${i + 1}`,
      sourceData: {
        generated: true,
        method: 'sample_generation'
      }
    };
    
    fixtures.push(fixture);
  }
  
  log(`✅ Generated ${fixtures.length} sample fixtures for ${competition.name}`);
  return fixtures;
}

// ============================================
// TEAM RESOLUTION
// ============================================

/**
 * Load team mapping from manual import data
 * @returns {Promise<Object>} Team name to metadata mapping
 */
async function loadTeamMapping() {
  try {
    const teamData = JSON.parse(await fs.readFile('teams-manual-data.json', 'utf8'));
    const teamMapping = {};
    
    teamData.teams.forEach(team => {
      // Create mapping for exact names and normalized names
      const key = team.name.toLowerCase();
      teamMapping[key] = {
        name: team.name,
        slug: team.slug,
        competition_id: team.competition_id
      };
    });
    
    log(`📋 Loaded ${Object.keys(teamMapping).length} team mappings`);
    return teamMapping;
  } catch (error) {
    log(`⚠️  Could not load team mapping: ${error.message}`);
    return {};
  }
}

/**
 * Resolve team names to database references
 * @param {Array} fixtures - Fixtures with team names
 * @param {Object} teamMapping - Team name to metadata mapping
 * @returns {Array} Fixtures with resolved team references
 */
function resolveTeamNames(fixtures, teamMapping) {
  const resolvedFixtures = [];
  let unresolvedCount = 0;
  
  fixtures.forEach(fixture => {
    const homeKey = fixture.home_team_name?.toLowerCase();
    const awayKey = fixture.away_team_name?.toLowerCase();
    
    const homeTeam = teamMapping[homeKey];
    const awayTeam = teamMapping[awayKey];
    
    if (homeTeam && awayTeam && homeTeam.competition_id === fixture.competition_id && awayTeam.competition_id === fixture.competition_id) {
      resolvedFixtures.push({
        ...fixture,
        home_team_slug: homeTeam.slug,
        away_team_slug: awayTeam.slug,
        // Keep names for SQL generation
        home_team: homeTeam.name,
        away_team: awayTeam.name
      });
    } else {
      unresolvedCount++;
      if (unresolvedCount <= 5) { // Only log first 5 to avoid spam
        log(`⚠️  Could not resolve teams: ${fixture.home_team_name} vs ${fixture.away_team_name} (${COMPETITION_CONFIG[Object.keys(COMPETITION_CONFIG).find(k => COMPETITION_CONFIG[k].id === fixture.competition_id)]?.name})`);
      }
    }
  });
  
  if (unresolvedCount > 5) {
    log(`⚠️  ... and ${unresolvedCount - 5} more unresolved fixtures`);
  }
  
  log(`📊 Team resolution: ${resolvedFixtures.length} resolved, ${unresolvedCount} unresolved`);
  return resolvedFixtures;
}

// ============================================
// SQL GENERATION
// ============================================

/**
 * Generate SQL INSERT statement for fixtures
 * @param {Array} fixtures - Fixture data to insert
 * @returns {string} SQL INSERT statement
 */
function generateFixturesSQL(fixtures) {
  if (fixtures.length === 0) {
    return '-- No fixtures to insert\n';
  }
  
  const values = fixtures.map(fixture => {
    const externalRef = fixture.external_ref.replace(/'/g, "''");
    const venue = fixture.venue ? `'${fixture.venue.replace(/'/g, "''")}'` : 'NULL';
    const homeTeam = fixture.home_team.replace(/'/g, "''");
    const awayTeam = fixture.away_team.replace(/'/g, "''");
    
    return `('${externalRef}', '${fixture.utc_kickoff}', ${fixture.matchday}, ${venue}, '${fixture.status}', ${fixture.competition_id}, '${homeTeam}', '${awayTeam}')`;
  }).join(',\n    ');
  
  return `-- Insert fixtures (${fixtures.length} records)
-- This uses team names that will be resolved to IDs via JOIN

-- Create temporary table for team name resolution and fixture insert
WITH fixture_data AS (
  SELECT * FROM (VALUES
    ${values}
  ) AS fd(external_ref, utc_kickoff, matchday, venue, status, competition_id, home_team_name, away_team_name)
),
team_resolution AS (
  SELECT 
    fd.external_ref,
    fd.utc_kickoff::timestamp as utc_kickoff,
    fd.matchday,
    fd.venue,
    fd.status,
    fd.competition_id,
    ht.id as home_team_id,
    at.id as away_team_id
  FROM fixture_data fd
  JOIN teams ht ON ht.name = fd.home_team_name AND ht.competition_id = fd.competition_id
  JOIN teams at ON at.name = fd.away_team_name AND at.competition_id = fd.competition_id
)
INSERT INTO fixtures (
  external_ref, utc_kickoff, matchday, venue, status, 
  competition_id, home_team_id, away_team_id
)
SELECT 
  external_ref, utc_kickoff, matchday, venue, status,
  competition_id, home_team_id, away_team_id
FROM team_resolution
ON CONFLICT (external_ref) DO UPDATE SET
  utc_kickoff = EXCLUDED.utc_kickoff,
  matchday = EXCLUDED.matchday,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Verify the import
-- SELECT 
--   c.name as competition,
--   COUNT(f.id) as fixture_count,
--   MIN(f.utc_kickoff) as earliest_fixture,
--   MAX(f.utc_kickoff) as latest_fixture
-- FROM competitions c
-- LEFT JOIN fixtures f ON c.id = f.competition_id
-- GROUP BY c.name, c.display_order
-- ORDER BY c.display_order;
`;
}

// ============================================
// FILE OPERATIONS
// ============================================

/**
 * Save fixture data to JSON file
 * @param {Array} fixtures - Fixture data
 * @param {string} filename - Output filename
 */
async function saveFixtureData(fixtures, filename) {
  try {
    const data = {
      generatedAt: new Date().toISOString(),
      totalFixtures: fixtures.length,
      competitions: Object.keys(COMPETITION_CONFIG),
      fixturesByCompetition: {},
      fixtures: fixtures
    };
    
    // Group by competition for summary
    Object.values(COMPETITION_CONFIG).forEach(comp => {
      const compFixtures = fixtures.filter(f => f.competition_id === comp.id);
      data.fixturesByCompetition[comp.name] = compFixtures.length;
    });
    
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    log(`💾 Fixture data saved to ${filename}`);
  } catch (error) {
    log(`❌ Error saving fixture data: ${error.message}`);
  }
}

/**
 * Save SQL scripts to file
 * @param {string} sql - SQL content
 * @param {string} filename - Output filename
 */
async function saveSQLScript(sql, filename) {
  try {
    const header = `-- Multi-Competition Fixture Import SQL
-- Generated: ${new Date().toISOString()}
-- Source: TheSportsDB API (with fallback to sample data)
-- Competitions: ${Object.keys(COMPETITION_CONFIG).join(', ')}

-- Prerequisites:
-- 1. Database migration completed (database-migration.sql)
-- 2. Teams imported (teams-manual-import.sql)
-- 3. Competitions table populated with correct competition IDs

-- Note: This script resolves team names to IDs via database JOINs
-- Make sure team names match exactly between teams and fixtures

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
    log('⚽ Multi-Competition Fixture Import Starting...');
    
    // Load team mapping for resolution
    log('\n👥 Loading team mapping...');
    const teamMapping = await loadTeamMapping();
    
    if (Object.keys(teamMapping).length === 0) {
      log('❌ No team mapping found. Run team import first: node import-teams-manual.js');
      process.exit(1);
    }
    
    // Fetch fixture data from API
    let allFixtures = await fetchAllFixtures();
    
    // If API returned no fixtures, generate samples for testing
    if (allFixtures.length === 0) {
      log('\n⚠️  No fixtures from TheSportsDB API. Generating sample fixtures for testing...');
      
      Object.entries(COMPETITION_CONFIG).forEach(([slug, competition]) => {
        const competitionTeams = Object.keys(teamMapping)
          .filter(teamName => teamMapping[teamName].competition_id === competition.id)
          .map(teamName => teamMapping[teamName].name);
        
        if (competitionTeams.length >= 2) {
          const sampleFixtures = generateSampleFixtures(competition, competitionTeams);
          allFixtures.push(...sampleFixtures);
        }
      });
      
      log(`📊 Generated ${allFixtures.length} sample fixtures for testing`);
    }
    
    if (allFixtures.length === 0) {
      log('❌ No fixtures available (API + samples). Check team import and try again.');
      process.exit(1);
    }
    
    // Resolve team names to database references
    log('\n🔗 Resolving team names...');
    const resolvedFixtures = resolveTeamNames(allFixtures, teamMapping);
    
    if (resolvedFixtures.length === 0) {
      log('❌ No fixtures could be resolved. Check team name matching.');
      process.exit(1);
    }
    
    // Generate SQL
    log('\n📝 Generating SQL scripts...');
    const fixturesSQL = generateFixturesSQL(resolvedFixtures);
    
    // Save files
    log('\n💾 Saving output files...');
    await saveFixtureData(resolvedFixtures, 'fixtures-import-data.json');
    await saveSQLScript(fixturesSQL, 'fixtures-import.sql');
    
    // Summary
    log('\n📊 Import Summary:');
    log(`   Total fixtures processed: ${allFixtures.length}`);
    log(`   Fixtures resolved: ${resolvedFixtures.length}`);
    log(`   Files generated: fixtures-import-data.json, fixtures-import.sql`);
    
    // Competition breakdown
    log('\n📈 Fixtures per competition:');
    Object.values(COMPETITION_CONFIG).forEach(comp => {
      const count = resolvedFixtures.filter(f => f.competition_id === comp.id).length;
      log(`   ${comp.name}: ${count} fixtures`);
    });
    
    log('\n✅ Fixture import completed successfully!');
    log('\n🚀 Next steps:');
    log('   1. Review fixtures-import-data.json for data accuracy');
    log('   2. Execute fixtures-import.sql in your Supabase database');
    log('   3. Verify import: SELECT COUNT(*) FROM fixtures GROUP BY competition_id;');
    log('   4. Test API: /fixtures_with_team_names_v?competition_id=eq.1');
    
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
  fetchAllFixtures,
  generateSampleFixtures,
  resolveTeamNames,
  generateFixturesSQL,
  COMPETITION_CONFIG,
  SEASON_DATES
};