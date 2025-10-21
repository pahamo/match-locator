#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// MW7 fixtures from SportMonks API (Round 372201) - CORRECT data
const mw7Fixtures = [
  {
    sportmonksId: 19427517,
    home: 'AFC Bournemouth',
    away: 'Fulham',
    kickoff: '2025-10-03 19:00:00'
  },
  {
    sportmonksId: 19427521,
    home: 'Leeds United',
    away: 'Tottenham Hotspur',
    kickoff: '2025-10-04 14:00:00'
  },
  {
    sportmonksId: 19427515,
    home: 'Arsenal',
    away: 'West Ham United',
    kickoff: '2025-10-04 14:00:00'
  },
  {
    sportmonksId: 19427522,
    home: 'Manchester United',
    away: 'Sunderland',
    kickoff: '2025-10-04 14:00:00'
  },
  {
    sportmonksId: 19427519,
    home: 'Chelsea',
    away: 'Liverpool',
    kickoff: '2025-10-04 16:30:00'
  },
  {
    sportmonksId: 19427516,
    home: 'Aston Villa',  // CORRECT: Villa home, Burnley away
    away: 'Burnley',
    kickoff: '2025-10-05 13:00:00'
  },
  {
    sportmonksId: 19427520,
    home: 'Everton',
    away: 'Crystal Palace',
    kickoff: '2025-10-05 13:00:00'
  },
  {
    sportmonksId: 19427523,
    home: 'Newcastle United',
    away: 'Nottingham Forest',
    kickoff: '2025-10-05 13:00:00'
  },
  {
    sportmonksId: 19427524,
    home: 'Wolverhampton Wanderers',
    away: 'Brighton & Hove Albion',
    kickoff: '2025-10-05 13:00:00'
  },
  {
    sportmonksId: 19427518,
    home: 'Brentford',
    away: 'Manchester City',
    kickoff: '2025-10-05 15:30:00'
  }
];

// Helper function to find team by name
async function findTeamByName(teamName) {
  // Try exact match first
  let { data: team } = await supabase
    .from('teams')
    .select('id')
    .ilike('name', teamName)
    .maybeSingle();

  if (team) return team;

  // Try fuzzy match (contains)
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .ilike('name', `%${teamName}%`);

  if (teams && teams.length > 0) {
    console.log(`   📍 Found ${teams.length} matches for "${teamName}": ${teams.map(t => t.name).join(', ')}`);
    return teams[0];
  }

  // Try by slug
  const slug = teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const { data: teamBySlug } = await supabase
    .from('teams')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle();

  if (teamBySlug) {
    console.log(`   📍 Found by slug: ${teamBySlug.name}`);
    return teamBySlug;
  }

  return null;
}

console.log('🔄 Fixing MW7 fixtures...\n');

for (const fixture of mw7Fixtures) {
  try {
    // Find teams by name
    const homeTeam = await findTeamByName(fixture.home);
    const awayTeam = await findTeamByName(fixture.away);

    if (!homeTeam || !awayTeam) {
      console.log(`⚠️  Skipping ${fixture.home} vs ${fixture.away} - teams not found`);
      continue;
    }

    // Check if fixture already exists
    const { data: existing } = await supabase
      .from('fixtures')
      .select('id, home_team_id, away_team_id')
      .eq('sportmonks_fixture_id', fixture.sportmonksId)
      .maybeSingle();

    if (existing) {
      // Check if home/away are correct
      if (existing.home_team_id === homeTeam.id && existing.away_team_id === awayTeam.id) {
        console.log(`✅ Already correct: ${fixture.home} vs ${fixture.away}`);
      } else {
        console.log(`🔧 Fixing reversed: ${fixture.home} vs ${fixture.away}`);
        // Update to correct home/away
        const { error } = await supabase
          .from('fixtures')
          .update({
            home_team_id: homeTeam.id,
            away_team_id: awayTeam.id
          })
          .eq('id', existing.id);

        if (error) {
          console.error(`❌ Error fixing: ${fixture.home} vs ${fixture.away}`, error.message);
        } else {
          console.log(`   ✅ Fixed!`);
        }
      }
      continue;
    }

    // Insert new fixture
    const { error } = await supabase
      .from('fixtures')
      .insert({
        sportmonks_fixture_id: fixture.sportmonksId,
        competition_id: 1,
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        utc_kickoff: fixture.kickoff,
        status: 'FT',
        round: { id: 372201, name: '7' },
        data_source: 'sportmonks',
        last_synced_at: new Date().toISOString(),
        sync_status: 'synced'
      });

    if (error) {
      console.error(`❌ Error inserting: ${fixture.home} vs ${fixture.away}`, error.message);
    } else {
      console.log(`✅ Inserted: ${fixture.home} vs ${fixture.away}`);
    }

  } catch (err) {
    console.error(`❌ Error: ${fixture.home} vs ${fixture.away}`, err.message);
  }
}

console.log('\n✅ Done!');
