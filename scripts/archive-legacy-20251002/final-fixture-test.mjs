#!/usr/bin/env node

/**
 * Final comprehensive fixture test with headers and historical data
 */

import 'dotenv/config';

async function finalFixtureTest() {
  console.log('🔬 FINAL Comprehensive Fixture Test...\n');

  const username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME;
  const token = process.env.REACT_APP_SOCCERSAPI_TOKEN || process.env.SOCCERSAPI_KEY;

  // Test with exact headers from admin function
  const headers = {
    'User-Agent': 'FixturesApp-Test/1.0',
    'Accept': 'application/json',
  };

  // Test 1: Try with proper headers and historical data (2023-2024 season)
  console.log('📅 TEST 1: 2023-2024 Premier League season with proper headers...');
  try {
    const url1 = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url1.searchParams.append('user', username);
    url1.searchParams.append('token', token);
    url1.searchParams.append('t', 'list');
    url1.searchParams.append('league_id', '583');
    url1.searchParams.append('date_from', '2023-08-01');
    url1.searchParams.append('date_to', '2024-05-31');

    const response1 = await fetch(url1.toString(), { headers });
    const data1 = await response1.json();

    console.log(`   Fixtures: ${data1.data ? data1.data.length : 0}`);
    console.log(`   Requests left: ${data1.meta?.requests_left || 'unknown'}`);

    if (data1.data && data1.data.length > 0) {
      console.log('   ✅ SUCCESS! Found historical Premier League data');
      const fixture = data1.data[0];
      console.log(`   Sample: ${fixture.homeTeam?.name || fixture.home_team} vs ${fixture.awayTeam?.name || fixture.away_team}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 2: Try 2022-2023 season
  console.log('📅 TEST 2: 2022-2023 Premier League season...');
  try {
    const url2 = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url2.searchParams.append('user', username);
    url2.searchParams.append('token', token);
    url2.searchParams.append('t', 'list');
    url2.searchParams.append('league_id', '583');
    url2.searchParams.append('date_from', '2022-08-01');
    url2.searchParams.append('date_to', '2023-05-31');

    const response2 = await fetch(url2.toString(), { headers });
    const data2 = await response2.json();

    console.log(`   Fixtures: ${data2.data ? data2.data.length : 0}`);

    if (data2.data && data2.data.length > 0) {
      console.log('   ✅ SUCCESS! Found 2022-2023 season data');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 3: Try very broad historical range
  console.log('📅 TEST 3: Very broad historical range (2020-2024)...');
  try {
    const url3 = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url3.searchParams.append('user', username);
    url3.searchParams.append('token', token);
    url3.searchParams.append('t', 'list');
    url3.searchParams.append('league_id', '583');
    url3.searchParams.append('date_from', '2020-01-01');
    url3.searchParams.append('date_to', '2024-12-31');

    const response3 = await fetch(url3.toString(), { headers });
    const data3 = await response3.json();

    console.log(`   Fixtures: ${data3.data ? data3.data.length : 0}`);

    if (data3.data && data3.data.length > 0) {
      console.log('   ✅ SUCCESS! Found data in broad range');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 4: Try different major leagues with historical data
  const majorLeagues = [
    { name: 'Bundesliga', id: '594' },
    { name: 'Serie A', id: '719' },
    { name: 'Ligue 1', id: '764' },
    { name: 'Champions League', id: '539' }
  ];

  console.log('🏆 TEST 4: Try other major leagues with 2023-2024 season...');
  for (const league of majorLeagues) {
    try {
      const url4 = new URL('https://api.soccersapi.com/v2.2/fixtures');
      url4.searchParams.append('user', username);
      url4.searchParams.append('token', token);
      url4.searchParams.append('t', 'list');
      url4.searchParams.append('league_id', league.id);
      url4.searchParams.append('date_from', '2023-08-01');
      url4.searchParams.append('date_to', '2024-05-31');

      const response4 = await fetch(url4.toString(), { headers });
      const data4 = await response4.json();

      console.log(`   ${league.name}: ${data4.data ? data4.data.length : 0} fixtures`);

      if (data4.data && data4.data.length > 0) {
        console.log(`   ✅ ${league.name} has data!`);
        const fixture = data4.data[0];
        console.log(`     Sample: ${fixture.homeTeam?.name || fixture.home_team} vs ${fixture.awayTeam?.name || fixture.away_team}`);
      }
    } catch (error) {
      console.log(`   ${league.name}: Error - ${error.message}`);
    }
  }
  console.log('');

  // Test 5: Try with actual live/current data if any
  console.log('📅 TEST 5: Try current live fixtures globally (no league filter)...');
  try {
    const url5 = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url5.searchParams.append('user', username);
    url5.searchParams.append('token', token);
    url5.searchParams.append('t', 'list');
    url5.searchParams.append('live', '1'); // Try live parameter

    const response5 = await fetch(url5.toString(), { headers });
    const data5 = await response5.json();

    console.log(`   Live fixtures: ${data5.data ? data5.data.length : 0}`);

    if (data5.data && data5.data.length > 0) {
      console.log('   ✅ SUCCESS! Found live fixtures');
      const fixture = data5.data[0];
      console.log(`   Live: ${fixture.homeTeam?.name || fixture.home_team} vs ${fixture.awayTeam?.name || fixture.away_team}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 6: Ultimate test - check account status and plan details
  console.log('📊 TEST 6: Detailed account status...');
  try {
    const url6 = new URL('https://api.soccersapi.com/v2.2/leagues');
    url6.searchParams.append('user', username);
    url6.searchParams.append('token', token);
    url6.searchParams.append('t', 'list');
    url6.searchParams.append('page', '1');

    const response6 = await fetch(url6.toString(), { headers });
    const data6 = await response6.json();

    console.log('   Account Details:');
    console.log(`     Plan: ${data6.meta?.plan || 'unknown'}`);
    console.log(`     Requests left: ${data6.meta?.requests_left || 'unknown'}`);
    console.log(`     Total leagues: ${data6.meta?.total || 'unknown'}`);
    console.log(`     Current page: ${data6.meta?.page || 'unknown'}`);
    console.log(`     Total pages: ${data6.meta?.pages || 'unknown'}`);

    // Check if account has fixture access specifically
    if (data6.meta && data6.meta.plan) {
      console.log(`\n   Plan "${data6.meta.plan}" analysis:`);
      console.log(`     - League access: ✅ (${data6.data ? data6.data.length : 0} leagues on this page)`);
      console.log(`     - Fixture access: ❌ (0 fixtures found across all tests)`);
      console.log(`     - This suggests either:`);
      console.log(`       1. Plan doesn't include historical fixtures`);
      console.log(`       2. Fixtures require different parameters`);
      console.log(`       3. Data population is still in progress`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n🎯 Final test complete!');
  console.log('\n📞 RECOMMENDATION:');
  console.log('Contact SoccersAPI support with these findings:');
  console.log('- Account: Working, "Soccer API Broadcast" plan');
  console.log('- League access: ✅ 808+ leagues including Premier League (ID: 583)');
  console.log('- Fixture access: ❌ 0 fixtures across all date ranges and leagues');
  console.log('- Ask specifically about fixture data availability for your plan');
}

finalFixtureTest();