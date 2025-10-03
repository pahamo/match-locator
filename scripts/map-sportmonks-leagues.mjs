#!/usr/bin/env node

/**
 * Sports Monks League Mapping Script
 *
 * Discovers all leagues and maps them to your database competitions
 *
 * Usage: node scripts/map-sportmonks-leagues.mjs
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

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

// Your current competitions to map
const YOUR_COMPETITIONS = [
  { id: 1, name: 'Premier League', country: 'England' },
  { id: 2, name: 'Champions League', country: 'Europe' },
  { id: 3, name: 'FA Cup', country: 'England' },
  { id: 4, name: 'EFL Cup', country: 'England' },
  { id: 5, name: 'Europa League', country: 'Europe' },
  { id: 6, name: 'Europa Conference League', country: 'Europe' },
  { id: 7, name: 'Scottish Premiership', country: 'Scotland' },
  { id: 8, name: 'Championship', country: 'England' },
  { id: 9, name: 'League One', country: 'England' },
];

function normalizeLeagueName(name) {
  return name
    .toLowerCase()
    .replace(/uefa\s+/i, '')
    .replace(/\s+cup\s*/i, '')
    .replace(/\s+league\s*/i, '')
    .replace(/efl\s*/i, '')
    .replace(/fa\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function findBestMatch(yourComp, allLeagues) {
  const searchTerms = [
    yourComp.name,
    normalizeLeagueName(yourComp.name),
  ];

  for (const league of allLeagues) {
    const leagueName = league.name.toLowerCase();
    const normalizedLeague = normalizeLeagueName(league.name);

    // Exact match
    if (leagueName === yourComp.name.toLowerCase()) {
      return league;
    }

    // Normalized match
    if (normalizedLeague === normalizeLeagueName(yourComp.name)) {
      return league;
    }

    // Contains match (be careful with this)
    for (const term of searchTerms) {
      if (leagueName.includes(term.toLowerCase())) {
        // Additional validation for common names
        if (yourComp.name === 'Premier League' && !leagueName.includes('u18') && !leagueName.includes('u21') && !leagueName.includes('u23')) {
          return league;
        }
        if (yourComp.name === 'Champions League' && leagueName.includes('champions')) {
          return league;
        }
        if (yourComp.name === 'Europa League' && leagueName.includes('europa') && !leagueName.includes('conference')) {
          return league;
        }
        if (yourComp.name === 'Europa Conference League' && leagueName.includes('conference')) {
          return league;
        }
        if (yourComp.name === 'FA Cup' && leagueName.includes('fa cup')) {
          return league;
        }
        if (yourComp.name === 'EFL Cup' && (leagueName.includes('efl cup') || leagueName.includes('carabao') || leagueName.includes('league cup'))) {
          return league;
        }
        if (yourComp.name === 'Championship' && leagueName.includes('championship') && !leagueName.includes('u18') && !leagueName.includes('u21')) {
          return league;
        }
        if (yourComp.name === 'Scottish Premiership' && leagueName.includes('scottish') && leagueName.includes('premiership')) {
          return league;
        }
        if (yourComp.name === 'League One' && leagueName.includes('league one')) {
          return league;
        }
      }
    }
  }

  return null;
}

async function mapLeagues() {
  console.log('🔍 Fetching all leagues from Sports Monks API...\n');

  // Get all leagues
  const response = await makeRequest('/leagues');

  const allLeagues = response.data;
  console.log(`✅ Found ${allLeagues.length} total leagues\n`);

  // Map your competitions
  const mappings = [];
  const unmapped = [];

  console.log('🗺️  MAPPING YOUR COMPETITIONS:\n');
  console.log('='.repeat(80));

  for (const yourComp of YOUR_COMPETITIONS) {
    const match = findBestMatch(yourComp, allLeagues);

    if (match) {
      mappings.push({
        your_id: yourComp.id,
        your_name: yourComp.name,
        sportmonks_id: match.id,
        sportmonks_name: match.name,
        sportmonks_active: match.active || false,
      });

      console.log(`✅ ${yourComp.name} (ID: ${yourComp.id})`);
      console.log(`   → Sports Monks: "${match.name}" (ID: ${match.id})`);
      console.log(`   → Active: ${match.active ? 'Yes' : 'No'}`);
      console.log('');
    } else {
      unmapped.push(yourComp);
      console.log(`❌ ${yourComp.name} (ID: ${yourComp.id})`);
      console.log(`   → No match found in Sports Monks`);
      console.log('');
    }
  }

  console.log('='.repeat(80));
  console.log('');

  // Summary
  console.log('📊 MAPPING SUMMARY:\n');
  console.log(`✅ Mapped: ${mappings.length}/${YOUR_COMPETITIONS.length}`);
  console.log(`❌ Unmapped: ${unmapped.length}/${YOUR_COMPETITIONS.length}`);
  console.log('');

  if (unmapped.length > 0) {
    console.log('⚠️  UNMAPPED COMPETITIONS:');
    unmapped.forEach(comp => {
      console.log(`   - ${comp.name} (ID: ${comp.id})`);
    });
    console.log('');
    console.log('💡 Tip: Manually search Sports Monks for these leagues');
    console.log('   You can browse all leagues at: https://www.sportmonks.com/football-api/');
    console.log('');
  }

  // Generate SQL migration
  if (mappings.length > 0) {
    console.log('📝 GENERATING SQL MIGRATION:\n');

    const sql = `-- Sports Monks League Mapping
-- Generated: ${new Date().toISOString()}

-- Create mapping table
CREATE TABLE IF NOT EXISTS api_competition_mapping (
  our_competition_id INT PRIMARY KEY REFERENCES competitions(id),
  sportmonks_league_id INT NOT NULL,
  sportmonks_league_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_verified_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert mappings
${mappings.map(m => `INSERT INTO api_competition_mapping (our_competition_id, sportmonks_league_id, sportmonks_league_name, is_active)
VALUES (${m.your_id}, ${m.sportmonks_id}, '${m.sportmonks_name.replace(/'/g, "''")}', ${m.sportmonks_active})
ON CONFLICT (our_competition_id) DO UPDATE SET
  sportmonks_league_id = EXCLUDED.sportmonks_league_id,
  sportmonks_league_name = EXCLUDED.sportmonks_league_name,
  is_active = EXCLUDED.is_active,
  last_verified_at = NOW();`).join('\n\n')}

-- Verify mappings
SELECT
  c.id as our_id,
  c.name as our_name,
  m.sportmonks_league_id,
  m.sportmonks_league_name,
  m.is_active
FROM competitions c
LEFT JOIN api_competition_mapping m ON c.id = m.our_competition_id
ORDER BY c.id;
`;

    const fs = await import('fs');
    const sqlPath = './database/migrations/sportmonks-league-mapping.sql';
    fs.writeFileSync(sqlPath, sql);

    console.log(`✅ SQL migration saved to: ${sqlPath}`);
    console.log('');
  }

  // Generate JSON mapping for code
  const jsonPath = './src/config/sportmonks-mappings.json';
  const mappingConfig = {
    generated_at: new Date().toISOString(),
    leagues: Object.fromEntries(
      mappings.map(m => [m.your_id, {
        sportmonks_id: m.sportmonks_id,
        name: m.sportmonks_name,
        our_name: m.your_name,
        active: m.sportmonks_active
      }])
    ),
    unmapped: unmapped.map(u => ({
      id: u.id,
      name: u.name,
      country: u.country
    }))
  };

  const fs = await import('fs');
  fs.writeFileSync(jsonPath, JSON.stringify(mappingConfig, null, 2));
  console.log(`✅ JSON config saved to: ${jsonPath}`);
  console.log('');

  // Show example usage
  console.log('💻 EXAMPLE USAGE IN CODE:\n');
  console.log('```javascript');
  console.log('import leagueMappings from "./config/sportmonks-mappings.json";');
  console.log('');
  console.log('// Get Sports Monks ID for Premier League');
  console.log('const sportmonksId = leagueMappings.leagues[1].sportmonks_id;');
  console.log('console.log(sportmonksId); // Output:', mappings.find(m => m.your_id === 1)?.sportmonks_id || 'N/A');
  console.log('```');
  console.log('');

  // Show popular English leagues for reference
  console.log('🏴󠁧󠁢󠁥󠁮󠁧󠁿  POPULAR ENGLISH LEAGUES IN SPORTS MONKS:\n');
  const englishLeagues = allLeagues
    .filter(l => l.country && l.country.name === 'England' && l.active)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 15);

  englishLeagues.forEach(league => {
    console.log(`   ${league.id.toString().padStart(6)}: ${league.name}`);
  });
  console.log('');

  // Show European competitions for reference
  console.log('🇪🇺 EUROPEAN COMPETITIONS IN SPORTS MONKS:\n');
  const europeanComps = allLeagues
    .filter(l =>
      (l.name.includes('Champions') ||
       l.name.includes('Europa') ||
       l.name.includes('Conference')) &&
      !l.name.includes('U19') &&
      !l.name.includes('U18')
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  europeanComps.forEach(league => {
    console.log(`   ${league.id.toString().padStart(6)}: ${league.name}`);
  });
  console.log('');

  console.log('✅ MAPPING COMPLETE!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. Review the generated SQL file');
  console.log('   2. Run the migration in Supabase');
  console.log('   3. Use the JSON config in your sync scripts');
  console.log('   4. Manually map any unmapped competitions');
}

// Run the mapping
mapLeagues().catch(console.error);
