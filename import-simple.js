/**
 * Simplified Football-Data.org Import Script
 * Works with basic Supabase schema
 */

// Configuration (same as your original)
const FOOTBALL_DATA_CONFIG = {
  baseUrl: 'https://api.football-data.org/v4',
  apiKey: '91f8454dc9d44e63b90202737e6ce29d',
  competitionCode: 'PL',
  season: '2025'
};

const SUPABASE_CONFIG = {
  url: 'https://nkfuzkrazehjivzmdrvt.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZnV6a3JhemVoaml2em1kcnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNjI5MzAsImV4cCI6MjA3MjgzODkzMH0.CNW1EUtcC4JWfDy-WzOIVDfv7rnXzsz1qqQyRTZVyXU'
};

const footballDataHeaders = {
  'X-Auth-Token': FOOTBALL_DATA_CONFIG.apiKey,
  'Content-Type': 'application/json'
};

const supabaseHeaders = {
  'apikey': SUPABASE_CONFIG.anonKey,
  'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
  'Content-Type': 'application/json'
};

/**
 * Import Premier League Teams (Simplified Schema)
 */
async function importTeams() {
  console.log('🏟️ Importing Premier League teams...');
  
  try {
    // Fetch teams from Football-Data.org
    const response = await fetch(
      `${FOOTBALL_DATA_CONFIG.baseUrl}/competitions/${FOOTBALL_DATA_CONFIG.competitionCode}/teams`,
      { headers: footballDataHeaders }
    );
    
    if (!response.ok) {
      throw new Error(`Football-Data API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const teams = data.teams;
    
    console.log(`Found ${teams.length} teams from Football-Data.org`);
    
    // Transform to basic schema (no external_id column)
    const transformedTeams = teams.map(team => ({
      name: team.name,
      slug: createSlug(team.name),
      competition_id: 1, // Premier League
      crest_url: team.crest
    }));
    
    console.log('Sample team data:', transformedTeams[0]);
    
    // Insert into Supabase
    const supabaseResponse = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/teams`,
      {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(transformedTeams)
      }
    );
    
    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();
      throw new Error(`Supabase error: ${supabaseResponse.status} - ${errorText}`);
    }
    
    console.log('✅ Teams imported successfully');
    return transformedTeams;
    
  } catch (error) {
    console.error('❌ Team import failed:', error);
    throw error;
  }
}

/**
 * Import Premier League Fixtures (Simplified)
 */
async function importFixtures() {
  console.log('⚽ Importing Premier League fixtures...');
  
  try {
    // Get team mappings from Supabase (by name since no external_id)
    const teamsResponse = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/teams?competition_id=eq.1&select=id,name`,
      { headers: supabaseHeaders }
    );
    
    const teams = await teamsResponse.json();
    console.log(`Found ${teams.length} teams in database`);
    
    const teamMapping = {};
    teams.forEach(team => {
      teamMapping[team.name] = team.id;
    });
    
    // Fetch fixtures from Football-Data.org
    const response = await fetch(
      `${FOOTBALL_DATA_CONFIG.baseUrl}/competitions/${FOOTBALL_DATA_CONFIG.competitionCode}/matches?season=${FOOTBALL_DATA_CONFIG.season}`,
      { headers: footballDataHeaders }
    );
    
    if (!response.ok) {
      throw new Error(`Football-Data API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const matches = data.matches;
    
    console.log(`Found ${matches.length} fixtures from API`);
    
    // Transform to simple schema
    const transformedFixtures = matches
      .filter(match => match.homeTeam && match.awayTeam)
      .map(match => ({
        competition_id: 1,
        home_team_id: teamMapping[match.homeTeam.name],
        away_team_id: teamMapping[match.awayTeam.name], 
        utc_kickoff: match.utcDate,
        matchday: match.matchday,
        venue: match.venue || `${match.homeTeam.name} Stadium`,
        status: mapMatchStatus(match.status)
      }))
      .filter(fixture => fixture.home_team_id && fixture.away_team_id);
    
    console.log(`Transformed ${transformedFixtures.length} valid fixtures`);
    console.log('Sample fixture:', transformedFixtures[0]);
    
    // Insert fixtures in batches
    const batchSize = 50;
    let successCount = 0;
    
    for (let i = 0; i < transformedFixtures.length; i += batchSize) {
      const batch = transformedFixtures.slice(i, i + batchSize);
      
      const supabaseResponse = await fetch(
        `${SUPABASE_CONFIG.url}/rest/v1/fixtures`,
        {
          method: 'POST',
          headers: supabaseHeaders,
          body: JSON.stringify(batch)
        }
      );
      
      if (!supabaseResponse.ok) {
        const errorText = await supabaseResponse.text();
        console.warn(`Batch ${i} failed: ${supabaseResponse.status} - ${errorText}`);
        // Continue with next batch instead of failing completely
        continue;
      }
      
      successCount += batch.length;
      console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${batch.length} fixtures`);
    }
    
    console.log(`✅ Successfully imported ${successCount}/${transformedFixtures.length} fixtures`);
    return transformedFixtures;
    
  } catch (error) {
    console.error('❌ Fixture import failed:', error);
    throw error;
  }
}

/**
 * Utility Functions
 */
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapMatchStatus(status) {
  const statusMap = {
    'SCHEDULED': 'scheduled',
    'TIMED': 'scheduled', 
    'IN_PLAY': 'live',
    'PAUSED': 'live',
    'FINISHED': 'finished',
    'POSTPONED': 'postponed',
    'SUSPENDED': 'postponed',
    'CANCELLED': 'postponed'
  };
  
  return statusMap[status] || 'scheduled';
}

/**
 * Main Import Function
 */
async function runImport() {
  console.log('🚀 Starting simplified Premier League data import...');
  console.log('📡 Source: Football-Data.org API');
  console.log('🎯 Target: New Supabase project');
  console.log('📋 Schema: Basic (no external_id tracking)\n');
  
  try {
    // Step 1: Import teams
    await importTeams();
    
    // Wait a moment for database consistency
    console.log('⏳ Waiting for database consistency...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Import fixtures  
    await importFixtures();
    
    console.log('\n🎉 Import completed successfully!');
    console.log('✅ Your database now has Premier League teams and fixtures');
    console.log('🔄 Next step: Update your frontend configuration');
    
  } catch (error) {
    console.error('\n💥 Import failed:', error.message);
    console.log('🔧 Check your API keys and database schema');
  }
}

// Execute immediately
runImport();