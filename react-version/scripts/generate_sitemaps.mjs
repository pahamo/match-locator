#!/usr/bin/env node
/*
  Generate sitemap index + child sitemaps at build time.
  Requires env:
    - REACT_APP_SUPABASE_URL
    - REACT_APP_SUPABASE_ANON_KEY
    - Optional: REACT_APP_CANONICAL_BASE (e.g., https://fixturesapp.netlify.app)
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..'); // react-version/
const publicDir = path.join(root, 'public');
const sitemapsDir = path.join(publicDir, 'sitemaps');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON = process.env.REACT_APP_SUPABASE_ANON_KEY;
const CANONICAL_BASE = (process.env.REACT_APP_CANONICAL_BASE || 'https://fixturesapp.netlify.app').replace(/\/$/, '');

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.warn('[sitemap] Missing Supabase env; generating static legal+core sitemaps only');
}

const supabase = SUPABASE_URL && SUPABASE_ANON ? createClient(SUPABASE_URL, SUPABASE_ANON) : null;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function urlEntry(loc, lastmod = null, changefreq = 'weekly', priority = '0.6') {
  const lastModTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${loc}</loc>${lastModTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function writeXml(filePath, content) {
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
  console.log('[sitemap] wrote', path.relative(publicDir, filePath));
}

async function fetchFixtures() {
  if (!supabase) return [];
  const seasonStart = new Date();
  const year = seasonStart.getUTCMonth() >= 6 ? seasonStart.getUTCFullYear() : seasonStart.getUTCFullYear() - 1;
  const startIso = `${year}-08-01T00:00:00.000Z`;
  const { data, error } = await supabase
    .from('fixtures_with_teams')
    .select('id,utc_kickoff,home_name,away_name')
    .gte('utc_kickoff', startIso)
    .order('utc_kickoff', { ascending: true })
    .limit(2000);
  if (error) {
    console.warn('[sitemap] fixtures error', error);
    return [];
  }
  return data || [];
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function dateToYMD(iso) {
  return new Date(iso).toISOString().split('T')[0];
}

async function fetchTeams() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('teams')
    .select('slug,updated_at')
    .order('name', { ascending: true });
  if (error) {
    console.warn('[sitemap] teams error', error);
    return [];
  }
  return data || [];
}

async function fetchProviders() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('providers')
    .select('id,display_name,slug,updated_at')
    .order('display_name', { ascending: true });
  if (error) {
    console.warn('[sitemap] providers error', error);
    return [];
  }
  return data || [];
}

async function build() {
  ensureDir(publicDir);
  ensureDir(sitemapsDir);

  // Core pages (fixtures sitemap)
  const coreUrls = [
    `${CANONICAL_BASE}/`,
    `${CANONICAL_BASE}/fixtures`,
    `${CANONICAL_BASE}/clubs`,
    `${CANONICAL_BASE}/about`,
  ];
  const fixturesXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...coreUrls.map(u => urlEntry(u, null, 'daily', '0.8')),
    '</urlset>'
  ].join('\n');
  writeXml(path.join(sitemapsDir, 'sitemap-fixtures.xml'), fixturesXml);

  // Legal sitemap
  const legalUrls = [
    `${CANONICAL_BASE}/legal/privacy-policy`,
    `${CANONICAL_BASE}/legal/cookie-policy`,
    `${CANONICAL_BASE}/legal/terms`,
  ];
  const legalXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...legalUrls.map(u => urlEntry(u, null, 'yearly', '0.3')),
    '</urlset>'
  ].join('\n');
  writeXml(path.join(sitemapsDir, 'sitemap-legal.xml'), legalXml);

  // Matches sitemap
  const fixtures = await fetchFixtures();
  const matchUrls = fixtures.map(f => {
    const slug = `${f.id}-${slugify(f.home_name)}-vs-${slugify(f.away_name)}-${dateToYMD(f.utc_kickoff)}`;
    return `${CANONICAL_BASE}/matches/${slug}`;
  });
  const matchesXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...matchUrls.map(u => urlEntry(u, null, 'daily', '0.7')),
    '</urlset>'
  ].join('\n');
  writeXml(path.join(sitemapsDir, 'sitemap-matches.xml'), matchesXml);

  // Teams sitemap
  const teams = await fetchTeams();
  const teamUrls = teams.map(t => `${CANONICAL_BASE}/clubs/${t.slug}`);
  const teamsXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...teamUrls.map(u => urlEntry(u, null, 'weekly', '0.6')),
    '</urlset>'
  ].join('\n');
  writeXml(path.join(sitemapsDir, 'sitemap-teams.xml'), teamsXml);

  // Providers sitemap (optional; may be empty if no provider pages yet)
  const providers = await fetchProviders();
  const providerUrls = providers
    .filter(p => p.slug)
    .map(p => `${CANONICAL_BASE}/providers/${p.slug}`);
  const providersXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...providerUrls.map(u => urlEntry(u, null, 'monthly', '0.4')),
    '</urlset>'
  ].join('\n');
  writeXml(path.join(sitemapsDir, 'sitemap-providers.xml'), providersXml);

  // Sitemap index
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

build().catch((e) => {
  console.error('[sitemap] generation failed', e);
  process.exit(0); // Do not fail build on sitemap errors
});

