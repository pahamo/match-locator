# Premier League TV Schedule UK

A fast, reliable single-page application for finding which UK broadcaster shows Premier League matches.

## 🏗️ Architecture Overview

This is a **hash-based SPA** with no build step, designed for maximum reliability and simplicity.

### Core Principles

1. **Hash-based routing only** - No History API, no server-side routing
2. **Single HTML file** - All code in one file for simplicity
3. **No external dependencies** - Pure vanilla JavaScript
4. **Database-driven content** - All data from Supabase API

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

### ✅ DO:

1. **Always use hash URLs** - `href="#/page"` not `href="/page"`
2. **Use navigate() function** - `navigate('/fixtures')` updates hash properly
3. **Listen for hashchange** - `window.addEventListener('hashchange', render)`
4. **Test on file:// protocol** - Hash routing works locally without server

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
index.html          # Main application (single file)
netlify.toml        # Deployment config (SPA fallback)
src/
  index.html        # Source file (copied to root)
  css/main.css      # Styling (embedded in HTML)
data/               # Static data files
config/             # Configuration files
```

## 🧪 Testing Navigation

Always test these scenarios when making changes:

1. **Direct URL load** - `site.com#/fixtures` should load fixtures page
2. **Link navigation** - Clicking links updates URL and content
3. **Browser back/forward** - Should navigate properly
4. **Page refresh** - Should stay on same page
5. **File protocol** - Should work with `file:///path/index.html`

## 🚀 Deployment

The app is deployed to Netlify with SPA fallback configuration in `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html" 
  status = 200
```

This ensures that any URL (for SEO) redirects to the SPA, where hash routing takes over.

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

## 📝 Development Workflow

1. **Edit** `src/index.html` 
2. **Copy** to root: `cp src/index.html .`
3. **Test** locally with file:// or Live Server
4. **Deploy** - Netlify auto-deploys on git push

## 🔄 Future Modifications

When adding new pages or features:

1. **Add route** to `routes` object
2. **Create view function** (async, takes params)
3. **Generate hash links** using `#/` format
4. **Test hash navigation** works properly

Remember: **Simplicity is reliability**. The hash-based system works everywhere without server configuration or complex edge cases.