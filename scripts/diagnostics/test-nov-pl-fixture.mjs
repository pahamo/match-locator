#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

console.log('🔍 Testing Nov Premier League fixture for UK broadcasters...\n');

// Get a Premier League Nov fixture WITHOUT broadcasts
const { data: fixtures } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff, sportmonks_fixture_id, home_team_id, away_team_id')
  .eq('competition_id', 1) // Premier League
  .gte('utc_kickoff', '2025-11-01')
  .lte('utc_kickoff', '2025-11-30')
  .limit(5);

console.log(`Found ${fixtures?.length || 0} Premier League Nov fixtures\n`);

for (const fixture of fixtures || []) {
  // Check if has broadcasts
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('id')
    .eq('fixture_id', fixture.id);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Fixture ${fixture.id} - ${fixture.utc_kickoff.substring(0, 10)}`);
  console.log(`Database broadcasts: ${broadcasts?.length || 0}`);

  if (fixture.sportmonks_fixture_id) {
    console.log(`\nFetching from SportMonks API (${fixture.sportmonks_fixture_id})...`);

    const url = `https://api.sportmonks.com/v3/football/fixtures/${fixture.sportmonks_fixture_id}?api_token=${SPORTMONKS_TOKEN}&include=tvstations.tvstation`;

    try {
      const response = await fetch(url);
      const json = await response.json();

      if (json.data && json.data.tvstations) {
        const tvStations = json.data.tvstations;
        console.log(`API returned ${tvStations.length} total TV stations`);

        // Filter by current script logic (country 11, 455, 462)
        const currentFilterMatches = tvStations.filter(ts =>
          ts.tvstation && [11, 455, 462].includes(ts.country_id) && !ts.tvstation.name.includes('ROI')
        );

        console.log(`\nCurrent filter (country 11, 455, 462): ${currentFilterMatches.length} matches`);
        if (currentFilterMatches.length > 0) {
          currentFilterMatches.slice(0, 5).forEach(ts => {
            console.log(`  ✅ ${ts.tvstation.name} (country: ${ts.country_id})`);
          });
        }

        // Search for known UK broadcasters by NAME
        const ukBroadcasterPatterns = [
          'Sky Sports', 'TNT Sports', 'BBC', 'ITV',
          'BT Sport', 'Amazon Prime', 'Discovery+',
          'NOW', 'DAZN UK', 'Premier Sports'
        ];

        console.log(`\nSearching by UK channel names:`);
        const nameMatches = [];
        for (const pattern of ukBroadcasterPatterns) {
          const matches = tvStations.filter(ts =>
            ts.tvstation && ts.tvstation.name.includes(pattern) && !ts.tvstation.name.includes('ROI')
          );
          if (matches.length > 0) {
            matches.forEach(m => {
              console.log(`  🎯 ${m.tvstation.name} (country: ${m.country_id})`);
              nameMatches.push(m);
            });
          }
        }

        if (nameMatches.length > 0) {
          console.log(`\n✅ FOUND ${nameMatches.length} UK BROADCASTERS BY NAME!`);
          console.log(`❌ But current filter only catches ${currentFilterMatches.length}`);
          console.log(`\n🔧 FIX: Need to add channel name pattern matching to filter`);

          // Show unique country IDs from name matches
          const countryIds = [...new Set(nameMatches.map(m => m.country_id))];
          console.log(`\nCountry IDs used by UK channels: ${countryIds.join(', ')}`);
        } else {
          console.log(`\n⚠️  No UK broadcasters found by name either`);
        }

        // Show sample of other stations
        console.log(`\nSample of OTHER stations (first 5):`);
        tvStations.slice(0, 5).forEach(ts => {
          if (ts.tvstation) {
            console.log(`  - ${ts.tvstation.name} (country: ${ts.country_id})`);
          }
        });

      } else {
        console.log('⚠️  No TV stations data in API response');
      }

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  // Only check first fixture in detail
  break;
}
