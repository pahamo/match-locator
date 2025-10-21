/**
 * Sync UK Broadcaster Data for Upcoming Fixtures
 *
 * Purpose:
 *   Fetches UK broadcaster data from SportMonks API and syncs to the database
 *   for upcoming fixtures. Works across all competitions (Premier League,
 *   Champions League, FA Cup, etc.).
 *
 * Usage:
 *   # Sync specific competition
 *   node scripts/sync-upcoming-broadcasters.mjs --competition-id=2
 *
 *   # Sync all active competitions
 *   node scripts/sync-upcoming-broadcasters.mjs
 *
 * What it syncs:
 *   - UK TV broadcasters only (country_id: 11, 455, 462)
 *   - Filters out Irish ROI-specific channels
 *   - Only upcoming fixtures (not past matches)
 *   - Skips fixtures that already have broadcaster data
 *
 * What it does NOT sync:
 *   - Fixture dates, scores, teams (use sync-sportmonks-fixtures.mjs)
 *   - Past fixtures (only upcoming)
 *
 * When to use:
 *   - Broadcaster announcements are released for upcoming matches
 *   - Quick update for next few weeks of fixtures
 *   - After running sync-sportmonks-fixtures.mjs to add broadcaster data
 *
 * Data source:
 *   SportMonks Football API - TV Stations endpoint
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

// Parse command line args
const args = process.argv.slice(2);
let competitionIds = [];

args.forEach(arg => {
  if (arg.startsWith('--competition-id=')) {
    const id = parseInt(arg.split('=')[1], 10);
    if (!isNaN(id)) competitionIds.push(id);
  }
});

// If no competition specified, sync all active competitions
if (competitionIds.length === 0) {
  const { data: competitions } = await supabase
    .from('api_competition_mapping')
    .select('our_competition_id')
    .eq('is_active', true);

  competitionIds = (competitions || []).map(c => c.our_competition_id);
}

console.log(`🔄 Syncing broadcaster data for ${competitionIds.length} competition(s)...\n`);

let totalSynced = 0;
let totalSkipped = 0;
let totalErrors = 0;

for (const competitionId of competitionIds) {
  // Get competition name
  const { data: comp } = await supabase
    .from('competitions')
    .select('name')
    .eq('id', competitionId)
    .single();

  const compName = comp?.name || `Competition ${competitionId}`;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📺 ${compName} (ID: ${competitionId})`);
  console.log('='.repeat(60));

  // Get all upcoming fixtures for this competition that need broadcaster data
  const { data: fixtures, error: fixturesError } = await supabase
    .from('fixtures')
    .select('id, sportmonks_fixture_id, home_team_id, away_team_id, utc_kickoff, round')
    .eq('competition_id', competitionId)
    .gte('utc_kickoff', new Date().toISOString())
    .not('sportmonks_fixture_id', 'is', null)
    .order('utc_kickoff')
    .limit(50);

  if (fixturesError) {
    console.error('Error fetching fixtures:', fixturesError);
    totalErrors++;
    continue;
  }

  console.log(`\nFound ${fixtures.length} upcoming fixtures\n`);

  let synced = 0;
  let skipped = 0;
  let errors = 0;

  for (const fixture of fixtures) {
    const roundName = fixture.round?.name || '?';
    const date = new Date(fixture.utc_kickoff).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    });

    // Check if we already have broadcasts for this fixture
    const { data: existingBroadcasts } = await supabase
      .from('broadcasts')
      .select('id')
      .eq('fixture_id', fixture.id);

    if (existingBroadcasts && existingBroadcasts.length > 0) {
      console.log(`⏭️  Fixture ${fixture.id} (${roundName}, ${date}) - Already has broadcasts`);
      skipped++;
      continue;
    }

    // Fetch TV stations from SportMonks
    const url = `https://api.sportmonks.com/v3/football/fixtures/${fixture.sportmonks_fixture_id}?api_token=${SPORTMONKS_TOKEN}&include=tvstations.tvstation`;

    try {
      const response = await fetch(url);
      const json = await response.json();

      if (!json.data) {
        console.log(`⚠️  Fixture ${fixture.id} (${roundName}, ${date}) - No data from API`);
        errors++;
        continue;
      }

      const tvStations = json.data.tvstations || [];

      // Filter for UK broadcasts using ONLY API data
      // Trust country_id from API, filter out obvious non-UK names
      const ukStations = tvStations.filter(ts => {
        if (!ts.tvstation) return false;

        // Include England (462), Ireland (455), and UK (11) country IDs
        if (![11, 455, 462].includes(ts.country_id)) {
          return false;
        }

        const channelName = ts.tvstation.name || '';

        // Filter out Irish-specific channels (have "ROI" in name)
        if (channelName.includes('ROI')) {
          return false;
        }

        // Filter out non-UK international channels by name
        // These channels are sometimes miscategorized under UK country IDs
        const nonUKKeywords = [
          'Germany', 'France', 'Spain', 'Italy', 'Portugal',
          'Netherlands', 'Belgium', 'Austria', 'Switzerland',
          'Poland', 'Turkey', 'Greece', 'Denmark', 'Sweden',
          'Norway', 'Finland', 'Czech', 'Hungary', 'Russia',
          'Ukraine', 'Romania', 'Serbia', 'Croatia', 'Bulgaria',
          'Arabic', 'MENA', 'Asia', 'Africa', 'Latin America'
        ];

        for (const keyword of nonUKKeywords) {
          if (channelName.includes(keyword)) {
            return false;
          }
        }

        return true;
      });

      if (ukStations.length === 0) {
        console.log(`📺 Fixture ${fixture.id} (${roundName}, ${date}) - No UK broadcasters found`);
        synced++;
        continue;
      }

      // Insert broadcasts
      for (const ts of ukStations) {
        const station = ts.tvstation;

        const { error: insertError } = await supabase
          .from('broadcasts')
          .insert({
            fixture_id: fixture.id,
            channel_name: station.name,
            broadcaster_type: station.type || 'tv',
            country_code: 'GB',
            sportmonks_tv_station_id: station.id,
            data_source: 'sportmonks',
            last_synced_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`❌ Error inserting broadcast for fixture ${fixture.id}:`, insertError);
        }
      }

      console.log(`✅ Fixture ${fixture.id} (${roundName}, ${date}) - Synced ${ukStations.length} broadcaster(s)`);
      synced++;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Error fetching fixture ${fixture.id}:`, error.message);
      errors++;
    }
  }

  console.log(`\n${compName} Summary:`);
  console.log(`  Synced: ${synced}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);

  totalSynced += synced;
  totalSkipped += skipped;
  totalErrors += errors;
}

console.log(`\n${'='.repeat(60)}`);
console.log('📊 Overall Summary:');
console.log(`  Total Synced: ${totalSynced}`);
console.log(`  Total Skipped: ${totalSkipped}`);
console.log(`  Total Errors: ${totalErrors}`);
console.log('='.repeat(60));
console.log(`\n✅ Done!`);
