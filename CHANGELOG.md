# Changelog

All notable changes to this project will be documented in this file.

## [2025-09-09] - FA Cup Competition Support

### Added
- **FA Cup competition integration** with full knockout tournament structure
- **Multi-competition architecture** supporting both league (Premier League) and knockout (FA Cup) formats
- **Database schema enhancements** for knockout tournaments:
  - Added `stage`, `round`, `home_team`, `away_team` columns to fixtures table
  - Added team metadata columns: `short_name`, `tla`, `venue`, `founded`, `club_colors`, `website`
  - Added competition metadata: `type`, `country`, `season`, `external_id`, colors
  - Created views for FA Cup fixtures with human-readable round names
- **Data import system** via Node.js scripts:
  - `scripts/import-fa-cup.js` for automated team and fixture import from Football-Data.org API
  - Support for 124 English football teams across all divisions
  - Batch processing with rate limiting and error handling
  - CLI arguments for flexible import options (`--teams-only`, `--fixtures-only`, etc.)
- **Frontend competition selector** with dynamic navigation between Premier League and FA Cup
- **FA Cup-specific UI elements**:
  - Round-based fixture grouping (First Round, Quarter-finals, Semi-finals, Final)
  - Knockout tournament table view showing current round participants
  - Competition badge styling with FA Cup colors (#003366, #ffffff)
- **Enhanced debug interface** showing fixture counts and data integrity status for both competitions
- **Package.json scripts** for easy data management: `npm run import-fa-cup`

### Technical Implementation
- **Competition configuration system** in frontend JavaScript with external API integration
- **Flexible database schema** supporting both matchday-based (league) and stage-based (knockout) fixtures
- **Data validation and filtering** ensuring only valid competition data is displayed
- **Rate-limited API integration** respecting Football-Data.org's 10 requests/minute limit
- **Environment variable management** with `.env` file for secure API key storage
- **SQL migration scripts** for database schema updates with proper indexing

### Files Created/Modified
- `scripts/import-fa-cup.js` - Complete data import solution
- `scripts/update-schema-fa-cup.sql` - Database schema migration
- `scripts/fix-data-integrity.sql` - Data cleanup and season corrections
- `config/.env` - Environment variables (Football-Data.org API key, Supabase credentials)
- `config/package.json` - Node.js dependencies and import scripts
- `index.html` - FA Cup integration in COMPETITIONS object and navigation

### Database Changes
- **New competition record**: FA Cup (ID: 6) with type='CUP'
- **Schema extensions**: Support for knockout tournament structure
- **View creation**: `fa_cup_fixtures_with_rounds` for user-friendly round names
- **Indexing**: Performance optimizations for new columns

### Integration Notes
- FA Cup data imports from Football-Data.org competition ID 2055
- Internal competition ID 6 used for database consistency
- Maintains compatibility with existing Premier League functionality
- Uses same broadcast management system as Premier League fixtures

## v1.0.0-beta2 — Adapter sweep & resilient providers
- All fixtures/providers/broadcasts fetches now go through `src/js/supabaseAdapter.js`.
- `apiRequest()` is now a safe proxy to the adapter (no raw `/rest/v1`).
- Provider chips + CTA render robustly even with empty data.
- Match/Team pages show consistent empty/not-found states.
- Router and blackout logic unchanged.

## [2025-09-09] - SPA stability + UI polish

### Fixed
- Local preview stuck on "loading…" caused by an unclosed `<script type="module">` tag. Added closing `</script>`, `</body>`, `</html>`.
- Router crash due to missing optional views (about/how-to-watch/weekend/team-guides). Added safe stubs so routes always resolve.
- Removed invalid `<meta http-equiv="X-Frame-Options">` which must be set via HTTP header (Netlify/Toml), silencing console warnings.

### Added
- Centralized data helpers in `index.html`: `jget()`, `loadTeams()`, `loadFixtures()` with Supabase auth headers and fallbacks.
- Blackout UI: red disabled button for confirmed blackout (`data-is-blackout="true"`) with tooltip "No TV broadcast (UK blackout)".
- Competition badge: EPL pill replaced with Premier League logo-only badge on match cards.
 - Match page hero layout with larger crests/title, right-side meta (kickoff, venue, competition badge), responsive providers grid, and breadcrumb trail.
 - Clickable team names on match page linking to team pages.

### Changed
- Kept yellow "Broadcast TBC" styling for unknown broadcasts; blackout now visually distinct but consistent opacity.
 - Breadcrumbs now use slash separators: `Football / Premier League / Matchweek N`, with a Back link row underneath.

### Notes
- Blackout logic remains localStorage-based and does not write placeholder provider rows to the database.

## [2025-01-XX] - Major Routing Refactor + Data Filtering

### 🚨 BREAKING CHANGES
- **Complete routing system refactor**: Migrated from complex dual-mode routing to simple hash-based navigation
- **All internal URLs changed**: `/football/fixtures` → `#/fixtures`
- **Removed History API dependency**: Now works without server-side routing configuration

### ✅ Fixed
- **Navigation issues**: URLs now properly sync with content updates
- **Page reload errors**: Eliminated "Cannot GET" errors on direct URL access  
- **Match card links**: Fixed missing/broken match IDs in fixture cards
- **Development vs Production**: Unified behavior across all environments
- **Click interceptor bugs**: Simplified link handling eliminates edge cases
- **Test fixture data**: Implemented dual-layer filtering to exclude test fixtures
- **Data consistency**: All views now use consistent filtered data source

### 🔧 Technical Changes  
- **Simplified parseRoute()**: Reduced from 80+ lines to 30 lines of hash parsing
- **Simplified navigate()**: Now just sets `location.hash`, no History API complexity
- **Hash-only event handling**: Uses `hashchange` events exclusively
- **Link generation**: All internal links now generate `#/` URLs
- **Removed DEV_HASH detection**: No more environment-specific routing logic
- **Centralized data loading**: All fixture queries go through `loadFixtures()` function
- **Dual-layer filtering**: Database query filtering + backup ID filtering
- **Season-aware queries**: Only load fixtures from current season (2024-08-01+)
- **Matchday validation**: Filter for valid Premier League matchdays (1-38)

### 📈 Improvements
- **Reliability**: Hash routing works in all environments without configuration
- **Performance**: Eliminated complex route parsing and URL manipulation
- **Maintainability**: Much simpler codebase with fewer edge cases
- **Local development**: Works with file:// protocol and any local server
- **SEO compatibility**: Server redirects still work with Netlify fallback

### 🏗️ Architecture
- **Single routing mode**: Hash-based navigation (`#/fixtures`, `#/clubs`, etc.)
- **No server dependencies**: Works with any static file server
- **Simplified debugging**: Clear separation between hash parsing and view rendering
- **Future-proof**: Resistant to server configuration changes

## [Previous]

### ⚡ Technical Improvements
- Reorganize project structure into logical folders (ac7b79d)
