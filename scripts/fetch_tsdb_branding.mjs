// scripts/fetch_tsdb_branding.mjs
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// --- CONFIG ---
// Get a free API key from https://www.thesportsdb.com/api.php
// For dev, many examples use key "3" but use your own if you have it.
const TSDB_API_KEY = process.env.TSDB_API_KEY ?? '3';
// Premier League id in TheSportsDB
const EPL_LEAGUE_ID = '4328';

// Supabase (use SERVICE ROLE key locally; do NOT ship this to frontend)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in .env');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// Small delay to stay well under free-tier rate limits (~2 req/sec)
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Normalize names to improve matching (cheap & cheerful)
function norm(name) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number} ]/gu, '') // strip diacritics/punct
    .replace(/\b(afc|fc|cf|the)\b/g, '')        // drop common suffixes
    .replace(/\s+/g, ' ')
    .trim();
}

// Manual overrides for tricky names (local -> array of acceptable TSDB names)
const ALIASES = {
  'wolverhampton wanderers': ['wolves', 'wolverhampton wanderers'],
  'brighton & hove albion': ['brighton hove albion', 'brighton and hove albion'],
  'manchester united': ['manchester utd', 'manchester united'],
  'manchester city': ['manchester city'],
  'newcastle united': ['newcastle utd', 'newcastle united'],
  'tottenham hotspur': ['tottenham', 'spurs', 'tottenham hotspur'],
  'west ham united': ['west ham', 'west ham united'],
};

// Map TSDB team ids -> local team ids from external_ids
async function loadTeamIdMap(){
  const m = new Map();
  const { data, error } = await sb
    .from('external_ids')
    .select('local_id, source_id')
    .eq('entity_type', 'team')
    .eq('source', 'thesportsdb');
  if (error) throw error;
  for (const r of (data || [])) {
    m.set(String(r.source_id), r.local_id);
  }
  return m;
}

// Try to match a TSDB team to a local name
function matchTsdbToLocal(tsdbName, localIndex) {
  const n = norm(tsdbName);
  // direct normalized name hit
  if (localIndex.has(n)) return localIndex.get(n);

  // alias fallback: normalize the alias owner key too
  for (const [local, aliasList] of Object.entries(ALIASES)) {
    if (aliasList.map(norm).includes(n)) {
      const normalizedLocalKey = norm(local);
      return localIndex.get(normalizedLocalKey) || null;
    }
  }
  return null;
}
// ---- Fixtures import (TSDB -> staging -> fixtures) ----
function toUtcTimestamp(tsdbEvent){
  // Prefer strTimestamp if present; fallback to dateEvent + strTime
  const ts = tsdbEvent.strTimestamp || null;
  if (ts) {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  const dStr = tsdbEvent.dateEvent || tsdbEvent.dateEventLocal || null;
  const tStr = tsdbEvent.strTime || tsdbEvent.strTimeLocal || '00:00:00';
  if (!dStr) return null;
  const iso = `${dStr}T${tStr.replace(/\s+/g,'')}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function parseMatchday(tsdbEvent){
  // Use intRound if available; else parse digits from strRound
  if (typeof tsdbEvent.intRound === 'number') return tsdbEvent.intRound;
  const sr = tsdbEvent.strRound || tsdbEvent.strStage || '';
  const m = String(sr).match(/\d+/);
  return m ? Number(m[0]) : null;
}

async function upsertStageRows(rows){
  if (!rows.length) return;
  const { error } = await sb
    .from('tsdb_fixtures_stage')
    .upsert(rows, { onConflict: 'source,source_event_id' });
  if (error) throw error;
}

async function mergeToFixtures(){
  const { error } = await sb.rpc('merge_tsdb_fixtures');
  if (error) throw error;
}

async function importSeasonFixturesEPL({ season }){
  if (!season) throw new Error('Missing season (e.g. 2025-2026)');
  console.log(`Fetching EPL season ${season} fixtures from TSDB…`);
  const url = `https://www.thesportsdb.com/api/v1/json/${TSDB_API_KEY}/eventsseason.php?id=4328&s=${encodeURIComponent(season)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TSDB HTTP ${res.status}`);
  const json = await res.json();
  const events = Array.isArray(json.events) ? json.events : [];
  const teamIdMap = await loadTeamIdMap();
  console.log(`Got ${events.length} events`);

  const stageRows = [];
  for (const ev of events){
    const utc = toUtcTimestamp(ev);
    const md = parseMatchday(ev);

    const homeId = teamIdMap.get(String(ev.idHomeTeam)) || null;
    const awayId = teamIdMap.get(String(ev.idAwayTeam)) || null;

    const row = {
      source: 'thesportsdb',
      source_event_id: String(ev.idEvent),
      league_name: ev.strLeague || 'English Premier League',
      season: ev.strSeason || season,
      round: ev.strRound || ev.strStage || null,
      matchday: md,
      home_team: ev.strHomeTeam,     // keep for debugging
      away_team: ev.strAwayTeam,     // keep for debugging
      home_team_id: homeId,          // mapped local id
      away_team_id: awayId,          // mapped local id
      utc_kickoff: ev.strTimestamp ? toUtcTimestamp(ev) : null,
      local_date: ev.dateEvent || ev.dateEventLocal || null,
      local_time: ev.strTime || ev.strTimeLocal || null,
      venue: ev.strVenue || null,
      payload: ev,
    };
    stageRows.push(row);
  }

  // Chunk upserts to keep payload sizes reasonable
  const chunkSize = 500;
  for (let i=0; i<stageRows.length; i+=chunkSize){
    await upsertStageRows(stageRows.slice(i, i+chunkSize));
    await new Promise(r=>setTimeout(r, 400)); // be polite
  }

  console.log('Merging staged rows into fixtures…');
  await mergeToFixtures();
  console.log('Import complete ✅');
}
async function run() {
  console.log('Fetching local teams…');
  const { data: localTeams, error: localErr } = await sb
    .from('teams')
    .select('id,name');

  if (localErr) throw localErr;

  const localIdx = new Map(localTeams.map(t => [norm(t.name), t]));

  console.log('Fetching Premier League teams from TheSportsDB…');
  const url = `https://www.thesportsdb.com/api/v1/json/${TSDB_API_KEY}/search_all_teams.php?l=English_Premier_League`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error('TSDB error:', res.status, res.statusText);
    process.exit(1);
  }
  const json = await res.json();
  const teams = (json.teams || []).filter(t =>
    t?.strSport === 'Soccer' && t?.strLeague === 'English Premier League'
  );
  console.log(`Got ${teams.length} TSDB teams`);

  const upsertsExternal = [];
  const upsertsBranding = [];
  const misses = [];

  for (const t of teams) {
    const match = matchTsdbToLocal(t.strTeam, localIdx);
    if (!match) {
      misses.push(t.strTeam);
      continue;
    }

    // Artwork fields vary; strTeamBadge is the common one
    const badge = t.strTeamBadge || t.strBadge || null;

    upsertsExternal.push({
      entity_type: 'team',
      local_id: match.id,
      source: 'thesportsdb',
      source_id: String(t.idTeam),
    });

    upsertsBranding.push({
      team_id: match.id,
      badge_url: badge,
      // Colors are sparse in TSDB; keep placeholders for future enrichment
      primary_color: null,
      secondary_color: null,
    });
  }

  console.log(`Matched ${upsertsBranding.length} teams, ${misses.length} unmatched`);
  if (misses.length) console.log('Unmatched TSDB names:', misses.join(', '));

  // Fallback: for any local teams that didn't get branding yet, try per-team search by name
  const matchedLocalIds = new Set(upsertsBranding.map(x => x.team_id));
  const remainingLocals = localTeams.filter(t => !matchedLocalIds.has(t.id));

  for (const lt of remainingLocals) {
    const q = encodeURIComponent(lt.name);
    const searchUrl = `https://www.thesportsdb.com/api/v1/json/${TSDB_API_KEY}/searchteams.php?t=${q}`;
    try {
      await sleep(600); // be nice to the free tier
      const r = await fetch(searchUrl);
      if (!r.ok) continue;
      const j = await r.json();
      const arr = j?.teams || [];
      // Choose the best candidate by normalized name match
      let best = null;
      for (const cand of arr) {
        const nCand = norm(cand.strTeam || '');
        if (nCand && nCand === norm(lt.name)) { best = cand; break; }
      }
      const chosen = best || arr[0];
      if (chosen) {
        const badge = chosen.strTeamBadge || chosen.strBadge || null;
        if (badge) {
          upsertsExternal.push({
            entity_type: 'team',
            local_id: lt.id,
            source: 'thesportsdb',
            source_id: String(chosen.idTeam),
          });
          upsertsBranding.push({
            team_id: lt.id,
            badge_url: badge,
            primary_color: null,
            secondary_color: null,
          });
          console.log(`Fallback matched via search: ${lt.name}`);
        }
      }
    } catch (e) {
      console.warn('Search fallback failed for', lt.name, e?.message || e);
    }
  }

  // Upsert external_ids (align with table PK: entity_type, local_id, source)
  // We only want to skip if a row already exists for that (entity_type, local_id, source);
  // do NOT error on duplicates from previous runs.
  if (upsertsExternal.length) {
    const { error } = await sb
      .from('external_ids')
      .upsert(upsertsExternal, {
        onConflict: 'entity_type,local_id,source',
        ignoreDuplicates: true,
      });
    if (error) throw error;
  }

  // Upsert team_branding
  if (upsertsBranding.length) {
    const { error } = await sb
      .from('team_branding')
      .upsert(upsertsBranding, { onConflict: 'team_id' });
    if (error) throw error;
  }

  console.log('Done ✅');
}

const args = process.argv.slice(2);
const isImport = args.includes('--import-fixtures');

async function main(){
  if (isImport){
    const seasonArg = (args.find(a => a.startsWith('season=')) || '').split('=')[1];
    await importSeasonFixturesEPL({ season: seasonArg });
  } else {
    await run(); // branding
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});