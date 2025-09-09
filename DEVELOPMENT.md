# Development Guidelines

This document establishes strict guidelines to prevent routing regressions and maintain system stability.

## 🚨 Critical Rules - Never Break These

### 1. Hash-Based Routing Only

**✅ ALWAYS use hash URLs:**
```javascript
href="#/fixtures"
href="#/premier-league/clubs"  
href="#/matches/123"
```

**❌ NEVER use server-side URLs:**
```javascript
href="/football/fixtures"        // Will break routing
href="/premier-league/clubs"     // Will cause 404s
```

### 2. Navigation Function Usage

**✅ ALWAYS use navigate() for programmatic navigation:**
```javascript
navigate('/fixtures');           // Converts to hash automatically
navigate('#/clubs');            // Direct hash also works
```

**❌ NEVER manipulate URLs directly:**
```javascript
history.pushState(...);         // Will break hash routing
location.pathname = '/page';    // Bypasses navigation system
window.location = '/page';      // Causes page reload
```

### 3. Link Generation Patterns

**✅ ALWAYS generate hash links:**
```javascript
// Navigation tabs
const link = (href, label) => `<a href="#/${compSlug}${href}">${label}</a>`;

// Match cards  
const href = f.id ? `#/matches/${idSlug}` : '#';

// Back links
<a href="#/clubs">← Back to Clubs</a>
```

**❌ NEVER generate server-dependent links:**
```javascript
// Will break without server routing
const link = (href, label) => `<a href="/football/${compSlug}${href}">${label}</a>`;
```

## 📊 Data Layer Rules

### Fixture Data Loading

**✅ ALWAYS use loadFixtures() function:**
```javascript
// Correct - uses filtering
const fixtures = await loadFixtures(competitionId, true);

// Wrong - bypasses filtering
const fixtures = await jget('/rest/v1/fixtures?competition_id=eq.1');
```

**✅ ALWAYS validate filtered results:**
```javascript
// Check console for filtering messages
console.log('Successfully loaded X fixtures, filtered to Y (removed Z low-ID fixtures)');
```

### Anti-Patterns for Data

**❌ NEVER bypass loadFixtures():**
```javascript
// These will include test data:
await jget(`${API_ENDPOINTS.fixturesList}?competition_id=eq.1`);
await jget('/rest/v1/fixtures?select=*');
const allFixtures = await directDatabaseQuery(); // No filtering
```

**❌ NEVER skip data validation:**
```javascript
// Missing validation allows bad data through
const fixtures = rawData; // No filtering
const fixtures = data.filter(f => f.id); // Insufficient filtering
```

### Blackout System Rules

**✅ ALWAYS use localStorage for blackout tracking:**
```javascript
// Correct - admin interface
if (providerId === '-1') {
  // Delete broadcast record AND store in localStorage
  const blackoutFixtures = JSON.parse(localStorage.getItem('blackoutFixtures') || '[]');
  blackoutFixtures.push(fixtureId);
  localStorage.setItem('blackoutFixtures', JSON.stringify(blackoutFixtures));
}

// Correct - frontend detection
function isBlackoutFixture(fixtureId) {
  const blackoutFixtures = JSON.parse(localStorage.getItem('blackoutFixtures') || '[]');
  return blackoutFixtures.includes(fixtureId);
}
```

**❌ NEVER use database provider records for blackout:**
```javascript
// Wrong - causes foreign key constraint errors
const broadcastData = {
  fixture_id: fixtureId,
  provider_id: -1  // Invalid provider ID
};

// Wrong - checking non-existent database records  
const hasBlackout = broadcasts.some(b => b.provider_id == -1);
```

**Key Blackout Architecture:**
- **Admin**: Delete broadcast record + store fixture ID in localStorage
- **Frontend**: Check localStorage for blackout status
- **No database constraints**: Avoids foreign key errors entirely
- **Persistent**: localStorage survives page refreshes and sessions

## 🧪 Testing Checklist

Before any navigation-related OR data-related changes, test ALL of these:

### Manual Tests
1. **Click navigation tabs** - URL and content should update
2. **Click match cards** - Should open match detail page
3. **Use browser back/forward** - Should navigate properly  
4. **Refresh page** - Should stay on same content
5. **Direct URL load** - `site.com#/fixtures` should work
6. **File protocol** - `file:///path/index.html#/fixtures` should work

### Data Quality Tests
1. **Check debug page** - No fixture IDs ≤30 should appear
2. **Check console logs** - Should see filtering messages
3. **Check fixture dates** - Only current season fixtures (2025-08-01+)
4. **Check matchdays** - Only 1-38 for Premier League
5. **Test all views** - Home, fixtures, clubs, debug all use filtered data

### Blackout System Tests
1. **Admin interface** - Set fixture to "🚫 Blackout (No TV)" saves without API errors
2. **Frontend match pages** - Blackout fixtures show "3pm blackout - this match is not televised in the UK"
3. **Frontend cards** - Blackout fixtures show "No TV broadcast" instead of "Broadcast TBC"
4. **Admin statistics** - Blackout fixtures counted separately from pending
5. **localStorage persistence** - Blackout status survives page refresh
6. **Admin filtering** - "Blackout" filter shows only blackout fixtures

### URL Format Tests
```bash
# All these should work:
https://site.com#/
https://site.com#/fixtures  
https://site.com#/premier-league/clubs
https://site.com#/matches/123-arsenal-vs-chelsea-2024-12-01
https://site.com#/premier-league/clubs/arsenal

# These should NOT be generated:
https://site.com/football/fixtures        # Server routing
https://site.com/premier-league/clubs     # Will 404
```

## 📋 Code Review Checklist

When reviewing navigation-related code:

- [ ] All `href` attributes use `#/` format
- [ ] No `history.pushState()` or `history.replaceState()` calls
- [ ] No `location.pathname` parsing (only `location.hash`)
- [ ] `navigate()` function used for programmatic navigation
- [ ] Hash change triggers `render()` function
- [ ] New view functions added to `routes` object

## 🔧 Adding New Pages

Follow this exact pattern:

### 1. Add Route
```javascript
const routes = {
  // ... existing routes
  "/my-new-page": myNewPageView,
};
```

### 2. Create View Function
```javascript
async function myNewPageView(params, competitionSlug = 'premier-league') {
  const app = document.getElementById('app');
  const competition = getCompetition(competitionSlug);
  const subnav = renderFootballSubnav(competition);
  
  // Your page content here
  app.innerHTML = subnav + `<div>Page content</div>`;
}
```

### 3. Generate Hash Links
```javascript
// In any template/component:
<a href="#/my-new-page">My New Page</a>
<a href="#/${competition.slug}/my-new-page">Competition Page</a>
```

### 4. Test Navigation
- Direct load: `site.com#/my-new-page`
- Link clicks work
- Browser back/forward work
- Page refresh stays on page

## 🚫 Anti-Patterns - Never Do These

### Server-Side Routing Attempts
```javascript
// ❌ These will break the system:
if (location.pathname.startsWith('/football')) { ... }
history.pushState(null, '', '/new-url');
app.get('/api/*', handler);                    // Server routes
```

### Mixed Routing Systems
```javascript
// ❌ Don't mix hash and pathname routing:
if (DEV_HASH) {
  // Different behavior for different environments
}
```

### Complex URL Manipulation
```javascript
// ❌ Don't overthink it:
const complexUrlParser = (url) => {
  // 50 lines of URL parsing logic
};
```

## 🎯 Keep It Simple

The routing system works because it's simple:

1. **Hash changes** → `render()` called
2. **Links click** → `navigate()` sets hash  
3. **Hash parsed** → View function called

Don't add complexity unless absolutely necessary.

## 🔄 Debugging Navigation Issues

If navigation breaks:

1. **Check browser console** - Any JavaScript errors?
2. **Check URL format** - Does it use `#/` prefix?
3. **Check event listeners** - Is `hashchange` handler active?
4. **Check link generation** - Are all links using hash format?
5. **Test with simple hash** - Does `#/fixtures` work manually?

## 📚 Reference

- **Main routing functions**: `parseRoute()`, `navigate()`, `render()`
- **Event handler**: `window.addEventListener('hashchange', render)`
- **Routes object**: Maps hash paths to view functions
- **Link helper**: `renderFootballSubnav()` generates navigation

Remember: **Simplicity equals reliability**. The hash-based system works everywhere without configuration.