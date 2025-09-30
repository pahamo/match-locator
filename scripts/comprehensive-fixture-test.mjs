#!/usr/bin/env node

/**
 * Comprehensive fixture testing - try different approaches
 */

import 'dotenv/config';

async function comprehensiveFixtureTest() {
  console.log('🔬 Comprehensive Fixture API Testing...\n');

  const username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME;
  const token = process.env.REACT_APP_SOCCERSAPI_TOKEN || process.env.SOCCERSAPI_KEY;

  if (!username || !token) {
    console.error('❌ Missing credentials');
    process.exit(1);
  }

  // Test 1: Use REAL current date (not environment date)
  console.log('📅 TEST 1: Using real current date (December 2024)...');
  try {
    const url1 = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url1.searchParams.append('user', username);
    url1.searchParams.append('token', token);
    url1.searchParams.append('t', 'list');
    url1.searchParams.append('date_from', '2024-12-01');
    url1.searchParams.append('date_to', '2024-12-31');

    const response1 = await fetch(url1.toString());
    const data1 = await response1.json();

    console.log(`   Fixtures: ${data1.data ? data1.data.length : 0}`);
    if (data1.data && data1.data.length > 0) {
      console.log('   ✅ SUCCESS! Found fixtures with real current date');
      const fixture = data1.data[0];
      console.log(`   Sample: ${fixture.homeTeam?.name || fixture.home_team} vs ${fixture.awayTeam?.name || fixture.away_team}`);
      console.log(`   League: ${fixture.league?.name || 'Unknown'}`);
      console.log(`   Date: ${fixture.date || fixture.utc_date}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 2: Try different date format
  console.log('📅 TEST 2: Different date format (YYYY/MM/DD)...');
  try {
    const url2 = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url2.searchParams.append('user', username);
    url2.searchParams.append('token', token);
    url2.searchParams.append('t', 'list');
    url2.searchParams.append('date_from', '2024/12/01');
    url2.searchParams.append('date_to', '2024/12/31');

    const response2 = await fetch(url2.toString());
    const data2 = await response2.json();

    console.log(`   Fixtures: ${data2.data ? data2.data.length : 0}`);
    if (data2.data && data2.data.length > 0) {
      console.log('   ✅ SUCCESS! Different date format worked');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 3: Try without any date filters
  console.log('🌍 TEST 3: No date filters (get any available fixtures)...');
  try {
    const url3 = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url3.searchParams.append('user', username);
    url3.searchParams.append('token', token);
    url3.searchParams.append('t', 'list');

    const response3 = await fetch(url3.toString());
    const data3 = await response3.json();

    console.log(`   Fixtures: ${data3.data ? data3.data.length : 0}`);
    if (data3.data && data3.data.length > 0) {
      console.log('   ✅ SUCCESS! Found fixtures without date filter');
      const fixture = data3.data[0];
      console.log(`   Sample: ${fixture.homeTeam?.name || fixture.home_team} vs ${fixture.awayTeam?.name || fixture.away_team}`);
      console.log(`   Date: ${fixture.date || fixture.utc_date}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 4: Try with season_id for Premier League
  console.log('🏆 TEST 4: Try with season_id for Premier League...');
  try {
    const url4 = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url4.searchParams.append('user', username);
    url4.searchParams.append('token', token);
    url4.searchParams.append('t', 'list');
    url4.searchParams.append('league_id', '583');
    url4.searchParams.append('season_id', '15672'); // Try a season ID

    const response4 = await fetch(url4.toString());
    const data4 = await response4.json();

    console.log(`   Fixtures: ${data4.data ? data4.data.length : 0}`);
    if (data4.data && data4.data.length > 0) {
      console.log('   ✅ SUCCESS! Season ID approach worked');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 5: Try past dates (2024)
  console.log('📅 TEST 5: Try past dates (August-November 2024)...');
  try {
    const url5 = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url5.searchParams.append('user', username);
    url5.searchParams.append('token', token);
    url5.searchParams.append('t', 'list');
    url5.searchParams.append('date_from', '2024-08-01');
    url5.searchParams.append('date_to', '2024-11-30');

    const response5 = await fetch(url5.toString());
    const data5 = await response5.json();

    console.log(`   Fixtures: ${data5.data ? data5.data.length : 0}`);
    if (data5.data && data5.data.length > 0) {
      console.log('   ✅ SUCCESS! Found fixtures in 2024');
      const fixture = data5.data[0];
      console.log(`   Sample: ${fixture.homeTeam?.name || fixture.home_team} vs ${fixture.awayTeam?.name || fixture.away_team}`);
      console.log(`   League: ${fixture.league?.name || 'Unknown'}`);
      console.log(`   Date: ${fixture.date || fixture.utc_date}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 6: Try different endpoint path
  console.log('🔀 TEST 6: Try different endpoint (/fixtures vs /fixture)...');
  try {
    const url6 = new URL('https://api.soccersapi.com/v2.2/fixture');
    url6.searchParams.append('user', username);
    url6.searchParams.append('token', token);
    url6.searchParams.append('t', 'list');
    url6.searchParams.append('date_from', '2024-12-01');
    url6.searchParams.append('date_to', '2024-12-31');

    const response6 = await fetch(url6.toString());
    const data6 = await response6.json();

    console.log(`   Status: ${response6.status}`);
    console.log(`   Fixtures: ${data6.data ? data6.data.length : 0}`);
    if (data6.data && data6.data.length > 0) {
      console.log('   ✅ SUCCESS! Different endpoint worked');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 7: Check what current season_id should be for Premier League
  console.log('🔍 TEST 7: Get current season info for Premier League...');
  try {
    const url7 = new URL('https://api.soccersapi.com/v2.2/seasons');
    url7.searchParams.append('user', username);
    url7.searchParams.append('token', token);
    url7.searchParams.append('t', 'list');
    url7.searchParams.append('league_id', '583');

    const response7 = await fetch(url7.toString());
    const data7 = await response7.json();

    console.log(`   Seasons found: ${data7.data ? data7.data.length : 0}`);
    if (data7.data && data7.data.length > 0) {
      console.log('   ✅ Found season data:');
      data7.data.slice(0, 3).forEach(season => {
        console.log(`   • Season: ${season.name} (ID: ${season.id}) - Current: ${season.is_current}`);
      });

      // Try fixtures with current season
      const currentSeason = data7.data.find(s => s.is_current === '1') || data7.data[0];
      if (currentSeason) {
        console.log(`\n   🎯 Testing fixtures with current season ${currentSeason.id}...`);

        const url7b = new URL('https://api.soccersapi.com/v2.2/fixtures');
        url7b.searchParams.append('user', username);
        url7b.searchParams.append('token', token);
        url7b.searchParams.append('t', 'list');
        url7b.searchParams.append('league_id', '583');
        url7b.searchParams.append('season_id', currentSeason.id);

        const response7b = await fetch(url7b.toString());
        const data7b = await response7b.json();

        console.log(`   Fixtures with season ${currentSeason.id}: ${data7b.data ? data7b.data.length : 0}`);
        if (data7b.data && data7b.data.length > 0) {
          console.log('   ✅ SUCCESS! Season-specific fixtures found');
          const fixture = data7b.data[0];
          console.log(`   Sample: ${fixture.homeTeam?.name || fixture.home_team} vs ${fixture.awayTeam?.name || fixture.away_team}`);
          console.log(`   Date: ${fixture.date || fixture.utc_date}`);
        }
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n🎯 Test complete!');
}

comprehensiveFixtureTest();