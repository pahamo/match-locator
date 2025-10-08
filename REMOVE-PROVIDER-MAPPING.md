# Remove Provider Mapping - Use API Data Directly

## Philosophy

**Don't manipulate or "clean" API data. Use SportMonks data as the source of truth.**

The SportMonks API provides:
- `tvstation_id`: Unique identifier for each channel
- `name`: Channel name (e.g., "Sky Go", "TNT Sports 1", "Sky Sport Bundesliga")
- `country_id`: Country where it broadcasts
- `type`: "tv" or "channel"

We should store and display this data **as-is**, without trying to group or categorize it.

---

## What We Removed

### 1. Provider ID Mapping (Deprecated)

**Old approach:**
- Created custom `providers` table (1=Sky Sports, 2=TNT Sports, 3=BBC, 4=Amazon)
- `mapBroadcasterToProvider()` function matched channel names to provider IDs
- Stored `provider_id` in broadcasts table
- Many channels were unmapped (provider_id = NULL)

**Problems:**
- Subjective mapping ("Sky Ultra HD" → Sky Sports? Or separate provider?)
- Breaks when expanding internationally (German Sky should be different provider)
- Added complexity without clear benefit
- Caused database constraint issues (couldn't store multiple Sky channels per fixture)

**New approach:**
- Store raw `channel_name` and `sportmonks_tv_station_id` from API
- No custom provider grouping
- Let the data speak for itself

---

### 2. Database Constraint Change

**Old constraint:**
```sql
UNIQUE (fixture_id, provider_id)
```
**Problem:** Prevented storing multiple channels from same provider (e.g., Sky Go + Sky Ultra HD)

**New constraint:**
```sql
UNIQUE (fixture_id, sportmonks_tv_station_id)
```
**Benefit:** Allows multiple channels while preventing duplicate API records

---

### 3. Broadcaster Selection (fixtures_with_teams view)

**Old approach:**
```sql
SELECT broadcaster, broadcaster_id
FROM broadcasts
WHERE fixture_id = X
ORDER BY CASE provider_id WHEN 2 THEN 1 WHEN 1 THEN 2 ... END
LIMIT 1
```

**New approach:**
```sql
SELECT channel_name, sportmonks_tv_station_id
FROM broadcasts
WHERE fixture_id = X AND country_code = 'GB'
ORDER BY channel_name ASC  -- Simple alphabetical
LIMIT 1
```

**Simpler:** Just pick first UK channel alphabetically, no custom priority logic.

---

## Changes Made

### Database Migration

**File:** `scripts/remove-provider-mapping.sql`

**What it does:**
1. Drop `(fixture_id, provider_id)` unique constraint
2. Add `(fixture_id, sportmonks_tv_station_id)` unique constraint
3. Make `provider_id` nullable (deprecated, keep column for now)
4. Update `fixtures_with_teams` view to select by channel_name

**Safe to run:** Doesn't delete any data, just changes constraints and view logic.

---

### Sync Script

**File:** `scripts/sync-sportmonks-fixtures.mjs`

**Changes:**
```javascript
// OLD:
const providerId = mapBroadcasterToProvider(station.tvstation.name);
const broadcastData = {
  provider_id: providerId,
  channel_name: station.tvstation.name,
  // ...
};

// NEW:
const broadcastData = {
  provider_id: null,  // Deprecated
  channel_name: station.tvstation.name,  // Raw API data
  sportmonks_tv_station_id: station.tvstation_id,  // API's ID
  // ...
};
```

**No more mapping logic.** Just store what the API gives us.

---

### Admin Page

**File:** `src/pages/admin/AdminMatchesPage.tsx`

**Changes:**
- Removed provider_id and provider_name from query
- Fetch `sportmonks_tv_station_id`, `channel_name`, `broadcaster_type` directly
- Display raw channel names with API IDs
- No more "[Sky Sports]" or "[UNMAPPED]" tags

**UI now shows:**
```
All Channels (SportMonks API):
- Amazon Prime Video (API ID: 1234)
- Sky Go (API ID: 5678)
- Sky Ultra HD (API ID: 9101)
- TNT Sports 1 (API ID: 1121)
```

Clean, simple, no interpretation.

---

## UK Filtering (Still Active)

We **still filter to UK broadcasters only** via `isUKBroadcaster()` function.

**Why keep this filter:**
- Site is currently UK-focused
- Reduces noise for UK users
- Performance (fewer records)

**TODO when expanding internationally:**
- Remove or parameterize `isUKBroadcaster()` check
- Add country selection to UI
- Store all countries' broadcasters

**The filter is documented** with `TODO` comment in code (line 434 of sync script).

---

## Expected Results

### Fixture 6057 Before:
```
Broadcasts in database:
- Sky Go [Sky Sports] ✓
- Sky Ultra HD [UNMAPPED] ❌
- Sky+ [UNMAPPED] ❌
- TNT Sports 1 [TNT Sports] ✓

Only 2 providers shown, 3 channels unmapped
```

### Fixture 6057 After Migration:
```
Broadcasts in database:
- Amazon Prime Video (API ID: 1234)
- Sky Go (API ID: 5678)
- Sky Ultra HD (API ID: 9101)
- Sky+ (API ID: 1112)
- Skylink (API ID: 1314)
- TNT Sports 1 (API ID: 1516)

All 6 channels stored, no mapping needed
```

---

## How to Apply

### Step 1: Run SQL Migration

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy contents of `scripts/remove-provider-mapping.sql`
3. Run it
4. Verify the view update worked:
```sql
SELECT id, home_team, away_team, broadcaster, broadcaster_id
FROM fixtures_with_teams
WHERE id = 6057;
```

Should show a channel name (not provider name) and sportmonks_tv_station_id.

### Step 2: Re-sync Recent Fixtures

This will store new broadcasts with `provider_id = NULL`:

```bash
node scripts/sync-sportmonks-fixtures.mjs \
  --date-from=2025-10-01 \
  --date-to=2025-10-31 \
  --verbose
```

### Step 3: Verify Admin Page

1. Go to `/admin/matches`
2. Check fixture 6057
3. "All Channels (SportMonks API)" should show all UK channels with API IDs
4. No provider mapping tags

---

## Future Improvements

### Option 1: Remove UK Filter
To support international broadcasts:
1. Remove `isUKBroadcaster()` check from sync script
2. Store all countries' channels
3. Add country filter to UI

### Option 2: Add Manual Curation
For "primary broadcaster" selection:
1. Add `is_primary` boolean to broadcasts table
2. Manually mark primary broadcaster per fixture
3. Update view to prioritize `is_primary = true`

### Option 3: Use API Metadata
If SportMonks provides priority/hierarchy data:
1. Store that metadata
2. Use it for selection instead of alphabetical

---

## Files Changed

**Migration:**
- `scripts/remove-provider-mapping.sql` (NEW)

**Sync Logic:**
- `scripts/sync-sportmonks-fixtures.mjs` (provider_id → null)

**Admin UI:**
- `src/pages/admin/AdminMatchesPage.tsx` (show raw API data)

**Documentation:**
- `REMOVE-PROVIDER-MAPPING.md` (this file)

---

## Deprecated (Will Remove Later)

- `providers` table (keep for now, but unused)
- `provider_id` column in `broadcasts` table (now always NULL)
- `mapBroadcasterToProvider()` function (no longer called)

These will be removed in a future cleanup PR once we're confident the new approach works.

---

## Questions to Consider

1. **Alphabetical selection** - Is picking first channel alphabetically the right approach? Or should we:
   - Let user select their preferred broadcaster
   - Research actual broadcast rights hierarchy
   - Use fixture metadata (if available)

2. **International expansion** - When we remove UK filter:
   - How do we show users their relevant country's channels?
   - Do we need country-specific defaults?
   - Should users set their country in settings?

3. **Multiple channels** - When fixture has 6 channels showing same match:
   - Do we show all 6 in UI?
   - Group by network (Sky Go + Sky Ultra HD = "Sky Sports")?
   - Let user filter by subscription service?

---

**Principle:** Start with clean, unmanipulated API data. Add complexity only when user need is clear.
