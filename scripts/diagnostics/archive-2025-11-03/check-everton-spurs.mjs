import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.SPORTMONKS_TOKEN;

const response = await fetch(
  `https://api.sportmonks.com/v3/football/fixtures/19427541?api_token=${TOKEN}&include=tvstations.tvstation;participants`
);
const json = await response.json();

if (!json.data) {
  console.log('API Response:', JSON.stringify(json, null, 2));
  process.exit(1);
}

const f = json.data;
console.log('Fixture:', f.name);
console.log('Date:', f.starting_at);
console.log('TV Stations:', f.tvstations?.length || 0);

const ukStations = f.tvstations?.filter(ts =>
  [11, 455, 462].includes(ts.country_id) &&
  !ts.tvstation?.name?.includes('ROI')
) || [];

console.log('UK Stations:', ukStations.length);
ukStations.forEach(ts => console.log('  -', ts.tvstation?.name));
