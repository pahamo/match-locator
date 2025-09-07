import { createClient } from '@supabase/supabase-js';

// Use env vars for safety
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY env vars');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- helpers you referenced ---
async function getTeamsForCompetition(competitionId) {
  // Get teams for the specified competition
  const { data, error } = await supabase
    .from('teams')
    .select('id, name')
    .eq('competition_id', competitionId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function insertFixture(fixture) {
  const { error } = await supabase.from('fixtures').insert(fixture).single();
  if (error) throw error;
}

// --- your generator (with small notes left intact) ---
function generateSampleFixtures(teams, competitionId, competitionName) {
  if (teams.length < 2) {
    console.log(`⚠️  Not enough teams for ${competitionName} (need at least 2, have ${teams.length})`);
    return [];
  }

  const fixtures = [];
  // Start fixtures from next week  
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() + 7); // Next week
  startDate.setUTCHours(14, 0, 0, 0); // 2pm UTC
  
  const daysInterval = 7; // one week

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const homeTeam = teams[i];
      const awayTeam = teams[j];

      const fixtureDate = new Date(startDate);
      fixtureDate.setUTCDate(startDate.getUTCDate() + (fixtures.length * daysInterval));

      const fixture = {
        external_ref: `${competitionName.toLowerCase().replace(/\s+/g, '_')}_${fixtures.length + 1}`,
        utc_kickoff: fixtureDate.toISOString(),
        matchday: Math.floor(fixtures.length / Math.max(1, Math.floor(teams.length / 2))) + 1,
        venue: `${homeTeam.name} Stadium`,
        status: 'scheduled',
        competition_id: competitionId,
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
      };

      fixtures.push(fixture);

      // For small competitions (2 teams), create return fixture too
      if (teams.length === 2) {
        const returnFixture = {
          external_ref: `${competitionName.toLowerCase().replace(/\s+/g, '_')}_${fixtures.length + 1}`,
          utc_kickoff: new Date(fixtureDate.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString(),
          matchday: 2,
          venue: `${awayTeam.name} Stadium`,
          status: 'scheduled',
          competition_id: competitionId,
          home_team_id: awayTeam.id,
          away_team_id: homeTeam.id,
        };
        fixtures.push(returnFixture);
      }

      if (fixtures.length >= 4) break;
    }
    if (fixtures.length >= 4) break;
  }

  return fixtures;
}

function nextSaturdayUTC() {
  const d = new Date();
  // normalize to UTC date w/o time
  const u = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = u.getUTCDay(); // 0 Sun … 6 Sat
  const delta = (6 - day + 7) % 7 || 7; // next Saturday (at least 1–7 days ahead)
  u.setUTCDate(u.getUTCDate() + delta);
  // set approximate UK 3pm local: if currently BST (Mar–Oct) 14:00 UTC, else 15:00 UTC.
  // For simplicity, keep 14:00 UTC; you already overwrite later anyway.
  u.setUTCHours(14, 0, 0, 0);
  return u;
}

// --- main ---
async function main() {
  console.log('🚀 Importing sample fixtures for all competitions...\n');

  const competitions = [
    { id: 1, name: 'Premier League' },
    { id: 2, name: 'Bundesliga' },
    { id: 3, name: 'La Liga' },
    { id: 4, name: 'Serie A' },
    { id: 5, name: 'Ligue 1' }
  ];

  let totalFixtures = 0;
  let totalSuccess = 0;

  for (const comp of competitions) {
    console.log(`📊 Processing ${comp.name}...`);
    try {
      const teams = await getTeamsForCompetition(comp.id);
      console.log(`   👥 Found ${teams.length} teams`);
      if (teams.length === 0) {
        console.log(`   ⚠️  No teams found for ${comp.name}, skipping fixtures`);
        continue;
      }

      const fixtures = generateSampleFixtures(teams, comp.id, comp.name);
      console.log(`   ⚽ Generated ${fixtures.length} sample fixtures`);

      let successCount = 0;
      for (const fixture of fixtures) {
        try {
          await insertFixture(fixture);
          successCount++;
          const homeTeam = teams.find(t => t.id === fixture.home_team_id)?.name || 'Unknown';
          const awayTeam = teams.find(t => t.id === fixture.away_team_id)?.name || 'Unknown';
          console.log(`   ✅ ${homeTeam} vs ${awayTeam}`);
        } catch (error) {
          console.log(`   ❌ Failed: ${error.message}`);
        }
        await new Promise(r => setTimeout(r, 100));
      }

      console.log(`   📈 Inserted ${successCount}/${fixtures.length} fixtures\n`);
      totalFixtures += fixtures.length;
      totalSuccess += successCount;

    } catch (error) {
      console.log(`   ❌ Error processing ${comp.name}: ${error.message}`);
    }
  }

  console.log('🎯 Import Summary:');
  console.log(`✅ Total fixtures created: ${totalSuccess}/${totalFixtures}`);
  console.log(`📊 Competitions processed: ${competitions.length}`);

  if (totalSuccess > 0) {
    console.log('\n🎉 Sample fixtures imported successfully!');
    console.log('\n🔗 Test your multi-competition frontend:');
    console.log('   - Home page: /football/ (should show upcoming fixtures)');
    console.log('   - Competition dropdown: Switch between leagues');
    console.log('   - Fixtures page: /football/bundesliga/fixtures');
    console.log('   - Each competition should show different fixtures');
    console.log('\n💡 Tips:');
    console.log('   - Fixtures start from the next Saturday');
    console.log('   - Each competition has up to 8 sample fixtures');
  } else {
    console.log('\n❌ No fixtures were imported');
    console.log('💡 Check that teams were imported correctly first');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});