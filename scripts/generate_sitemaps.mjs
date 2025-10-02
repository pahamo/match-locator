#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

const root = process.cwd();
const publicDir = path.join(root, 'public');
const sitemapsDir = path.join(publicDir, 'sitemaps');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.REACT_APP_SUPABASE_ANON_KEY;
const CANONICAL_BASE = (process.env.REACT_APP_CANONICAL_BASE || 'https://matchlocator.com').replace(/\/$/, '');

/** util **/
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function urlEntry(loc, { lastmod = null, changefreq = 'weekly', priority = '0.6' } = {}) {
  const last = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${loc}</loc>${last}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}
function writeXml(file, content) { fs.writeFileSync(file, content.trim() + '\n', 'utf8'); console.log('[sitemap] wrote', path.relative(publicDir, file)); }

// Only create supabase client if we have valid, non-empty credentials
let supabase = null;
if (SUPABASE_URL && SUPABASE_ANON && SUPABASE_URL.startsWith('http')) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
  } catch (err) {
    console.log('[sitemap] Supabase not initialized - check env vars');
  }
} else {
  console.log('[sitemap] Supabase not initialized - check env vars');
}

async function fetchFixtures() {
  if (!supabase) return [];
  const now = new Date();
  const seasonYear = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  const startIso = `${seasonYear}-08-01T00:00:00.000Z`;
  const { data, error } = await supabase
    .from('fixtures_with_teams')
    .select('id,utc_kickoff,home_team,away_team,competition_id')
    .gte('utc_kickoff', startIso)
    .order('utc_kickoff', { ascending: true })
    .limit(2000);
  if (error) { console.warn('[sitemap] fixtures error', error); return []; }
  return data || [];
}
function slugify(t) { return String(t).toLowerCase().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim(); }
function ymd(iso) { return new Date(iso).toISOString().split('T')[0]; }
function mapCompetitionIdToSlug(competitionId) {
  const mappings = { 1: 'premier-league', 2: 'champions-league', 3: 'bundesliga' };
  return mappings[competitionId] || 'unknown';
}
function cleanTeamName(teamName) {
  return teamName.replace(/\s+(FC|AFC|CF|United|City)$/i, '').replace(/\s+FC$/i, '').replace(/\s+AFC$/i, '').trim();
}
function formatDateForSeoUrl(date) {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleDateString('en-GB', { month: 'short' }).toLowerCase();
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

async function fetchTeams() {
  if (!supabase) {
    console.warn('[sitemap] Supabase not initialized - check env vars');
    return [];
  }
  const { data, error } = await supabase.from('teams').select('slug, url_slug').order('name', { ascending: true });
  if (error) {
    console.warn('[sitemap] teams error', error);
    return [];
  }
  console.log(`[sitemap] Fetched ${data?.length || 0} teams from database`);
  return (data || []).map(team => ({
    ...team,
    preferredSlug: (team.url_slug && team.url_slug.trim()) ? team.url_slug : team.slug
  }));
}


async function build() {
  ensureDir(publicDir); ensureDir(sitemapsDir);
  // Core pages
  const core = [ '/', '/matches', '/clubs', '/about' ].map(p => `${CANONICAL_BASE}${p}`);
  const coreXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...core.map(u => urlEntry(u, { changefreq: 'daily', priority: '0.8' })),
    '</urlset>'
  ].join('\n');
  writeXml(path.join(sitemapsDir, 'sitemap-fixtures.xml'), coreXml);

  // Legal
  const legal = ['/legal/privacy-policy','/legal/cookie-policy','/legal/terms'].map(p => `${CANONICAL_BASE}${p}`);
  const legalXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...legal.map(u => urlEntry(u, { changefreq: 'yearly', priority: '0.3' })),
    '</urlset>'
  ].join('\n');
  writeXml(path.join(sitemapsDir, 'sitemap-legal.xml'), legalXml);

  // Matches (using new SEO-friendly URLs without IDs)
  const fixtures = await fetchFixtures();
  const matchUrls = fixtures.map(f => {
    const homeSlug = slugify(cleanTeamName(f.home_team));
    const awaySlug = slugify(cleanTeamName(f.away_team));
    const competitionSlug = mapCompetitionIdToSlug(f.competition_id);
    const dateSlug = formatDateForSeoUrl(f.utc_kickoff);
    return `${CANONICAL_BASE}/matches/${homeSlug}-vs-${awaySlug}-${competitionSlug}-${dateSlug}`;
  });
  const matchesXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...matchUrls.map(u => urlEntry(u, { changefreq: 'daily', priority: '0.7' })),
    '</urlset>'
  ].join('\n');
  writeXml(path.join(sitemapsDir, 'sitemap-matches.xml'), matchesXml);

  // Teams (using /clubs/ route as per App.tsx)
  const teams = await fetchTeams();
  const teamUrls = teams.map(t => `${CANONICAL_BASE}/clubs/${t.preferredSlug}`);
  const teamsXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...teamUrls.map(u => urlEntry(u, { changefreq: 'weekly', priority: '0.7' })),
    '</urlset>'
  ].join('\n');
  writeXml(path.join(sitemapsDir, 'sitemap-teams.xml'), teamsXml);

  // Note: Providers are hardcoded in ProviderPage.tsx, not database-driven, so no sitemap needed

  // Index
  const indexXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <sitemap><loc>${CANONICAL_BASE}/sitemaps/sitemap-fixtures.xml</loc></sitemap>`,
    `  <sitemap><loc>${CANONICAL_BASE}/sitemaps/sitemap-matches.xml</loc></sitemap>`,
    `  <sitemap><loc>${CANONICAL_BASE}/sitemaps/sitemap-teams.xml</loc></sitemap>`,
    `  <sitemap><loc>${CANONICAL_BASE}/sitemaps/sitemap-legal.xml</loc></sitemap>`,
    '</sitemapindex>'
  ].join('\n');
  writeXml(path.join(publicDir, 'sitemap.xml'), indexXml);
}

build().catch(e => { console.warn('[sitemap] generation error', e); process.exit(0); });
