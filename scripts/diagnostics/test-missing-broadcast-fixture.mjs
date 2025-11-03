#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

console.log('🔍 Testing Nov fixtures that are MISSING broadcasts...\n');

// Get Premier League Nov fixtures
const { data: plFixtures } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff, sportmonks_fixture_id')
  .eq('competition_id', 1) // Premier League
  .gte('utc_kickoff', '2025-11-01')
  .lte('utc_kickoff', '2025-11-30')
  .order('utc_kickoff', { ascending: true });

console.log(`Found ${plFixtures?.length || 0} Premier League Nov fixtures\n`);

// Find ones without broadcasts
const withoutBroadcasts = [];
for (const fixture of plFixtures || []) {
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('id')
    .eq('fixture_id', fixture.id);

  if (!broadcasts || broadcasts.length === 0) {
    withoutBroadcasts.push(fixture);
  }
}

console.log(`Fixtures WITHOUT broadcasts: ${withoutBroadcasts.length}\n`);

if (withoutBroadcasts.length > 0) {
  const testFixture = withoutBroadcasts[0];
  console.log(`${'='.repeat(80)}`);
  console.log(`Testing fixture ${testFixture.id} - ${testFixture.utc_kickoff.substring(0, 10)}`);
  console.log(`SportMonks ID: ${testFixture.sportmonks_fixture_id}`);

  const url = `https://api.sportmonks.com/v3/football/fixtures/${testFixture.sportmonks_fixture_id}?api_token=${SPORTMONKS_TOKEN}&include=tvstations.tvstation`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (json.data && json.data.tvstations) {
      const tvStations = json.data.tvstations;
      console.log(`\nAPI returned ${tvStations.length} total TV stations`);

      // Current filter (country 11, 455, 462)
      const currentMatches = tvStations.filter(ts =>
        ts.tvstation && [11, 455, 462].includes(ts.country_id)
      );
      console.log(`Current filter matches: ${currentMatches.length}`);

      // Search by UK channel names
      const ukPatterns = [
        'Sky Sports', 'TNT Sports', 'BBC', 'ITV',
        'BT Sport', 'Amazon Prime', 'Discovery+',
        'NOW', 'DAZN UK', 'Premier Sports'
      ];

      console.log(`\nSearching by UK channel names:`);
      const nameMatches = [];
      for (const pattern of ukPatterns) {
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

      if (nameMatches.length === 0) {
        console.log(`  ❌ No UK broadcasters found by name`);
        console.log(`\n  This fixture likely has NO UK broadcaster yet`);
        console.log(`  (TV schedules are announced closer to match date)`);
      } else {
        console.log(`\n  ✅ FOUND ${nameMatches.length} UK BROADCASTERS!`);
        console.log(`  ❌ But they were filtered out by country_id check`);

        const countryIds = [...new Set(nameMatches.map(m => m.country_id))];
        console.log(`  📍 Country IDs to add: ${countryIds.join(', ')}`);
      }

      // Show all country IDs present
      console.log(`\nAll country IDs in API response:`);
      const allCountryIds = [...new Set(tvStations.map(ts => ts.country_id))].sort((a, b) => a - b);
      console.log(`  ${allCountryIds.slice(0, 20).join(', ')}${allCountryIds.length > 20 ? '...' : ''}`);

    } else {
      console.log('⚠️  No TV stations data in API response');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
} else {
  console.log('✅ All Premier League Nov fixtures have broadcasts!');
}
