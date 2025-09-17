#!/usr/bin/env node

/**
 * Test Football-Data.org API for match results format
 */

const https = require('https');
require('dotenv').config();

const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_TOKEN;

function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || data}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });
    req.on('error', reject);
  });
}

async function checkFootballDataAPI() {
  console.log('🔍 Checking Football-Data.org API for match results format...');

  if (!FOOTBALL_DATA_API_KEY) {
    console.log('❌ No FOOTBALL_DATA_TOKEN found in .env');
    return;
  }

  try {
    // Get Premier League matches (finished ones)
    const url = 'https://api.football-data.org/v4/competitions/2021/matches?status=FINISHED&limit=3';
    const headers = { 'X-Auth-Token': FOOTBALL_DATA_API_KEY };

    console.log('Fetching finished Premier League matches...');
    const response = await makeRequest(url, headers);

    if (response.matches && response.matches.length > 0) {
      console.log('✅ Found', response.matches.length, 'finished matches');
      console.log('');

      response.matches.forEach((match, i) => {
        console.log(`📊 Match ${i + 1}: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
        console.log('   Status:', match.status);
        console.log('   Score:', match.score?.fullTime?.home || 'N/A', '-', match.score?.fullTime?.away || 'N/A');
        console.log('   Half Time:', match.score?.halfTime?.home || 'N/A', '-', match.score?.halfTime?.away || 'N/A');
        console.log('   Date:', match.utcDate);
        console.log('   Available score data:');
        if (match.score) {
          Object.keys(match.score).forEach(period => {
            console.log('     ', period + ':', match.score[period]);
          });
        }
        console.log('');
      });
    } else {
      console.log('❌ No finished matches found');
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.message.includes('403')) {
      console.log('   Check your API key permissions');
    }
  }
}

if (require.main === module) {
  checkFootballDataAPI().catch(console.error);
}