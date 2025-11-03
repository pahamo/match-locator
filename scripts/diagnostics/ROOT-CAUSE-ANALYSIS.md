# Root Cause Analysis: Missing Broadcaster Data for Nov/Dec 2025 Fixtures

## Investigation Date
November 3, 2025

## Summary
New fixtures (Nov/Dec 2025) are missing broadcaster data in the database, while old fixtures (Aug/Sep 2025) have it. This is preventing the ClubPage from showing TV channel information for upcoming matches.

## Current Workaround
ClubPage fetches fixtures from 2 months ago (lines 38-44) to include recent results that have broadcaster data.

## Key Findings

### 1. Data Status
- **Total fixtures Aug-Dec 2025:** 1,000
- **Aug 2025:** 308 fixtures, 240 synced, 240 from SportMonks
- **Sep 2025:** 323 fixtures, 265 synced, 265 from SportMonks
- **Oct 2025:** 311 fixtures, 311 synced, 311 from SportMonks
- **Nov 2025:** 58 fixtures, 58 synced, 58 from SportMonks

### 2. Broadcaster Data Distribution
- **Aug fixtures:** Most have 3-7 broadcast records
- **Nov fixtures:** 21 with broadcasts, 37 without broadcasts
- **Missing by competition:**
  - Serie A: 33 fixtures
  - Ligue 1: 30 fixtures
  - Eredivisie: 29 fixtures
  - La Liga: 29 fixtures
  - Primeira Liga: 22 fixtures
  - **Premier League: 20 fixtures** ⚠️
  - Bundesliga: 18 fixtures
  - Champions League: 18 fixtures
  - Europa League: 18 fixtures

### 3. Recent Sync Activity
**Most Recent Sync:** November 3, 2025 at 4:17 AM
- Status: Success
- Fixtures created: 0
- Fixtures updated: 3,081
- API calls: 336
- Date range: Nov 3 - Dec 3, 2025

### 4. API Data Availability
Testing a Nov fixture (19424980) shows:
- API returns 222 TV stations globally
- Only 1 "UK" station found (country_id: 11) - but it's "DAZN Germany" ❌
- This confirms SportMonks HAS broadcaster data, but UK filtering is too strict

## Root Cause

### The Problem: Missing Country ID 251 in Filter

The sync script (`scripts/production/sync-sportmonks-fixtures.mjs`) filters broadcasts using:

```javascript
function shouldIncludeBroadcast(station, competitionId) {
  const ENGLAND_COUNTRY_ID = 462;
  const IRELAND_COUNTRY_ID = 455;

  // Only includes country_id: 462, 455, or 11
  if (![ENGLAND_COUNTRY_ID, IRELAND_COUNTRY_ID, 11].includes(station.country_id)) {
    return false;
  }
  // ... additional filters
}
```

**CONFIRMED: Country ID 251 is used for UK broadcasters but is NOT in the filter!**

### Test Results from Nov Premier League Fixtures

**Fixture 7864 (Nov 1, 2025) - HAS 3 broadcasts:**
- API returned 366 TV stations
- Current filter (11, 455, 462) matched: 3 stations ✅
- By name search found: 3 UK broadcasters
  - Sky Sports Main Event (country: 455) ✅
  - Amazon Prime Video (country: 458) ❌ Filtered out
  - NOW TV (country: 251) ❌ **Filtered out!**

**Fixture 6085 (Nov 8, 2025) - HAS 0 broadcasts:**
- API returned 269 TV stations
- Current filter (11, 455, 462) matched: 3 stations
- By name search found: 2 UK broadcasters
  - Sky Sports Main Event (country: 455) ✅ Should be saved
  - NOW TV (country: 251) ❌ **Filtered out!**

**Confirmed Issue:**
- Country ID **251** is used by **NOW TV** (a major UK broadcaster)
- Country ID **458** is used by **Amazon Prime Video** (UK)
- These IDs are NOT included in the filter
- Result: Many UK broadcasts are being excluded

### Why Some Fixtures Have Data and Others Don't

**Pattern discovered:**

1. **Fixtures with Country 455 broadcasts = HAVE DATA**
   - Country 455 includes Sky Sports channels
   - These pass the current filter
   - Result: 3-7 broadcast records

2. **Fixtures with ONLY Country 251/458 broadcasts = NO DATA**
   - Country 251 = NOW TV
   - Country 458 = Amazon Prime Video
   - These are FILTERED OUT by current logic
   - Result: 0 broadcast records

3. **Sync is working, but incomplete**
   - The Nov 3 sync updated 3,081 fixtures ✅
   - TV stations ARE being fetched ✅
   - Broadcasts ARE being inserted... but ONLY for country 455 ✅
   - Country 251 and 458 broadcasts are silently dropped ❌

## The Real Issue: Feature Flag + Sync Timing

Looking at the sync script (lines 386-390):

```javascript
// Sync TV stations if enabled - use tvstations from fixture object (already included)
const showTVStations = process.env.REACT_APP_FF_SPORTMONKS_TV_STATIONS === 'true';
if (showTVStations && fixture.tvstations) {
  await syncFixtureTVStations(fixtureDbId, competitionId, fixture.tvstations, flags);
}
```

**Current status:**
- `REACT_APP_FF_SPORTMONKS_TV_STATIONS: true` ✅
- Feature flag IS enabled
- Sync IS running (Nov 3 sync updated 3,081 fixtures)

**BUT:**

The sync is running with `include=tvstations.tvstation` in the API call (line 258), which means:
1. Fixtures ARE being synced
2. TV station data IS being fetched
3. Broadcasts ARE being filtered by country_id

**The problem is the filtering is too strict, causing most broadcasts to be excluded.**

## Why 37% of Nov Fixtures Have NO Broadcasts

When the sync script processes a fixture:

1. Fetches fixture with `include=tvstations.tvstation`
2. Gets all global broadcasters (e.g., 222 stations)
3. Filters by country_id (462, 455, 11)
4. **Only finds 0-1 UK stations** (because country IDs are wrong/inconsistent)
5. Additional filters remove ROI channels, Amazon Prime
6. Result: **0 broadcasts inserted** for most fixtures

### Evidence from Nov Fixture Test:
- 222 total TV stations in API
- Only 1 matched UK filter (11, 455, 462)
- That 1 station was "DAZN Germany" (incorrect country_id)
- Net result: 0 valid UK broadcasts

## Solutions

### ✅ Solution: Add Country IDs 251 and 458 to Filter

**The fix is simple - just expand the country ID list:**

```javascript
function shouldIncludeBroadcast(station, competitionId) {
  const ENGLAND_COUNTRY_ID = 462;
  const IRELAND_COUNTRY_ID = 455;
  const UK_COUNTRY_ID = 11;
  const NOW_TV_COUNTRY_ID = 251;      // NOW TV (UK streaming)
  const AMAZON_COUNTRY_ID = 458;       // Amazon Prime Video (UK)
  const PREMIER_LEAGUE_COMPETITION_ID = 1;

  // Include England, Ireland, UK, NOW TV, and Amazon Prime country IDs
  if (![ENGLAND_COUNTRY_ID, IRELAND_COUNTRY_ID, UK_COUNTRY_ID, NOW_TV_COUNTRY_ID, AMAZON_COUNTRY_ID].includes(station.country_id)) {
    return false;
  }

  // Filter out Irish-specific channels (e.g., "Premier Sports ROI 1")
  const channelName = station.tvstation?.name || '';
  if (channelName.includes('ROI')) {
    return false;
  }

  // Filter out Amazon Prime for Premier League
  // Amazon has NO Premier League rights this season (2024-25)
  // They have some Champions League rights, so only filter for PL
  if (competitionId === PREMIER_LEAGUE_COMPETITION_ID &&
      channelName.toLowerCase().includes('amazon')) {
    if (options.verbose) {
      console.log(`      ⚠️  Filtering out ${channelName} for PL (no rights this season)`);
    }
    return false;
  }

  return true;
}
```

**Why this works:**
- Country 455 = Sky Sports, TNT Sports (already working) ✅
- Country 251 = NOW TV (currently missing) ⚠️
- Country 458 = Amazon Prime Video (currently missing) ⚠️
- Amazon filter still applies to PL (no PL rights)
- Amazon keeps Champions League broadcasts

### Alternative: Channel Name Pattern Matching (Fallback)

If country IDs continue to change, add channel name matching:

```javascript
function shouldIncludeBroadcast(station, competitionId) {
  const channelName = station.tvstation?.name || '';

  // 1. Check by country_id (primary method)
  if ([11, 251, 455, 458, 462].includes(station.country_id)) {
    if (channelName.includes('ROI')) return false;
    if (competitionId === 1 && channelName.toLowerCase().includes('amazon')) return false;
    return true;
  }

  // 2. Check by channel name (fallback)
  const ukChannelPatterns = [
    'Sky Sports', 'TNT Sports', 'BBC', 'ITV',
    'BT Sport', 'Discovery+', 'NOW', 'Premier Sports'
  ];

  for (const pattern of ukChannelPatterns) {
    if (channelName.includes(pattern)) {
      if (channelName.includes('ROI')) return false;
      if (competitionId === 1 && channelName.toLowerCase().includes('amazon')) return false;
      return true;
    }
  }

  return false;
}
```

### Option 2: Run Manual Broadcaster Sync
Use the dedicated broadcaster sync script for upcoming fixtures:

```bash
node scripts/production/sync-upcoming-broadcasters.mjs
```

This script:
- Fetches fixtures from last 3 hours onwards
- Specifically targets broadcast data
- Uses similar filtering but may have different results

### Option 3: Check SportMonks API for Correct Country IDs
The issue might be that UK broadcasts are stored with different country IDs. We need to:

1. Query SportMonks API for a known UK fixture
2. Look at ALL tvstations returned
3. Identify which country_ids contain Sky Sports, TNT Sports, etc.
4. Update the filter to include those IDs

## Immediate Action Required

1. **Test a known UK fixture from November**
   - Find a Premier League fixture that SHOULD have Sky Sports
   - Query SportMonks API directly
   - Check what country_id Sky Sports has for that fixture

2. **Update the shouldIncludeBroadcast() function**
   - Either expand country_id list
   - Or add channel name pattern matching

3. **Re-run the sync script**
   ```bash
   node scripts/production/sync-sportmonks-fixtures.mjs --verbose
   ```

4. **Verify broadcasts were created**
   ```bash
   node scripts/diagnostics/check-fixture-dates.mjs
   ```

## Files to Modify

1. **scripts/production/sync-sportmonks-fixtures.mjs**
   - Line 409-439: `shouldIncludeBroadcast()` function
   - Add channel name pattern matching as fallback

2. **scripts/production/sync-upcoming-broadcasters.mjs**
   - Line 147-180: Similar filtering logic
   - Should match the main sync script

## Testing Plan

1. Run sync with verbose logging on a single competition:
   ```bash
   node scripts/production/sync-sportmonks-fixtures.mjs --competition-id=1 --verbose
   ```

2. Check how many broadcasts are filtered out vs. inserted

3. If needed, manually inspect SportMonks API response for a fixture:
   ```bash
   node scripts/diagnostics/analyze-missing-broadcasts.mjs
   ```

## Expected Outcome

After fixing the filtering:
- Nov/Dec fixtures should have 3-7 broadcast records (like Aug/Sep)
- ClubPage can remove the 2-month lookback workaround
- All competitions should show broadcaster info
