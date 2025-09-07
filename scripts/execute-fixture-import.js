#!/usr/bin/env node

/**
 * Execute Fixture Import via Supabase API
 * This script runs the fixture import SQL using Supabase's REST API
 */

const fs = require('fs');
const https = require('https');

const SUPABASE_CONFIG = {
  url: 'https://ksqyurqkqznzrntdpood.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcXl1cnFrcXpuenJudGRwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTEwNjAsImV4cCI6MjA3MjM2NzA2MH0.wVBZBEbfctB7JPnpMZkXKMGwXlYxGWjOF_AxixVo-S4'
};

// Sample fixture data to insert directly via API calls
const fixtures = [
  // Premier League fixtures (competition_id: 1)
  { external_ref: 'sample_1_1', utc_kickoff: '2024-08-17T13:00:00.000Z', matchday: 1, venue: 'Sample Stadium 1', status: 'scheduled', competition_id: 1, home_team_name: 'Arsenal', away_team_name: 'Aston Villa' },
  { external_ref: 'sample_1_2', utc_kickoff: '2024-08-24T13:00:00.000Z', matchday: 2, venue: 'Sample Stadium 2', status: 'scheduled', competition_id: 1, home_team_name: 'Aston Villa', away_team_name: 'AFC Bournemouth' },
  { external_ref: 'sample_1_3', utc_kickoff: '2024-08-31T13:00:00.000Z', matchday: 3, venue: 'Sample Stadium 3', status: 'scheduled', competition_id: 1, home_team_name: 'AFC Bournemouth', away_team_name: 'Brentford' },
  { external_ref: 'sample_1_4', utc_kickoff: '2024-09-07T13:00:00.000Z', matchday: 4, venue: 'Sample Stadium 4', status: 'scheduled', competition_id: 1, home_team_name: 'Brentford', away_team_name: 'Brighton & Hove Albion' },
  { external_ref: 'sample_1_5', utc_kickoff: '2024-09-14T13:00:00.000Z', matchday: 5, venue: 'Sample Stadium 5', status: 'scheduled', competition_id: 1, home_team_name: 'Brighton & Hove Albion', away_team_name: 'Chelsea' },
  
  // Bundesliga fixtures (competition_id: 2)
  { external_ref: 'sample_2_1', utc_kickoff: '2024-08-24T13:00:00.000Z', matchday: 1, venue: 'Sample Stadium 1', status: 'scheduled', competition_id: 2, home_team_name: 'FC Augsburg', away_team_name: 'Bayer 04 Leverkusen' },
  { external_ref: 'sample_2_2', utc_kickoff: '2024-08-31T13:00:00.000Z', matchday: 2, venue: 'Sample Stadium 2', status: 'scheduled', competition_id: 2, home_team_name: 'Bayer 04 Leverkusen', away_team_name: 'Bayern Munich' },
  { external_ref: 'sample_2_3', utc_kickoff: '2024-09-07T13:00:00.000Z', matchday: 3, venue: 'Sample Stadium 3', status: 'scheduled', competition_id: 2, home_team_name: 'Bayern Munich', away_team_name: 'Borussia Dortmund' },
  
  // La Liga fixtures (competition_id: 3)
  { external_ref: 'sample_3_1', utc_kickoff: '2024-08-18T13:00:00.000Z', matchday: 1, venue: 'Sample Stadium 1', status: 'scheduled', competition_id: 3, home_team_name: 'Athletic Bilbao', away_team_name: 'Atlético Madrid' },
  { external_ref: 'sample_3_2', utc_kickoff: '2024-08-25T13:00:00.000Z', matchday: 2, venue: 'Sample Stadium 2', status: 'scheduled', competition_id: 3, home_team_name: 'Atlético Madrid', away_team_name: 'FC Barcelona' },
  
  // Serie A fixtures (competition_id: 4)
  { external_ref: 'sample_4_1', utc_kickoff: '2024-08-18T13:00:00.000Z', matchday: 1, venue: 'Sample Stadium 1', status: 'scheduled', competition_id: 4, home_team_name: 'Atalanta', away_team_name: 'Bologna FC' },
  { external_ref: 'sample_4_2', utc_kickoff: '2024-08-25T13:00:00.000Z', matchday: 2, venue: 'Sample Stadium 2', status: 'scheduled', competition_id: 4, home_team_name: 'Bologna FC', away_team_name: 'Cagliari' },
  
  // Ligue 1 fixtures (competition_id: 5)
  { external_ref: 'sample_5_1', utc_kickoff: '2024-08-17T13:00:00.000Z', matchday: 1, venue: 'Sample Stadium 1', status: 'scheduled', competition_id: 5, home_team_name: 'Angers SCO', away_team_name: 'AJ Auxerre' },
  { external_ref: 'sample_5_2', utc_kickoff: '2024-08-24T13:00:00.000Z', matchday: 2, venue: 'Sample Stadium 2', status: 'scheduled', competition_id: 5, home_team_name: 'AJ Auxerre', away_team_name: 'Stade Brestois 29' }
];

/**
 * Get team ID by name and competition
 */
async function getTeamId(teamName, competitionId) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/teams?competition_id=eq.${competitionId}&name=eq.${encodeURIComponent(teamName)}&select=id`;
    
    const options = {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result && result.length > 0) {
            resolve(result[0].id);
          } else {
            console.warn(`⚠️  Team not found: ${teamName} in competition ${competitionId}`);
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Insert fixture with team ID resolution
 */
async function insertFixture(fixture) {
  try {
    // Resolve team IDs
    const homeTeamId = await getTeamId(fixture.home_team_name, fixture.competition_id);
    const awayTeamId = await getTeamId(fixture.away_team_name, fixture.competition_id);

    if (!homeTeamId || !awayTeamId) {
      console.log(`❌ Skipping fixture ${fixture.external_ref}: Could not resolve teams ${fixture.home_team_name} vs ${fixture.away_team_name}`);
      return false;
    }

    // Insert fixture
    const fixtureData = {
      external_ref: fixture.external_ref,
      utc_kickoff: fixture.utc_kickoff,
      matchday: fixture.matchday,
      venue: fixture.venue,
      status: fixture.status,
      competition_id: fixture.competition_id,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId
    };

    return new Promise((resolve, reject) => {
      const url = `${SUPABASE_CONFIG.url}/rest/v1/fixtures`;
      const postData = JSON.stringify(fixtureData);
      
      const options = {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      };

      const req = https.request(url, options, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Inserted fixture: ${fixture.home_team_name} vs ${fixture.away_team_name}`);
          resolve(true);
        } else {
          console.log(`❌ Failed to insert fixture: ${fixture.external_ref} (${res.statusCode})`);
          resolve(false);
        }
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });

  } catch (error) {
    console.error(`❌ Error inserting fixture ${fixture.external_ref}:`, error);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting fixture import...');
  console.log(`📊 Importing ${fixtures.length} fixtures across 5 competitions`);
  
  let successCount = 0;
  let failureCount = 0;

  for (const fixture of fixtures) {
    const success = await insertFixture(fixture);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Small delay to be nice to the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n🎯 Import Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📊 Total: ${fixtures.length}`);

  if (successCount > 0) {
    console.log('\n🎉 Fixture import completed! The multi-competition frontend should now work.');
    console.log('🔗 Test URLs:');
    console.log('   - /football/ (Premier League)');
    console.log('   - /football/bundesliga/fixtures');
    console.log('   - /football/la-liga/clubs');
  }
}

// Run the import
main().catch(console.error);