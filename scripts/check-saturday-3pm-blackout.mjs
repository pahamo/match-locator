import dotenv from 'dotenv';
dotenv.config();

const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

// Find a 3pm Saturday Premier League fixture
const findSaturdayFixture = async () => {
  // Get next few weeks of PL fixtures
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);

  const dateFrom = today.toISOString().split('T')[0];
  const dateTo = nextMonth.toISOString().split('T')[0];

  const url = `https://api.sportmonks.com/v3/football/fixtures/between/${dateFrom}/${dateTo}?api_token=${SPORTMONKS_TOKEN}&include=tvstations.tvstation&leagues=8`;

  console.log(`📅 Checking fixtures from ${dateFrom} to ${dateTo}\n`);

  const response = await fetch(url);
  const json = await response.json();

  // Find 3pm Saturday matches
  const saturdayFixtures = json.data.filter(f => {
    const kickoff = new Date(f.starting_at);
    const ukTime = new Date(kickoff.toLocaleString('en-US', { timeZone: 'Europe/London' }));
    const dayOfWeek = ukTime.getDay(); // 6 = Saturday
    const hour = ukTime.getHours();

    return dayOfWeek === 6 && hour === 15;
  });

  console.log(`🔍 Found ${saturdayFixtures.length} 3pm Saturday fixtures\n`);

  if (saturdayFixtures.length > 0) {
    // Show first 3 examples
    saturdayFixtures.slice(0, 3).forEach((fixture, idx) => {
      console.log(`\n━━━ Example ${idx + 1} ━━━`);
      console.log(`📅 Fixture: ${fixture.name}`);
      console.log(`⏰ Kickoff: ${fixture.starting_at}`);
      console.log(`📺 TV Stations: ${fixture.tvstations ? fixture.tvstations.length : 0}`);

      if (fixture.tvstations && fixture.tvstations.length > 0) {
        console.log('🌍 All broadcasters from API:');
        fixture.tvstations.forEach(ts => {
          if (ts.tvstation) {
            console.log(`   - ${ts.tvstation.name} (Country ID: ${ts.country_id}, Type: ${ts.tvstation.type || 'unknown'})`);
          }
        });
      } else {
        console.log('❌ No TV stations returned by SportMonks API');
      }
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Total 3pm Saturday matches: ${saturdayFixtures.length}`);
    const withBroadcasters = saturdayFixtures.filter(f => f.tvstations && f.tvstations.length > 0).length;
    console.log(`   With broadcasters: ${withBroadcasters}`);
    console.log(`   Without broadcasters: ${saturdayFixtures.length - withBroadcasters}`);
  } else {
    console.log('❌ No 3pm Saturday fixtures found in date range');
  }
};

findSaturdayFixture();
