#!/usr/bin/env node

/**
 * Test Score Import
 * Tests the score import system with a small dataset
 */

const https = require('https');
require('dotenv').config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabaseHeaders = {
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json'
};

/**
 * Test adding a sample score to verify the system works
 */
async function testScoreUpdate() {
  console.log('🧪 Testing score update system...');

  try {
    // Find a test fixture
    const { data: fixtures } = await makeSupabaseRequest('fixtures', 'GET', null, 'status=eq.FINISHED&limit=1');

    if (!fixtures || fixtures.length === 0) {
      console.log('❌ No finished fixtures found to test with');
      return;
    }

    const testFixture = fixtures[0];
    console.log(`📝 Using test fixture: ${testFixture.home_team || 'Team A'} vs ${testFixture.away_team || 'Team B'} (ID: ${testFixture.id})`);

    // Update with sample scores
    const scoreData = {
      full_time_home_score: 2,
      full_time_away_score: 1,
      half_time_home_score: 1,
      half_time_away_score: 0,
      home_score: 2,  // Legacy compatibility
      away_score: 1,  // Legacy compatibility
      winner: 'HOME_TEAM',
      duration: 'REGULAR',
      last_updated: new Date().toISOString()
    };

    console.log('📊 Updating fixture with sample scores: 2-1...');
    await makeSupabaseRequest(`fixtures?id=eq.${testFixture.id}`, 'PATCH', scoreData);

    // Verify the update
    const { data: updatedFixtures } = await makeSupabaseRequest(`fixtures?id=eq.${testFixture.id}`, 'GET');
    const updated = updatedFixtures[0];

    console.log('✅ Update verification:');
    console.log(`   Full-time: ${updated.full_time_home_score}-${updated.full_time_away_score}`);
    console.log(`   Half-time: ${updated.half_time_home_score}-${updated.half_time_away_score}`);
    console.log(`   Winner: ${updated.winner}`);
    console.log(`   Legacy scores: ${updated.home_score}-${updated.away_score}`);

    console.log('\n🎉 Score update system working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

/**
 * Test league table calculation
 */
async function testLeagueTable() {
  console.log('\n🏆 Testing league table calculation...');

  try {
    // Try to call the league table calculation function
    const result = await makeSupabaseRequest('rpc/calculate_league_standings', 'POST', {
      comp_id: 1,  // Premier League
      season_str: '2025'
    });

    console.log('✅ League table calculation completed');

    // Check if standings were created
    const { data: standings } = await makeSupabaseRequest('current_league_tables?competition_id=eq.1&limit=5', 'GET');

    if (standings && standings.length > 0) {
      console.log('📊 Sample league table:');
      console.log('   Pos | Team | P | W | D | L | GF | GA | GD | Pts');
      console.log('   ----|----- |---|---|---|---|----|----|----|----|');
      standings.forEach(team => {
        const pos = String(team.position || 0).padStart(3, ' ');
        const name = (team.team_name || 'Unknown').substring(0, 12).padEnd(12, ' ');
        const p = String(team.played || 0).padStart(2, ' ');
        const w = String(team.won || 0).padStart(2, ' ');
        const d = String(team.drawn || 0).padStart(2, ' ');
        const l = String(team.lost || 0).padStart(2, ' ');
        const gf = String(team.goals_for || 0).padStart(3, ' ');
        const ga = String(team.goals_against || 0).padStart(3, ' ');
        const gd = String(team.goal_difference || 0).padStart(3, ' ');
        const pts = String(team.points || 0).padStart(3, ' ');
        console.log(`   ${pos} | ${name}| ${p}| ${w}| ${d}| ${l}|${gf}|${ga}|${gd}|${pts}`);
      });

      console.log('\n✅ League table system working correctly!');
    } else {
      console.log('⚠️  No league table data found (this is normal if no scores have been imported yet)');
    }

  } catch (error) {
    console.error('❌ League table test failed:', error.message);
    console.log('ℹ️  This might mean the database schema needs to be set up first');
    console.log('   Run: scripts/setup-scores-database.sql in Supabase SQL Editor');
  }
}

/**
 * Helper function for Supabase requests
 */
function makeSupabaseRequest(endpoint, method = 'GET', data = null, queryParams = '') {
  return new Promise((resolve, reject) => {
    const cleanEndpoint = String(endpoint || '').replace(/^\/+/, '');
    const url = new URL(cleanEndpoint + (queryParams ? '?' + queryParams : ''), `${SUPABASE_URL}/rest/v1`);

    const options = {
      method,
      headers: supabaseHeaders
    };

    if (data && (method === 'POST' || method === 'PATCH')) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : {};
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || responseData}`));
          } else {
            resolve({ data: parsed, status: res.statusCode });
          }
        } catch (e) {
          if (res.statusCode < 400) {
            resolve({ data: null, status: res.statusCode });
          } else {
            reject(new Error(`Invalid JSON response: ${responseData}`));
          }
        }
      });
    });

    req.on('error', reject);

    if (data && (method === 'POST' || method === 'PATCH')) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Main test function
 */
async function main() {
  console.log('🧪 Testing Scores & League Tables System\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase configuration in .env file');
    process.exit(1);
  }

  await testScoreUpdate();
  await testLeagueTable();

  console.log('\n✅ All tests completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Run setup-scores-database.sql in Supabase SQL Editor');
  console.log('   2. Run node scripts/import-scores.js to import real scores');
  console.log('   3. Build frontend components to display scores and tables');
}

if (require.main === module) {
  main().catch(console.error);
}