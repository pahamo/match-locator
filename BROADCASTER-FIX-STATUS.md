# Broadcaster Data Fix - Current Status

**Date:** 2025-10-08
**Status:** ✅ ROOT CAUSE FIXED - View Update Pending

---

## What We Fixed Today

### 1. ✅ Root Cause: Name-Based Filtering (FIXED)

**The Problem:**
- `isUKBroadcaster()` function filtered by channel NAME ("sky", "tnt", "amazon")
- This let through WRONG channels:
  - German Sky Go (country_id 11) - because name contains "sky"
  - Brazilian Sky+ (country_id 5) - because name contains "sky"
- And MISSED correct UK channels:
  - Sky Sports Main Event (actual UK primary channel)
  - SKY GO Extra (actual UK Sky Go)

**The Fix:**
- Renamed function to `isUKBroadcast()`
- Now filters by `country_id === 462` (England, from SportMonks API)
- No more name guessing - uses API's country data

**Files Changed:**
- `scripts/sync-sportmonks-fixtures.mjs` - Lines 380-389

---

### 2. ✅ UK vs Ireland Clarification (FIXED)

**Discovery:**
UK and Ireland have DIFFERENT broadcasters:
- England (462): TNT Sports, Discovery+, Amazon Prime
- Ireland (455): Sky Sports, TNT Sports, Amazon Prime

**Decision:**
Filter for England (462) only since site is UK-focused.

**Files Changed:**
- `scripts/sync-sportmonks-fixtures.mjs` - Country filtering
- `scripts/remove-provider-mapping.sql` - View filtering

---

### 3. ✅ Foreign Key Constraint Issue (FIXED)

**The Problem:**
- Sync was trying to insert `country_id: 462` (SportMonks ID)
- Database has FK constraint on `broadcasts.country_id`
- Our `countries` table doesn't have ID 462
- Inserts failed silently (no error shown)

**The Fix:**
- Set `country_id: null` to avoid FK constraint
- Use `country_code: 'EN'` for country info instead

**Files Changed:**
- `scripts/sync-sportmonks-fixtures.mjs` - Line 443

---

### 4. ✅ Provider Mapping Removed (DONE)

**Philosophy Change:**
- Stop manipulating API data
- Store raw channel names from SportMonks API
- No more custom provider grouping (Sky Sports, TNT, etc.)
- Set `provider_id: null` (deprecated field)

**Files Changed:**
- `scripts/sync-sportmonks-fixtures.mjs` - Removed `mapBroadcasterToProvider()` call
- `src/pages/admin/AdminMatchesPage.tsx` - Shows raw channel names with API IDs
- `scripts/remove-provider-mapping.sql` - View update (NEEDS TO BE RUN)

---

## Current Data State

### Fixture 6057 (Arsenal vs Nottingham Forest, 2025-09-13):

**Broadcasts Stored (5 channels):**
1. Amazon Prime Video (API ID: 999)
2. Discover+ App (API ID: 997)
3. Discovery+ (API ID: 729)
4. TNT Sports 1 (API ID: 860)
5. TNT Sports Ultimate (API ID: 998)

**All are England (462) broadcasts with country_code: 'EN'**

---

## What Still Needs to Be Done Tomorrow

### ⏳ STEP 1: Update Database View

**Action:** Run SQL in Supabase SQL Editor

**File:** `scripts/remove-provider-mapping.sql` (full content)

**Or copy/paste this:**
```sql
-- Drop old view
DROP VIEW IF EXISTS fixtures_with_teams CASCADE;

-- Create new view that selects by channel name (alphabetically)
CREATE VIEW fixtures_with_teams AS
SELECT
  f.id,
  f.competition_id,
  f.home_team_id,
  f.away_team_id,
  f.utc_kickoff,
  f.matchday,
  f.season,
  f.venue,
  f.status,
  f.home_score,
  f.away_score,
  f.sportmonks_fixture_id,
  f.round,
  f.stage,
  ht.id as home_team_db_id,
  ht.name as home_team,
  ht.slug as home_team_slug,
  ht.crest_url as home_crest,
  at.id as away_team_db_id,
  at.name as away_team,
  at.slug as away_team_slug,
  at.crest_url as away_crest,
  (
    SELECT b.channel_name
    FROM broadcasts b
    WHERE b.fixture_id = f.id
      AND (b.country_code IN ('EN', 'GB', 'GBR'))
    ORDER BY b.channel_name ASC
    LIMIT 1
  ) AS broadcaster,
  (
    SELECT b.sportmonks_tv_station_id
    FROM broadcasts b
    WHERE b.fixture_id = f.id
      AND (b.country_code IN ('EN', 'GB', 'GBR'))
    ORDER BY b.channel_name ASC
    LIMIT 1
  ) AS broadcaster_id
FROM fixtures f
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id;
```

**Expected Result:**
- Fixture 6057 should show `broadcaster: "Amazon Prime Video"`
- broadcaster_id should be `999` (not 2)

---

### ⏳ STEP 2: Verify View Works

**Action:** Run this SQL to check fixture 6057:
```sql
SELECT id, home_team, away_team, broadcaster, broadcaster_id
FROM fixtures_with_teams
WHERE id = 6057;
```

**Expected:**
- broadcaster: "Amazon Prime Video"
- broadcaster_id: 999

---

### ⏳ STEP 3: Check Admin Page

**Action:** Visit `/admin/matches` in browser

**Filter:** Matchday 4, Competition: Premier League

**Expected for Fixture 6057:**
- "Broadcaster (View Selection)" column: Amazon Prime Video
- "All Channels (SportMonks API)" column: All 5 England channels listed

---

### ⏳ STEP 4: Investigate Amazon Prime Issue

**Your Concern:** "Amazon have no games in the premier league this season"

**Two Possibilities:**

**A) API Data is Wrong:**
- SportMonks incorrectly lists Amazon for this game
- We need to report to them or filter it out manually

**B) API Data is Correct:**
- Amazon might have streaming rights for this specific game
- Or it's a test/preview broadcast

**Action:**
1. Check SportMonks dashboard/documentation
2. Verify if Amazon actually showed this game
3. Decide if we need to manually exclude certain channels

---

### ⏳ STEP 5: Full Season Re-sync (Optional)

**If view works correctly for fixture 6057:**

```bash
# Delete ALL old broadcast data (bad country filtering)
# Run in Supabase SQL Editor:
DELETE FROM broadcasts WHERE country_code IN ('GBR', 'GB') OR country_code IS NULL;

# Re-sync full season with correct filtering
node scripts/sync-sportmonks-fixtures.mjs \
  --date-from=2025-08-01 \
  --date-to=2026-05-31 \
  --verbose
```

**Warning:** This will take 30-60 minutes.

**Expected Result:**
- Only England (462) broadcasts stored
- All have country_code: 'EN'
- All channels are actual England broadcasters

---

## Key Learnings

### ✅ What We Learned:

1. **Use API's country_id, not name matching**
   - SportMonks provides `country_id` on each broadcast record
   - England = 462, Ireland = 455
   - This is the correct way to filter

2. **UK ≠ Ireland for broadcasters**
   - Different channels, different rights
   - Don't assume they're the same

3. **Foreign Key constraints fail silently**
   - Supabase doesn't throw errors on FK violations in some cases
   - Always verify inserts actually worked

4. **Don't manipulate API data**
   - Store what the API gives us
   - Let the data speak for itself
   - Use raw channel names, not custom groupings

---

## Documentation Files

Created/Updated:
- ✅ `BROADCASTER-FIX-STATUS.md` (this file)
- ✅ `REMOVE-PROVIDER-MAPPING.md` - Explains provider_id removal
- ✅ `BROADCASTER-DATA-FLOW-ANALYSIS.md` - Old analysis (archived)
- ✅ `BROADCASTER-FIXES-SUMMARY.md` - Old approach (archived)

Scripts Created:
- ✅ `scripts/remove-provider-mapping.sql` - View update SQL
- ✅ `scripts/check-fixture-6057-broadcasts.mjs` - Diagnostic
- ✅ `scripts/find-arsenal-fixture.mjs` - Diagnostic
- ✅ `scripts/analyze-fixture-broadcasts.mjs` - Diagnostic

---

## Git Status

**Last Commits:**
1. `34d74010` - fix: set country_id to null to avoid FK constraint failure
2. `3982305b` - fix: filter for England (462) only, not Ireland
3. `594fd051` - fix: update view to accept IE/EN country codes
4. `9be3bb5c` - fix: filter broadcasts by country_id instead of channel name

**Branch:** staging
**Status:** All changes pushed ✅

---

## Quick Start Tomorrow Morning

1. ☐ Run view update SQL (Step 1 above)
2. ☐ Verify fixture 6057 shows "Amazon Prime Video" (Step 2)
3. ☐ Check admin page `/admin/matches` (Step 3)
4. ☐ Investigate Amazon Prime issue (Step 4)
5. ☐ If all good, re-sync full season (Step 5)

---

## Questions to Answer Tomorrow

1. **Does Amazon Prime actually have this game?**
   - Check if API is correct or needs manual filtering

2. **Should we use alphabetical selection?**
   - Or should we prioritize certain channels (TNT > Discovery+ > Amazon)?
   - Current: Alphabetical (Amazon first)

3. **Do we need a "primary broadcaster" flag?**
   - To distinguish main channel from streaming options

4. **Should Discovery+ be treated as TNT Sports?**
   - They might be related (Discovery owns TNT)
   - Or are they separate platforms?

---

**Ready to continue tomorrow! 🚀**
