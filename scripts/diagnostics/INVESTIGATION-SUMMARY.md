# Broadcaster Data Investigation - Executive Summary

**Date:** November 3, 2025
**Issue:** New fixtures (Nov/Dec 2025) lack broadcaster data while old fixtures (Aug/Sep 2025) have it
**Status:** ✅ ROOT CAUSE IDENTIFIED

---

## Quick Summary

**Problem:** 20 out of 35 Premier League November fixtures are missing UK broadcaster data (NOW TV, Amazon Prime).

**Root Cause:** The sync script filters broadcasters by country_id, but is missing two critical IDs:
- Country ID **251** = NOW TV
- Country ID **458** = Amazon Prime Video (UK)

**Current Filter:** Only includes country IDs 11, 455, 462
**Should Include:** 11, 251, 455, 458, 462

---

## Evidence

### Test Results from Live API

**Fixture 7864 (Nov 1) - Has 3 broadcasts in database:**
- ✅ Sky Sports Main Event (country 455) - SAVED
- ✅ Sky Ultra HD (country 455) - SAVED
- ✅ SKY GO Extra (country 455) - SAVED
- ❌ NOW TV (country 251) - **FILTERED OUT**
- ❌ Amazon Prime Video (country 458) - **FILTERED OUT**

**Fixture 6085 (Nov 8) - Has 0 broadcasts in database:**
- ✅ Sky Sports Main Event (country 455) - Should be saved but fixture shows 0
- ❌ NOW TV (country 251) - **FILTERED OUT**

### Data Statistics

**November 2025 Premier League:**
- Total fixtures: 35
- With broadcaster data: 15 (43%)
- Without broadcaster data: 20 (57%)

**Pattern:**
- Fixtures that have Sky Sports (country 455) = Have data ✅
- Fixtures that only have NOW TV/Amazon (251/458) = No data ❌

---

## Technical Details

### Current Code (Incorrect)

Location: `scripts/production/sync-sportmonks-fixtures.mjs` line 417

```javascript
if (![ENGLAND_COUNTRY_ID, IRELAND_COUNTRY_ID, 11].includes(station.country_id)) {
  return false;
}
```

**Values:**
- ENGLAND_COUNTRY_ID = 462
- IRELAND_COUNTRY_ID = 455
- Additional: 11

**Missing:** 251 (NOW TV), 458 (Amazon Prime)

### Fix Required

```javascript
if (![11, 251, 455, 458, 462].includes(station.country_id)) {
  return false;
}
```

### Files to Update

1. **Main sync script:**
   `scripts/production/sync-sportmonks-fixtures.mjs` (line 417)

2. **Broadcaster-only sync:**
   `scripts/production/sync-upcoming-broadcasters.mjs` (line 151)

---

## Why This Wasn't Caught Earlier

1. **Sync is working correctly** - The script runs successfully and updates fixtures
2. **Some broadcasts ARE being saved** - Country 455 (Sky Sports) works fine
3. **No errors are thrown** - Filtered broadcasts are silently dropped
4. **Gradual rollout** - TV schedules are announced incrementally, so some fixtures naturally have data

The issue only becomes apparent when comparing fixtures that SHOULD have broadcasters but don't.

---

## Impact

### Current Impact
- 57% of Nov Premier League fixtures missing broadcaster data
- Similar issues across all competitions (217 fixtures without broadcasts)
- Users see "No broadcast info" for matches that WILL be televised

### After Fix
- All fixtures with UK broadcasters will show channel information
- NOW TV subscribers can see which matches they can watch
- Amazon Prime subscribers can see Champions League broadcasts

---

## Recommended Actions

### Immediate (5 minutes)
1. Update `shouldIncludeBroadcast()` function in both sync scripts
2. Add country IDs 251 and 458 to the filter

### Short-term (30 minutes)
3. Re-run sync script to populate missing broadcasts:
   ```bash
   node scripts/production/sync-sportmonks-fixtures.mjs --verbose
   ```

4. Verify fix with test script:
   ```bash
   node scripts/diagnostics/test-missing-broadcast-fixture.mjs
   ```

### Long-term (optional)
5. Add channel name pattern matching as fallback (see ROOT-CAUSE-ANALYSIS.md)
6. Add monitoring for filtered broadcasts (log when filtering out UK channels)
7. Remove 2-month lookback workaround from ClubPage.tsx

---

## Test Scripts Created

All scripts are in `scripts/diagnostics/`:

1. **compare-broadcaster-dates.mjs** - Compare old vs new fixture data
2. **check-fixture-dates.mjs** - Show fixtures by month with broadcast counts
3. **analyze-missing-broadcasts.mjs** - Analyze which fixtures lack data
4. **test-nov-pl-fixture.mjs** - Test Premier League fixture API calls
5. **test-missing-broadcast-fixture.mjs** - Test fixtures without broadcasts

Run any of these to verify the fix.

---

## Related Files

- **Root cause analysis:** `scripts/diagnostics/ROOT-CAUSE-ANALYSIS.md` (detailed technical analysis)
- **Main sync script:** `scripts/production/sync-sportmonks-fixtures.mjs`
- **Broadcaster sync:** `scripts/production/sync-upcoming-broadcasters.mjs`
- **Database view:** `docs/migrations/create-fixtures-with-teams-view.sql`
- **ClubPage workaround:** `src/pages/ClubPage.tsx` (lines 38-44)

---

## Questions?

See `ROOT-CAUSE-ANALYSIS.md` for full technical details, API response examples, and alternative solutions.
