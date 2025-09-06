# Football Listings MVP

Modern single-page application showing **Premier League fixtures** with **UK TV/Radio broadcaster information**. Features iOS-inspired design, broadcaster integration, and timezone-accurate fixture times.

## Run locally
1. Open `index.html` in **VS Code**.
2. Use **Live Server** (or any static server) to preview.

## Deploy
- Push to `main` on GitHub; **Netlify** auto-deploys from the repo root.
- Version badge shows the current release (bottom-right of the site).

## Data model (Supabase)
- `teams` — canonical team list (with `slug`).
- `team_aliases` — flexible mapping for names like *Spurs*, *Man Utd*.
- `fixtures` — season fixtures with `external_ref`, `utc_kickoff`, `home_team_id`, `away_team_id`, `venue`, `status`.
- `providers` — e.g. Sky Sports, TNT Sports, BBC.
- `broadcasts_uk` — link table (fixture ↔ provider) with `channel_name`, `stream_type`, `verified`.

Read access uses the Supabase **anon** key. Writes are protected by RLS.

## Importing fixtures (refresh)
1. Import the season CSV into staging table `fixtures_fd_stage` with headers: `Match Number, Round Number, Date, Location, Home Team, Away Team, Result`.
2. Run the SQL upsert to transform and load into `fixtures` (maps team names via `teams`/`team_aliases`, converts UK time → UTC).
3. Verify with:
   ```sql
   select count(*) from fixtures;
   select (utc_kickoff at time zone 'Europe/London') as uk_time, home_team_id, away_team_id from fixtures order by utc_kickoff asc limit 10;
   ```

## Adding broadcasters (sheet → staging → upsert)
- Prepare a CSV with columns: `external_ref,date_local,time_local,home_name,away_name,provider_name,channel_name,stream_type,verified,source_note`.
- Import into `broadcasts_uk_sheet_stage`.
- Apply the UPSERT to populate `broadcasts_uk`.

## Features ✨
- **Broadcaster Integration**: Shows Sky Sports (blue), TNT Sports (red), and other UK broadcasters
- **3pm Saturday Blackout**: Clear indicators for games not available on UK TV
- **iOS-Inspired Design**: Glassmorphism effects with backdrop blur and smooth animations  
- **Theme System**: Multiple themes including modern iOS-style "Pixel" theme
- **Timezone Accuracy**: Fixtures display correct UK local times (fixed timezone conversion)
- **Smart Navigation**: Active page highlighting and context-aware filter visibility
- **Mobile-First**: Responsive design optimized for all screen sizes

## Frontend Architecture
- **Single Page Application**: Clean, modern SPA built with vanilla JavaScript
- **Optimized Performance**: CSS custom properties, efficient API layer, proper error handling
- **Mobile-First Design**: Responsive design with accessibility considerations
- **SEO-Friendly**: Clean URLs, proper meta tags, semantic HTML structure
- **Well-Documented Code**: Comprehensive JSDoc documentation, modular organization

## Frontend Behavior
- **Homepage**: Shows upcoming fixtures grouped by matchweek with lazy loading
- **Fixtures Page**: Complete fixture list with filtering by team, matchweek, and time
- **Match Pages**: Detailed view with broadcaster information, venue, and match details  
- **Clubs Pages**: Team-focused views with upcoming fixtures
- **Broadcaster Display**: Color-coded buttons and cards showing where to watch each game

## Broadcaster Information
- **Sky Sports**: Blue styling with channel details (Sky Sports Main Event, etc.)
- **TNT Sports**: Red styling with stream type information
- **Blackout Games**: Black styling indicating "Not available on UK TV (3pm Saturday blackout)"
- **Multiple Broadcasters**: Shows all available options for each fixture
- **Verification Status**: Displays verified vs unverified broadcast information

## Notes
- Fixtures are subject to change per Premier League announcements
- Broadcaster information updated regularly via `broadcasts_uk` table
- 3pm Saturday games follow UK broadcasting blackout rules

## Code Structure
The application is built as a single-file SPA for optimal performance:

- **`src/index.html`**: Main application file containing HTML, CSS, and JavaScript
- **Inline CSS**: Organized with CSS custom properties and component-based structure
- **Modular JavaScript**: Well-documented functions grouped by purpose
- **API Layer**: Centralized Supabase integration with proper error handling
- **Routing System**: Clean URLs with History API navigation

## Development Notes
- **CSS Architecture**: Uses custom properties for consistent theming
- **JavaScript**: ES6+ features with comprehensive JSDoc documentation  
- **Error Handling**: Graceful degradation and user-friendly error messages
- **Performance**: Optimized API calls and efficient DOM manipulation
- **Maintainability**: Clear code organization and extensive documentation

---

*This README intentionally contains **no app code**. All runtime code lives in `src/index.html` with proper organization and documentation.*