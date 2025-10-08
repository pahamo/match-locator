# Broadcaster Data Fixes - Complete Summary

## Problems Identified

### 1. Database Constraint Issue
**Problem**: The `broadcasts` table had a unique constraint on `(fixture_id, provider_id)` which prevented storing multiple channels from the same provider for the same match.

**Example**: Fixture 6057 couldn't have both "Sky Go" AND "Sky Ultra HD" with `provider_id = 1` because of this constraint.

**Impact**: We could only store ONE channel per provider per match, hiding other valid viewing options.

---

### 2. Incomplete Provider Mapping
**Problem**: The `mapBroadcasterToProvider()` function only caught "Sky Sports" and "Sky Go", missing other UK Sky channels.

**Unmapped Sky Channels**:
- Sky Ultra HD (49 broadcasts)
- Sky+ (93 broadcasts)
- Skylink (31 broadcasts)

**Impact**: 173 UK Sky broadcasts were unmapped (`provider_id = NULL`), so they weren't selected by the fixtures view and didn't show in the UI.

---

### 3. Non-UK Channels in Database
**Problem**: UK broadcaster filter missed German Sky channels with "Bundesliga" in the name.

**Bad Data**:
- Sky Sport Bundesliga 1 (13 broadcasts)
- Sky Sport Bundesliga 2 (7 broadcasts)

**Impact**: Non-UK broadcasts in database, polluting UK-only data.

---

## Solutions Applied

### 1. Admin Page Updates ✅

**File**: `src/pages/admin/AdminMatchesPage.tsx`

**Changes**:
- Updated `BroadcastRecord` interface to include `channel_name`
- Modified query to fetch `channel_name` from database
- Updated UI to display ALL channel names with provider mapping status
- Shows `[UNMAPPED]` tag for channels with `provider_id = NULL`

**Result**: Admin page now shows complete broadcaster data per fixture.

---

### 2. Provider Mapping Fix ✅

**File**: `scripts/sync-sportmonks-fixtures.mjs`

**Changes**:
```javascript
// OLD (Line 412):
if (name.includes('sky sports') || (name.includes('sky') && name.includes('go'))) return 1;

// NEW (Line 414):
if (name.includes('sky')) return 1;  // Catches ALL UK Sky channels
```

**Also Added**: Filter for Bundesliga channels in `isUKBroadcaster()` (Line 390)

**Result**: Future syncs will properly map all UK Sky channels and filter out German channels.

---

### 3. Database Schema Migration ⏳ NEEDS TO BE RUN

**File**: `scripts/fix-unmapped-sky-channels.sql`

**What it does**:
1. **Drops old constraint**: `broadcasts_fixture_id_provider_id_key`
2. **Adds new constraint**: `broadcasts_fixture_sportmonks_unique` on `(fixture_id, sportmonks_tv_station_id)`
3. **Deletes bad data**: Removes German Sky Sport Bundesliga channels
4. **Updates mappings**: Sets `provider_id = 1` for unmapped UK Sky channels

**Why this works**:
- New constraint allows multiple channels from same provider (e.g., Sky Go + Sky Ultra HD)
- Still prevents duplicate TV stations (same sportmonks_tv_station_id)
- Cleans up existing bad data
- Fixes 173 unmapped UK Sky broadcasts

---

## What You Need to Do

### Step 1: Run the SQL Migration

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy the contents of `scripts/fix-unmapped-sky-channels.sql`
3. Run the SQL
4. Verify output shows updated channels

### Step 2: Verify the Fix

Run the analysis script to check fixture 6057:
```bash
node scripts/analyze-fixture-broadcasts.mjs
```

**Expected output** (after SQL migration):
```
Sky Sports (Provider ID: 1) - 4 channels:
   - Sky Go
   - Sky Ultra HD
   - Sky+
   - Skylink

TNT Sports (Provider ID: 2) - 1 channels:
   - TNT Sports 1

Amazon Prime (Provider ID: 4) - 1 channels:
   - Amazon Prime Video
```

### Step 3: Check Admin Page

1. Go to `/admin/matches`
2. Filter to Matchday 4
3. Check fixture 6057 (Arsenal vs Nottingham Forest)
4. "All Broadcasts (DB)" column should show all 6 channels with provider names

### Step 4: Re-sync Recent Fixtures (Optional)

To apply the new mapping to recent data:
```bash
node scripts/sync-sportmonks-fixtures.mjs --date-from=2025-10-01 --date-to=2025-10-31 --verbose
```

This will re-fetch broadcaster data with the improved mapping function.

---

## Expected Results

### Before Fix:
```
Fixture 6057 broadcasts:
- Sky Go [Sky Sports]
- Sky Ultra HD [UNMAPPED]  ❌
- TNT Sports 1 [TNT Sports]
- Skylink [UNMAPPED]  ❌
- Sky+ [UNMAPPED]  ❌
- Amazon Prime Video [Amazon Prime]
- Sky Sport Bundesliga 1 [UNMAPPED]  ❌ (shouldn't be here)
```

### After Fix:
```
Fixture 6057 broadcasts:
- Sky Go [Sky Sports]  ✅
- Sky Ultra HD [Sky Sports]  ✅
- TNT Sports 1 [TNT Sports]  ✅
- Skylink [Sky Sports]  ✅
- Sky+ [Sky Sports]  ✅
- Amazon Prime Video [Amazon Prime]  ✅
(German channels deleted)  ✅
```

---

## Understanding the Data

### Multiple Providers = Need Investigation

As you noted: **"Premier League games are not shown on multiple broadcasters"**

If a fixture shows multiple providers (Sky + TNT + Amazon), it means:

1. **API data includes all platforms** - Some may be streaming/highlights, not live
2. **Simulcast** - Rare, but some matches ARE on multiple platforms
3. **Data quality issue** - Wrong channels associated with fixture

**For Admin Area**: You can now see ALL channels and manually verify which is correct.

**For Public View**: The `fixtures_with_teams` view still picks ONE broadcaster using priority:
1. TNT Sports (often Champions League)
2. Sky Sports (most Premier League)
3. BBC (highlights/special matches)
4. Amazon Prime (selected fixtures)

---

## Files Changed

### Modified:
- `src/pages/admin/AdminMatchesPage.tsx` - Show all channel names
- `scripts/sync-sportmonks-fixtures.mjs` - Better Sky mapping + Bundesliga filter

### Created:
- `scripts/fix-unmapped-sky-channels.sql` - Database migration
- `scripts/fix-unmapped-sky-channels.mjs` - Diagnostic script
- `BROADCASTER-FIXES-SUMMARY.md` - This file

---

## Questions to Investigate

1. **Fixture 6057** - Was it really on Sky Sports, TNT Sports, AND Amazon Prime? Or is API including wrong data?

2. **German Channels** - Why did Sky Sport Bundesliga get through the UK filter? (Fixed now)

3. **Multiple Providers** - Should we research actual broadcast rights to show correct primary broadcaster?

---

## Next Steps

✅ **Immediate**: Run the SQL migration to fix existing data

📊 **Short term**: Investigate fixtures with multiple providers to understand the data

🔍 **Medium term**: Consider adding manual curation for "primary broadcaster" flag

🎯 **Long term**: Research actual Premier League broadcast rights hierarchy for accurate priority
