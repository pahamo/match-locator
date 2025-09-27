#!/usr/bin/env node

/**
 * Quick test of SoccersApiService with correct authentication
 */

import dotenv from 'dotenv';
dotenv.config();

// Simple test with fetch
async function testDirectAPI() {
  const user = process.env.SOCCERSAPI_USERNAME;
  const token = process.env.SOCCERSAPI_KEY;

  console.log('🧪 Testing direct API call...');
  console.log(`🔑 User: ${user}`);
  console.log(`🔑 Token: ${token?.substring(0, 5)}...`);

  const url = `https://api.soccersapi.com/v2.2/leagues/?user=${user}&token=${token}&t=list`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log('📊 Status:', response.status);
    if (response.ok) {
      console.log('✅ API working!');
      console.log('📝 Requests left:', data.meta?.requests_left);
      console.log('📊 Found leagues:', data.data?.length);
    } else {
      console.log('❌ API error:', data);
    }
  } catch (error) {
    console.error('💥 Request failed:', error.message);
  }
}

testDirectAPI();