import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.SPORTMONKS_TOKEN;

const response = await fetch(
  `https://api.sportmonks.com/v3/football/rounds/372204?api_token=${TOKEN}&include=fixtures.tvstations.tvstation;fixtures.participants`
);
const json = await response.json();

if (!json.data) {
  console.log('No data returned');
  process.exit(1);
}

const fixtures = json.data.fixtures || [];
console.log(`MW10 has ${fixtures.length} fixtures\n`);

let totalWithBroadcasters = 0;
let totalUKBroadcasters = 0;

fixtures.forEach(f => {
  const home = f.participants?.find(p => p.meta?.location === 'home');
  const away = f.participants?.find(p => p.meta?.location === 'away');

  const tvCount = f.tvstations?.length || 0;

  console.log(`${home?.name || '?'} vs ${away?.name || '?'}`);
  console.log(`  Has tvstations array: ${f.tvstations ? 'YES' : 'NO'}`);
  console.log(`  Total TV stations: ${tvCount}`);

  if (tvCount > 0) {
    // Show first few stations with their country IDs
    f.tvstations.slice(0, 3).forEach(ts => {
      console.log(`    - ${ts.tvstation?.name || 'NO NAME'} (country_id: ${ts.country_id})`);
    });
  }

  const ukStations = f.tvstations?.filter(ts =>
    ts.tvstation &&
    [11, 455, 462].includes(ts.country_id) &&
    !ts.tvstation.name?.includes('ROI')
  ) || [];

  if (ukStations.length > 0) {
    totalWithBroadcasters++;
    totalUKBroadcasters += ukStations.length;
    console.log(`  ✅ UK stations: ${ukStations.length}`);
  }
  console.log('');
});

console.log(`\nSummary:`);
console.log(`  Fixtures with UK broadcasters: ${totalWithBroadcasters}/${fixtures.length}`);
console.log(`  Total UK broadcaster entries: ${totalUKBroadcasters}`);
