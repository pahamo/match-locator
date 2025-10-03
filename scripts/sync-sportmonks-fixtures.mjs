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
    // Fetch fixtures from Sports Monks using date iteration
    // This works better with limited subscriptions than /fixtures/between
    const startDate = new Date(options.dateFrom);
    const endDate = new Date(options.dateTo);
    let allLeagueFixtures = [];

    // Iterate through dates
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];

      try {
        const response = await makeRequest(`/fixtures/date/${dateStr}`, {
          include: 'participants;tvstations;round;scores;state'
        });

        const dayFixtures = (response.data || []).filter(f => f.league_id === sportmonksLeagueId);
        allLeagueFixtures = allLeagueFixtures.concat(dayFixtures);

        if (dayFixtures.length > 0) {
          console.log(`   ${dateStr}: ${dayFixtures.length} fixtures`);
        }

        stats.apiCalls++;

        // Rate limit: 200ms between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        if (options.verbose) {
          console.log(`   Error on ${dateStr}:`, err.message);
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

        // Extract matchday from round data (round.name is usually the matchweek number)
        const matchday = fixture.round?.name ? parseInt(fixture.round.name, 10) : null;

        // Extract scores from the scores array (participant_id = 1 is home, 2 is away typically)
        const homeScore = fixture.scores?.find(s => s.description === 'CURRENT')?.score?.participant === 'home'
          ? fixture.scores.find(s => s.description === 'CURRENT')?.score?.goals
          : null;
        const awayScore = fixture.scores?.find(s => s.description === 'CURRENT')?.score?.participant === 'away'
          ? fixture.scores.find(s => s.description === 'CURRENT')?.score?.goals
          : null;

        // Alternative: Try to get scores from participants array if available
        const finalHomeScore = homeScore ?? fixture.participants?.[0]?.meta?.score ?? null;
        const finalAwayScore = awayScore ?? fixture.participants?.[1]?.meta?.score ?? null;

        const fixtureData = {
          utc_kickoff: fixture.starting_at,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          competition_id: competitionId,
          matchday: matchday,
          home_score: finalHomeScore,
          away_score: finalAwayScore,
          status: fixture.state?.state || null,
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

        // Sync TV stations if enabled
        const showTVStations = process.env.REACT_APP_FF_SPORTMONKS_TV_STATIONS === 'true';
        if (showTVStations) {
          await syncFixtureTVStations(fixtureDbId, fixture.id, flags);
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

// Detect if a broadcaster is UK-based
function isUKBroadcaster(station) {
  const name = station.name.toLowerCase();

  // Exclude non-UK Sky channels
  if (name.includes('sky') && (
      name.includes('italia') ||
      name.includes('austria') ||
      name.includes('deutschland') ||
      name.includes('germany') ||
      name.includes('sport uno')
  )) {
    return false;
  }

  // UK broadcaster keywords
  const ukKeywords = [
    'sky', 'tnt', 'bbc', 'itv', 'amazon', 'prime',
    'bt sport', 'premier sports', 'uk', 'british',
    'channel 4', 'channel 5', 'radio 5', 'talksport'
  ];

  return ukKeywords.some(keyword => name.includes(keyword)) ||
         name.includes('united kingdom') ||
         name.includes('england');
}

// Map broadcaster to provider (network level)
function mapBroadcasterToProvider(stationName) {
  const name = stationName.toLowerCase();

  // Provider mappings (network level)
  if (name.includes('sky sports') || (name.includes('sky') && name.includes('go'))) return 1; // Sky Sports
  if (name.includes('tnt') || name.includes('bt sport')) return 2; // TNT Sports
  if (name.includes('bbc')) return 3; // BBC
  if (name.includes('amazon') || name.includes('prime')) return 4; // Amazon Prime

  return null; // No provider match
}

// Sync TV stations for a fixture
async function syncFixtureTVStations(fixtureDbId, sportmonksFixtureId, flags) {
  try {
    const response = await makeRequest(`/tv-stations/fixtures/${sportmonksFixtureId}`);
    const tvStations = response.data || [];

    for (const station of tvStations) {
      // Phase 1: UK broadcasters only
      if (!isUKBroadcaster(station)) {
        continue;
      }

      const providerId = mapBroadcasterToProvider(station.name);

      if (flags.testMode) {
        if (options.verbose) {
          console.log(`      [TEST MODE] Would create broadcast: ${station.name} (${station.type}) [UK]`);
        }
        continue;
      }

      // Check if broadcast already exists
      const { data: existingBroadcast } = await supabase
        .from('broadcasts')
        .select('id')
        .eq('fixture_id', fixtureDbId)
        .eq('sportmonks_tv_station_id', station.id)
        .single();

      const broadcastData = {
        fixture_id: fixtureDbId,
        provider_id: providerId,
        channel_name: station.name,
        country_code: 'GBR',
        broadcaster_type: station.type,
        sportmonks_tv_station_id: station.id,
        data_source: 'sportmonks',
        last_synced_at: new Date().toISOString()
      };

      if (existingBroadcast) {
        // Update existing broadcast
        await supabase
          .from('broadcasts')
          .update(broadcastData)
          .eq('id', existingBroadcast.id);
      } else {
        // Create new broadcast
        await supabase
          .from('broadcasts')
          .insert(broadcastData);

        if (options.verbose) {
          console.log(`      📺 Added broadcast: ${station.name} (${station.type})`);
        }
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
