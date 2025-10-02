#!/usr/bin/env node

/**
 * Debug basic API functionality step by step
 */

import 'dotenv/config';

async function debugAPIBasics() {
  console.log('🔍 Debugging API Basics Step by Step...\n');

  const username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME;
  const token = process.env.REACT_APP_SOCCERSAPI_TOKEN || process.env.SOCCERSAPI_KEY;

  console.log('📋 Credentials Check:');
  console.log(`   Username: ${username ? username.substring(0, 3) + '***' : 'MISSING'}`);
  console.log(`   Token: ${token ? token.substring(0, 8) + '***' : 'MISSING'}`);
  console.log('');

  // Test 1: Basic API connectivity with leagues (we know this works)
  console.log('🧪 TEST 1: Verify basic API connectivity (leagues)...');
  try {
    const url1 = new URL('https://api.soccersapi.com/v2.2/leagues');
    url1.searchParams.append('user', username);
    url1.searchParams.append('token', token);
    url1.searchParams.append('t', 'list');

    console.log(`   URL: ${url1.toString().replace(token, '[TOKEN]')}`);

    const response1 = await fetch(url1.toString());
    const data1 = await response1.json();

    console.log(`   Status: ${response1.status}`);
    console.log(`   Leagues: ${data1.data ? data1.data.length : 0}`);
    console.log(`   Plan: ${data1.meta?.plan || 'unknown'}`);
    console.log(`   Requests left: ${data1.meta?.requests_left || 'unknown'}`);

    if (response1.status !== 200) {
      console.log('   Response body:', JSON.stringify(data1, null, 2));
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 2: Try exact same format but with fixtures
  console.log('🧪 TEST 2: Same format but with fixtures endpoint...');
  try {
    const url2 = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url2.searchParams.append('user', username);
    url2.searchParams.append('token', token);
    url2.searchParams.append('t', 'list');

    console.log(`   URL: ${url2.toString().replace(token, '[TOKEN]')}`);

    const response2 = await fetch(url2.toString());
    const data2 = await response2.json();

    console.log(`   Status: ${response2.status}`);
    console.log(`   Fixtures: ${data2.data ? data2.data.length : 0}`);
    console.log(`   Plan: ${data2.meta?.plan || 'unknown'}`);
    console.log(`   Requests left: ${data2.meta?.requests_left || 'unknown'}`);

    if (data2.data === null || data2.data === undefined) {
      console.log('   Full response:', JSON.stringify(data2, null, 2));
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 3: Try POST instead of GET
  console.log('🧪 TEST 3: Try POST method...');
  try {
    const response3 = await fetch('https://api.soccersapi.com/v2.2/fixtures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        user: username,
        token: token,
        t: 'list'
      })
    });

    const data3 = await response3.json();

    console.log(`   Status: ${response3.status}`);
    console.log(`   Fixtures: ${data3.data ? data3.data.length : 0}`);

    if (data3.data && data3.data.length > 0) {
      console.log('   ✅ SUCCESS! POST method worked');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 4: Check if we need to use 'feed' parameter
  console.log('🧪 TEST 4: Try with feed parameter...');
  try {
    const url4 = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url4.searchParams.append('user', username);
    url4.searchParams.append('token', token);
    url4.searchParams.append('t', 'list');
    url4.searchParams.append('feed', 'fixtures');

    const response4 = await fetch(url4.toString());
    const data4 = await response4.json();

    console.log(`   Status: ${response4.status}`);
    console.log(`   Fixtures: ${data4.data ? data4.data.length : 0}`);

    if (data4.data && data4.data.length > 0) {
      console.log('   ✅ SUCCESS! Feed parameter worked');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 5: Try different API format altogether
  console.log('🧪 TEST 5: Try different API format (maybe they use different structure)...');
  try {
    const url5 = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url5.searchParams.append('user', username);
    url5.searchParams.append('token', token);
    url5.searchParams.append('action', 'get');
    url5.searchParams.append('format', 'json');

    const response5 = await fetch(url5.toString());
    const data5 = await response5.json();

    console.log(`   Status: ${response5.status}`);
    console.log(`   Response type: ${typeof data5}`);
    console.log(`   Response keys: ${Object.keys(data5)}`);

    if (response5.status === 200) {
      console.log('   ✅ Different format got 200 status');
      console.log('   Sample response:', JSON.stringify(data5, null, 2).substring(0, 500));
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 6: Test different base URLs
  console.log('🧪 TEST 6: Try alternative base URLs...');
  const baseUrls = [
    'https://api.soccersapi.com/v2.1/fixtures',
    'https://api.soccersapi.com/v2/fixtures',
    'https://soccersapi.com/api/v2.2/fixtures'
  ];

  for (const baseUrl of baseUrls) {
    try {
      const url = new URL(baseUrl);
      url.searchParams.append('user', username);
      url.searchParams.append('token', token);
      url.searchParams.append('t', 'list');

      const response = await fetch(url.toString());
      const data = await response.json();

      console.log(`   ${baseUrl}: Status ${response.status}, Fixtures: ${data.data ? data.data.length : 0}`);

      if (data.data && data.data.length > 0) {
        console.log(`   ✅ SUCCESS! ${baseUrl} worked`);
      }
    } catch (error) {
      console.log(`   ${baseUrl}: Error - ${error.message}`);
    }
  }

  console.log('\n🎯 Debug complete!');
}

debugAPIBasics();