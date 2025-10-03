#!/usr/bin/env node

/**
 * Sports Monks TV Stations Mapper
 *
 * Discovers all TV stations and maps UK broadcasters to your providers table
 *
 * Usage: node scripts/map-tv-stations.mjs
 */

import 'dotenv/config';

const API_TOKEN = process.env.SPORTMONKS_TOKEN || process.env.REACT_APP_SPORTMONKS_TOKEN;
const BASE_URL = 'https://api.sportmonks.com/v3/football';

if (!API_TOKEN) {
  console.error('❌ No API token found');
  process.exit(1);
}

async function makeRequest(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_token', API_TOKEN);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

// Your current providers
const YOUR_PROVIDERS = [
  { id: 1, name: 'Sky Sports', type: 'tv' },
  { id: 2, name: 'TNT Sports', type: 'tv' },
  { id: 3, name: 'BBC', type: 'radio' },
  { id: 4, name: 'Amazon Prime Video', type: 'streaming' },
  { id: 999, name: 'Blackout', type: 'blackout' },
];

// UK broadcaster keywords for matching
const UK_KEYWORDS = [
  'sky', 'tnt', 'bbc', 'itv', 'amazon', 'prime',
  'bt sport', 'premier sports', 'uk', 'british',
  'channel 4', 'channel 5', 'radio 5', 'talksport'
];

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

  // Check if name contains UK keywords
  const hasKeyword = UK_KEYWORDS.some(keyword => name.includes(keyword));

  // Additional checks
  const isUK = station.name.includes('UK') ||
               station.name.includes('United Kingdom') ||
               station.name.includes('England');

  return hasKeyword || isUK;
}

function findBestProviderMatch(station, providers) {
  const stationName = station.name.toLowerCase();

  // Direct matches
  if (stationName.includes('sky sports') || (stationName.includes('sky') && stationName.includes('go') && !stationName.includes('italia') && !stationName.includes('austria'))) return providers[0]; // Sky Sports
  if (stationName.includes('tnt') || stationName.includes('bt sport')) return providers[1]; // TNT Sports
  if (stationName.includes('bbc')) return providers[2]; // BBC
  if (stationName.includes('amazon') || stationName.includes('prime video')) return providers[3]; // Amazon Prime

  return null; // No match found
}

async function mapTVStations() {
  console.log('🔍 Discovering TV Stations from Sports Monks...\n');

  // Get a sample of recent fixtures to find TV stations
  const today = new Date().toISOString().split('T')[0];
  const fixturesResponse = await makeRequest('/fixtures/date/' + today);

  console.log(`📺 Found ${fixturesResponse.data.length} fixtures today\n`);

  // Collect all unique TV stations from today's fixtures
  const allStations = new Map();

  for (const fixture of fixturesResponse.data.slice(0, 10)) { // Sample first 10 fixtures
    try {
      const tvResponse = await makeRequest(`/tv-stations/fixtures/${fixture.id}`);

      tvResponse.data.forEach(station => {
        if (!allStations.has(station.id)) {
          allStations.set(station.id, station);
        }
      });

      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`  ⚠️  Could not get TV stations for fixture ${fixture.id}`);
    }
  }

  console.log(`\n✅ Collected ${allStations.size} unique TV stations\n`);
  console.log('='.repeat(100));

  // Filter for UK broadcasters
  const ukBroadcasters = Array.from(allStations.values()).filter(isUKBroadcaster);

  console.log(`\n🇬🇧 UK BROADCASTERS (${ukBroadcasters.length} found):\n`);

  ukBroadcasters
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(station => {
      const match = findBestProviderMatch(station, YOUR_PROVIDERS);
      const status = match ? `✅ → Provider ${match.id}: ${match.name}` : '❓ → No match';
      console.log(`  ${station.id.toString().padStart(6)}: ${station.name.padEnd(40)} | ${station.type.padEnd(10)} | ${status}`);
    });

  // Show all broadcasters for reference
  console.log(`\n\n📡 ALL TV STATIONS (${allStations.size} total):\n`);

  const groupedByType = {};
  allStations.forEach(station => {
    if (!groupedByType[station.type]) groupedByType[station.type] = [];
    groupedByType[station.type].push(station);
  });

  Object.entries(groupedByType).forEach(([type, stations]) => {
    console.log(`\n${type.toUpperCase()} (${stations.length}):`);
    stations
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 20) // Show first 20 per type
      .forEach(s => {
        const ukFlag = isUKBroadcaster(s) ? '🇬🇧' : '  ';
        console.log(`  ${ukFlag} ${s.id.toString().padStart(6)}: ${s.name}`);
      });
    if (stations.length > 20) {
      console.log(`  ... and ${stations.length - 20} more`);
    }
  });

  // Generate mapping recommendations
  console.log('\n\n📝 MAPPING RECOMMENDATIONS:\n');
  console.log('='.repeat(100));

  const mappings = [];
  const unmapped = [];

  ukBroadcasters.forEach(station => {
    const match = findBestProviderMatch(station, YOUR_PROVIDERS);
    if (match) {
      mappings.push({
        sportmonks_id: station.id,
        sportmonks_name: station.name,
        your_provider_id: match.id,
        your_provider_name: match.name,
        type: station.type
      });
    } else {
      unmapped.push({
        sportmonks_id: station.id,
        sportmonks_name: station.name,
        type: station.type
      });
    }
  });

  console.log(`\n✅ AUTO-MAPPED: ${mappings.length} UK broadcasters`);
  mappings.forEach(m => {
    console.log(`   Sports Monks ${m.sportmonks_id}: "${m.sportmonks_name}" → Provider ${m.your_provider_id}: ${m.your_provider_name}`);
  });

  console.log(`\n❓ UNMAPPED UK BROADCASTERS: ${unmapped.length}`);
  if (unmapped.length > 0) {
    console.log('   These need manual review:');
    unmapped.forEach(u => {
      console.log(`   - ${u.sportmonks_id}: ${u.sportmonks_name} (${u.type})`);
    });
  }

  // Generate SQL for provider mapping table
  if (mappings.length > 0 || unmapped.length > 0) {
    console.log('\n\n📄 GENERATING SQL MIGRATION...\n');

    const sql = `-- Sports Monks TV Stations Mapping
-- Generated: ${new Date().toISOString()}

-- Create TV stations mapping table
CREATE TABLE IF NOT EXISTS api_tv_station_mapping (
  sportmonks_tv_station_id INT PRIMARY KEY,
  sportmonks_tv_station_name VARCHAR(255) NOT NULL,
  our_provider_id INT REFERENCES providers(id),
  station_type VARCHAR(50),
  is_uk_broadcaster BOOLEAN DEFAULT false,
  auto_mapped BOOLEAN DEFAULT false,
  last_verified_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert auto-mapped UK broadcasters
${mappings.map(m => `INSERT INTO api_tv_station_mapping (sportmonks_tv_station_id, sportmonks_tv_station_name, our_provider_id, station_type, is_uk_broadcaster, auto_mapped)
VALUES (${m.sportmonks_id}, '${m.sportmonks_name.replace(/'/g, "''")}', ${m.your_provider_id}, '${m.type}', true, true)
ON CONFLICT (sportmonks_tv_station_id) DO UPDATE SET
  sportmonks_tv_station_name = EXCLUDED.sportmonks_tv_station_name,
  our_provider_id = EXCLUDED.our_provider_id,
  station_type = EXCLUDED.station_type,
  last_verified_at = NOW();`).join('\n\n')}

${unmapped.length > 0 ? `-- Unmapped UK broadcasters (manual review needed)
${unmapped.map(u => `INSERT INTO api_tv_station_mapping (sportmonks_tv_station_id, sportmonks_tv_station_name, our_provider_id, station_type, is_uk_broadcaster, auto_mapped)
VALUES (${u.sportmonks_id}, '${u.sportmonks_name.replace(/'/g, "''")}', NULL, '${u.type}', true, false)
ON CONFLICT (sportmonks_tv_station_id) DO UPDATE SET
  sportmonks_tv_station_name = EXCLUDED.sportmonks_tv_station_name,
  last_verified_at = NOW();`).join('\n\n')}` : ''}

-- Verify mappings
SELECT
  t.sportmonks_tv_station_id,
  t.sportmonks_tv_station_name,
  t.our_provider_id,
  p.name as provider_name,
  t.is_uk_broadcaster,
  t.auto_mapped
FROM api_tv_station_mapping t
LEFT JOIN providers p ON t.our_provider_id = p.id
WHERE t.is_uk_broadcaster = true
ORDER BY t.our_provider_id, t.sportmonks_tv_station_name;
`;

    const fs = await import('fs');
    const sqlPath = './database/migrations/sportmonks-tv-station-mapping.sql';
    fs.writeFileSync(sqlPath, sql);

    console.log(`✅ SQL migration saved to: ${sqlPath}`);
  }

  // Generate JSON config
  const jsonPath = './src/config/sportmonks-tv-mappings.json';
  const config = {
    generated_at: new Date().toISOString(),
    uk_broadcasters: Object.fromEntries(
      mappings.map(m => [m.sportmonks_id, {
        name: m.sportmonks_name,
        provider_id: m.your_provider_id,
        provider_name: m.your_provider_name,
        type: m.type
      }])
    ),
    unmapped_uk: unmapped.map(u => ({
      id: u.sportmonks_id,
      name: u.sportmonks_name,
      type: u.type
    })),
    total_stations_found: allStations.size,
    uk_broadcasters_count: ukBroadcasters.length,
    mapped_count: mappings.length,
    unmapped_count: unmapped.length
  };

  const fs = await import('fs');
  fs.writeFileSync(jsonPath, JSON.stringify(config, null, 2));
  console.log(`✅ JSON config saved to: ${jsonPath}`);

  console.log('\n\n✅ TV STATIONS MAPPING COMPLETE!\n');
  console.log('📋 Next Steps:');
  console.log('   1. Review the generated SQL file');
  console.log('   2. Manually map any unmapped UK broadcasters');
  console.log('   3. Run the migration in Supabase');
  console.log('   4. Use the JSON config in sync scripts');
}

// Run the mapper
mapTVStations().catch(console.error);
