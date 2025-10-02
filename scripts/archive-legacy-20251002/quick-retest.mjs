#!/usr/bin/env node

/**
 * Quick re-test of different fixture approaches
 */

import 'dotenv/config';

async function quickRetest() {
  console.log('🔄 Quick Re-test of Fixtures...\n');

  const username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME;
  const token = process.env.REACT_APP_SOCCERSAPI_TOKEN || process.env.SOCCERSAPI_KEY;

  const tests = [
    {
      name: 'Current Week',
      params: { date_from: '2024-12-23', date_to: '2024-12-29' }
    },
    {
      name: 'No Date Filter',
      params: {}
    },
    {
      name: 'Different League (Austrian)',
      params: { league_id: '1005', date_from: '2024-08-01', date_to: '2024-12-31' }
    },
    {
      name: 'Live Matches',
      params: { live: '1' }
    }
  ];

  for (const test of tests) {
    console.log(`🧪 ${test.name}:`);

    try {
      const url = new URL('https://api.soccersapi.com/v2.2/fixtures');
      url.searchParams.append('user', username);
      url.searchParams.append('token', token);
      url.searchParams.append('t', 'list');

      Object.entries(test.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString());
      const data = await response.json();

      console.log(`   Status: ${response.status}`);
      console.log(`   Has data field: ${data.data !== undefined ? 'Yes' : 'No'}`);
      console.log(`   Data length: ${data.data ? data.data.length : 'N/A'}`);
      console.log(`   Count: ${data.meta?.count || 'N/A'}`);

      if (data.data && data.data.length > 0) {
        console.log(`   ✅ SUCCESS! Found fixture data`);
        return; // Exit early if we find anything
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }

  console.log('❌ All tests still return no fixture data');
}

quickRetest();