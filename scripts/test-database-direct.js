#!/usr/bin/env node

/**
 * Direct Database Test
 * Tests the score system using Supabase client directly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  console.log('🧪 Testing Score System with Supabase Client\n');

  try {
    // Step 1: Find a test fixture
    console.log('📋 Finding a Premier League fixture...');
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('competition_id', 1)
      .limit(1);

    if (fixturesError) {
      console.log('❌ Error fetching fixtures:', fixturesError);
      return;
    }

    if (!fixtures || fixtures.length === 0) {
      console.log('❌ No fixtures found in competition 1');
      return;
    }

    const testFixture = fixtures[0];
    console.log(`✅ Using fixture ID ${testFixture.id}`);
    console.log(`   Competition: ${testFixture.competition_id}`);
    console.log(`   Season: ${testFixture.season}`);
    console.log(`   Status: ${testFixture.status}`);
    console.log(`   Current scores: ${testFixture.home_score}-${testFixture.away_score}`);

    // Step 2: Add sample score
    console.log('\n⚽ Adding sample score (3-1)...');
    const scoreData = {
      status: 'FINISHED',
      full_time_home_score: 3,
      full_time_away_score: 1,
      half_time_home_score: 2,
      half_time_away_score: 0,
      home_score: 3,  // Legacy compatibility
      away_score: 1,
      winner: 'HOME_TEAM',
      duration: 'REGULAR',
      season: testFixture.season || '2025'
    };

    const { error: updateError } = await supabase
      .from('fixtures')
      .update(scoreData)
      .eq('id', testFixture.id);

    if (updateError) {
      console.log('❌ Error updating fixture:', updateError);
      return;
    }

    console.log('✅ Score added successfully');

    // Step 3: Verify the update
    console.log('\n📋 Verifying score update...');
    const { data: updatedFixture, error: verifyError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('id', testFixture.id)
      .single();

    if (verifyError) {
      console.log('❌ Error verifying update:', verifyError);
      return;
    }

    console.log('✅ Updated fixture verified:');
    console.log(`   Full-time: ${updatedFixture.full_time_home_score}-${updatedFixture.full_time_away_score}`);
    console.log(`   Half-time: ${updatedFixture.half_time_home_score}-${updatedFixture.half_time_away_score}`);
    console.log(`   Winner: ${updatedFixture.winner}`);
    console.log(`   Legacy scores: ${updatedFixture.home_score}-${updatedFixture.away_score}`);

    // Step 4: Test league table calculation
    console.log('\n🏆 Testing league table calculation...');
    try {
      const { error: rpcError } = await supabase.rpc('calculate_league_standings', {
        comp_id: 1,
        season_str: testFixture.season || '2025'
      });

      if (rpcError) {
        console.log('❌ RPC Error:', rpcError.message);
        console.log('   Make sure setup-functions-and-views.sql was run');
      } else {
        console.log('✅ League table calculation completed');
      }
    } catch (rpcCatchError) {
      console.log('❌ RPC Catch Error:', rpcCatchError.message);
    }

    // Step 5: Check league standings
    console.log('\n📊 Checking league standings...');
    const { data: standings, error: standingsError } = await supabase
      .from('league_standings')
      .select('*')
      .eq('competition_id', 1)
      .eq('season', testFixture.season || '2025')
      .order('position', { ascending: true })
      .limit(5);

    if (standingsError) {
      console.log('❌ Standings error:', standingsError.message);
      console.log('   Make sure setup-league-standings.sql was run');
    } else if (standings && standings.length > 0) {
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
      console.log('⚠️  No standings found (this is normal for first test)');
    }

    // Step 6: Test the view
    console.log('\n📋 Testing current_league_tables view...');
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('current_league_tables')
        .select('*')
        .eq('competition_id', 1)
        .limit(3);

      if (viewError) {
        console.log('❌ View error:', viewError.message);
        console.log('   Make sure setup-functions-and-views.sql was run');
      } else if (viewData && viewData.length > 0) {
        console.log('✅ View working correctly:');
        viewData.forEach(team => {
          console.log(`   ${team.position}. ${team.team_name || 'Team ' + team.team_id} - ${team.points} pts (${team.played} played)`);
        });
      } else {
        console.log('⚠️  View exists but no data (season might not match)');
      }
    } catch (viewCatchError) {
      console.log('❌ View catch error:', viewCatchError.message);
    }

    console.log('\n🎉 Database test completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Fixture score update: Working');
    console.log('   ✅ New score columns: Working');
    console.log('   ✅ Database structure: Ready for scores');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}