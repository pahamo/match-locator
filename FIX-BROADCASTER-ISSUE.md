# Broadcaster Data Fix - RESOLVED ✅

## Root Cause

The sync script was fetching TV station data but not including the nested station details.

**The Problem:**
- API query used `include=tvstations` which returns pivot table data (only IDs)
- Each item in `fixture.tvstations` has `tvstation_id` and `country_id` but no `name`
- Sync function tried to access `station.name.toLowerCase()` causing "Cannot read properties of undefined" error

**Data Structure:**
```javascript
// What we were getting (WRONG):
fixture.tvstations = [
  { id: 123, fixture_id: 456, tvstation_id: 42, country_id: 556 }
]

// What we needed (CORRECT):
fixture.tvstations = [
  {
    id: 123,
    fixture_id: 456,
    tvstation_id: 42,
    country_id: 556,
    tvstation: {
      id: 42,
      name: "Sky Sports Premier League",  // ✅ This is what we need!
      type: "channel",
      url: "https://..."
    }
  }
]
```

## The Fix

### 1. Change API Include Parameter (Line 232)

**Before:**
```javascript
include: 'participants;tvstations;round;scores;state'
```

**After:**
```javascript
include: 'participants;tvstations.tvstation;round;scores;state'
```

### 2. Update Sync Function (Lines 420-486)

**Before:**
```javascript
async function syncFixtureTVStations(fixtureDbId, tvStations, flags) {
  for (const station of tvStations) {
    if (!isUKBroadcaster(station)) {  // ❌ station.name undefined
      continue;
    }
    const providerId = mapBroadcasterToProvider(station.name);  // ❌ undefined
    // ...
  }
}
```

**After:**
```javascript
async function syncFixtureTVStations(fixtureDbId, tvStations, flags) {
  for (const station of tvStations) {
    if (!station.tvstation) {  // ✅ Skip if nested data missing
      continue;
    }
    if (!isUKBroadcaster(station.tvstation)) {  // ✅ Pass nested object
      continue;
    }
    const providerId = mapBroadcasterToProvider(station.tvstation.name);  // ✅ Access nested name
    // ...
  }
}
```

## Verification

✅ Test sync (Aug 15-25) created 87 broadcasts for 16 fixtures
✅ Broadcaster names are correct:
- Sky Sports Premier League
- TNT Sports
- Amazon Prime Video
- BBC iPlayer
- Sky Ultra HD
- TNT Sports Ultimate

## Next Steps

Run full season sync to populate all broadcaster data:
```bash
node scripts/sync-sportmonks-fixtures.mjs --date-from=2025-08-01 --date-to=2026-05-31
```

This will take 30-60 minutes to sync all competitions and fixtures.
