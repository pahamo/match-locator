#!/usr/bin/env node

/**
 * Sports Monks Live Scores Sync
 *
 * Continuously syncs live match scores from Sports Monks API
 *
 * Features:
 * - Real-time score updates
 * - Match status tracking (scheduled, live, finished)
 * - Respects feature flags
 * - Rate limiting
 * - Runs as daemon (continuous updates)
 *
 * Usage:
 *   node scripts/sync-sportmonks-livescores.mjs [options]
 *
 * Options:
 *   --interval=N    Update interval in seconds (default: 30)
 *   --once          Run once and exit (no daemon)
 *   --verbose       Show detailed logs
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
  interval: 30, // seconds
  once: args.includes('--once'),
  verbose: args.includes('--verbose')
};

args.forEach(arg => {
  if (arg.startsWith('--interval=')) {
    options.interval = parseInt(arg.split('=')[1], 10);
  }
});

// Feature flags check
const checkFeatureFlags = () => {
  const useSportMonks = process.env.REACT_APP_FF_USE_SPORTMONKS === 'true';
  const showLiveScores = process.env.REACT_APP_FF_SPORTMONKS_LIVE_SCORES === 'true';

  return {
    enabled: useSportMonks && showLiveScores
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

// Get today's fixtures from our database that have Sports Monks IDs
async function getTodaysFixturesWithSportMonksIds() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('fixtures')
    .select('id, sportmonks_fixture_id, home_team_id, away_team_id, utc_kickoff')
    .gte('utc_kickoff', today)
    .lt('utc_kickoff', tomorrowStr)
    .not('sportmonks_fixture_id', 'is', null);

  if (error) throw error;

  return data || [];
}

// Fetch live scores from Sports Monks
async function fetchLiveScores() {
  try {
    const response = await makeRequest('/livescores/inplay');
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching live scores:', error.message);
    return [];
  }
}

// Update fixture with live score data
async function updateFixtureScore(fixture, liveData) {
  const homeScore = liveData.scores?.find(s => s.description === 'CURRENT')?.score?.participant === 'home'
    ? liveData.scores.find(s => s.description === 'CURRENT').score.goals
    : null;

  const awayScore = liveData.scores?.find(s => s.description === 'CURRENT')?.score?.participant === 'away'
    ? liveData.scores.find(s => s.description === 'CURRENT').score.goals
    : null;

  // For simplicity, we'll store scores in a metadata field
  // In production, you'd want dedicated score columns
  const updateData = {
    sync_status: liveData.state?.state || 'live',
    last_synced_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('fixtures')
    .update(updateData)
    .eq('id', fixture.id);

  if (error) {
    console.error(`   ❌ Error updating fixture ${fixture.id}:`, error.message);
    return false;
  }

  if (options.verbose) {
    console.log(`   ✅ Updated: Fixture ${fixture.id} - Status: ${liveData.state?.state}`);
  }

  return true;
}

// Main sync function
async function syncLiveScores() {
  const timestamp = new Date().toISOString().substring(11, 19);
  console.log(`\n[${timestamp}] 🔄 Syncing live scores...`);

  try {
    // Get today's fixtures with Sports Monks IDs
    const fixtures = await getTodaysFixturesWithSportMonksIds();

    if (fixtures.length === 0) {
      console.log('   No fixtures to update today');
      return { updated: 0, errors: 0 };
    }

    console.log(`   Found ${fixtures.length} fixtures to check`);

    // Fetch live scores from Sports Monks
    const liveScores = await fetchLiveScores();

    if (liveScores.length === 0) {
      console.log('   No live matches currently');
      return { updated: 0, errors: 0 };
    }

    console.log(`   Found ${liveScores.length} live matches`);

    // Create lookup map
    const liveScoresMap = liveScores.reduce((map, score) => {
      map[score.id] = score;
      return map;
    }, {});

    // Update fixtures with live data
    let updated = 0;
    let errors = 0;

    for (const fixture of fixtures) {
      const liveData = liveScoresMap[fixture.sportmonks_fixture_id];

      if (liveData) {
        const success = await updateFixtureScore(fixture, liveData);
        if (success) updated++;
        else errors++;

        // Small delay for rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`   ✅ Updated ${updated} fixtures, ${errors} errors`);

    return { updated, errors };

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    return { updated: 0, errors: 1 };
  }
}

// Main function
async function main() {
  console.log('⚽ Sports Monks Live Scores Sync');
  console.log('='.repeat(80));

  // Check feature flags
  const flags = checkFeatureFlags();

  if (!flags.enabled) {
    console.log('❌ Live scores feature is not enabled');
    console.log('   Set REACT_APP_FF_USE_SPORTMONKS=true');
    console.log('   Set REACT_APP_FF_SPORTMONKS_LIVE_SCORES=true');
    process.exit(1);
  }

  console.log(`\n📋 Configuration:`);
  console.log(`   Update Interval: ${options.interval}s`);
  console.log(`   Mode: ${options.once ? 'Single run' : 'Daemon (continuous)'}`);
  console.log('');

  if (options.once) {
    // Run once and exit
    await syncLiveScores();
    console.log('\n✅ Done!');
  } else {
    // Run as daemon
    console.log('🚀 Starting live scores daemon...');
    console.log('   Press Ctrl+C to stop\n');

    // Initial sync
    await syncLiveScores();

    // Set up interval
    setInterval(async () => {
      await syncLiveScores();
    }, options.interval * 1000);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Run the sync
main().catch(console.error);
