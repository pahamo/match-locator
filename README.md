# Premier League TV Schedule UK

A fast, reliable single-page application for finding which UK broadcaster shows Premier League and FA Cup matches.

## 🏗️ Architecture Overview

This is a **hash-based SPA** with no build step, designed for maximum reliability and simplicity. The app lives in a single `index.html` with an inline ES module.

### Core Principles

1. **Hash-based routing only** - No History API, no server-side routing
2. **Single HTML file** - All code in one file for simplicity
3. **No external dependencies** - Pure vanilla JavaScript
4. **Database-driven content** - All data from Supabase API
5. **Multi-competition support** - Premier League (league) and FA Cup (knockout tournament)

## 📊 Data Architecture

**CRITICAL**: All fixture data goes through `loadFixtures()` function with built-in filtering.

### Data Filtering Strategy

The app uses **dual-layer filtering** to ensure only valid fixtures are displayed:

```javascript
// Layer 1: Database query filtering
`fixtures?competition_id=eq.1&utc_kickoff=gte.2025-08-01&matchday=gte.1&matchday=lte.38`

// Layer 2: ID filtering (backup)
const filtered = fixtures.filter(f => f.id && f.id > 30);
```

### Key Data Functions
- `loadFixtures(competitionId, includeUpcoming)` — Main fixture loader (with fallbacks)
- `loadTeams(competitionId, fallbackToAll)` — Team data loader (with fallbacks)
- `jget(endpoint)` — JSON GET with Supabase auth headers

### Data Quality Rules
1. **Season filtering** - Only fixtures from current season (2025-08-01+)
2. **Matchday validation** - Only matchdays 1-38 for Premier League
3. **ID validation** - Exclude suspicious low IDs (≤30) 
4. **Competition filtering** - Only specified competition data

### Broadcast Management System

The app includes a **dual-interface system** for managing broadcaster assignments:

#### Admin Interface (`admin.html`)
- **Standalone admin panel** for managing UK broadcaster assignments
- **Bulk editing capabilities** with save-all functionality  
- **Dynamic statistics** showing confirmed/blackout/pending fixture counts
- **Month-based filtering** with data-driven month selector
- **Blackout system** using localStorage tracking (avoids database constraints)

#### Blackout System Architecture
```javascript
// Admin: Store blackout fixtures in localStorage
localStorage.setItem('blackoutFixtures', JSON.stringify([fixtureId1, fixtureId2]));

// Frontend: Check blackout status
function isBlackoutFixture(fixtureId) {
  const blackoutFixtures = JSON.parse(localStorage.getItem('blackoutFixtures') || '[]');
  return blackoutFixtures.includes(fixtureId);
}
```

**Key Features:**
- **No database provider records** for blackout fixtures (avoids foreign key errors)
- **localStorage persistence** for blackout status across sessions
- **Proper frontend display**: "3pm blackout" messages instead of "Broadcast TBC"
- **UI differences**: Blackout button shown as a red disabled pill; unknown broadcasts shown as a yellow disabled pill

### Competition Support

#### Premier League (League Format)
- 20 teams competing in a 38-matchday season
- Fixtures show logo-only badge using official Premier League symbol
- Standard league table with points, goals, and standings

#### FA Cup (Knockout Tournament)
- 124 teams from across the English football pyramid
- Knockout format with rounds: First Round through Final
- Stage-based fixtures (no matchdays) with varying team participation per round
- Uses colored pill badge with "FAC" short name

### Competition Badges
- Premier League fixtures show a logo-only badge (no text) using the official symbol
- FA Cup and other competitions use a small colored pill with the competition short name

### Match Page Layout
- Uses a hero card (`.match-hero`) with larger crests (`.crest-lg`) and bold names.
- Right-side meta block shows kickoff time, venue, and competition badge (PL logo when applicable).
- Breadcrumbs appear above the hero in the form: `Football / <Competition> / Matchweek N`, and a Back link appears under the breadcrumbs.
- Watch providers render in a responsive grid (`.providers-grid`).
- Team names are clickable and link to their club pages (`#/premier-league/clubs/<slug>`), styled via `.team-link`.

Example (simplified):
```html
<section class="match-hero">
  <div class="teams">
    <img class="crest crest-lg" src="...">
    <div class="names">
      <a class="team-link" href="#/premier-league/clubs/arsenal">Arsenal</a>
      <span class="vs">vs</span>
      <a class="team-link" href="#/premier-league/clubs/chelsea">Chelsea</a>
    </div>
    <img class="crest crest-lg" src="...">
  </div>
  <div class="meta">
    <div class="kick">Sat 12:30 · Europe/London</div>
    <div class="venue">Emirates Stadium</div>
    <img class="comp-badge epl" src="...">
  </div>
}</section>
<section class="card"><div id="providers" class="providers-grid">...</div></section>
```
- **Statistics integration**: Blackout fixtures counted separately from pending

## 🔧 Routing System

**CRITICAL**: The routing system uses **hash-based navigation exclusively**.

### URL Format
```
https://site.com#/fixtures
https://site.com#/premier-league/clubs  
https://site.com#/matches/123-arsenal-vs-chelsea-2024-12-01
```

### Key Functions
- `parseRoute()` - Parses `location.hash` into `{ path, params, competition }`
- `navigate(url)` - Sets `location.hash` to trigger navigation
- `render()` - Main rendering function called on hashchange
 - `renderFootballSubnav(competition)` - Renders tabs + crumbs on index/fixtures/clubs/table pages; match page uses a local breadcrumb.

### Route Structure
```javascript
// Routes map hash paths to view functions
const routes = {
  "/": homeView,
  "/fixtures": fixturesView, 
  "/table": tableView,
  "/clubs": clubsIndexView,
  "/club": clubPageView,     // uses ?slug param
  "/match": matchView,       // uses ?id param  
  "/about": aboutView,       // optional; safe stub exists
  "/tv-guide": tvGuideView,
  "/debug": debugDataView,
  // ... others
};
```

## ⚠️ Critical Development Rules

### 🚨 DO NOT:

1. **Never use History API** - No `history.pushState()`, `history.replaceState()`
2. **Never use pathname routing** - No `location.pathname` parsing
3. **Never mix routing modes** - No DEV_HASH conditionals
4. **Never use server-side redirects** - Hash routing works without server config
5. **Never query fixtures directly** - No `jget('/rest/v1/fixtures?...')` bypassing `loadFixtures()`
6. **Never skip data filtering** - All fixture queries must go through validation

### ✅ DO:

1. **Always use hash URLs** - `href="#/page"` not `href="/page"`
2. **Use navigate() function** - `navigate('/fixtures')` updates hash properly
3. **Listen for hashchange** - `window.addEventListener('hashchange', render)`
4. **Test on file:// protocol** - Hash routing works locally without server
5. **Always use loadFixtures()** - `const fixtures = await loadFixtures(competitionId, true)`
6. **Verify data filtering** - Check console for "filtered to X fixtures" messages

## 🔗 Link Generation

### Navigation Links
```javascript
// ✅ Correct - generates hash links
const link = (href, label) => `<a href="#/${competition}${href}">${label}</a>`;

// ❌ Wrong - server-dependent URLs
const link = (href, label) => `<a href="/football/${competition}${href}">${label}</a>`;
```

### Match Cards
```javascript
// ✅ Correct - hash-based match links
const href = f.id ? `#/matches/${idSlug}` : '#';

// ❌ Wrong - server routing required
const href = f.id ? `/football/matches/${idSlug}` : '#';
```

## 📁 File Structure

```
index.html          # Main application (single file SPA)
admin.html          # Standalone admin interface for broadcast management
netlify.toml        # Deployment config (SPA fallback, admin exclusion)
src/
  index.html        # Source file (copied to root)
  css/main.css      # Styling (embedded in HTML)
data/               # Static data files
config/             # Configuration files and environment variables
  .env              # Environment variables (API keys, database URLs)
  package.json      # Node.js dependencies and scripts
scripts/            # Data import and management scripts
  import-fa-cup.js  # FA Cup data import from Football-Data.org API
  update-schema-fa-cup.sql  # Database schema updates for knockout tournaments
  fix-data-integrity.sql    # Data cleanup and integrity fixes
seo.md              # SEO implementation status and strategy
DEVELOPMENT.md      # Development guidelines and critical rules
README.md           # Architecture overview and usage guide
CHANGELOG.md        # Version history and feature updates
```

### Key Files Explained

- **`index.html`** - Hash-based SPA with pure vanilla JavaScript, no build step
- **`admin.html`** - Independent admin panel with localStorage-based blackout system
- **`netlify.toml`** - Handles SPA redirects while preserving admin.html access
- **`config/.env`** - Environment variables for API keys and database configuration
- **`scripts/import-fa-cup.js`** - Node.js script for importing FA Cup teams and fixtures
- **`scripts/update-schema-fa-cup.sql`** - Database schema updates for knockout tournament support
- **`DEVELOPMENT.md`** - Critical development rules to prevent routing/data regressions

## 🧪 Testing Navigation

Always test these scenarios when making changes:

1. **Direct URL load** - `site.com#/fixtures` should load fixtures page
2. **Link navigation** - Clicking links updates URL and content
3. **Browser back/forward** - Should navigate properly
4. **Page refresh** - Should stay on same page
5. **File protocol** - Should work with `file:///path/index.html`

## 🚀 Deployment

The app is deployed to Netlify with **dual-interface configuration** in `netlify.toml`:

```toml
# SPA routes redirect to main app
[[redirects]]
  from = "/football/*"
  to = "/index.html"
  status = 200

# Catch-all fallback (excludes admin.html)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false
```

### Access Points
- **Main App**: `https://football-listings.netlify.app/` (public)
- **Admin Interface**: `https://football-listings.netlify.app/admin.html` (broadcast management)

### Deployment Features
- **SPA fallback** for SEO-friendly URLs that redirect to hash routing
- **Admin preservation** - `/admin.html` loads directly without redirection  
- **Auto-deployment** on git push to main branch

## 🐛 Common Issues & Solutions

### Navigation not working?
- Check all links use `#/` format
- Verify `navigate()` function sets `location.hash`
- Ensure `hashchange` event listener is active

### "Cannot GET" errors?
- You're using server-side routing instead of hash routing
- Convert all links to hash format: `/page` → `#/page`

### Content not updating on navigation?
- `render()` function not called on hash changes
- Check `window.addEventListener('hashchange', render)`

### App stuck on "loading…"?
- Ensure `</script>`, `</body>`, and `</html>` closing tags are present in `index.html`.
- Check the browser console for `ReferenceError: aboutView is not defined` (add or keep the provided route stubs).
- Remove `<meta http-equiv="X-Frame-Options">`; configure this as an HTTP header instead.

### Broadcast button colors
- Yellow = "Broadcast TBC" (`data-has-broadcast="false"`, `data-is-blackout="false"`).
- Red = "No TV broadcast" for blackout (`data-has-broadcast="false"`, `data-is-blackout="true"`).

## 📝 Development Workflow

1. **Edit** `src/index.html` 
2. **Copy** to root: `cp src/index.html .`
3. **Test** locally with file:// or Live Server
4. **Deploy** - Netlify auto-deploys on git push

Tip: If copying only parts of `src/index.html` into the root `index.html`, keep the helper functions (`jget`, `loadTeams`, `loadFixtures`) and route stubs to avoid runtime errors.

## 🔄 Future Modifications

When adding new pages or features:

1. **Add route** to `routes` object
2. **Create view function** (async, takes params)
3. **Generate hash links** using `#/` format
4. **Test hash navigation** works properly

Remember: **Simplicity is reliability**. The hash-based system works everywhere without server configuration or complex edge cases.
### Match page layout looks off?
- Ensure the new styles exist in `index.html` (look for `.match-hero`, `.crest-lg`, `.providers-grid`, `.team-link`).
- If you port code from `src/index.html`, also carry these CSS blocks.
