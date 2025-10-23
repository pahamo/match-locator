import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.SPORTMONKS_TOKEN;
const FIXTURE_ID = 19568463; // Arsenal vs Atletico

console.log('🧪 Testing broadcaster filtering logic...\n');

const response = await fetch(
  `https://api.sportmonks.com/v3/football/fixtures/${FIXTURE_ID}?api_token=${TOKEN}&include=tvstations.tvstation`
);

const data = await response.json();
const tvStations = data.data.tvstations || [];

console.log(`Total TV stations from API: ${tvStations.length}\n`);

// Apply the same filtering logic as sync-upcoming-broadcasters.mjs
const ukStations = tvStations.filter(ts => {
  if (!ts.tvstation) return false;

  // Include England (462), Ireland (455), and UK (11) country IDs
  if (![11, 455, 462].includes(ts.country_id)) {
    return false;
  }

  const channelName = ts.tvstation.name || '';

  // Filter out Irish-specific channels (have "ROI" in name)
  if (channelName.includes('ROI')) {
    return false;
  }

  // Filter out non-UK international channels by name
  const nonUKKeywords = [
    'Germany', 'France', 'Spain', 'Italy', 'Portugal',
    'Netherlands', 'Belgium', 'Austria', 'Switzerland',
    'Poland', 'Turkey', 'Greece', 'Denmark', 'Sweden',
    'Norway', 'Finland', 'Czech', 'Hungary', 'Russia',
    'Ukraine', 'Romania', 'Serbia', 'Croatia', 'Bulgaria',
    'Arabic', 'MENA', 'Asia', 'Africa', 'Latin America'
  ];

  for (const keyword of nonUKKeywords) {
    if (channelName.includes(keyword)) {
      return false;
    }
  }

  return true;
});

console.log(`✅ UK broadcasters after filtering: ${ukStations.length}\n`);

ukStations.forEach(ts => {
  console.log(`  - ${ts.tvstation.name} (country_id: ${ts.country_id}, station_id: ${ts.tvstation_id})`);
});

console.log('\n🔍 Broadcasters that were filtered OUT:\n');

const filteredOut = tvStations.filter(ts => {
  if (!ts.tvstation) return false;
  if (![11, 455, 462].includes(ts.country_id)) return false;

  const channelName = ts.tvstation.name || '';

  // Check if it matches any filter criteria
  if (channelName.includes('ROI')) return true;

  const nonUKKeywords = [
    'Germany', 'France', 'Spain', 'Italy', 'Portugal',
    'Netherlands', 'Belgium', 'Austria', 'Switzerland',
    'Poland', 'Turkey', 'Greece', 'Denmark', 'Sweden',
    'Norway', 'Finland', 'Czech', 'Hungary', 'Russia',
    'Ukraine', 'Romania', 'Serbia', 'Croatia', 'Bulgaria',
    'Arabic', 'MENA', 'Asia', 'Africa', 'Latin America'
  ];

  for (const keyword of nonUKKeywords) {
    if (channelName.includes(keyword)) return true;
  }

  return false;
});

filteredOut.forEach(ts => {
  console.log(`  - ${ts.tvstation.name} (country_id: ${ts.country_id}) - Contains non-UK keyword`);
});
