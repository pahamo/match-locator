#!/usr/bin/env node

/**
 * Simple Score Test
 * Tests adding a single score and calculating league table
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

async function main() {
  console.log('🧪 Testing Simple Score Addition & League Table\n');

  try {
    // Step 1: Find a test fixture
    console.log('📋 Finding a test fixture...');
    const { data: fixtures } = await makeSupabaseRequest('fixtures', 'GET', null, 'competition_id=eq.1&limit=1');

    if (!fixtures || fixtures.length === 0) {
      console.log('❌ No fixtures found in competition 1');
      return;
    }

    const testFixture = fixtures[0];
    console.log(`✅ Using fixture ID ${testFixture.id}: ${testFixture.home_team || 'Home'} vs ${testFixture.away_team || 'Away'}`);

    // Step 2: Add sample score
    console.log('\n⚽ Adding sample score (2-1)...');
    const scoreData = {
      status: 'FINISHED',
      full_time_home_score: 2,
      full_time_away_score: 1,
      half_time_home_score: 1,
      half_time_away_score: 0,
      home_score: 2,  // Legacy compatibility
      away_score: 1,
      winner: 'HOME_TEAM',
      duration: 'REGULAR',
      season: '2025'
    };

    await makeSupabaseRequest(`fixtures?id=eq.${testFixture.id}`, 'PATCH', scoreData);
    console.log('✅ Score added successfully');

    // Step 3: Trigger league table calculation
    console.log('\n🏆 Calculating league table...');
    await makeSupabaseRequest('rpc/calculate_league_standings', 'POST', {
      comp_id: 1,  // Premier League
      season_str: '2025'
    });
    console.log('✅ League table calculation completed');

    // Step 4: Check results
    console.log('\n📊 Checking league table results...');
    const { data: standings } = await makeSupabaseRequest('league_standings', 'GET', null, 'competition_id=eq.1&season=eq.2025&order=position.asc&limit=5');

    if (standings && standings.length > 0) {
      console.log('✅ League standings found:');
      console.log('   Pos | Team ID | P | W | D | L | GF | GA | Pts');
      console.log('   ----|---------|---|---|---|---|----|----|----');
      standings.forEach(team => {
        const pos = String(team.position || 0).padStart(3, ' ');
        const teamId = String(team.team_id || 0).padStart(7, ' ');
        const p = String(team.played || 0).padStart(2, ' ');
        const w = String(team.won || 0).padStart(2, ' ');
        const d = String(team.drawn || 0).padStart(2, ' ');
        const l = String(team.lost || 0).padStart(2, ' ');
        const gf = String(team.goals_for || 0).padStart(3, ' ');
        const ga = String(team.goals_against || 0).padStart(3, ' ');
        const pts = String(team.points || 0).padStart(3, ' ');
        console.log(`   ${pos} |${teamId} | ${p}| ${w}| ${d}| ${l}|${gf}|${ga}|${pts}`);
      });
    } else {
      console.log('❌ No standings found');
    }

    // Step 5: Test the view (if it exists)
    console.log('\n📋 Testing current_league_tables view...');
    try {
      const { data: viewData } = await makeSupabaseRequest('current_league_tables', 'GET', null, 'competition_id=eq.1&limit=3');
      if (viewData && viewData.length > 0) {
        console.log('✅ View working correctly:');
        viewData.forEach(team => {
          console.log(`   ${team.position}. ${team.team_name} - ${team.points} pts`);
        });
      } else {
        console.log('⚠️  View exists but no data returned');
      }
    } catch (error) {
      console.log('❌ View error:', error.message);
      console.log('   Make sure to run setup-functions-and-views.sql');
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}