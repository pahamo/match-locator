#!/usr/bin/env node

/**
 * Import Sample Fixtures for All Competitions
 * Creates sample fixtures to test the multi-competition frontend
 */

const https = require('https');

const SUPABASE_CONFIG = {
  url: 'https://ksqyurqkqznzrntdpood.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcXl1cnFrcXpuenJudGRwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTEwNjAsImV4cCI6MjA3MjM2NzA2MH0.wVBZBEbfctB7JPnpMZkXKMGwXlYxGWjOF_AxixVo-S4'
};

/**
 * Get teams for a competition
 */
async function getTeamsForCompetition(competitionId) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/teams?competition_id=eq.${competitionId}&select=id,name,slug`;
    
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
          const teams = JSON.parse(data);
          resolve(teams);
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
 * Insert a fixture
 */
async function insertFixture(fixture) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/fixtures`;
    const postData = JSON.stringify(fixture);
    
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
        resolve(true);
      } else {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${data}`)));
      }
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Generate sample fixtures for a competition
 */
function generateSampleFixtures(teams, competitionId, competitionName) {
  if (teams.length < 2) {
    console.log(`⚠️  Not enough teams for ${competitionName} (need at least 2, have ${teams.length})`);
    return [];
  }

  const fixtures = [];
  const startDate = new Date('2024-09-15'); // Start from a future date
  const daysInterval = 7; // One week apart

  // Create fixtures between teams (round-robin style)
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < Math.min(teams.length, i + 4); j++) { // Limit to avoid too many fixtures
      const homeTeam = teams[i];
      const awayTeam = teams[j];
      
      // Calculate fixture date (spread over several weeks)
      const fixtureDate = new Date(startDate);
      fixtureDate.setDate(startDate.getDate() + (fixtures.length * daysInterval));
      
      // Set kick-off time (Saturday 3pm local time, converted to UTC)
      fixtureDate.setUTCHours(15, 0, 0, 0); // 3pm UTC (adjust if needed for timezone)
      
      const fixture = {
        external_ref: `sample_${competitionId}_${fixtures.length + 1}`,
        utc_kickoff: fixtureDate.toISOString(),
        matchday: Math.floor(fixtures.length / (teams.length / 2)) + 1,
        venue: `${homeTeam.name} Stadium`,
        status: 'scheduled',
        competition_id: competitionId,
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id
      };
      
      fixtures.push(fixture);
      
      // Limit to 8 fixtures per competition for testing
      if (fixtures.length >= 8) break;
    }
    if (fixtures.length >= 8) break;
  }

  return fixtures;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Importing sample fixtures for all competitions...\n');
  
  const competitions = [
    { id: 1, name: 'Premier League' },
    { id: 2, name: 'Bundesliga' },
    { id: 3, name: 'La Liga' },
    { id: 4, name: 'Serie A' },
    { id: 5, name: 'Ligue 1' }
  ];
  
  let totalFixtures = 0;
  let totalSuccess = 0;

  for (const comp of competitions) {
    console.log(`📊 Processing ${comp.name}...`);
    
    try {
      // Get teams for this competition
      const teams = await getTeamsForCompetition(comp.id);
      console.log(`   👥 Found ${teams.length} teams`);
      
      if (teams.length === 0) {
        console.log(`   ⚠️  No teams found for ${comp.name}, skipping fixtures`);
        continue;
      }
      
      // Generate sample fixtures
      const fixtures = generateSampleFixtures(teams, comp.id, comp.name);
      console.log(`   ⚽ Generated ${fixtures.length} sample fixtures`);
      
      // Insert fixtures
      let successCount = 0;
      for (const fixture of fixtures) {
        try {
          await insertFixture(fixture);
          successCount++;
          
          // Show progress
          const homeTeam = teams.find(t => t.id === fixture.home_team_id)?.name || 'Unknown';
          const awayTeam = teams.find(t => t.id === fixture.away_team_id)?.name || 'Unknown';
          console.log(`   ✅ ${homeTeam} vs ${awayTeam}`);
          
        } catch (error) {
          console.log(`   ❌ Failed: ${error.message}`);
        }
        
        // Small delay to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`   📈 Inserted ${successCount}/${fixtures.length} fixtures\n`);
      totalFixtures += fixtures.length;
      totalSuccess += successCount;
      
    } catch (error) {
      console.log(`   ❌ Error processing ${comp.name}:`, error.message);
    }
  }

  console.log('🎯 Import Summary:');
  console.log(`✅ Total fixtures created: ${totalSuccess}/${totalFixtures}`);
  console.log(`📊 Competitions processed: ${competitions.length}`);
  
  if (totalSuccess > 0) {
    console.log('\n🎉 Sample fixtures imported successfully!');
    console.log('\n🔗 Test your multi-competition frontend:');
    console.log('   - Home page: /football/ (should show upcoming fixtures)');
    console.log('   - Competition dropdown: Switch between leagues');
    console.log('   - Fixtures page: /football/bundesliga/fixtures');
    console.log('   - Each competition should show different fixtures');
    console.log('\n💡 Tips:');
    console.log('   - Fixtures are scheduled from Sep 15, 2024 onwards');
    console.log('   - Each competition has 8 sample fixtures');
    console.log('   - Competition badges should show different colors');
  } else {
    console.log('\n❌ No fixtures were imported');
    console.log('💡 Check that teams were imported correctly first');
  }
}

// Run the import
main().catch(console.error);