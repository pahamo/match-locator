#!/usr/bin/env node

/**
 * Explore SoccersAPI endpoints to understand data structure
 */

import dotenv from 'dotenv';
dotenv.config();

async function exploreAPI() {
  const user = process.env.SOCCERSAPI_USERNAME;
  const token = process.env.SOCCERSAPI_KEY;

  console.log('🔍 Exploring SoccersAPI endpoints...');

  // Test different endpoints
  const endpoints = [
    '/leagues',
    '/competitions',
    '/fixtures?date_from=2025-09-20&date_to=2025-09-30',
    '/fixtures?date_from=2025-09-27&date_to=2025-09-27',
    '/fixtures?league_id=39', // Try Premier League if it exists
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📡 Testing: ${endpoint}`);

    const url = `https://api.soccersapi.com/v2.2${endpoint}${endpoint.includes('?') ? '&' : '?'}user=${user}&token=${token}&t=list`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        console.log('✅ Success!');
        console.log(`📊 Count: ${data.meta?.count || 0}`);
        console.log(`📝 Requests left: ${data.meta?.requests_left}`);

        if (data.data && data.data.length > 0) {
          console.log('📄 Sample data:');
          console.log(JSON.stringify(data.data[0], null, 2));
        }
      } else {
        console.log('❌ Failed:', data.message || 'Unknown error');
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error('💥 Error:', error.message);
    }
  }
}

exploreAPI();