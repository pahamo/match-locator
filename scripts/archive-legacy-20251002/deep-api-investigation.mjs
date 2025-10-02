#!/usr/bin/env node

/**
 * Deep investigation of SoccersAPI - check pagination, different endpoints, etc.
 */

import 'dotenv/config';

async function investigateAPI() {
  console.log('🕵️ Deep API Investigation...\n');

  const username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME;
  const token = process.env.REACT_APP_SOCCERSAPI_TOKEN || process.env.SOCCERSAPI_KEY;

  if (!username || !token) {
    console.error('❌ Missing credentials');
    process.exit(1);
  }

  // Test 1: Check pagination on leagues
  console.log('📄 TEST 1: Check if leagues endpoint has pagination...');
  try {
    const url1 = new URL('https://api.soccersapi.com/v2.2/leagues');
    url1.searchParams.append('user', username);
    url1.searchParams.append('token', token);
    url1.searchParams.append('t', 'list');

    const response1 = await fetch(url1.toString());
    const data1 = await response1.json();

    console.log('🔍 Full API Response Structure:');
    console.log(JSON.stringify(data1, null, 2));

    console.log('\n📊 Response Meta Info:');
    if (data1.meta) {
      console.log(`   Pages: ${data1.meta.pages || 'N/A'}`);
      console.log(`   Current Page: ${data1.meta.page || 'N/A'}`);
      console.log(`   Count: ${data1.meta.count || 'N/A'}`);
      console.log(`   Total: ${data1.meta.total || 'N/A'}`);
    }

    const leagues = data1.data || [];
    console.log(`   Leagues returned: ${leagues.length}`);

  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
  }

  // Test 2: Try page 2 if pagination exists
  console.log('\n📄 TEST 2: Try page 2...');
  try {
    const url2 = new URL('https://api.soccersapi.com/v2.2/leagues');
    url2.searchParams.append('user', username);
    url2.searchParams.append('token', token);
    url2.searchParams.append('t', 'list');
    url2.searchParams.append('page', '2');

    const response2 = await fetch(url2.toString());
    const data2 = await response2.json();

    if (data2.data && data2.data.length > 0) {
      console.log(`✅ Page 2 has ${data2.data.length} leagues!`);
      console.log('📋 Sample from page 2:');
      data2.data.slice(0, 5).forEach(league => {
        console.log(`   • ${league.name} (${league.country_name})`);
      });
    } else {
      console.log('❌ Page 2 is empty or doesn\'t exist');
    }

  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }

  // Test 3: Try direct search for English Premier League
  console.log('\n🔍 TEST 3: Direct search for "English Premier League"...');
  try {
    const url3 = new URL('https://api.soccersapi.com/v2.2/leagues');
    url3.searchParams.append('user', username);
    url3.searchParams.append('token', token);
    url3.searchParams.append('t', 'list');
    url3.searchParams.append('search', 'Premier League');

    const response3 = await fetch(url3.toString());
    const data3 = await response3.json();

    console.log('🔍 Search results:');
    console.log(JSON.stringify(data3, null, 2));

  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
  }

  // Test 4: Try different API version
  console.log('\n🔄 TEST 4: Try API v2.1...');
  try {
    const url4 = new URL('https://api.soccersapi.com/v2.1/leagues');
    url4.searchParams.append('user', username);
    url4.searchParams.append('token', token);
    url4.searchParams.append('t', 'list');

    const response4 = await fetch(url4.toString());
    const data4 = await response4.json();

    const leagues4 = data4.data || [];
    console.log(`📊 v2.1 returned ${leagues4.length} leagues`);

    // Quick check for EPL
    const epl = leagues4.find(l =>
      l.name.toLowerCase().includes('premier') &&
      (l.country_name?.toLowerCase().includes('england') || l.cc === 'gb' || l.cc === 'en')
    );

    if (epl) {
      console.log(`✅ Found EPL in v2.1: ${epl.name} (ID: ${epl.id})`);
    } else {
      console.log('❌ No EPL in v2.1 either');
    }

  } catch (error) {
    console.error('❌ Test 4 failed:', error.message);
  }

  // Test 5: Try getting fixtures without league filter to see what leagues have data
  console.log('\n⚽ TEST 5: Check what fixtures are actually available today...');
  try {
    const url5 = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url5.searchParams.append('user', username);
    url5.searchParams.append('token', token);
    url5.searchParams.append('t', 'list');
    url5.searchParams.append('date_from', '2025-09-27');
    url5.searchParams.append('date_to', '2025-09-27');

    const response5 = await fetch(url5.toString());
    const data5 = await response5.json();

    const fixtures = data5.data || [];
    console.log(`📊 Found ${fixtures.length} fixtures for today`);

    if (fixtures.length > 0) {
      console.log('🏆 Leagues with fixtures today:');
      const leagueNames = [...new Set(fixtures.map(f => f.league?.name || 'Unknown'))];
      leagueNames.forEach(name => {
        console.log(`   • ${name}`);
      });
    }

  } catch (error) {
    console.error('❌ Test 5 failed:', error.message);
  }

  // Test 6: Try a broader date range for fixtures
  console.log('\n📅 TEST 6: Check fixtures for this week...');
  try {
    const url6 = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url6.searchParams.append('user', username);
    url6.searchParams.append('token', token);
    url6.searchParams.append('t', 'list');
    url6.searchParams.append('date_from', '2025-09-25');
    url6.searchParams.append('date_to', '2025-10-01');

    const response6 = await fetch(url6.toString());
    const data6 = await response6.json();

    const fixtures = data6.data || [];
    console.log(`📊 Found ${fixtures.length} fixtures for this week`);

    if (fixtures.length > 0) {
      console.log('🏆 Leagues with fixtures this week:');
      const leagueData = fixtures.map(f => ({
        name: f.league?.name || 'Unknown',
        country: f.league?.country || 'Unknown'
      }));

      const uniqueLeagues = leagueData.reduce((acc, curr) => {
        const key = `${curr.name} (${curr.country})`;
        if (!acc.has(key)) {
          acc.set(key, true);
        }
        return acc;
      }, new Map());

      [...uniqueLeagues.keys()].forEach(league => {
        console.log(`   • ${league}`);
      });
    }

  } catch (error) {
    console.error('❌ Test 6 failed:', error.message);
  }

  console.log('\n🎯 Investigation complete!');
}

investigateAPI();