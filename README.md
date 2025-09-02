# Football Listings MVP

Minimal site that lists **Premier League fixtures** and (soon) **UK TV/Radio broadcasters**. Front end is a single-file SPA, data lives in Supabase.

## Run locally
1. Open `index.html` in **VS Code**.
2. Use **Live Server** (or any static server) to preview.

## Deploy
- Push to `main` on GitHub; **Netlify** auto-deploys from the repo root.
- Version badge shows the current release (bottom-right of the site).

## Data model (Supabase)
- `teams` — canonical team list (with `slug`);
- `team_aliases` — flexible mapping for names like *Spurs*, *Man Utd*;
- `fixtures` — season fixtures with `external_ref`, `utc_kickoff`, `home_team_id`, `away_team_id`, `venue`, `status`;
- `providers` — e.g. Sky Sports, TNT Sports, BBC;
- `broadcasts_uk` — link table (fixture ↔ provider), `channel_name`, `stream_type`, `verified`.

Read access uses the Supabase **anon** key. Writes are protected by RLS.

## Importing fixtures (one-off or refresh)
1. Import the season CSV into staging table `fixtures_fd_stage` with headers:
   `Match Number, Round Number, Date, Location, Home Team, Away Team, Result`
2. Run the SQL upsert to transform and load into `fixtures` (maps team names via `teams` / `team_aliases`, converts UK time → UTC).
3. Verify with:
   ```sql
   select count(*) from fixtures;
   select (utc_kickoff at time zone 'Europe/London') as uk_time, * from fixtures order by utc_kickoff asc limit 10;
   ```

## Adding broadcasters (manual via sheet → staging → upsert)
- Prepare a CSV with columns:
  `external_ref,date_local,time_local,home_name,away_name,provider_name,channel_name,stream_type,verified,source_note`
- Import into `broadcasts_uk_sheet_stage`.
- Apply with the UPSERT script (idempotent) to populate `broadcasts_uk`.

## Frontend behaviour
- Homepage lists **upcoming fixtures only** (filters to `utc_kickoff >= now`).
- Match page shows fixture details + any broadcasters found.

## Notes
- All fixtures are subject to change per Premier League announcements.
- Do **not** use official club crests; use text/colour badges.

---

*This README intentionally contains **no app code**. All runtime code lives in `index.html` (and small inline scripts).*