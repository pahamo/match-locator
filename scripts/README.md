# Scripts Documentation

This directory contains scripts for syncing football fixture and broadcaster data from the SportMonks API to the database.

## Table of Contents

1. [Overview](#overview)
2. [Main Scripts](#main-scripts)
3. [Utility Scripts](#utility-scripts)
4. [Common Workflows](#common-workflows)
5. [Troubleshooting](#troubleshooting)

---

## Overview

The project uses two complementary sync strategies:

1. **Fixture Sync** (`sync-sportmonks-fixtures.mjs`) - Syncs fixture dates, teams, scores, and rounds from SportMonks API by fetching full seasons
2. **Broadcaster Sync** (`sync-upcoming-broadcasters.mjs`) - Syncs UK broadcaster data for upcoming fixtures only

These scripts work together to keep the database up-to-date with the latest match schedules and TV broadcast information.

---

## Main Scripts

### sync-sportmonks-fixtures.mjs

**Purpose:** Comprehensive sync of fixture data (dates, teams, scores, rounds) for entire seasons.

**What it syncs:**
- Fixture dates and kick-off times
- Home and away teams (creates teams if they don't exist)
- Match scores (live and final)
- Round/matchweek information
- Match status (scheduled, live, finished)
- TV broadcaster data (if enabled)

**What it does NOT sync:**
- Only upcoming fixtures (syncs entire season including past matches)

**Usage:**
```bash
# Sync all active competitions
node scripts/sync-sportmonks-fixtures.mjs

# Sync specific competition
node scripts/sync-sportmonks-fixtures.mjs --competition-id=1

# Sync with custom date range
node scripts/sync-sportmonks-fixtures.mjs --date-from=2025-01-01 --date-to=2025-12-31

# Test mode (no database writes)
node scripts/sync-sportmonks-fixtures.mjs --dry-run --verbose
```

**Options:**
- `--competition-id=N` - Sync specific competition only
- `--date-from=YYYY-MM-DD` - Start date (default: today)
- `--date-to=YYYY-MM-DD` - End date (default: +30 days)
- `--dry-run` - Test mode (no database writes)
- `--verbose` - Show detailed logs

**When to use:**
- Weekly automated sync (via GitHub Actions)
- After new fixtures are announced for a competition
- To backfill historical fixture data
- To update scores for completed matches
- When fixture dates/times change

**Competition IDs:**
- `1` - Premier League
- `2` - Champions League
- `3` - FA Cup
- `4` - EFL Cup
- `5` - Europa League
- `6` - Europa Conference League
- `9` - Scottish Premiership
- `11` - EFL Championship

**Rate Limiting:** Built-in 200ms delay between requests (max ~3000 calls/hour)

---

### sync-upcoming-broadcasters.mjs

**Purpose:** Quick sync of UK broadcaster data for upcoming fixtures only. Does NOT sync fixture dates or teams.

**What it syncs:**
- UK TV broadcasters only (country_id: 11, 455, 462)
- Filters out Irish ROI-specific channels
- Only upcoming fixtures (not past matches)
- Skips fixtures that already have broadcaster data

**What it does NOT sync:**
- Fixture dates, scores, teams (use sync-sportmonks-fixtures.mjs)
- Past fixtures (only upcoming)

**Usage:**
```bash
# Sync all active competitions
node scripts/sync-upcoming-broadcasters.mjs

# Sync specific competition
node scripts/sync-upcoming-broadcasters.mjs --competition-id=2
```

**When to use:**
- Broadcaster announcements are released for upcoming matches
- Quick update for next few weeks of fixtures
- After running sync-sportmonks-fixtures.mjs to add broadcaster data
- DON'T use for syncing fixture dates or teams (use sync-sportmonks-fixtures.mjs)

**Example:** Champions League broadcaster info is usually announced 1-2 weeks before each matchday. Run this script after announcements.

**Filters Applied:**
- Country IDs: 11 (UK), 455 (Ireland - Sky Sports UK uses this), 462 (England)
- Excludes channels with "ROI" in name (Irish-only broadcasts)
- Skips fixtures that already have broadcasts to avoid duplicates

**Rate Limiting:** Built-in 100ms delay between requests

---

## Utility Scripts

### Diagnostic Scripts

These scripts help debug data issues:

#### check-competition-mappings.mjs
Lists all competition mappings and their active status.

```bash
node scripts/check-competition-mappings.mjs
```

#### check-ucl-sportmonks.mjs
Checks SportMonks API data for specific Champions League fixtures.

```bash
node scripts/check-ucl-sportmonks.mjs
```

**Use cases:**
- Verify broadcaster data exists in SportMonks API
- Compare API data with database data
- Debug "TBD" or "No UK broadcast" issues

---

### Database Migration Scripts

#### update-view-filter-amazon.mjs
Updates the `fixtures_with_teams` view to filter out Amazon Prime for all competitions.

```bash
node scripts/update-view-filter-amazon.mjs
```

**Why:** Amazon Prime has no Premier League or Champions League rights this season, so we filter it out globally.

**Note:** This script reads from `docs/migrations/create-fixtures-with-teams-view.sql` and requires the `exec_sql` RPC function to exist in your Supabase database.

---

### Matchweek-Specific Scripts

These scripts were created for one-off fixes of specific matchweek data issues:

- `fix-mw7.mjs` - Fix Matchweek 7 data
- `fix-mw8-sportmonks-ids.mjs` - Fix Matchweek 8 SportMonks IDs
- `manual-insert-mw8.mjs` - Manually insert Matchweek 8 fixtures
- `sync-mw7-scores.mjs` - Sync scores for Matchweek 7
- `sync-round-by-id.mjs` - Sync specific round by ID

**When to use:** Generally not needed - these are legacy scripts for historical fixes.

---

### SEO & Maintenance Scripts

#### generate_sitemaps.mjs
Generates XML sitemaps for SEO (teams, fixtures, competitions).

```bash
npm run generate:sitemaps
```

#### cleanup.js
Automated codebase maintenance (removes .DS_Store, formats code, updates dependencies).

```bash
npm run cleanup:dry     # Preview changes
npm run cleanup:verbose # Detailed preview
npm run cleanup         # Execute cleanup
```

---

## Common Workflows

### Weekly Fixture Update

**Goal:** Keep all competitions up-to-date with latest fixtures and broadcaster info.

**Steps:**
1. Run comprehensive fixture sync (automated via GitHub Actions)
   ```bash
   node scripts/sync-sportmonks-fixtures.mjs
   ```
2. Optionally run broadcaster sync for upcoming matches
   ```bash
   node scripts/sync-upcoming-broadcasters.mjs
   ```

**GitHub Actions:** The weekly sync runs automatically every Monday at 6am UTC via `.github/workflows/sync-fixtures.yml`.

---

### New Competition Setup

**Goal:** Add a new competition to the database.

**Steps:**
1. Add competition mapping to `api_competition_mapping` table:
   ```sql
   INSERT INTO api_competition_mapping (our_competition_id, sportmonks_league_id, sportmonks_league_name, is_active)
   VALUES (7, 123, 'New Competition', true);
   ```

2. Run full fixture sync for that competition:
   ```bash
   node scripts/sync-sportmonks-fixtures.mjs --competition-id=7
   ```

3. Run broadcaster sync:
   ```bash
   node scripts/sync-upcoming-broadcasters.mjs --competition-id=7
   ```

---

### Broadcaster Announcement Release

**Goal:** Update broadcaster info after TV schedule announcements.

**Example:** Premier League announces broadcasters for Matchweeks 15-20.

**Steps:**
1. Run broadcaster sync (skips fixtures that already have data):
   ```bash
   node scripts/sync-upcoming-broadcasters.mjs --competition-id=1
   ```

2. Check results on frontend - matches should now show correct broadcasters.

---

### Debugging "TBD" Broadcasters

**Problem:** Fixture shows "TBD" or "No UK broadcast" but you know it has UK TV coverage.

**Diagnostic steps:**

1. Check if broadcaster data exists in SportMonks API:
   ```bash
   # Modify check-ucl-sportmonks.mjs with fixture ID
   node scripts/check-ucl-sportmonks.mjs
   ```

2. Check if broadcaster data exists in database:
   ```sql
   SELECT * FROM broadcasts WHERE fixture_id = 123;
   ```

3. Check if view is filtering broadcaster correctly:
   ```sql
   SELECT * FROM fixtures_with_teams WHERE id = 123;
   ```

**Common causes:**
- Broadcaster data not synced yet → Run `sync-upcoming-broadcasters.mjs`
- View filtering out broadcaster (e.g., Amazon) → Expected behavior
- SportMonks API has no data yet → Wait for broadcaster announcement
- Country filtering excluding broadcaster → Check country_id in broadcasts table

---

## Troubleshooting

### Error: "duplicate key value violates unique constraint"

**Symptom:**
```
❌ Error inserting broadcast for fixture 123: {
  code: '23505',
  details: 'Key (fixture_id, sportmonks_tv_station_id)=(123, 456) already exists.'
}
```

**Cause:** Broadcaster already exists in database.

**Solution:** This is usually not an error - the script correctly skips fixtures that already have broadcasts. If you need to re-sync broadcaster data, manually delete existing broadcasts first:
```sql
DELETE FROM broadcasts WHERE fixture_id = 123;
```

---

### Error: "Could not find function exec_sql"

**Symptom:**
```
code: 'PGRST202',
message: 'Could not find the function public.exec_sql(sql_query) in the schema cache'
```

**Cause:** `exec_sql` RPC function doesn't exist in Supabase.

**Solution:** Run SQL migrations manually via Supabase SQL Editor instead of using the script.

---

### No fixtures returned for competition

**Symptom:** Script says "Found 0 fixtures" for a competition.

**Possible causes:**
1. Date range doesn't include any fixtures
2. Competition mapping is incorrect (wrong SportMonks league ID)
3. SportMonks API has no data for that competition/season

**Solution:**
1. Check competition mapping:
   ```bash
   node scripts/check-competition-mappings.mjs
   ```

2. Verify SportMonks league ID is correct:
   ```bash
   curl "https://api.sportmonks.com/v3/football/leagues/LEAGUE_ID?api_token=TOKEN"
   ```

3. Try wider date range or different season.

---

### Broadcaster shows "Amazon Prime Video" but should be filtered

**Symptom:** Fixture shows Amazon Prime as broadcaster despite filter.

**Cause:** Database view not updated with latest SQL migration.

**Solution:** Run the view update SQL manually:
```bash
node scripts/update-view-filter-amazon.mjs
```

Or run the SQL directly in Supabase SQL Editor:
```sql
-- Contents of docs/migrations/create-fixtures-with-teams-view.sql
```

---

## Environment Variables

All scripts require these environment variables (set in `.env` file):

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SPORTMONKS_TOKEN=your-sportmonks-api-token
```

Optional feature flags (for sync-sportmonks-fixtures.mjs):
```bash
REACT_APP_FF_USE_SPORTMONKS=true
REACT_APP_FF_SPORTMONKS_ENABLE_SYNC=true
REACT_APP_FF_SPORTMONKS_TEST_MODE=false
REACT_APP_FF_SPORTMONKS_TV_STATIONS=true
REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=1,2,3,4,5,6,9,11
```

---

## Database Schema

### Key Tables

- `fixtures` - Match fixtures with dates, teams, scores
- `teams` - Team data (name, slug, crest)
- `broadcasts` - TV broadcaster data for fixtures
- `api_competition_mapping` - Maps our competition IDs to SportMonks league IDs
- `api_sync_log` - Logs of all sync operations

### Key Views

- `fixtures_with_teams` - Joins fixtures with team details and selects broadcaster with priority ordering
  - Priority: TNT Sports > Discovery+ > Others
  - Filters: ROI channels, Amazon Prime, 3pm Saturday blackout (Premier League only)

---

## Further Reading

- [SportMonks API Documentation](https://docs.sportmonks.com)
- [Supabase Documentation](https://supabase.com/docs)
- `docs/migrations/create-fixtures-with-teams-view.sql` - Database view definition
- `.github/workflows/sync-fixtures.yml` - Automated sync workflow
