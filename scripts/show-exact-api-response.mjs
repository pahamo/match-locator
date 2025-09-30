#!/usr/bin/env node

/**
 * Show exact API response structure for fixtures
 */

import 'dotenv/config';

async function showExactAPIResponse() {
  console.log('📋 Showing Exact API Response Structure...\n');

  const username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME;
  const token = process.env.REACT_APP_SOCCERSAPI_TOKEN || process.env.SOCCERSAPI_KEY;

  // Test 1: Fixtures endpoint - show complete response
  console.log('🔍 FIXTURES ENDPOINT - Complete Response:');
  try {
    const url = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url.searchParams.append('user', username);
    url.searchParams.append('token', token);
    url.searchParams.append('t', 'list');
    url.searchParams.append('league_id', '583'); // Premier League
    url.searchParams.append('date_from', '2023-08-01');
    url.searchParams.append('date_to', '2024-05-31');

    console.log(`URL: ${url.toString().replace(token, '[TOKEN]')}\n`);

    const response = await fetch(url.toString());
    const data = await response.json();

    console.log('='.repeat(80));
    console.log('COMPLETE API RESPONSE:');
    console.log('='.repeat(80));
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(80));

    console.log('\nRESPONSE ANALYSIS:');
    console.log(`- HTTP Status: ${response.status}`);
    console.log(`- Response Type: ${typeof data}`);
    console.log(`- Top-level keys: [${Object.keys(data).join(', ')}]`);

    if (data.meta) {
      console.log(`- Meta object keys: [${Object.keys(data.meta).join(', ')}]`);
      console.log(`- Plan: ${data.meta.plan}`);
      console.log(`- Requests Left: ${data.meta.requests_left}`);
      console.log(`- Pages: ${data.meta.pages}`);
      console.log(`- Count: ${data.meta.count}`);
      console.log(`- Total: ${data.meta.total}`);
      console.log(`- Message: ${data.meta.msg || 'null'}`);
    }

    if (data.data) {
      console.log(`- Data array length: ${data.data.length}`);
      console.log(`- Data type: ${Array.isArray(data.data) ? 'Array' : typeof data.data}`);
    } else {
      console.log(`- Data field: ${data.data} (${typeof data.data})`);
    }

    if (data.error) {
      console.log(`- Error: ${JSON.stringify(data.error)}`);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
  console.log('\n');

  // Test 2: Leagues endpoint for comparison (we know this works)
  console.log('🔍 LEAGUES ENDPOINT - For Comparison:');
  try {
    const url = new URL('https://api.soccersapi.com/v2.2/leagues');
    url.searchParams.append('user', username);
    url.searchParams.append('token', token);
    url.searchParams.append('t', 'list');
    url.searchParams.append('page', '3'); // Page 3 has Premier League

    const response = await fetch(url.toString());
    const data = await response.json();

    console.log('='.repeat(80));
    console.log('LEAGUES RESPONSE (First 2 items):');
    console.log('='.repeat(80));
    if (data.data && data.data.length > 0) {
      console.log(JSON.stringify({
        meta: data.meta,
        data: data.data.slice(0, 2),
        totalDataItems: data.data.length
      }, null, 2));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Leagues request failed:', error.message);
  }
  console.log('\n');

  // Test 3: Teams endpoint
  console.log('🔍 TEAMS ENDPOINT - Check if this has data:');
  try {
    const url = new URL('https://api.soccersapi.com/v2.2/teams');
    url.searchParams.append('user', username);
    url.searchParams.append('token', token);
    url.searchParams.append('t', 'list');
    url.searchParams.append('league_id', '583'); // Premier League

    const response = await fetch(url.toString());
    const data = await response.json();

    console.log('='.repeat(80));
    console.log('TEAMS RESPONSE:');
    console.log('='.repeat(80));
    if (data.data && data.data.length > 0) {
      console.log(JSON.stringify({
        meta: data.meta,
        data: data.data.slice(0, 2),
        totalDataItems: data.data.length
      }, null, 2));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Teams request failed:', error.message);
  }
  console.log('\n');

  // Test 4: Seasons endpoint
  console.log('🔍 SEASONS ENDPOINT:');
  try {
    const url = new URL('https://api.soccersapi.com/v2.2/seasons');
    url.searchParams.append('user', username);
    url.searchParams.append('token', token);
    url.searchParams.append('t', 'list');
    url.searchParams.append('league_id', '583'); // Premier League

    const response = await fetch(url.toString());
    const data = await response.json();

    console.log('='.repeat(80));
    console.log('SEASONS RESPONSE:');
    console.log('='.repeat(80));
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Seasons request failed:', error.message);
  }

  console.log('\n🎯 Analysis complete!');
}

showExactAPIResponse();