#!/usr/bin/env node

/**
 * Test broadcast data from SoccersAPI
 */

import dotenv from 'dotenv';
dotenv.config();

async function testBroadcastEndpoints() {
  const user = process.env.SOCCERSAPI_USERNAME;
  const token = process.env.SOCCERSAPI_KEY;

  console.log('🎬 Testing broadcast endpoints...');

  // First, get some fixtures to test broadcasts
  console.log('\n1️⃣ Getting recent fixtures...');
  const fixturesUrl = `https://api.soccersapi.com/v2.2/fixtures/?user=${user}&token=${token}&t=list&date_from=2025-09-25&date_to=2025-09-27`;

  try {
    const response = await fetch(fixturesUrl);
    const data = await response.json();

    if (response.ok && data.data?.length > 0) {
      console.log(`✅ Found ${data.data.length} fixtures`);
      console.log(`📝 Requests left: ${data.meta?.requests_left}`);

      // Test broadcast endpoint for first fixture
      const testFixture = data.data[0];
      console.log(`\n2️⃣ Testing broadcasts for fixture: ${testFixture.home_team?.name} vs ${testFixture.away_team?.name}`);

      const broadcastUrl = `https://api.soccersapi.com/v2.2/fixtures/${testFixture.id}/broadcasts/?user=${user}&token=${token}&t=list`;

      const broadcastResponse = await fetch(broadcastUrl);
      const broadcastData = await broadcastResponse.json();

      if (broadcastResponse.ok) {
        console.log('✅ Broadcasts endpoint working!');
        console.log(`📊 Found ${broadcastData.data?.length || 0} broadcast entries`);
        console.log(`📝 Requests left: ${broadcastData.meta?.requests_left}`);

        if (broadcastData.data?.length > 0) {
          console.log('\n📺 Sample broadcast data:');
          console.log(JSON.stringify(broadcastData.data[0], null, 2));
        }
      } else {
        console.log('❌ Broadcasts endpoint failed:', broadcastData);
      }

    } else {
      console.log('❌ No fixtures found:', data);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testBroadcastEndpoints();