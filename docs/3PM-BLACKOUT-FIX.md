# 3pm Saturday Blackout Fix

**Date:** 2025-11-04
**Issue:** Admin page shows "TBD" for 3pm Saturday matches instead of "🚫 No UK Broadcast"

---

## Problem Summary

### What We Found

**Database Analysis:**
- 196 3pm Saturday Premier League fixtures in database
- All have `broadcaster = NULL` in `fixtures_with_teams` view
- But they DO have broadcasters in raw `broadcasts` table (Sky Sports, NOW TV, etc.)
- SportMonks API correctly returns broadcaster data for these matches

### Root Cause

The `fixtures_with_teams` view has blackout filtering logic (lines 57-61, 84-88) that:
1. ✅ Correctly filters OUT broadcasters for 3pm Saturday matches
2. ❌ But doesn't set an `isBlackout` flag

Result: `broadcaster` is `NULL`, but there's no way for the UI to know if it's:
- "TBD" (no broadcaster data yet)
- "Blackout" (3pm Saturday, not televised in UK)

### UI Expects Blackout Flag

The `FixtureCard` component already has blackout UI logic:
- Line 92: Checks `fixture.isBlackout`
- Line 105: Checks `fixture.blackout?.is_blackout`
- Line 330-331: Shows "🚫 No UK Broadcast" when `isBlackout = TRUE`

But the database view doesn't provide this field!

---

## The 3pm Blackout Rule

**Official Rule:** In the UK, live TV broadcasts of football matches are prohibited between **2:45pm - 5:15pm on Saturdays** to protect lower-league attendance.

**What This Means:**
- Matches at 3pm Saturday UK time: **No live TV in UK**
- Other time slots (12:30pm, 5:30pm, evening): **Can be televised**
- Highlights after 5:15pm: **Allowed**
- Radio commentary: **Allowed** (hence BBC Radio 5 Live appears in data)

**Why SportMonks Returns Broadcaster Data:**
- SportMonks is a global API
- These matches ARE broadcast in other countries
- Radio commentary is broadcast in UK
- Highlights packages exist
- Our view correctly filters this data OUT for UK users

---

## The Fix

### Step 1: Update Database View

**File:** `docs/migrations/create-fixtures-with-teams-view-v2.sql`

**Change:** Add `is_blackout` boolean field that explicitly marks 3pm Saturday Premier League matches:

```sql
-- ⭐ NEW: 3pm Saturday blackout flag
(
  f.competition_id = 1  -- Premier League only
  AND EXTRACT(DOW FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 6  -- Saturday
  AND EXTRACT(HOUR FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 15  -- 3pm UK time
) AS is_blackout,
```

**To Apply:**
```sql
-- Connect to Supabase dashboard → SQL Editor
-- Paste and execute create-fixtures-with-teams-view-v2.sql
```

### Step 2: Update Admin Page (Optional)

**File:** `src/pages/admin/AdminMatchesPage.tsx`

Update line 292-301 to check for blackout:

```typescript
// CURRENT (shows "TBD" for everything):
{fixture.broadcaster ? (
  <span style={{ background: '#10b981', ... }}>
    {fixture.broadcaster}
  </span>
) : (
  <span style={{ background: '#f59e0b', ... }}>
    TBD
  </span>
)}

// BETTER (distinguishes blackout from TBD):
{fixture.broadcaster ? (
  <span style={{ background: '#10b981', color: 'white', ... }}>
    {fixture.broadcaster}
  </span>
) : fixture.is_blackout ? (
  <span style={{ background: '#ef4444', color: 'white', ... }}>
    🚫 3pm Blackout
  </span>
) : (
  <span style={{ background: '#f59e0b', color: 'white', ... }}>
    TBD
  </span>
)}
```

### Step 3: Verify Frontend

The `FixtureCard` component already handles this correctly (no changes needed):
- Line 92: `isBlackout: fixture.isBlackout || false`
- Line 105: `isBlackout = fixture.blackout?.is_blackout || false`
- Line 330: Shows "🚫 No UK Broadcast" when `isBlackout = TRUE`

Once the database view is updated, the frontend will automatically start showing the correct message.

---

## Expected Behavior After Fix

### Admin Page (`/admin/matches`)
**Before:**
- 3pm Saturday match: "TBD" (orange badge)

**After:**
- 3pm Saturday match: "🚫 3pm Blackout" (red badge)
- Unknown broadcaster: "TBD" (orange badge)
- Known broadcaster: "Sky Sports" (green badge)

### User-Facing Pages
**Before:**
- 3pm Saturday match: "TBD"

**After:**
- 3pm Saturday match: "🚫 No UK Broadcast"
- Unknown broadcaster: "TBD"
- Known broadcaster: "Sky Sports" (with affiliate link)

---

## Verification Steps

### 1. Check Database View
```sql
SELECT
  id,
  home_team,
  away_team,
  utc_kickoff,
  is_blackout,
  broadcaster
FROM fixtures_with_teams
WHERE competition_id = 1
  AND is_blackout = TRUE
LIMIT 10;
```

**Expected:** 196 rows with `is_blackout = TRUE` and `broadcaster = NULL`

### 2. Check Admin Page
1. Go to `https://matchlocator.com/admin/matches`
2. Set filters:
   - Competition: Premier League
   - Broadcaster Status: Without Broadcaster (TBD)
3. Check any Saturday 3pm match
4. Should now show "🚫 3pm Blackout" instead of "TBD"

### 3. Check User-Facing Page
1. Find a 3pm Saturday fixture on homepage or `/matches`
2. Should show "🚫 No UK Broadcast" instead of "TBD"

---

## Files Changed

- ✅ `docs/migrations/create-fixtures-with-teams-view-v2.sql` - NEW view with `is_blackout` field
- ⏳ `src/pages/admin/AdminMatchesPage.tsx` - OPTIONAL: Better admin UI
- ✅ `scripts/check-saturday-3pm-blackout.mjs` - Investigation script
- ✅ `scripts/check-db-saturday-3pm.mjs` - Investigation script
- ✅ `docs/3PM-BLACKOUT-FIX.md` - This document

---

## Why This Matters

**User Experience:**
- "TBD" implies broadcaster data is missing or coming soon
- "🚫 No UK Broadcast" correctly explains WHY there's no broadcaster
- Sets proper expectations for UK users

**Data Accuracy:**
- We DO have broadcaster data (from SportMonks API)
- We're correctly filtering it for UK blackout rules
- Now we're also correctly labeling it for users

**SEO Impact:**
- Pages with "TBD" look incomplete
- Pages with "🚫 No UK Broadcast" explain the situation
- Better user trust and engagement

---

## Testing Script

Run the investigation scripts:

```bash
# Check what SportMonks API returns for 3pm Saturday matches
node scripts/check-saturday-3pm-blackout.mjs

# Check what's in your database
node scripts/check-db-saturday-3pm.mjs
```

Both scripts are now in the repo for future reference.

---

**Next Steps:** Apply the database migration to production to enable the blackout flag.
