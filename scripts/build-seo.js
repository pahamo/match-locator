// scripts/build-seo.js
import fs from 'fs';
import path from 'path';

// ---- CONFIG ----
const SITE = 'https://football-listings.netlify.app';
const OUT = path.join(process.cwd(), 'docs', 'seo');
const SB = {
  url: 'https://ksqyurqkqznzrntdpood.supabase.co',
  // Use env var if set; otherwise fallback to your anon key for convenience
  key: process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcXl1cnFrcXpuenJudGRwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTEwNjAsImV4cCI6MjA3MjM2NzA2MH0.wVBZBEbfctB7JPnpMZkXKMGwXlYxGWjOF_AxixVo-S4'
};
const H = { apikey: SB.key, Authorization: `Bearer ${SB.key}` };

// ---- HELPERS ----
async function jget(p) {
  const r = await fetch(SB.url + p, { headers: H });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}: ${p}`);
  return r.json();
}

function html({ title, desc, canonical, body, extraHead = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<meta name="description" content="${desc}"/>
<link rel="canonical" href="${canonical}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${desc}"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:type" content="website"/>
<meta name="twitter:card" content="summary_large_image"/>
${extraHead}
</head>
<body>
<header><a href="${SITE}/football/fixtures">Premier League — UK Listings</a></header>
<main>${body}</main>
<footer><a href="${SITE}/football/about">About</a></footer>
</body></html>`;
}

function fmtDT(iso) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/London'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// --- Pretty URL helpers ---
function slugify(s) {
  return String(s)
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
function ymd(iso) {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
function matchSlug(f) {
  const date = ymd(f.utc_kickoff);
  return `${slugify(f.home_team)}-vs-${slugify(f.away_team)}-${date}`;
}

// --- JSON-LD helpers ---
function ld(tagObject){
  return `<script type="application/ld+json">\n${JSON.stringify(tagObject, null, 2)}\n</script>`;
}
function ldSportsEvent({home, away, startISO, url, spaUrl}) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": `${home} vs ${away}`,
    "startDate": startISO,
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "url": url,
    "sport": "Soccer",
    "homeTeam": { "@type": "SportsTeam", "name": home },
    "awayTeam": { "@type": "SportsTeam", "name": away },
    "organizer": { "@type": "SportsOrganization", "name": "Premier League" },
    "location": { "@type": "Place", "name": `${home} (home)` },
    "isAccessibleForFree": false,
    "offers": [
      {
        "@type": "Offer",
        "url": spaUrl || url,
        "availabilityStarts": startISO
      }
    ]
  };
}
function ldSportsTeam({name, url}){
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "name": name,
    "sport": "Soccer",
    "url": url
  };
}

// ---- BUILD ----
async function build() {
  fs.mkdirSync(OUT, { recursive: true });

  // Load data
  const teams = await jget(`/rest/v1/teams_v?select=id,name,slug,crest_url`);
  const nowIso = new Date().toISOString();
  const fixtures = await jget(
    `/rest/v1/fixtures_with_team_names_v?utc_kickoff=gte.${nowIso}&order=utc_kickoff.asc&limit=2000`
  );

  // 1) Home overview
  {
    const body = `
      <h1>Premier League fixtures — UK TV & radio listings</h1>
      <ul>
        ${fixtures
          .slice(0, 20)
          .map((f) => {
            const url = `${SITE}/seo/matches/${matchSlug(f)}.html`;
            return `<li><a href="${url}">${f.home_team} vs ${f.away_team}</a> — ${fmtDT(
              f.utc_kickoff
            )}</li>`;
          })
          .join('')}
      </ul>
    `;
    const homeLd = {
      "@context":"https://schema.org",
      "@type":"CollectionPage",
      "name":"Premier League fixtures — UK TV & radio listings",
      "url": `${SITE}/seo/index.html`
    };
    const page = html({
      title: `Premier League fixtures — UK TV & radio listings`,
      desc: `Upcoming Premier League fixtures with UK kick-off times and broadcaster info.`,
      canonical: `${SITE}/seo/index.html`,
      body,
      extraHead: ld(homeLd)
    });
    fs.writeFileSync(path.join(OUT, 'index.html'), page);
  }

  // 2) Fixtures page
  {
    const body = `
      <h1>All upcoming Premier League fixtures</h1>
      <ul>
        ${fixtures
          .map((f) => {
            const url = `${SITE}/seo/matches/${matchSlug(f)}.html`;
            return `<li><a href="${url}">${f.home_team} vs ${f.away_team}</a> — ${fmtDT(
              f.utc_kickoff
            )}</li>`;
          })
          .join('')}
      </ul>
    `;
    const fixturesLd = {
      "@context":"https://schema.org",
      "@type":"CollectionPage",
      "name":"Premier League fixtures (all) — UK listings",
      "url": `${SITE}/seo/fixtures.html`
    };
    const page = html({
      title: `Premier League fixtures (all) — UK listings`,
      desc: `Full list of upcoming Premier League fixtures with UK kick-off times.`,
      canonical: `${SITE}/seo/fixtures.html`,
      body,
      extraHead: ld(fixturesLd)
    });
    fs.writeFileSync(path.join(OUT, 'fixtures.html'), page);
  }

  // 3) Club pages
  for (const t of teams) {
    const clubFix = fixtures.filter(
      (f) => f.home_team === t.name || f.away_team === t.name
    );
    const body = `
      <h1>${t.name} — upcoming fixtures</h1>
      ${
        clubFix.length
          ? `<ul>
        ${clubFix
          .map((f) => {
            const opp = f.home_team === t.name ? f.away_team : f.home_team;
            const url = `${SITE}/seo/matches/${matchSlug(f)}.html`;
            return `<li><a href="${url}">${opp}</a> — ${fmtDT(
              f.utc_kickoff
            )}</li>`;
          })
          .join('')}
      </ul>`
          : `<p>No upcoming fixtures listed.</p>`
      }
    `;
    const canonical = `${SITE}/seo/clubs/${t.slug}.html`;
    const page = html({
      title: `${t.name} — fixtures, kick-off times (UK)`,
      desc: `Upcoming fixtures for ${t.name} with UK kick-off times.`,
      canonical,
      body,
      extraHead: ld(ldSportsTeam({ name: t.name, url: canonical }))
    });
    const dir = path.join(OUT, 'clubs');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${t.slug}.html`), page);
  }

  // 4) Match pages (pretty + legacy numeric)
  {
    const dir = path.join(OUT, 'matches');
    fs.mkdirSync(dir, { recursive: true });
    for (const f of fixtures) {
      const pretty = `${matchSlug(f)}.html`;
      const canonical = `${SITE}/seo/matches/${pretty}`;
      const spaUrl = `${SITE}/football/matches/${f.id}-${matchSlug(f)}`;
      const body = `
        <h1>${f.home_team} vs ${f.away_team}</h1>
        <p>Kick-off (UK): ${fmtDT(f.utc_kickoff)}</p>
        <p><a href="${spaUrl}">SPA live match page</a></p>
      `;
      const eventLd = ldSportsEvent({
        home: f.home_team,
        away: f.away_team,
        startISO: f.utc_kickoff,
        url: canonical,
        spaUrl
      });
      const page = html({
        title: `${f.home_team} vs ${f.away_team} — UK TV channel & time`,
        desc: `Kick-off time in UK and broadcaster info for ${f.home_team} vs ${f.away_team}.`,
        canonical,
        body,
        extraHead: ld(eventLd)
      });
      // Write pretty slug URL
      fs.writeFileSync(path.join(dir, pretty), page);
      // Also write legacy numeric id URL for any existing references
      fs.writeFileSync(path.join(dir, `${f.id}.html`), page);
    }
  }

  // 5) Sitemap (include SPA pretty routes + SEO pages)
  const nowLastmod = new Date().toISOString();

  // Static SPA routes
  const spaStatic = [
    `${SITE}/football`,
    `${SITE}/football/fixtures`,
    `${SITE}/football/clubs`,
    `${SITE}/football/about`,
  ];

  // Club SPA pages
  const spaClubs = (teams || [])
    .filter(t => t && t.slug)
    .map(t => `${SITE}/football/clubs/${encodeURIComponent(t.slug)}`);

  // Match SPA pages (id + pretty slug)
  const spaMatches = (fixtures || [])
    .filter(f => f && f.id && f.home_team && f.away_team && f.utc_kickoff)
    .map(f => `${SITE}/football/matches/${f.id}-${matchSlug(f)}`);

  // Existing SEO pages
  const seoPages = [
    `${SITE}/seo/`,
    `${SITE}/seo/fixtures.html`,
    ...((teams || []).map(t => `${SITE}/seo/clubs/${t.slug}.html`)),
    ...((fixtures || []).map(f => `${SITE}/seo/matches/${matchSlug(f)}.html`)),
  ];

  function urlTag(loc, lastmod = nowLastmod){
    return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
  }

  const allUrls = [
    ...spaStatic.map(u => urlTag(u)),
    ...spaClubs.map(u => urlTag(u)),
    ...spaMatches.map(u => urlTag(u)),
    ...seoPages.map(u => urlTag(u)),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls.join('\n')}\n</urlset>`;
  fs.writeFileSync(path.join(process.cwd(), 'sitemap.xml'), xml);

  console.log(`SEO pages written to ${OUT} and sitemap.xml generated.`);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});