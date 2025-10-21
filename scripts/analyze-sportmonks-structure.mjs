import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.SPORTMONKS_TOKEN;
const PL_LEAGUE_ID = 8;

console.log('🔍 Analyzing SportMonks Premier League structure...\n');

// 1. Get league info and current season
console.log('1️⃣ Getting league and season info...\n');
const leagueResponse = await fetch(
  `https://api.sportmonks.com/v3/football/leagues/${PL_LEAGUE_ID}?api_token=${TOKEN}&include=currentSeason`
);
const leagueData = await leagueResponse.json();

if (leagueData.data) {
  console.log('League:', leagueData.data.name);
  console.log('Current Season ID:', leagueData.data.current_season_id);

  // 2. Get season details with rounds
  const seasonId = leagueData.data.current_season_id;

  console.log('\n2️⃣ Getting season rounds...\n');
  const seasonResponse = await fetch(
    `https://api.sportmonks.com/v3/football/seasons/${seasonId}?api_token=${TOKEN}&include=rounds`
  );
  const seasonData = await seasonResponse.json();

  if (seasonData.data && seasonData.data.rounds) {
    const rounds = seasonData.data.rounds;
    console.log(`Total rounds: ${rounds.length}`);
    console.log('\nFirst 10 rounds:');
    rounds.slice(0, 10).forEach(r => {
      console.log(`  Round ${r.name} (ID: ${r.id}) - ${r.starting_at} to ${r.ending_at}`);
    });

    // 3. Check a specific round to see fixture count
    console.log('\n3️⃣ Checking fixture count for Round 9...\n');

    // Find round 9
    const round9 = rounds.find(r => r.name === '9');
    if (round9) {
      const roundResponse = await fetch(
        `https://api.sportmonks.com/v3/football/rounds/${round9.id}?api_token=${TOKEN}&include=fixtures`
      );
      const roundData = await roundResponse.json();

      console.log(`Round 9 (ID: ${round9.id}):`);
      console.log(`  Fixtures: ${roundData.data.fixtures?.length || 0}`);

      if (roundData.data.fixtures && roundData.data.fixtures.length > 0) {
        console.log('\n  Fixtures:');
        roundData.data.fixtures.forEach((f, i) => {
          console.log(`    ${i + 1}. Fixture ${f.id} - ${f.starting_at}`);
        });
      }
    } else {
      console.log('❌ Round 9 not found in rounds list');
    }
  }
}
