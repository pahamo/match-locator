#!/usr/bin/env node

/**
 * Diagnose and Report ID Conflicts Between Old and New API Data
 *
 * This script identifies:
 * 1. Duplicate fixtures (same match, different IDs from old vs new API)
 * 2. Team ID mismatches
 * 3. Competition/league mapping issues
 * 4. Broadcast data conflicts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔍 Diagnosing ID Conflicts Between Old and New API Data\n');
console.log('='.repeat(80));

async function analyzeFixtures() {
  console.log('\n📅 FIXTURES ANALYSIS');
  console.log('-'.repeat(80));

  // Get fixtures grouped by data source
  const { data: fixtures, error } = await supabase
    .from('fixtures')
    .select('id, sportmonks_fixture_id, data_source, home_team_id, away_team_id, utc_kickoff, competition_id')
    .order('utc_kickoff', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Error fetching fixtures:', error);
    return;
  }

  const bySource = {
    manual: fixtures.filter(f => f.data_source === 'manual' || !f.data_source),
    sportmonks: fixtures.filter(f => f.data_source === 'sportmonks'),
    hybrid: fixtures.filter(f => f.data_source === 'hybrid'),
  };

  console.log(`Total fixtures analyzed: ${fixtures.length}`);
  console.log(`  - Manual/Old API: ${bySource.manual.length}`);
  console.log(`  - Sports Monks: ${bySource.sportmonks.length}`);
  console.log(`  - Hybrid: ${bySource.hybrid.length}`);

  // Find potential duplicates (same teams, same day)
  const potentialDuplicates = [];
  for (let i = 0; i < fixtures.length; i++) {
    for (let j = i + 1; j < fixtures.length; j++) {
      const f1 = fixtures[i];
      const f2 = fixtures[j];

      const sameTeams = (f1.home_team_id === f2.home_team_id && f1.away_team_id === f2.away_team_id);
      const sameDay = new Date(f1.utc_kickoff).toDateString() === new Date(f2.utc_kickoff).toDateString();
      const differentSources = f1.data_source !== f2.data_source;

      if (sameTeams && sameDay && differentSources) {
        potentialDuplicates.push({ f1, f2 });
      }
    }
  }

  if (potentialDuplicates.length > 0) {
    console.log(`\n⚠️  Found ${potentialDuplicates.length} potential duplicate fixtures:`);
    potentialDuplicates.slice(0, 5).forEach(({ f1, f2 }) => {
      console.log(`  - Fixture ${f1.id} (${f1.data_source}) vs ${f2.id} (${f2.data_source})`);
      console.log(`    ${f1.utc_kickoff}`);
    });
    if (potentialDuplicates.length > 5) {
      console.log(`    ... and ${potentialDuplicates.length - 5} more`);
    }
  } else {
    console.log('\n✅ No duplicate fixtures found');
  }

  // Check for fixtures missing Sports Monks IDs
  const missingSportmonksId = fixtures.filter(f => !f.sportmonks_fixture_id && f.data_source !== 'manual');
  if (missingSportmonksId.length > 0) {
    console.log(`\n⚠️  ${missingSportmonksId.length} fixtures from Sports Monks API missing sportmonks_fixture_id`);
  }
}

async function analyzeTeams() {
  console.log('\n👥 TEAMS ANALYSIS');
  console.log('-'.repeat(80));

  const { data: teams, error } = await supabase
    .from('teams')
    .select('id, name, sportmonks_team_id, slug, competition_id');

  if (error) {
    console.error('Error fetching teams:', error);
    return;
  }

  const withSportmonksId = teams.filter(t => t.sportmonks_team_id);
  const withoutSportmonksId = teams.filter(t => !t.sportmonks_team_id);

  console.log(`Total teams: ${teams.length}`);
  console.log(`  - With Sports Monks ID: ${withSportmonksId.length}`);
  console.log(`  - Without Sports Monks ID: ${withoutSportmonksId.length}`);

  if (withoutSportmonksId.length > 0) {
    console.log(`\n⚠️  Teams without Sports Monks ID (first 10):`);
    withoutSportmonksId.slice(0, 10).forEach(t => {
      console.log(`  - ${t.name} (ID: ${t.id}, Slug: ${t.slug})`);
    });
  }

  // Check for duplicate team names
  const nameCount = {};
  teams.forEach(t => {
    nameCount[t.name] = (nameCount[t.name] || 0) + 1;
  });
  const duplicateNames = Object.entries(nameCount).filter(([_, count]) => count > 1);

  if (duplicateNames.length > 0) {
    console.log(`\n⚠️  Duplicate team names found:`);
    duplicateNames.forEach(([name, count]) => {
      console.log(`  - "${name}" appears ${count} times`);
    });
  }
}

async function analyzeCompetitions() {
  console.log('\n🏆 COMPETITIONS / LEAGUE MAPPING ANALYSIS');
  console.log('-'.repeat(80));

  const { data: competitions, error: compError } = await supabase
    .from('competitions')
    .select('id, name, slug');

  const { data: mappings, error: mapError } = await supabase
    .from('api_competition_mapping')
    .select('*');

  if (compError || mapError) {
    console.error('Error fetching data:', compError || mapError);
    return;
  }

  console.log(`Total competitions: ${competitions?.length || 0}`);
  console.log(`Total API mappings: ${mappings?.length || 0}`);

  const unmappedComps = competitions.filter(c =>
    !mappings?.some(m => m.our_competition_id === c.id)
  );

  if (unmappedComps.length > 0) {
    console.log(`\n⚠️  Competitions without Sports Monks mapping:`);
    unmappedComps.forEach(c => {
      console.log(`  - ${c.name} (ID: ${c.id}, Slug: ${c.slug})`);
    });
  } else {
    console.log('\n✅ All competitions have Sports Monks mappings');
  }
}

async function analyzeBroadcasts() {
  console.log('\n📺 BROADCASTS ANALYSIS');
  console.log('-'.repeat(80));

  const { data: broadcasts, error } = await supabase
    .from('broadcasts')
    .select('id, fixture_id, provider_id, sportmonks_tv_station_id, data_source, channel_name')
    .limit(1000);

  if (error) {
    console.error('Error fetching broadcasts:', error);
    return;
  }

  const bySource = {
    manual: broadcasts.filter(b => b.data_source === 'manual' || !b.data_source),
    sportmonks: broadcasts.filter(b => b.data_source === 'sportmonks'),
  };

  console.log(`Total broadcasts analyzed: ${broadcasts.length}`);
  console.log(`  - Manual/Old: ${bySource.manual.length}`);
  console.log(`  - Sports Monks: ${bySource.sportmonks.length}`);

  const withChannelName = broadcasts.filter(b => b.channel_name);
  console.log(`  - With channel names: ${withChannelName.length}`);
}

async function generateRecommendations() {
  console.log('\n💡 RECOMMENDATIONS');
  console.log('='.repeat(80));
  console.log(`
Based on the analysis above, here are recommended actions:

1. **Duplicate Fixtures**: If duplicates found, decide on merge or delete strategy
2. **Missing Sports Monks IDs**: Backfill IDs for existing data from Sports Monks API
3. **Unmapped Competitions**: Add Sports Monks league mappings
4. **Teams Without IDs**: Match teams to Sports Monks team IDs by name/slug

Would you like a script to:
  - Merge duplicate fixtures? (combine old + new data)
  - Delete old fixtures? (keep only Sports Monks data)
  - Backfill missing Sports Monks IDs?
`);
}

async function main() {
  try {
    await analyzeFixtures();
    await analyzeTeams();
    await analyzeCompetitions();
    await analyzeBroadcasts();
    await generateRecommendations();

    console.log('\n' + '='.repeat(80));
    console.log('✅ Diagnosis complete\n');
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
    process.exit(1);
  }
}

main();
