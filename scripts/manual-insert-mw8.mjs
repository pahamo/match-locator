#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// MW8 fixtures from SportMonks API (Round 372202)
const mw8Fixtures = [
  {
    sportmonksId: 19441670,
    home: 'Nottingham Forest',
    away: 'Chelsea',
    kickoff: '2025-10-18 11:30:00'
  },
  {
    sportmonksId: 19441671,
    home: 'Burnley',
    away: 'Leeds United',
    kickoff: '2025-10-18 14:00:00'
  },
  {
    sportmonksId: 19441672,
    home: 'Brighton & Hove Albion',
    away: 'Newcastle United',
    kickoff: '2025-10-18 14:00:00'
  },
  {
    sportmonksId: 19441673,
    home: 'Sunderland',
    away: 'Wolverhampton Wanderers',
    kickoff: '2025-10-18 14:00:00'
  },
  {
    sportmonksId: 19441674,
    home: 'Crystal Palace',
    away: 'AFC Bournemouth',
    kickoff: '2025-10-18 14:00:00'
  },
  {
    sportmonksId: 19441675,
    home: 'Manchester City',
    away: 'Everton',
    kickoff: '2025-10-18 14:00:00'
  },
  {
    sportmonksId: 19441676,
    home: 'Fulham',
    away: 'Arsenal',
    kickoff: '2025-10-18 16:30:00'
  },
  {
    sportmonksId: 19441677,
    home: 'Tottenham Hotspur',
    away: 'Aston Villa',
    kickoff: '2025-10-19 13:00:00'
  },
  {
    sportmonksId: 19441678,
    home: 'Liverpool',
    away: 'Manchester United',
    kickoff: '2025-10-19 15:30:00'
  },
  {
    sportmonksId: 19441679,
    home: 'West Ham United',
    away: 'Brentford',
    kickoff: '2025-10-20 19:00:00'
  }
];

// Helper function to find team by name (matches sync script logic)
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
    return teams[0]; // Use first match
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

console.log('🔄 Manually inserting MW8 fixtures...\n');

for (const fixture of mw8Fixtures) {
  try {
    // Find teams by name
    const homeTeam = await findTeamByName(fixture.home);
    const awayTeam = await findTeamByName(fixture.away);

    if (!homeTeam || !awayTeam) {
      console.log(`⚠️  Skipping ${fixture.home} vs ${fixture.away} - teams not found (home: ${homeTeam?'found':'missing'}, away: ${awayTeam?'found':'missing'})`);
      continue;
    }

    // Check if fixture already exists
    const { data: existing } = await supabase
      .from('fixtures')
      .select('id')
      .eq('sportmonks_fixture_id', fixture.sportmonksId)
      .maybeSingle();

    if (existing) {
      console.log(`✅ Already exists: ${fixture.home} vs ${fixture.away}`);
      continue;
    }

    // Insert fixture
    const { data, error} = await supabase
      .from('fixtures')
      .insert({
        sportmonks_fixture_id: fixture.sportmonksId,
        competition_id: 1,
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        utc_kickoff: fixture.kickoff,
        status: 'NS',
        round: { id: 372202, name: '8' },
        data_source: 'sportmonks',
        last_synced_at: new Date().toISOString(),
        sync_status: 'synced'
      });

    if (error) {
      console.error(`❌ Error: ${fixture.home} vs ${fixture.away}`, error.message);
    } else {
      console.log(`✅ Inserted: ${fixture.home} vs ${fixture.away}`);
    }

  } catch (err) {
    console.error(`❌ Error: ${fixture.home} vs ${fixture.away}`, err.message);
  }
}

console.log('\n✅ Done!');
