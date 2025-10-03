/**
 * Netlify Function: Sync Broadcasts from SoccersAPI
 * Triggers the broadcast sync process
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
}

// SoccersAPI client
class SoccersApiClient {
  constructor() {
    this.baseUrl = 'https://api.soccersapi.com/v2.2';
    this.apiKey = process.env.SOCCERSAPI_KEY;
    this.email = process.env.SOCCERSAPI_USERNAME; // Username environment variable
  }

  async makeRequest(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Try different authentication patterns
    if (this.email) {
      // Email + token pattern
      url.searchParams.append('username', this.email);
      url.searchParams.append('token', this.apiKey);
    } else {
      // Simple API key pattern
      url.searchParams.append('APIkey', this.apiKey);
    }

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'FixturesApp-Netlify/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SoccersAPI error: ${response.status} ${errorText}`);
    }

    return await response.json();
  }
}

// Provider mapping
const PROVIDER_MAPPING = {
  'Sky Sports': 1,
  'Sky Sports Main Event': 1,
  'Sky Sports Premier League': 1,
  'Sky Sports Football': 1,
  'TNT Sports': 2,
  'BT Sport': 2,
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
  'BBC Radio 5 Live': 6,
  'TalkSport': 7,
  'NOW TV': 1,
  'Discovery+': 2,
  'No TV': 999,
  'Not Available': 999,
  'Blackout': 999,
};

function mapProviderName(providerName) {
  const normalized = providerName?.trim();

  if (PROVIDER_MAPPING[normalized]) {
    return PROVIDER_MAPPING[normalized];
  }

  const lower = normalized.toLowerCase();
  if (lower.includes('sky')) return 1;
  if (lower.includes('tnt') || lower.includes('bt sport')) return 2;
  if (lower.includes('amazon') || lower.includes('prime')) return 4;
  if (lower.includes('bbc')) return 3;
  if (lower.includes('itv')) return 5;

  return 1; // Default to Sky Sports
}

async function syncBroadcastsForFixtures(supabase, soccersApi, fixtures, limit = 10) {
  let syncedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < Math.min(fixtures.length, limit); i++) {
    const fixture = fixtures[i];

    try {
      console.log(`Syncing fixture ${fixture.id}: ${fixture.home_team} vs ${fixture.away_team}`);

      // Try to get broadcast data from SoccersAPI
      let broadcastData;
      try {
        broadcastData = await soccersApi.makeRequest(`/fixtures/${fixture.id}/broadcasts`);
      } catch (apiError) {
        console.warn(`API error for fixture ${fixture.id}:`, apiError.message);
        continue;
      }

      if (!broadcastData?.broadcasts?.length) {
        // No broadcasts found - mark as blackout
        await supabase
          .from('broadcasts')
          .upsert({
            fixture_id: fixture.id,
            provider_id: 999
          }, { onConflict: 'fixture_id' });

        syncedCount++;
        continue;
      }

      // Find UK broadcasts
      const ukBroadcasts = broadcastData.broadcasts.filter(b =>
        ['england', 'united kingdom', 'uk', 'gb'].includes(b.country?.toLowerCase())
      );

      if (ukBroadcasts.length === 0) {
        // No UK broadcasts - blackout
        await supabase
          .from('broadcasts')
          .upsert({
            fixture_id: fixture.id,
            provider_id: 999
          }, { onConflict: 'fixture_id' });
      } else {
        // Use first UK broadcaster
        const primaryBroadcast = ukBroadcasts[0];
        const providerId = mapProviderName(primaryBroadcast.name);

        await supabase
          .from('broadcasts')
          .upsert({
            fixture_id: fixture.id,
            provider_id: providerId
          }, { onConflict: 'fixture_id' });
      }

      syncedCount++;

    } catch (error) {
      console.error(`Error syncing fixture ${fixture.id}:`, error.message);
      errorCount++;
    }
  }

  return { syncedCount, errorCount };
}

exports.handler = async (event, context) => {
  console.log('🚀 Broadcast sync function started');

  // Only allow POST requests for security
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { limit = 10, dryRun = false } = JSON.parse(event.body || '{}');

    console.log(`Sync parameters: limit=${limit}, dryRun=${dryRun}`);

    // Initialize clients
    const supabase = getSupabaseClient();
    const soccersApi = new SoccersApiClient();

    // Check API key
    if (!soccersApi.apiKey) {
      throw new Error('SOCCERSAPI_KEY not configured');
    }

    // Get fixtures needing sync
    const startDate = new Date();
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures_with_teams')
      .select(`
        id, utc_kickoff, competition_id,
        home_team, away_team, home_team_id, away_team_id
      `)
      .gte('utc_kickoff', startDate.toISOString())
      .lte('utc_kickoff', endDate.toISOString())
      .limit(limit * 2); // Get more than needed for filtering

    if (fixturesError) {
      throw new Error(`Failed to fetch fixtures: ${fixturesError.message}`);
    }

    // Filter out fixtures that already have broadcasts
    const { data: existingBroadcasts } = await supabase
      .from('broadcasts')
      .select('fixture_id')
      .in('fixture_id', fixtures.map(f => f.id));

    const existingIds = new Set((existingBroadcasts || []).map(b => b.fixture_id));
    const unsyncedFixtures = fixtures.filter(f => !existingIds.has(f.id));

    console.log(`Found ${unsyncedFixtures.length} fixtures needing sync`);

    if (dryRun) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Dry run completed',
          fixturesFound: unsyncedFixtures.length,
          fixtures: unsyncedFixtures.slice(0, 10).map(f => ({
            id: f.id,
            match: `${f.home_team} vs ${f.away_team}`,
            date: f.utc_kickoff
          }))
        })
      };
    }

    if (unsyncedFixtures.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'All fixtures already have broadcast data',
          syncedCount: 0
        })
      };
    }

    // Perform sync
    const result = await syncBroadcastsForFixtures(
      supabase,
      soccersApi,
      unsyncedFixtures,
      limit
    );

    console.log(`Sync completed: ${result.syncedCount} synced, ${result.errorCount} errors`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        message: 'Broadcast sync completed',
        syncedCount: result.syncedCount,
        errorCount: result.errorCount,
        totalFixtures: unsyncedFixtures.length
      })
    };

  } catch (error) {
    console.error('Sync function error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack
      })
    };
  }
};