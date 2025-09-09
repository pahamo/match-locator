# Data Import Progress and Usage

This doc captures the current state of the FA Cup/League import tooling, issues encountered, and how to run and verify imports. Use it as a quick reference going forward.

## What’s Implemented

- Hardened import script: `scripts/import-fa-cup.js`
  - Normalizes REST endpoints to keep `/rest/v1` intact
  - Validates env: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
  - Handles missing `competitions` REST route (404) gracefully, continues with teams/fixtures
  - CLI flags to target different competitions and types (CUP vs LEAGUE)
  - Fixture mapping switches based on `--type=LEAGUE|CUP`
- Verification tool: `scripts/verify-competition.js`
  - Queries Supabase REST for counts and sample rows for a given `competition_id`
- NPM scripts (in `config/package.json`):
  - `npm run import-fa-cup` (default FA Cup config)
  - `npm run verify-competition -- --internal-id=<id>`

## Environment

Edit `config/.env` and ensure:

- `SUPABASE_URL=https://<your-project>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=<service_role_key>` (not the anon key)
- `VITE_SUPABASE_ANON_KEY=<anon_public_key>` (used by the web app, not the import)
- `FOOTBALL_DATA_API_KEY=<your_football_data_key>`

Tip: Keys must match the Supabase project in `SUPABASE_URL`.

## Known Blockers (Current)

- Football-Data access:
  - FA Cup (ID `2055`) returns 403 with the current API plan.
  - Action: Either upgrade the plan or target supported competitions (e.g., EPL `2021`, Championship `2016`).
- Supabase `competitions` REST path 404:
  - REST at `/rest/v1/competitions` returns 404 in the current project.
  - Action: Create/expose a `public.competitions` table in Supabase and ensure PostgREST exposes it. Optionally run `scripts/update-schema-fa-cup.sql` in Supabase SQL editor.
  - Workaround: Import script continues without ensuring a competition row.

## Import Commands (Examples)

Use the generalized importer with CLI flags.

- Premier League (EPL, comp-id `2021`, internal-id `1`):
  - Full: `node scripts/import-fa-cup.js --type=LEAGUE --comp-id=2021 --internal-id=1 --name="Premier League" --slug=premier-league --short-name=EPL --skip-competition`
  - Teams only: `node scripts/import-fa-cup.js --type=LEAGUE --comp-id=2021 --internal-id=1 --name="Premier League" --slug=premier-league --teams-only --skip-competition`
  - Fixtures only: `node scripts/import-fa-cup.js --type=LEAGUE --comp-id=2021 --internal-id=1 --name="Premier League" --slug=premier-league --fixtures-only --skip-competition`

- Championship (comp-id `2016`, internal-id `7` suggested):
  - Full: `node scripts/import-fa-cup.js --type=LEAGUE --comp-id=2016 --internal-id=7 --name=Championship --slug=championship --short-name=ELC --skip-competition`

Notes:
- Use `--skip-competition` while the `competitions` REST route is not available.
- If Football-Data returns 403 for a comp-id, that competition is not included in the current plan.

## Verify Data Landed (No Frontend Needed)

Check counts and a small sample via REST:

- `npm run verify-competition -- --internal-id=7` (for Championship)
- `npm run verify-competition -- --internal-id=1` (for EPL)

Outputs include:
- Teams count and 3 sample rows
- Fixtures count and 3 sample rows

## Future Improvements (Optional)

- Import from local JSON: add `--from-file` to bypass Football-Data for restricted competitions.
- Automatic schema detection: adapt payloads to existing columns when custom columns are missing.
- Frontend wiring: add additional competitions to `COMPETITIONS` in `src/index.html` once data verified.

## Troubleshooting

- 401 Invalid API key (Supabase):
  - Ensure `SUPABASE_SERVICE_ROLE_KEY` is for the same project as `SUPABASE_URL` and differs from the anon key.
- 404 requested path is invalid (Supabase):
  - Caused by wrong path (fixed in script) or missing table/route (create/expose the table).
- 403 restricted resource (Football-Data):
  - The plan/key doesn’t include that competition.

---

Maintained alongside: `scripts/import-fa-cup.js`, `scripts/verify-competition.js`, and `scripts/update-schema-fa-cup.sql`.

