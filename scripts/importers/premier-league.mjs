import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from config/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../config/.env') });
import { createClient } from '@supabase/supabase-js';

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  FOOTBALL_DATA_API_KEY,
  SEASON = '2024',
  COMP_ID_DB = '1',
  COMP_ID_API = '2021',
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !FOOTBALL_DATA_API_KEY) {
  console.error('Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FOOTBALL_DATA_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// A few friendly aliases in case your DB uses slightly different canonical names
const NAME_ALIASES = new Map([
  ['Wolves', 'Wolverhampton Wanderers FC'],
  ['Nottingham Forest', 'Nottingham Forest FC'],
  ['Brighton Hove Albion', 'Brighton & Hove Albion FC'],
  ['Brighton and Hove Albion FC', 'Brighton & Hove Albion FC'],
  ['Bournemouth', 'AFC Bournemouth'],
  ['Man City', 'Manchester City FC'],
  ['Manchester City', 'Manchester City FC'],
  ['Man United', 'Manchester United FC'],
  ['Manchester United', 'Manchester United FC'],
  ['Spurs', 'Tottenham Hotspur FC'],
  ['Tottenham', 'Tottenham Hotspur FC'],
  ['Newcastle', 'Newcastle United FC'],
  ['West Ham', 'West Ham United FC'],
  ['Leeds', 'Leeds United FC'],
  ['Fulham', 'Fulham FC'],
  ['Everton', 'Everton FC'],
  ['Arsenal', 'Arsenal FC'],
  ['Chelsea', 'Chelsea FC'],
  ['Liverpool', 'Liverpool FC'],
  ['Aston Villa', 'Aston Villa FC'],
  ['Crystal Palace', 'Crystal Palace FC'],
  ['Brentford', 'Brentford FC'],
  ['Burnley', 'Burnley FC'],
]);

function normaliseName(apiName) {
  return NAME_ALIASES.get(apiName) || `${apiName.endsWith('FC') ? apiName : apiName + ' FC'}`; // cheap fallback
}

function mapStatus(s) {
  // football-data v4 statuses (examples): SCHEDULED, TIMED, IN_PLAY, PAUSED, FINISHED, POSTPONED, SUSPENDED, CANCELED
  const m = {
    SCHEDULED: 'scheduled',
    TIMED: 'scheduled',
    IN_PLAY: 'live',
    PAUSED: 'live',
    FINISHED: 'finished',
    POSTPONED: 'postponed',
    SUSPENDED: 'suspended',
    CANCELED: 'canceled',
  };
  return m[s] || (s ? s.toLowerCase() : 'scheduled');
}

async function getOrCreateTeamId(canonicalName) {
  // 1) try exact name
  {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name')
      .eq('name', canonicalName)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data?.id) return data.id;
  }

  // 2) try by slug
  const slug = slugify(canonicalName);
  {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name')
      .eq('slug', slug)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data?.id) return data.id;
  }

  // 3) create team (name + slug). Your schema requires slug NOT NULL.
  const { data, error } = await supabase
    .from('teams')
    .insert([{ name: canonicalName, slug, competition_id: Number(COMP_ID_DB) }])
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function fetchFootballDataMatches() {
  const url = `https://api.football-data.org/v4/competitions/${COMP_ID_API}/matches?season=${SEASON}`;
  const res = await fetch(url, { headers: { 'X-Auth-Token': FOOTBALL_DATA_API_KEY } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`football-data HTTP ${res.status}: ${body}`);
  }
  const json = await res.json();
  if (!json.matches) throw new Error('Unexpected response: no matches[]');
  return json.matches;
}

async function buildRows(matches) {
  const rows = [];
  for (const m of matches) {
    // football-data fields
    const homeApi = m.homeTeam?.name;
    const awayApi = m.awayTeam?.name;
    const utcIso = m.utcDate;             // e.g. "2025-09-13T11:30:00Z"
    const md = Number(m.matchday) || null;
    const status = mapStatus(m.status);

    if (!homeApi || !awayApi || !utcIso) continue;

    const homeName = normaliseName(homeApi);
    const awayName = normaliseName(awayApi);

    const [homeId, awayId] = await Promise.all([
      getOrCreateTeamId(homeName),
      getOrCreateTeamId(awayName),
    ]);

    rows.push({
      competition_id: Number(COMP_ID_DB),
      utc_kickoff: utcIso,          // your column is timestamptz; ISO Z is fine
      home_team_id: homeId,
      away_team_id: awayId,
      matchday: md,
      status,
    });
  }
  return rows;
}

async function upsertFixtures(rows) {
  // Insert fixtures in chunks, skip duplicates
  const chunk = 100;
  let inserted = 0, skipped = 0;
  
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    
    try {
      const { data, error } = await supabase
        .from('fixtures')
        .insert(slice)
        .select('id');
      
      if (error) {
        // Check if it's a duplicate key error
        if (error.code === '23505') { // unique_violation
          console.log(`Skipped ${slice.length} duplicate fixtures (${i + 1}-${i + slice.length})`);
          skipped += slice.length;
        } else {
          throw error;
        }
      } else {
        inserted += data?.length || slice.length;
        console.log(`Inserted ${inserted}/${rows.length} fixtures`);
      }
    } catch (err) {
      console.error(`Error inserting fixtures batch ${i}-${i + slice.length}:`, err.message);
      // Try inserting one by one to identify problematic records
      for (const fixture of slice) {
        try {
          await supabase.from('fixtures').insert([fixture]);
          inserted++;
        } catch (singleError) {
          if (singleError.code === '23505') {
            skipped++;
          } else {
            console.error('Failed to insert fixture:', fixture, singleError.message);
          }
        }
      }
    }
  }
  
  console.log(`Summary: ${inserted} inserted, ${skipped} skipped duplicates`);
}

async function main() {
  console.log('🏈 Premier League Import Script Starting...');
  console.log(`Config: season=${SEASON}, comp_api=${COMP_ID_API}, comp_db=${COMP_ID_DB}`);
  
  try {
    console.log(`Fetching PL fixtures from football-data...`);
    const matches = await fetchFootballDataMatches();
    console.log(`✅ Fetched ${matches.length} matches from API`);
    
    console.log(`Building fixture rows...`);
    const rows = await buildRows(matches);
    console.log(`✅ Prepared ${rows.length} fixture rows`);
    
    console.log(`Inserting fixtures into database...`);
    await upsertFixtures(rows);
    console.log('🎉 Import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});