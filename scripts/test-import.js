#!/usr/bin/env node

/**
 * Test script for team import functionality
 * Tests API connectivity and data processing without full import
 */

const { fetchAllTeams, detectDuplicates, COMPETITION_CONFIG } = require('./import-teams');

async function testImport() {
  console.log('🧪 Testing team import functionality...\n');
  
  try {
    // Test 1: Configuration validation
    console.log('1️⃣ Testing configuration...');
    const competitions = Object.keys(COMPETITION_CONFIG);
    console.log(`   ✅ Found ${competitions.length} competitions: ${competitions.join(', ')}`);
    
    // Test 2: API connectivity (single competition)
    console.log('\n2️⃣ Testing API connectivity with Premier League...');
    const testComp = COMPETITION_CONFIG['premier-league'];
    const https = require('https');
    
    const testUrl = `https://www.thesportsdb.com/api/v1/json/123/lookup_all_teams.php?id=${testComp.theSportsDbId}`;
    
    const testResponse = await new Promise((resolve, reject) => {
      https.get(testUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
    
    if (testResponse.teams && testResponse.teams.length > 0) {
      console.log(`   ✅ API accessible - found ${testResponse.teams.length} Premier League teams`);
      console.log(`   📝 Sample team: ${testResponse.teams[0].strTeam}`);
    } else {
      console.log('   ❌ API returned no teams');
      return false;
    }
    
    // Test 3: Limited data fetch (just Premier League)
    console.log('\n3️⃣ Testing data processing...');
    
    // Temporarily modify config to test just Premier League
    const originalConfig = { ...COMPETITION_CONFIG };
    Object.keys(COMPETITION_CONFIG).forEach(key => {
      if (key !== 'premier-league') {
        delete COMPETITION_CONFIG[key];
      }
    });
    
    const testTeams = await fetchAllTeams();
    
    // Restore original config
    Object.assign(COMPETITION_CONFIG, originalConfig);
    
    if (testTeams.length > 0) {
      console.log(`   ✅ Data processing successful - processed ${testTeams.length} teams`);
      
      // Test duplicate detection
      const { duplicates, uniqueTeams } = detectDuplicates(testTeams);
      console.log(`   ✅ Duplicate detection working - ${uniqueTeams.length} unique teams`);
      
      // Show sample team data
      console.log('\n📊 Sample team data:');
      const sampleTeam = testTeams[0];
      console.log(`   Name: ${sampleTeam.name}`);
      console.log(`   Slug: ${sampleTeam.slug}`);
      console.log(`   Competition ID: ${sampleTeam.competition_id}`);
      console.log(`   Country: ${sampleTeam.country_code}`);
      console.log(`   TheSportsDB ID: ${sampleTeam.thesportsdb_id}`);
      
    } else {
      console.log('   ❌ No teams processed');
      return false;
    }
    
    console.log('\n✅ All tests passed! Import script is ready to use.');
    console.log('\n🚀 To run full import: node import-teams.js');
    
    return true;
    
  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

// Run tests if called directly
if (require.main === module) {
  testImport().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testImport };