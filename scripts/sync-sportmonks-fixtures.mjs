#!/usr/bin/env node

/**
 * Sports Monks Fixtures Sync Pipeline
 *
 * Syncs fixtures and TV broadcast data from Sports Monks API to database
 *
 * Features:
 * - Respects feature flags for safe rollout
 * - Competition filtering (sync only enabled competitions)
 * - Test mode (log only, no database writes)
 * - TV station mapping and broadcast creation
 * - Comprehensive sync logging
 * - Rate limiting (3000/hour)
 *
 * Usage:
 *   node scripts/sync-sportmonks-fixtures.mjs [options]
 *
 * Options:
 *   --competition-id=N    Sync specific competition only
 *   --date-from=YYYY-MM-DD  Start date (default: today)
 *   --date-to=YYYY-MM-DD    End date (default: +30 days)
 *   --dry-run             Test mode (no database writes)
 *   --verbose             Show detailed logs
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Environment validation
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN || process.env.REACT_APP_SPORTMONKS_TOKEN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

if (!SPORTMONKS_TOKEN) {
  console.error('❌ Missing Sports Monks API token');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  competitionId: null,
  dateFrom: null,
  dateTo: null,
  dryRun: args.includes('--dry-run'),
  verbose: args.includes('--verbose')
};

args.forEach(arg => {
  if (arg.startsWith('--competition-id=')) {
    options.competitionId = parseInt(arg.split('=')[1], 10);
  }
  if (arg.startsWith('--date-from=')) {
    options.dateFrom = arg.split('=')[1];
  }
  if (arg.startsWith('--date-to=')) {
    options.dateTo = arg.split('=')[1];
  }
});

// Default date range: today to +30 days
if (!options.dateFrom) {
  options.dateFrom = new Date().toISOString().split('T')[0];
}
if (!options.dateTo) {
  const dateTo = new Date();
  dateTo.setDate(dateTo.getDate() + 30);
  options.dateTo = dateTo.toISOString().split('T')[0];
}

// Feature flags check
const checkFeatureFlags = () => {
  const useSportMonks = process.env.REACT_APP_FF_USE_SPORTMONKS === 'true';
  const enableSync = process.env.REACT_APP_FF_SPORTMONKS_ENABLE_SYNC === 'true';
  const testMode = process.env.REACT_APP_FF_SPORTMONKS_TEST_MODE === 'true';
  const syncCompetitionsEnv = process.env.REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS || '';

  const syncCompetitions = syncCompetitionsEnv
    ? syncCompetitionsEnv.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
    : [];

  return {
    enabled: useSportMonks && enableSync,
    testMode: testMode || options.dryRun,
    syncCompetitions
  };
};

// Sports Monks API helper
const BASE_URL = 'https://api.sportmonks.com/v3/football';

async function makeRequest(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_token', SPORTMONKS_TOKEN);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

// Load competition mappings
async function loadCompetitionMappings() {
  const { data, error } = await supabase
    .from('api_competition_mapping')
    .select('our_competition_id, sportmonks_league_id, sportmonks_league_name')
    .eq('is_active', true);

  if (error) throw error;

  return data.reduce((map, row) => {
    map[row.our_competition_id] = {
      sportmonksId: row.sportmonks_league_id,
      name: row.sportmonks_league_name
    };
    return map;
  }, {});
}

// Load team mappings (create if needed)
async function getOrCreateTeamMapping(sportmonksTeamId, teamData, testMode = false) {
  // Check if team exists with Sports Monks ID
  let { data: existingTeam } = await supabase
    .from('teams')
    .select('id')
    .eq('sportmonks_team_id', sportmonksTeamId)
    .single();

  if (existingTeam) {
    return existingTeam.id;
  }

  // Try to find by exact name match
  let { data: teamByName } = await supabase
    .from('teams')
    .select('id')
    .ilike('name', teamData.name)
    .maybeSingle();

  if (teamByName) {
    // Update with Sports Monks ID (unless in test mode)
    if (!testMode) {
      await supabase
        .from('teams')
        .update({
          sportmonks_team_id: sportmonksTeamId,
          last_synced_at: new Date().toISOString()
        })
        .eq('id', teamByName.id);
    }

    return teamByName.id;
  }

  // Try to find by slug match (in case team exists with different name format)
  const slug = teamData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const { data: teamBySlug } = await supabase
    .from('teams')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (teamBySlug) {
    // Update with Sports Monks ID (unless in test mode)
    if (!testMode) {
      await supabase
        .from('teams')
        .update({
          sportmonks_team_id: sportmonksTeamId,
          last_synced_at: new Date().toISOString()
        })
        .eq('id', teamBySlug.id);
    }

    return teamBySlug.id;
  }

  // In test mode, return mock ID
  if (testMode) {
    return 999999; // Mock team ID for test mode
  }

  // Create new team (slug already calculated above)

  const { data: newTeam, error } = await supabase
    .from('teams')
    .insert({
      name: teamData.name,
      slug: slug,
      sportmonks_team_id: sportmonksTeamId,
      last_synced_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (error) throw error;
  return newTeam.id;
}

// Sync fixtures for a competition
async function syncCompetitionFixtures(competitionId, sportmonksLeagueId, competitionName, stats, flags) {
  console.log(`\n📅 Syncing ${competitionName} (Competition ${competitionId}, Sports Monks ${sportmonksLeagueId})...`);

  try {
    // NEW APPROACH: Fetch fixtures by SEASON and ROUNDS instead of dates
    // This ensures we get ALL fixtures regardless of their dates

    // Step 1: Get the current season for this league
    const leagueResponse = await makeRequest(`/leagues/${sportmonksLeagueId}`, {
      include: 'seasons'
    });

    if (!leagueResponse.data || !leagueResponse.data.seasons) {
      console.log(`   ⚠️  No seasons found for league ${sportmonksLeagueId}`);
      return;
    }

    // Get the most recent season (last in array)
    const currentSeason = leagueResponse.data.seasons[leagueResponse.data.seasons.length - 1];
    console.log(`   Season: ${currentSeason.name} (ID: ${currentSeason.id})`);
    stats.apiCalls++;

    // Step 2: Get all rounds for this season
    const seasonResponse = await makeRequest(`/seasons/${currentSeason.id}`, {
      include: 'rounds'
    });

    if (!seasonResponse.data || !seasonResponse.data.rounds) {
      console.log(`   ⚠️  No rounds found for season ${currentSeason.id}`);
      return;
    }

    const rounds = seasonResponse.data.rounds;
    console.log(`   Found ${rounds.length} rounds`);
    stats.apiCalls++;

    let allLeagueFixtures = [];

    // Step 3: Fetch fixtures for each round
    for (const round of rounds) {
      try {
        const roundResponse = await makeRequest(`/rounds/${round.id}`, {
          include: 'fixtures.participants;fixtures.tvstations.tvstation;fixtures.scores;fixtures.state'
        });

        if (roundResponse.data && roundResponse.data.fixtures) {
          const roundFixtures = roundResponse.data.fixtures;
          allLeagueFixtures = allLeagueFixtures.concat(roundFixtures);

          console.log(`   Round ${round.name}: ${roundFixtures.length} fixtures`);
        }

        stats.apiCalls++;
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        if (options.verbose) {
          console.log(`   Error fetching round ${round.id}:`, err.message);
        }
      }
    }

    const fixtures = allLeagueFixtures;
    console.log(`   Total found: ${fixtures.length} fixtures`);

    if (fixtures.length === 0) {
      return;
    }

    for (const fixture of fixtures) {
      try {
        stats.fixturesProcessed++;

        // Debug: Check fixture structure
        if (!fixture.participants || fixture.participants.length < 2) {
          if (options.verbose) {
            console.log(`   ⚠️  Skipping fixture ${fixture.id}: Missing participants data`);
            console.log(`      Fixture data:`, JSON.stringify(fixture).substring(0, 200));
          }
          stats.fixturesErrors++;
          continue;
        }

        // Get or create team mappings
        const homeTeamId = await getOrCreateTeamMapping(fixture.participants[0].id, {
          name: fixture.participants[0].name
        }, flags.testMode);

        const awayTeamId = await getOrCreateTeamMapping(fixture.participants[1].id, {
          name: fixture.participants[1].name
        }, flags.testMode);

        // Check if fixture exists
        const { data: existingFixture } = await supabase
          .from('fixtures')
          .select('id')
          .eq('sportmonks_fixture_id', fixture.id)
          .single();

        // Store API's round data directly (don't derive matchday)
        // Frontend will use round.name to display "Matchweek X"
        const roundData = fixture.round || null;

        // Extract scores from the scores array - find CURRENT scores for home and away
        // Only store scores if match has started (status is NOT 'NS')
        const fixtureStatus = fixture.state?.state || null;
        const currentScores = fixture.scores?.filter(s => s.description === 'CURRENT') || [];
        const homeScore = currentScores.find(s => s.score?.participant === 'home')?.score?.goals;
        const awayScore = currentScores.find(s => s.score?.participant === 'away')?.score?.goals;

        // Use the scores only if found AND match has started (status is not NS)
        const finalHomeScore = (homeScore !== undefined && fixtureStatus !== 'NS') ? homeScore : null;
        const finalAwayScore = (awayScore !== undefined && fixtureStatus !== 'NS') ? awayScore : null;

        const fixtureData = {
          utc_kickoff: fixture.starting_at,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          competition_id: competitionId,
          round: roundData,  // Store full round object from API
          home_score: finalHomeScore,
          away_score: finalAwayScore,
          status: fixtureStatus,
          sportmonks_fixture_id: fixture.id,
          data_source: 'sportmonks',
          last_synced_at: new Date().toISOString(),
          sync_status: 'synced'
        };

        let fixtureDbId;

        if (flags.testMode) {
          console.log(`   [TEST MODE] Would ${existingFixture ? 'update' : 'create'} fixture: ${fixture.participants[0].name} vs ${fixture.participants[1].name}`);
          if (existingFixture) stats.fixturesUpdated++;
          else stats.fixturesCreated++;
          fixtureDbId = existingFixture?.id || 999999; // Mock ID for test mode
        } else {
          if (existingFixture) {
            // Update existing fixture
            const { error } = await supabase
              .from('fixtures')
              .update(fixtureData)
              .eq('id', existingFixture.id);

            if (error) throw error;

            stats.fixturesUpdated++;
            fixtureDbId = existingFixture.id;

            if (options.verbose) {
              console.log(`   ✅ Updated: ${fixture.participants[0].name} vs ${fixture.participants[1].name}`);
            }
          } else {
            // Create new fixture
            const { data: newFixture, error } = await supabase
              .from('fixtures')
              .insert(fixtureData)
              .select('id')
              .single();

            if (error) throw error;

            stats.fixturesCreated++;
            fixtureDbId = newFixture.id;

            if (options.verbose) {
              console.log(`   ✨ Created: ${fixture.participants[0].name} vs ${fixture.participants[1].name}`);
            }
          }
        }

        // Sync TV stations if enabled - use tvstations from fixture object (already included)
        const showTVStations = process.env.REACT_APP_FF_SPORTMONKS_TV_STATIONS === 'true';
        if (showTVStations && fixture.tvstations) {
          await syncFixtureTVStations(fixtureDbId, competitionId, fixture.tvstations, flags);
        }

        // Small delay for rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        stats.fixturesErrors++;
        console.error(`   ❌ Error syncing fixture ${fixture.id}:`, error.message);
      }
    }

  } catch (error) {
    console.error(`   ❌ Error fetching fixtures for ${competitionName}:`, error.message);
    throw error;
  }
}

// Check if a TV station broadcast should be included
// Filters by country and competition-specific rules
function shouldIncludeBroadcast(station, competitionId) {
  // station here is the pivot record: { id, fixture_id, tvstation_id, country_id, tvstation: {...} }
  const ENGLAND_COUNTRY_ID = 462;
  const IRELAND_COUNTRY_ID = 455;
  const PREMIER_LEAGUE_COMPETITION_ID = 1; // Our database competition ID

  // Include England (462) and Ireland (455) - Sky Sports UK is labeled as 455 by SportMonks
  // But filter out Irish-specific channels (have "ROI" in name)
  if (![ENGLAND_COUNTRY_ID, IRELAND_COUNTRY_ID, 11].includes(station.country_id)) {
    return false;
  }

  // Filter out Irish-specific channels (e.g., "Premier Sports ROI 1")
  const channelName = station.tvstation?.name || '';
  if (channelName.includes('ROI')) {
    return false;
  }

  // Filter out Amazon Prime for Premier League
  // Amazon has NO Premier League rights this season (2024-25)
  // They have some Champions League rights, so only filter for PL
  if (competitionId === PREMIER_LEAGUE_COMPETITION_ID &&
      channelName.toLowerCase().includes('amazon')) {
    if (options.verbose) {
      console.log(`      ⚠️  Filtering out ${channelName} for PL (no rights this season)`);
    }
    return false;
  }

  return true;
}

// Sync TV stations for a fixture - uses tvstations array from fixture object
// This contains ONLY the actual broadcasters for this specific match
async function syncFixtureTVStations(fixtureDbId, competitionId, tvStations, flags) {
  try {
    // Delete all existing broadcasts for this fixture first
    // This ensures we remove broadcasts that are no longer valid (e.g., Amazon Prime for PL)
    if (!flags.testMode) {
      await supabase
        .from('broadcasts')
        .delete()
        .eq('fixture_id', fixtureDbId);
    }

    // tvStations is already filtered to this specific match by Sports Monks
    for (const station of tvStations) {
      // Skip if tvstation details not included
      if (!station.tvstation) {
        continue;
      }

      // Filter by country and competition-specific rules
      // (e.g., England only, Amazon Prime excluded for PL)
      if (!shouldIncludeBroadcast(station, competitionId)) {
        continue;
      }

      if (flags.testMode) {
        if (options.verbose) {
          console.log(`      [TEST MODE] Would create broadcast: ${station.tvstation.name} (${station.tvstation.type}) [UK]`);
        }
        continue;
      }

      // Store raw API data without manipulation
      // Since we deleted all existing broadcasts above, we just insert fresh ones
      const broadcastData = {
        fixture_id: fixtureDbId,
        provider_id: null,  // Deprecated - we use API data directly now
        channel_name: station.tvstation.name,  // Raw channel name from API
        country_id: null,  // Not using FK to countries table
        country_code: 'EN',  // England (ISO2 code)
        broadcaster_type: station.tvstation.type,
        sportmonks_tv_station_id: station.tvstation_id,  // API's unique ID
        data_source: 'sportmonks',
        last_synced_at: new Date().toISOString()
      };

      // Insert new broadcast
      await supabase
        .from('broadcasts')
        .insert(broadcastData);

      if (options.verbose) {
        console.log(`      📺 Added broadcast: ${station.tvstation.name} (${station.tvstation.type})`);
      }
    }
  } catch (error) {
    if (options.verbose) {
      console.error(`      ⚠️  Could not sync TV stations:`, error.message);
    }
  }
}

// Create sync log entry
async function createSyncLog(competitionId, stats, status, errorMessage = null) {
  const duration = Math.floor((Date.now() - stats.startTime) / 1000);

  const logData = {
    sync_type: 'fixtures',
    competition_id: competitionId,
    started_at: new Date(stats.startTime).toISOString(),
    completed_at: new Date().toISOString(),
    status,
    fixtures_processed: stats.fixturesProcessed,
    fixtures_created: stats.fixturesCreated,
    fixtures_updated: stats.fixturesUpdated,
    fixtures_errors: stats.fixturesErrors,
    error_message: errorMessage,
    api_calls_made: stats.apiCalls,
    duration_seconds: duration,
    sync_metadata: {
      date_range: `${options.dateFrom} to ${options.dateTo}`,
      test_mode: options.dryRun,
      cli_options: options
    }
  };

  await supabase.from('api_sync_log').insert(logData);
}

// Main sync function
async function main() {
  console.log('🔄 Sports Monks Fixtures Sync Pipeline');
  console.log('='.repeat(80));

  // Check feature flags
  const flags = checkFeatureFlags();

  if (!flags.enabled && !options.dryRun) {
    console.log('❌ Sports Monks sync is not enabled in feature flags');
    console.log('   Set REACT_APP_FF_USE_SPORTMONKS=true');
    console.log('   Set REACT_APP_FF_SPORTMONKS_ENABLE_SYNC=true');
    process.exit(1);
  }

  console.log(`\n📋 Configuration:`);
  console.log(`   Date Range: ${options.dateFrom} to ${options.dateTo}`);
  console.log(`   Test Mode: ${flags.testMode ? '✅ YES (no database writes)' : '❌ NO (live writes)'}`);
  console.log(`   Competition Filter: ${options.competitionId || 'All enabled'}`);
  console.log(`   Enabled Competitions: ${flags.syncCompetitions.length > 0 ? flags.syncCompetitions.join(', ') : 'All'}`);
  console.log('');

  const stats = {
    startTime: Date.now(),
    fixturesProcessed: 0,
    fixturesCreated: 0,
    fixturesUpdated: 0,
    fixturesErrors: 0,
    apiCalls: 0
  };

  try {
    // Load competition mappings
    const competitionMappings = await loadCompetitionMappings();

    // Determine which competitions to sync
    let competitionsToSync = Object.keys(competitionMappings).map(id => parseInt(id, 10));

    if (options.competitionId) {
      competitionsToSync = [options.competitionId];
    } else if (flags.syncCompetitions.length > 0) {
      competitionsToSync = competitionsToSync.filter(id => flags.syncCompetitions.includes(id));
    }

    console.log(`📊 Syncing ${competitionsToSync.length} competitions...\n`);

    // Sync each competition
    for (const competitionId of competitionsToSync) {
      const mapping = competitionMappings[competitionId];

      if (!mapping) {
        console.log(`⚠️  Skipping competition ${competitionId}: No Sports Monks mapping found`);
        continue;
      }

      await syncCompetitionFixtures(
        competitionId,
        mapping.sportmonksId,
        mapping.name,
        stats,
        flags
      );
    }

    // Create sync log
    if (!flags.testMode) {
      await createSyncLog(null, stats, 'success');
    }

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ Sync Complete!');
    console.log('='.repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   Fixtures Processed: ${stats.fixturesProcessed}`);
    console.log(`   Fixtures Created:   ${stats.fixturesCreated}`);
    console.log(`   Fixtures Updated:   ${stats.fixturesUpdated}`);
    console.log(`   Errors:             ${stats.fixturesErrors}`);
    console.log(`   API Calls Made:     ${stats.apiCalls}`);
    console.log(`   Duration:           ${Math.floor((Date.now() - stats.startTime) / 1000)}s`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Sync Failed:', error.message);

    if (!flags.testMode) {
      await createSyncLog(null, stats, 'error', error.message);
    }

    process.exit(1);
  }
}

// Run the sync
main().catch(console.error);
