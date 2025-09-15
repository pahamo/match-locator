#!/usr/bin/env node

/**
 * Verify competition data in Supabase via PostgREST
 * Usage: node scripts/verify-competition.js --internal-id=7
 */

const https = require('https');
require('dotenv').config({ path: './config/.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !/^https?:\/\//.test(SUPABASE_URL)) {
  console.error('❌ Missing or invalid SUPABASE_URL in config/.env');
  process.exit(1);
}
if (!SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY (or anon fallback) in config/.env');
  process.exit(1);
}

function parseArgs(argv = []) {
  const args = {};
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, v] = a.replace(/^--/, '').split('=');
      const key = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (typeof v === 'undefined') args[key] = true; else args[key] = v;
    }
  }
  return args;
}
const ARGS = parseArgs(process.argv.slice(2));
const INTERNAL_ID = Number(ARGS.internalId || ARGS.id);

if (!Number.isFinite(INTERNAL_ID)) {
  console.error('❌ Provide --internal-id=<number> (e.g., 7 for Championship)');
  process.exit(1);
}

const BASE = `${SUPABASE_URL}/rest/v1`;
const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  Prefer: 'count=exact'
};

function get(path, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.replace(/^\/+/, ''), BASE);
    const req = https.request(url, { method: 'GET', headers: { ...headers, ...extraHeaders } }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
        try {
          const json = body ? JSON.parse(body) : [];
          resolve({ json, headers: res.headers });
        } catch (e) {
          resolve({ json: [], headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function parseContentRange(h) {
  // e.g., "0-0/123" -> 123
  const cr = (h && h['content-range']) || (h && h['Content-Range']);
  if (!cr) return null;
  const m = /\/(\d+)$/.exec(cr);
  return m ? Number(m[1]) : null;
}

async function getCount(table, filter) {
  const path = `/${table}?${filter}&select=id`;
  const { headers } = await get(path, { Range: '0-0' });
  const total = parseContentRange(headers);
  return Number.isFinite(total) ? total : 0;
}

async function main() {
  console.log(`🔎 Verifying competition_id=${INTERNAL_ID} in Supabase...`);

  const teamsCount = await getCount('teams', `competition_id=eq.${INTERNAL_ID}`);
  const fixCount = await getCount('fixtures', `competition_id=eq.${INTERNAL_ID}`);

  console.log('— Results —');
  console.log(`Teams: ${teamsCount}`);
  console.log(`Fixtures: ${fixCount}`);

  // Sample rows
  const { json: teamsSample } = await get(`/teams?competition_id=eq.${INTERNAL_ID}&select=id,name,slug,crest_url&order=id.asc&limit=3`);
  const { json: fixturesSample } = await get(`/fixtures?competition_id=eq.${INTERNAL_ID}&select=id,utc_kickoff,home_team,away_team,matchday,status&order=utc_kickoff.desc&limit=3`);

  console.log('\nSample teams (up to 3):');
  console.log(teamsSample);
  console.log('\nSample fixtures (up to 3):');
  console.log(fixturesSample);
}

main().catch(err => {
  console.error('❌ Verification failed:', err.message);
  process.exit(1);
});

