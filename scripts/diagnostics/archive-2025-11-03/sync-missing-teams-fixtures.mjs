#!/usr/bin/env node

/**
 * Sync fixtures for the 7 teams that were missing Sportmonks IDs
 *
 * This fetches Premier League fixtures for:
 * - Bournemouth, Brighton, Man City, Man United, Forest, Tottenham, Wolves
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SPORTMONKS_TOKEN) {
  console.error('❌ Missing credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const PREMIER_LEAGUE_ID = 8; // Sportmonks Premier League ID

async function syncTeamFixtures() {
  console.log('🔄 Syncing Premier League fixtures for teams...\n');

  // Fetch fixtures by date range (season start to end of current season)
  const startDate = '2024-08-01'; // PL 2024/25 season started in August
  const endDate = '2025-06-30';   // Season ends in May

  console.log(`📥 Fetching PL fixtures from ${startDate} to ${endDate}...\n`);

  const allFixtures = [];

  // Fetch fixtures by date (need to paginate through months)
  const dates = [
    '2024-08-01', '2024-09-01', '2024-10-01', '2024-11-01', '2024-12-01',
    '2025-01-01', '2025-02-01', '2025-03-01', '2025-04-01', '2025-05-01'
  ];

  for (const dateStart of dates) {
    const dateEnd = new Date(dateStart);
    dateEnd.setMonth(dateEnd.getMonth() + 1);
    const dateEndStr = dateEnd.toISOString().split('T')[0];

    console.log(`   Fetching ${dateStart}...`);

    const fixturesUrl = `https://api.sportmonks.com/v3/football/fixtures/between/${dateStart}/${dateEndStr}?api_token=${SPORTMONKS_TOKEN}&filters=fixtureLeagues:${PREMIER_LEAGUE_ID}&include=participants,round,scores,state,tvstations.tvstation`;

    const fixturesRes = await fetch(fixturesUrl);
    const fixturesData = await fixturesRes.json();

    if (fixturesData.data && Array.isArray(fixturesData.data)) {
      allFixtures.push(...fixturesData.data);
      console.log(`      Found ${fixturesData.data.length} fixtures`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  const fixtures = allFixtures;
  console.log(`\n✅ Total fixtures fetched: ${fixtures.length}\n`);

  // Get our team IDs
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, name, sportmonks_team_id')
    .in('slug', ['bournemouth', 'brighton', 'man-city', 'man-united', 'forest', 'tottenham', 'wolves']);

  if (teamsError) {
    console.error('❌ Error fetching teams:', teamsError);
    return;
  }

  const teamBySportmonksId = new Map(teams.map(t => [t.sportmonks_team_id, t]));
  console.log(`✅ Found ${teams.length} teams in database\n`);

  // Filter fixtures for our teams
  const relevantFixtures = fixtures.filter(fx => {
    const homeId = fx.participants?.find(p => p.meta?.location === 'home')?.id;
    const awayId = fx.participants?.find(p => p.meta?.location === 'away')?.id;
    return teamBySportmonksId.has(homeId) || teamBySportmonksId.has(awayId);
  });

  console.log(`✅ Found ${relevantFixtures.length} relevant fixtures for our teams\n`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const fx of relevantFixtures) {
    const homeParticipant = fx.participants?.find(p => p.meta?.location === 'home');
    const awayParticipant = fx.participants?.find(p => p.meta?.location === 'away');

    if (!homeParticipant || !awayParticipant) {
      console.log(`⚠️  Skipping fixture ${fx.id} - missing participants`);
      skipped++;
      continue;
    }

    const homeTeam = teamBySportmonksId.get(homeParticipant.id);
    const awayTeam = teamBySportmonksId.get(awayParticipant.id);

    if (!homeTeam || !awayTeam) {
      skipped++;
      continue; // One team is not in our target list
    }

    // Get broadcaster
    const broadcaster = fx.tvstations?.[0]?.tvstation?.name || null;
    const broadcasterId = fx.tvstations?.[0]?.tvstation?.id || null;

    // Get scores
    const homeScore = fx.scores?.find(s => s.description === 'CURRENT' && s.participant_id === homeParticipant.id)?.score?.goals;
    const awayScore = fx.scores?.find(s => s.description === 'CURRENT' && s.participant_id === awayParticipant.id)?.score?.goals;

    const fixtureData = {
      sportmonks_fixture_id: fx.id,
      competition_id: 1, // Premier League in our DB
      home_team_id: homeTeam.id,
      away_team_id: awayTeam.id,
      utc_kickoff: fx.starting_at,
      venue: fx.venue_id ? String(fx.venue_id) : null,
      status: fx.state?.state || 'scheduled',
      round: fx.round || null,
      stage: fx.stage || null,
      home_score: homeScore !== undefined ? homeScore : null,
      away_score: awayScore !== undefined ? awayScore : null,
      broadcaster: broadcaster,
      broadcaster_id: broadcasterId
    };

    // Check if fixture exists
    const { data: existing } = await supabase
      .from('fixtures')
      .select('id')
      .eq('sportmonks_fixture_id', fx.id)
      .single();

    if (existing) {
      // Update
      const { error } = await supabase
        .from('fixtures')
        .update(fixtureData)
        .eq('id', existing.id);

      if (error) {
        console.error(`❌ Error updating fixture ${fx.id}:`, error.message);
      } else {
        updated++;
      }
    } else {
      // Insert
      const { error } = await supabase
        .from('fixtures')
        .insert(fixtureData);

      if (error) {
        console.error(`❌ Error inserting fixture ${fx.id}:`, error.message);
      } else {
        inserted++;
        console.log(`✅ Inserted: ${homeTeam.name} vs ${awayTeam.name} (${new Date(fx.starting_at).toLocaleDateString()})`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Sync Summary:');
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log('='.repeat(60));
}

syncTeamFixtures().catch(console.error);
