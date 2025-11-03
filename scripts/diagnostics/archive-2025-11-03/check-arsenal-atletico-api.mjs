import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.SPORTMONKS_TOKEN;

// Arsenal vs Atletico Madrid - fixture ID from our database check
const FIXTURE_ID = 19568463; // SportMonks fixture ID for this match

console.log('🔍 Checking SportMonks API for Arsenal vs Atletico Madrid...\n');

const response = await fetch(
  `https://api.sportmonks.com/v3/football/fixtures/${FIXTURE_ID}?api_token=${TOKEN}&include=tvstations.tvstation`
);

const data = await response.json();

if (!data.data) {
  console.log('❌ No data returned from API');
  process.exit(1);
}

const fixture = data.data;
console.log(`Match: ${fixture.name}`);
console.log(`Date: ${fixture.starting_at}`);
console.log(`\nTotal TV stations: ${fixture.tvstations?.length || 0}\n`);

if (!fixture.tvstations || fixture.tvstations.length === 0) {
  console.log('❌ No TV stations found in API');
  process.exit(0);
}

// Filter for UK broadcasts (country_id 11, 455, 462)
const ukStations = fixture.tvstations.filter(ts => {
  if (!ts.tvstation) return false;
  if (![11, 455, 462].includes(ts.country_id)) return false;
  const name = ts.tvstation.name || '';
  if (name.includes('ROI')) return false;
  return true;
});

console.log(`UK TV stations (country_id 11, 455, 462, excluding ROI): ${ukStations.length}\n`);

ukStations.forEach(ts => {
  console.log(`📺 ${ts.tvstation.name}`);
  console.log(`   Country ID: ${ts.country_id}`);
  console.log(`   Station ID: ${ts.tvstation_id}`);
  console.log('');
});

if (ukStations.length === 0) {
  console.log('\n⚠️ No UK broadcasters found - this match might not be televised in the UK');
}
