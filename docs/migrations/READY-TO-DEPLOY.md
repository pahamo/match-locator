# ✅ Clean Data Architecture - Ready to Deploy

**Date**: 2025-10-09
**Status**: All code changes complete, ready for database migration

---

## 🎯 What We Built

A complete refactoring to follow the principle: **"Store API data as-is using the API's terminology (round)"**

### Philosophy
- **Before**: Derived matchday integer from round.name, stored separately
- **After**: Store full round object (jsonb), use API terminology internally, display "Matchweek X" only for users

---

## ✅ ALL CODE CHANGES COMPLETE

### Phase 1-6: Completed Files

**SQL Migrations** (ready to run):
- ✅ `docs/migrations/clean-schema-migration.sql` - Schema cleanup
- ✅ `docs/migrations/clean-view-migration.sql` - View update with broadcaster prioritization

**TypeScript Interfaces**:
- ✅ `src/types/index.ts` - Added `RoundData`, `StageData`, updated `Fixture` and `SimpleFixture`

**Utility Functions**:
- ✅ `src/utils/fixtures.ts` - Created round-based helpers:
  - `getRoundNumber(fixture)` - Extract round number
  - `getRoundLabel(fixture)` - Display label ("Matchweek X")
  - `getRoundId(fixture)` - Get round.id
  - `isInRound(fixture, num)` - Check if in round
  - `groupByRound(fixtures)` - Group by round
  - `getCurrentRound(fixtures)` - Find current round
  - Backwards compatibility aliases (getMatchweek, etc.)

**Services**:
- ✅ `src/services/supabase.ts` - Updated FixtureRow interface, mapFixtureRow function
- ✅ `src/services/supabase-simple.ts` - Removed matchday from query, calculate from round.name

**Components**:
- ✅ `src/components/MatchdaySection.tsx` - Uses getRoundNumber (5 locations)
- ✅ `src/pages/FixturesPage.tsx` - Uses getRoundNumber (2 locations)
- ✅ `src/pages/admin/AdminMatchesPage.tsx` - Uses round (jsonb query + display)
- ✅ `src/pages/MatchPage.tsx` - Uses getRoundNumber (2 locations)
- ✅ `src/design-system/components/FixtureCard.tsx` - Uses getRoundNumber (4 locations)
- ✅ `src/design-system/components/FixtureCard 2.tsx` - Uses getRoundNumber (4 locations)

**Sync Script**:
- ✅ `scripts/sync-sportmonks-fixtures.mjs` - Added shouldIncludeBroadcast() with Amazon Prime filter

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Run Database Migrations (10 minutes)

Open Supabase SQL Editor and run **IN ORDER**:

#### 1.1 Schema Migration
```bash
File: docs/migrations/clean-schema-migration.sql
```

**What it does**:
1. Creates backups: `fixtures_backup_20251009`, `broadcasts_backup_20251009`
2. Changes `fixtures.round` from varchar → jsonb
3. Changes `fixtures.stage` from varchar → jsonb
4. Drops `fixtures.matchday` column (derived data)
5. Drops `fixtures.home_team`, `fixtures.away_team` columns (duplicates)
6. Fixes `broadcasts.provider_id` and `country_id` constraints
7. Drops deprecated tables: `api_tv_station_mapping`, `affiliate_destinations`

**Expected Result**: "Query executed successfully"

**Verification Query**:
```sql
-- Check round is jsonb
SELECT id, round, round->>'name' as round_number
FROM fixtures
WHERE round IS NOT NULL
LIMIT 5;

-- Should show: round column with jsonb objects, round_number extracted
```

#### 1.2 View Migration
```bash
File: docs/migrations/clean-view-migration.sql
```

**What it does**:
1. Drops old `fixtures_with_teams` view
2. Creates new view with:
   - round and stage as jsonb (not varchar)
   - Amazon Prime filtered out for Premier League
   - Broadcaster priority: TNT Sports > Discovery+ > Others

**Expected Result**: "Query executed successfully"

**Verification Query**:
```sql
-- Check fixture 6057 shows TNT Sports (not Amazon)
SELECT id, home_team, away_team, broadcaster
FROM fixtures_with_teams
WHERE id = 6057;

-- Expected: broadcaster = "TNT Sports 1" or "Discovery+" (NOT "Amazon Prime Video")

-- Check round is jsonb in view
SELECT id, round, round->>'name' as round_num
FROM fixtures_with_teams
WHERE round IS NOT NULL
LIMIT 5;

-- Should show: jsonb objects
```

### Step 2: Re-sync Premier League Data (30 minutes)

```bash
cd /Users/p/Documents/pl_tv_mvp_spa

# Make sure feature flags are enabled in .env:
# REACT_APP_FF_USE_SPORTMONKS=true
# REACT_APP_FF_SPORTMONKS_ENABLE_SYNC=true
# REACT_APP_FF_SPORTMONKS_TV_STATIONS=true
# REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=1

# Run sync for full season
node scripts/sync-sportmonks-fixtures.mjs \
  --date-from=2024-08-01 \
  --date-to=2025-05-31 \
  --competition-id=1 \
  --verbose
```

**Expected Console Output**:
```
📅 Syncing Premier League (Competition 1, Sports Monks 8)...
   2024-08-17: 10 fixtures
   2024-08-24: 10 fixtures
   ...
   ⚠️  Filtering out Amazon Prime Video for PL (no rights this season)
   📺 Added broadcast: TNT Sports 1 (tv)
   📺 Added broadcast: Discovery+ (streaming)
   ...
   Total found: 380 fixtures
   ✅ Synced 380 fixtures for Premier League
```

**What to watch for**:
- ✅ "Filtering out Amazon Prime Video for PL" messages
- ✅ TNT Sports and Discovery+ being added
- ✅ ~380 fixtures total (38 matchweeks × 10 fixtures)
- ❌ NO Amazon Prime for competition_id = 1

### Step 3: Verify Data Quality (5 minutes)

Run these queries in Supabase:

```sql
-- 1. Check all fixtures have round data
SELECT
  competition_id,
  COUNT(*) as total_fixtures,
  COUNT(round) as fixtures_with_round,
  COUNT(round) FILTER (WHERE round->>'name' IS NOT NULL) as fixtures_with_round_name
FROM fixtures
WHERE competition_id = 1
GROUP BY competition_id;

-- Expected: total_fixtures = fixtures_with_round = fixtures_with_round_name (~380)

-- 2. Check no Amazon Prime for Premier League
SELECT COUNT(*) as amazon_count
FROM broadcasts b
JOIN fixtures f ON b.fixture_id = f.id
WHERE f.competition_id = 1
  AND b.channel_name ILIKE '%amazon%';

-- Expected: 0

-- 3. Check Matchweek 4 has all 10 fixtures
SELECT
  id,
  round->>'name' as round_number,
  home_team,
  away_team,
  broadcaster
FROM fixtures_with_teams
WHERE competition_id = 1
  AND round->>'name' = '4'
ORDER BY utc_kickoff;

-- Expected: 10 rows, no Amazon Prime

-- 4. Check fixture 6057 specifically
SELECT
  id,
  home_team,
  away_team,
  round->>'name' as round_number,
  broadcaster,
  broadcaster_id
FROM fixtures_with_teams
WHERE id = 6057;

-- Expected:
--   round_number = "4"
--   broadcaster = "TNT Sports 1" or "Discovery+" (NOT Amazon)
```

### Step 4: Test Frontend (10 minutes)

```bash
# Start dev server (if not already running)
npm start
```

**Test these pages**:

1. **Homepage** (`http://localhost:3000`)
   - ✅ Upcoming fixtures display
   - ✅ No console errors
   - ✅ Matchweek numbers visible

2. **Fixtures Page** (`http://localhost:3000/matches`)
   - ✅ Filter by matchweek works
   - ✅ Fixtures grouped correctly
   - ✅ No console errors

3. **Competition Page** (`http://localhost:3000/competitions/premier-league`)
   - ✅ Matchday sections show "Matchday X Fixtures"
   - ✅ All fixtures for current matchday visible
   - ✅ No Amazon Prime shown

4. **Admin Page** (`http://localhost:3000/admin/matches`)
   - ✅ Round column displays numbers
   - ✅ Filter by matchweek works
   - ✅ 10 fixtures show for MW4 (not just 2)

5. **Team Page** (e.g., `/clubs/arsenal`)
   - ✅ Next match shows matchweek
   - ✅ Fixture list loads correctly

6. **Match Detail** (click any fixture)
   - ✅ "Matchweek X" displays correctly
   - ✅ Broadcaster info shows TNT/Discovery+ (not Amazon for PL)

### Step 5: Browser Console Check

Open DevTools Console on each page, verify:
- ❌ NO TypeScript errors
- ❌ NO "cannot read property 'matchweek'" errors
- ❌ NO "undefined" being displayed
- ✅ Clean console output

---

## 📊 Expected Results

### Database Changes:
| Item | Before | After |
|------|--------|-------|
| `fixtures.round` | varchar or NULL | jsonb `{id, name, ...}` |
| `fixtures.stage` | varchar or NULL | jsonb |
| `fixtures.matchday` | integer (derived) | **DROPPED** |
| `fixtures.home_team` | varchar (duplicate) | **DROPPED** |
| `fixtures.away_team` | varchar (duplicate) | **DROPPED** |
| Amazon Prime for PL | Showing (incorrect) | Filtered out ✅ |
| MW4 fixtures visible | 2 (matchday NULL) | 10 (all have round) ✅ |

### Code Changes:
| Item | Before | After |
|------|--------|-------|
| Terminology | "matchweek" everywhere | "round" internally, "Matchweek X" for display |
| Data access | `fixture.matchweek` | `getRoundNumber(fixture)` |
| Type | `matchweek: number` | `round: RoundData` |
| Helper | N/A | `getRoundNumber()`, `getRoundLabel()`, etc. |

---

## 🛠️ Rollback Plan

If anything goes wrong:

```sql
-- 1. Restore fixtures table
DROP TABLE fixtures CASCADE;
ALTER TABLE fixtures_backup_20251009 RENAME TO fixtures;

-- 2. Restore broadcasts table
DROP TABLE broadcasts CASCADE;
ALTER TABLE broadcasts_backup_20251009 RENAME TO broadcasts;

-- 3. Recreate old view
-- Copy SQL from: scripts/remove-provider-mapping.sql (old version)
```

Then restart the app: `npm start`

---

## 🔍 Troubleshooting

### Issue: "column matchday does not exist"
**Cause**: Old code trying to access dropped column
**Fix**: Check that all files are updated (grep for "matchday" in src/)

### Issue: "round->>name is null"
**Cause**: Data not re-synced after migration
**Fix**: Run the sync script (Step 2)

### Issue: "Amazon Prime still showing for PL"
**Cause**: Old data not cleared
**Fix**: Delete old broadcasts, re-sync:
```sql
DELETE FROM broadcasts WHERE fixture_id IN (
  SELECT id FROM fixtures WHERE competition_id = 1
);
```
Then re-run sync script

### Issue: "No broadcaster showing"
**Cause**: View not updated or filter too strict
**Fix**: Re-run view migration SQL

---

## 📈 Success Metrics

After deployment, verify:
- ✅ Fixture 6057 shows TNT Sports (not Amazon Prime)
- ✅ Matchweek 4 shows all 10 fixtures (not just 2)
- ✅ All fixtures have round data (jsonb objects)
- ✅ No console errors in browser
- ✅ Admin page can filter by matchweek
- ✅ Competition pages group by matchday correctly
- ✅ No database queries fail

---

## 📝 Post-Deployment

1. **Monitor Logs**: Check Supabase logs for any query errors
2. **User Testing**: Click through main user flows
3. **Delete Backup Tables** (after 1 week if all good):
   ```sql
   DROP TABLE fixtures_backup_20251009;
   DROP TABLE broadcasts_backup_20251009;
   ```

---

## 🎉 Summary

**All code complete and ready!** You just need to:
1. Run the 2 SQL migration files in Supabase (10 min)
2. Re-sync Premier League data (30 min)
3. Test the frontend (10 min)

**Total deployment time**: ~50 minutes

**Risk level**: Low (we have backups and rollback plan)

**Next command**: Open Supabase SQL Editor and paste `docs/migrations/clean-schema-migration.sql`
