#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const sitemapsDir = path.join(publicDir, 'sitemaps');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON = process.env.REACT_APP_SUPABASE_ANON_KEY;
const CANONICAL_BASE = (process.env.REACT_APP_CANONICAL_BASE || 'https://fixturesapp.netlify.app').replace(/\/$/, '');

/** util **/
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function urlEntry(loc, { lastmod = null, changefreq = 'weekly', priority = '0.6' } = {}) {
  const last = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${loc}</loc>${last}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}
function writeXml(file, content) { fs.writeFileSync(file, content.trim() + '\n', 'utf8'); console.log('[sitemap] wrote', path.relative(publicDir, file)); }
const supabase = (SUPABASE_URL && SUPABASE_ANON) ? createClient(SUPABASE_URL, SUPABASE_ANON) : null;

async function fetchFixtures() {
  if (!supabase) return [];
  const now = new Date();
  const seasonYear = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  const startIso = `${seasonYear}-08-01T00:00:00.000Z`;
  const { data, error } = await supabase
    .from('fixtures_with_teams')
    .select('id,utc_kickoff,home_name,away_name')
    .gte('utc_kickoff', startIso)
    .order('utc_kickoff', { ascending: true })
    .limit(2000);
  if (error) { console.warn('[sitemap] fixtures error', error); return []; }
  return data || [];
}
function slugify(t) { return String(t).toLowerCase().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim(); }
function ymd(iso) { return new Date(iso).toISOString().split('T')[0]; }

async function fetchTeams() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('teams').select('slug,updated_at').order('name', { ascending: true });
  if (error) { console.warn('[sitemap] teams error', error); return []; }
  return data || [];
}

async function fetchProviders() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('providers').select('slug,display_name,updated_at').order('display_name', { ascending: true });
  if (error) { console.warn('[sitemap] providers error', error); return []; }
  return (data || []).filter(p => p.slug);
}

async function build() {
  ensureDir(publicDir); ensureDir(sitemapsDir);
  // Core pages
  const core = [ '/', '/fixtures', '/clubs', '/about' ].map(p => `${CANONICAL_BASE}${p}`);
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

  // Matches
  const fixtures = await fetchFixtures();
  const matchUrls = fixtures.map(f => `${CANONICAL_BASE}/matches/${f.id}-${slugify(f.home_name)}-vs-${slugify(f.away_name)}-${ymd(f.utc_kickoff)}`);
  const matchesXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...matchUrls.map(u => urlEntry(u, { changefreq: 'daily', priority: '0.7' })),
    '</urlset>'
  ].join('\n');
  writeXml(path.join(sitemapsDir, 'sitemap-matches.xml'), matchesXml);

  // Teams
  const teams = await fetchTeams();
  const teamUrls = teams.map(t => `${CANONICAL_BASE}/clubs/${t.slug}`);
  const teamsXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...teamUrls.map(u => urlEntry(u, { changefreq: 'weekly', priority: '0.6' })),
    '</urlset>'
  ].join('\n');
  writeXml(path.join(sitemapsDir, 'sitemap-teams.xml'), teamsXml);

  // Providers (optional)
  const providers = await fetchProviders();
  const providerUrls = providers.map(p => `${CANONICAL_BASE}/providers/${p.slug}`);
  const providersXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...providerUrls.map(u => urlEntry(u, { changefreq: 'monthly', priority: '0.4' })),
    '</urlset>'
  ].join('\n');
  writeXml(path.join(sitemapsDir, 'sitemap-providers.xml'), providersXml);

  // Index
  const indexXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <sitemap><loc>${CANONICAL_BASE}/sitemaps/sitemap-fixtures.xml</loc></sitemap>`,
    `  <sitemap><loc>${CANONICAL_BASE}/sitemaps/sitemap-matches.xml</loc></sitemap>`,
    `  <sitemap><loc>${CANONICAL_BASE}/sitemaps/sitemap-teams.xml</loc></sitemap>`,
    `  <sitemap><loc>${CANONICAL_BASE}/sitemaps/sitemap-providers.xml</loc></sitemap>`,
    `  <sitemap><loc>${CANONICAL_BASE}/sitemaps/sitemap-legal.xml</loc></sitemap>`,
    '</sitemapindex>'
  ].join('\n');
  writeXml(path.join(publicDir, 'sitemap.xml'), indexXml);
}

build().catch(e => { console.warn('[sitemap] generation error', e); process.exit(0); });
