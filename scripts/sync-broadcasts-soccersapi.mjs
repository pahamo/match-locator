/**
 * SoccersAPI Broadcast Sync Script
 * Fetches TV broadcast data and syncs with local database
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') });

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SOCCERSAPI_KEY,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SOCCERSAPI_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Provider mapping from SoccersAPI to your database IDs
const PROVIDER_MAPPING = {
  // UK TV Broadcasters
  'Sky Sports': 1,
  'Sky Sports Main Event': 1,
  'Sky Sports Premier League': 1,
  'Sky Sports Football': 1,
  'TNT Sports': 2,
  'BT Sport': 2, // Legacy name for TNT Sports
  'Amazon Prime Video': 4,
  'Amazon Prime': 4,
  'BBC': 3,
  'BBC One': 3,
  'BBC Two': 3,
  'BBC iPlayer': 3,
  'ITV': 5,
  'ITV1': 5,
  'ITV4': 5,
  'ITVX': 5,

  // Radio
  'BBC Radio 5 Live': 6,
  'BBC Radio': 6,
  'TalkSport': 7,

  // Streaming
  'NOW TV': 1, // Sky's streaming service
  'Discovery+': 2, // TNT Sports streaming

  // Default blackout
  'No TV': 999,
  'Not Available': 999,
  'Blackout': 999,
};

class BroadcastSyncer {
  constructor() {
    this.baseUrl = 'https://api.soccersapi.com/v2.2';
    this.apiKey = SOCCERSAPI_KEY;
    this.syncedCount = 0;
    this.errorCount = 0;
  }

  async makeApiRequest(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add API key (try the format that worked in tests once API is fixed)
    url.searchParams.append('APIkey', this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'FixturesApp-Sync/1.0',
          'Accept': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error.message);
      throw error;
    }
  }

  async getUnsyncedFixtures(limit = 50) {
    console.log('📋 Fetching fixtures without broadcast data...');

    // Get upcoming fixtures from the next 30 days that don't have broadcasts
    const startDate = new Date();
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { data: fixtures, error } = await supabase
      .from('fixtures_with_teams')
      .select(`
        id, utc_kickoff, competition_id,
        home_team, away_team, home_team_id, away_team_id
      `)
      .gte('utc_kickoff', startDate.toISOString())
      .lte('utc_kickoff', endDate.toISOString())
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch fixtures: ${error.message}`);
    }

    // Filter out fixtures that already have broadcasts
    const { data: existingBroadcasts, error: broadcastError } = await supabase
      .from('broadcasts')
      .select('fixture_id')
      .in('fixture_id', fixtures.map(f => f.id));

    if (broadcastError) {
      console.warn('Warning: Could not check existing broadcasts:', broadcastError.message);
    }

    const existingBroadcastIds = new Set((existingBroadcasts || []).map(b => b.fixture_id));
    const unsyncedFixtures = fixtures.filter(f => !existingBroadcastIds.has(f.id));

    console.log(`📊 Found ${unsyncedFixtures.length} fixtures needing broadcast sync`);
    return unsyncedFixtures;
  }

  mapProviderName(soccersApiProvider) {
    // Normalize provider name
    const normalizedName = soccersApiProvider.name?.trim();

    // Direct mapping
    if (PROVIDER_MAPPING[normalizedName]) {
      return PROVIDER_MAPPING[normalizedName];
    }

    // Fuzzy matching for common variations
    const lowerName = normalizedName.toLowerCase();

    if (lowerName.includes('sky')) return 1;
    if (lowerName.includes('tnt') || lowerName.includes('bt sport')) return 2;
    if (lowerName.includes('amazon') || lowerName.includes('prime')) return 4;
    if (lowerName.includes('bbc')) return 3;
    if (lowerName.includes('itv')) return 5;

    // If we can't map it, log for future mapping
    console.warn(`⚠️  Unknown provider: "${normalizedName}" - mapping to generic TV`);
    return 1; // Default to Sky Sports as most common UK broadcaster
  }

  async syncFixtureBroadcasts(fixture) {
    try {
      console.log(`🔄 Syncing broadcasts for: ${fixture.home_team} vs ${fixture.away_team}`);

      // Try to fetch broadcast data for this fixture
      // Note: Exact endpoint structure will depend on SoccersAPI response
      const broadcastData = await this.makeApiRequest(`/fixtures/${fixture.id}/broadcasts`);

      if (!broadcastData || !broadcastData.broadcasts || !Array.isArray(broadcastData.broadcasts)) {
        console.log(`   No broadcast data available`);
        return false;
      }

      // Filter for UK/English broadcasts
      const ukBroadcasts = broadcastData.broadcasts.filter(broadcast =>
        broadcast.country?.toLowerCase() === 'england' ||
        broadcast.country?.toLowerCase() === 'united kingdom' ||
        broadcast.country?.toLowerCase() === 'uk' ||
        broadcast.country?.toLowerCase() === 'gb'
      );

      if (ukBroadcasts.length === 0) {
        console.log(`   No UK broadcasts found - marking as blackout`);

        // Insert blackout record
        const { error } = await supabase
          .from('broadcasts')
          .insert({
            fixture_id: fixture.id,
            provider_id: 999 // Blackout provider
          });

        if (error) {
          console.error(`   Failed to insert blackout: ${error.message}`);
          return false;
        }

        this.syncedCount++;
        return true;
      }

      // Process UK broadcasts
      let inserted = false;
      for (const broadcast of ukBroadcasts) {
        const providerId = this.mapProviderName(broadcast);

        console.log(`   📺 ${broadcast.name} -> Provider ID ${providerId}`);

        const { error } = await supabase
          .from('broadcasts')
          .upsert({
            fixture_id: fixture.id,
            provider_id: providerId
          }, {
            onConflict: 'fixture_id'
          });

        if (error) {
          console.error(`   Failed to insert broadcast: ${error.message}`);
        } else {
          inserted = true;
          break; // Only insert the first/primary broadcaster
        }
      }

      if (inserted) {
        this.syncedCount++;
        return true;
      }

      return false;

    } catch (error) {
      console.error(`   ❌ Error syncing fixture ${fixture.id}: ${error.message}`);
      this.errorCount++;
      return false;
    }
  }

  async runSync(options = {}) {
    const {
      limit = 50,
      dryRun = false,
      competitionId = null
    } = options;

    console.log('🚀 Starting SoccersAPI Broadcast Sync');
    console.log(`📊 Limit: ${limit} fixtures`);
    console.log(`🔧 Dry run: ${dryRun ? 'Yes' : 'No'}`);
    console.log('=' * 50);

    try {
      // Get fixtures that need sync
      const fixtures = await this.getUnsyncedFixtures(limit);

      if (fixtures.length === 0) {
        console.log('✅ All fixtures already have broadcast data!');
        return;
      }

      if (dryRun) {
        console.log('\n🔍 DRY RUN - Would sync these fixtures:');
        fixtures.forEach(f => {
          console.log(`  - ${f.home_team} vs ${f.away_team} (${new Date(f.utc_kickoff).toLocaleDateString()})`);
        });
        return;
      }

      // Process fixtures with rate limiting
      for (let i = 0; i < fixtures.length; i++) {
        const fixture = fixtures[i];

        console.log(`\n[${i + 1}/${fixtures.length}] Processing fixture ${fixture.id}`);

        await this.syncFixtureBroadcasts(fixture);

        // Rate limiting - wait between requests
        if (i < fixtures.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      console.log('\n🎉 Sync completed!');
      console.log(`✅ Synced: ${this.syncedCount} fixtures`);
      console.log(`❌ Errors: ${this.errorCount} fixtures`);

    } catch (error) {
      console.error('💥 Sync failed:', error.message);
      throw error;
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limit = parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1]) || 50;

  const syncer = new BroadcastSyncer();

  try {
    await syncer.runSync({
      limit,
      dryRun
    });

    console.log('\n🎯 Sync completed successfully!');
  } catch (error) {
    console.error('\n💥 Sync failed:', error.message);
    process.exit(1);
  }
}

// Only run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { BroadcastSyncer };