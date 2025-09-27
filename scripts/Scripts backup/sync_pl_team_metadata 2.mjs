// scripts/sync_pl_team_metadata.mjs
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Read env the way your project already defines them
const SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY; // server-only
const FDO_API_KEY = process.env.FOOTBALL_DATA_API_KEY || process.env.FOOTBALL_DATA_TOKEN;      // football-data.org

if (!SUPABASE_URL || !SERVICE_ROLE || !FDO_API_KEY) {
  console.error('Missing env: REACT_APP_SUPABASE_URL/SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FOOTBALL_DATA_API_KEY');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE);

const COMP_CODE = 'PL'; // Premier League (current season on free plan)

const slugify = (s) =>
  s.toLowerCase()
   .replace(/&/g, 'and')
   .replace(/[^a-z0-9]+/g, '-')
   .replace(/^-+|-+$/g, '');

function cityFromAddress(address) {
  if (!address) return null;
  const parts = address.split(',').map(p => p.trim()).filter(Boolean);
  return parts[0] || null;
}

async function fdo(path) {
  const res = await fetch(`https://api.football-data.org/v4${path}`, {
    headers: { 'X-Auth-Token': FDO_API_KEY }
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`${res.status} ${path} ${txt}`);
  }
  return res.json();
}

async function fetchCurrentPLTeams() {
  // Free tier: current season only (no ?season=)
  const data = await fdo(`/competitions/${COMP_CODE}/teams`);
  return data.teams || [];
}

function mapFromTeamList(t) {
  // The /competitions/.../teams payload already includes most fields; some can still be null
  return {
    fdo_team_id: t.id,
    name: t.name ?? null,
    slug: slugify(t.name || String(t.id)),
    short_name: t.shortName ?? null,
    tla: t.tla ?? null,
    club_colors: t.clubColors ?? null,
    venue: t.venue ?? null,
    website: t.website ?? null,
    city: cityFromAddress(t.address ?? null),
    crest_url: t.crest ?? null,
    active: true,
    competition_id: 1, // EPL teams should have competition_id = 1
  };
}

function mergePreferExistingCrest(existing, incoming) {
  // Don’t overwrite an already-set crest_url unless existing is null/empty
  if (existing && existing.trim() !== '') return existing;
  return incoming ?? null;
}

async function upsertTeamPayload(payload) {
  // Find by slug first (stable across seasons)
  const { data: existing, error: selErr } = await db
    .from('teams')
    .select('id, crest_url')
    .eq('slug', payload.slug)
    .maybeSingle();
  if (selErr) throw selErr;

  const crest_url = mergePreferExistingCrest(existing?.crest_url, payload.crest_url);

  if (existing?.id) {
    const { error } = await db
      .from('teams')
      .update({ ...payload, crest_url })
      .eq('id', existing.id);
    if (error) throw error;
    console.log(`Updated: ${payload.slug}`);
  } else {
    const { error } = await db
      .from('teams')
      .insert({ ...payload, crest_url });
    if (error) throw error;
    console.log(`Inserted: ${payload.slug}`);
  }
}

async function enrichIfNeeded(payload) {
  // If any key fields are missing, hit the per-team endpoint
  if (payload.short_name && payload.tla && payload.venue && payload.website && payload.city) {
    return payload; // good enough
  }
  const dto = await fdo(`/teams/${payload.fdo_team_id}`);
  return {
    ...payload,
    short_name: payload.short_name ?? dto.shortName ?? null,
    tla: payload.tla ?? dto.tla ?? null,
    club_colors: payload.club_colors ?? dto.clubColors ?? null,
    venue: payload.venue ?? dto.venue ?? null,
    website: payload.website ?? dto.website ?? null,
    city: payload.city ?? cityFromAddress(dto.address),
    crest_url: mergePreferExistingCrest(payload.crest_url, dto.crest ?? null),
  };
}

async function run() {
  const teams = await fetchCurrentPLTeams();

  for (const t of teams) {
    try {
      let payload = mapFromTeamList(t);
      payload = await enrichIfNeeded(payload);
      await upsertTeamPayload(payload);
      // polite pause; FDO free is ~10 req/min
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.warn(`Skip ${t.name || t.id}: ${e.message}`);
      await new Promise(r => setTimeout(r, 800));
    }
  }

  console.log('Done syncing Premier League team metadata (current season).');
}

run().catch(e => { console.error(e); process.exit(1); });