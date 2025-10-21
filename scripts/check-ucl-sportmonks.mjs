import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.SPORTMONKS_TOKEN || 'lNX5lqJtQo2FSsKfM4PvDzhgkS4AkGLkjRtYZWjNmSZvdGHJxxtD0HyHoazs';

// Arsenal vs Atletico: 19568463
// Villarreal vs Man City: 19568598

const fixtures = [
  { id: 19568463, name: 'Arsenal vs Atletico Madrid' },
  { id: 19568598, name: 'Villarreal vs Man City' }
];

for (const fixture of fixtures) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${fixture.name} (ID: ${fixture.id})`);
  console.log('='.repeat(60));

  const response = await fetch(
    `https://api.sportmonks.com/v3/football/fixtures/${fixture.id}?api_token=${TOKEN}&include=tvstations.tvstation`
  );
  const data = await response.json();

  if (!data.data) {
    console.log('❌ No data returned');
    continue;
  }

  const tvStations = data.data.tvstations || [];
  console.log(`\nTotal TV stations: ${tvStations.length}\n`);

  if (tvStations.length === 0) {
    console.log('❌ No TV stations found in SportMonks API');
    continue;
  }

  // Filter for UK broadcasts
  const ukStations = tvStations.filter(ts => {
    if (!ts.tvstation) return false;
    if (![11, 455, 462].includes(ts.country_id)) return false;
    if (ts.tvstation.name && ts.tvstation.name.includes('ROI')) return false;
    return true;
  });

  console.log(`UK TV stations (country_id 11, 455, 462, excluding ROI): ${ukStations.length}\n`);

  ukStations.forEach(ts => {
    console.log(`  📺 ${ts.tvstation.name}`);
    console.log(`     Country ID: ${ts.country_id}`);
    console.log(`     TV Station ID: ${ts.tvstation_id}`);
    console.log('');
  });

  if (ukStations.length === 0) {
    console.log('All TV stations (including non-UK):\n');
    tvStations.slice(0, 10).forEach(ts => {
      console.log(`  - ${ts.tvstation?.name || 'NO NAME'} (country_id: ${ts.country_id})`);
    });
  }
}
