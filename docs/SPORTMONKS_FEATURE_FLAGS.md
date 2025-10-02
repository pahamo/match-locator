# Sports Monks Feature Flags System

**Status**: ✅ Complete
**Last Updated**: 2025-10-02

## Overview

Hierarchical feature flag system for gradual Sports Monks API rollout with zero downtime. Master switch controls all dependent features for safe emergency rollback.

## Environment Variables

All flags default to `false` for safety. Set to `'true'` to enable.

### Master Switches

```bash
REACT_APP_FF_USE_SPORTMONKS=false              # Enable Sports Monks API
REACT_APP_FF_SPORTMONKS_TEST_MODE=false        # Test mode: log only, no DB writes
```

### Sync Configuration

```bash
REACT_APP_FF_SPORTMONKS_ENABLE_SYNC=false      # Enable automatic data sync
REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=     # Comma-separated IDs (empty = all)
```

**Competition IDs**:
- `1` = Premier League
- `2` = Champions League
- `3` = FA Cup
- `4` = EFL Cup (Carabao Cup)
- `5` = Europa League
- `6` = Europa Conference League
- `7` = Scottish Premiership
- `8` = Championship

**Examples**:
```bash
# Sync only Premier League
REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=1

# Sync PL, UCL, and FA Cup
REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=1,2,3

# Sync all 8 competitions
REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=1,2,3,4,5,6,7,8

# Empty = sync all enabled competitions
REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=
```

### Feature Toggles

```bash
REACT_APP_FF_SPORTMONKS_TV_STATIONS=false      # TV broadcast data
REACT_APP_FF_SPORTMONKS_LIVE_SCORES=false      # Live match scores
REACT_APP_FF_SPORTMONKS_LINEUPS=false          # Team lineups
REACT_APP_FF_SPORTMONKS_MATCH_STATS=false      # Match statistics
REACT_APP_FF_SPORTMONKS_H2H_DATA=false         # Enhanced H2H data
```

## Helper Functions

### TypeScript API

```typescript
import {
  isSportMonksSyncEnabled,
  getSportMonksEnabledCompetitions,
  isCompetitionEnabledForSync,
  isSportMonksTVEnabled,
  isSportMonksLiveScoresEnabled,
  getCurrentAPISource,
  isTestMode
} from '../config/featureFlags';

// Check if Sports Monks sync is enabled
if (isSportMonksSyncEnabled()) {
  // Run sync logic
}

// Get list of enabled competition IDs
const competitionIds = getSportMonksEnabledCompetitions();
// Returns: [1, 2, 3] or [] if all enabled

// Check specific competition
if (isCompetitionEnabledForSync(1)) {
  // Sync Premier League
}

// Check feature flags
if (isSportMonksTVEnabled()) {
  // Show TV station data
}

// Get current API source
const source = getCurrentAPISource();
// Returns: 'sportmonks' | 'soccersapi' | 'football-data'

// Check if in test mode
if (isTestMode()) {
  console.log('Test mode: no database writes');
}
```

## Hierarchical Control

**Key Feature**: The master switch (`USE_SPORTMONKS`) controls all dependent features.

### Example: Master Switch OFF

```bash
REACT_APP_FF_USE_SPORTMONKS=false
REACT_APP_FF_SPORTMONKS_TV_STATIONS=true       # ⚠️ Will be FALSE
REACT_APP_FF_SPORTMONKS_LIVE_SCORES=true       # ⚠️ Will be FALSE
REACT_APP_FF_SPORTMONKS_ENABLE_SYNC=true       # ⚠️ Will be FALSE
```

**Result**: All Sports Monks features disabled, regardless of individual flag settings.

### Example: Master Switch ON

```bash
REACT_APP_FF_USE_SPORTMONKS=true
REACT_APP_FF_SPORTMONKS_TV_STATIONS=true       # ✅ Will be TRUE
REACT_APP_FF_SPORTMONKS_LIVE_SCORES=false      # ❌ Will be FALSE
```

**Result**: Only explicitly enabled features are active.

## Recommended Rollout Schedule

### Week 1: Test Mode (Premier League Pilot)

**Goal**: Validate sync logic without modifying database

```bash
REACT_APP_FF_USE_SPORTMONKS=true
REACT_APP_FF_SPORTMONKS_TEST_MODE=true
REACT_APP_FF_SPORTMONKS_ENABLE_SYNC=true
REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=1    # Premier League only
```

**Actions**:
1. Monitor logs for API calls
2. Verify TV station mapping accuracy
3. Check sync logic correctness
4. Review error handling

### Week 2: Premier League Live (TV Stations)

**Goal**: Enable TV broadcast data for Premier League

```bash
REACT_APP_FF_SPORTMONKS_TEST_MODE=false        # Write to database
REACT_APP_FF_SPORTMONKS_TV_STATIONS=true       # Show TV data
```

**Actions**:
1. Verify TV broadcasts display correctly
2. Monitor manual entry reduction (should drop from 2-3 hrs/week)
3. Track any missing or incorrect broadcasts

### Week 3: Expand Coverage (All 8 Competitions)

**Goal**: Enable sync for all supported competitions

```bash
REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=1,2,3,4,5,6,7,8
```

**Actions**:
1. Monitor API rate limits (3000/hour)
2. Verify data quality across all competitions
3. Check for any competition-specific issues

### Week 4: Full Feature Set

**Goal**: Enable all Sports Monks features

```bash
REACT_APP_FF_SPORTMONKS_LIVE_SCORES=true
REACT_APP_FF_SPORTMONKS_LINEUPS=true
REACT_APP_FF_SPORTMONKS_MATCH_STATS=true
REACT_APP_FF_SPORTMONKS_H2H_DATA=true
```

**Actions**:
1. Deploy live scores ticker
2. Add lineups to match pages
3. Display match statistics
4. Show enhanced H2H data

## Emergency Rollback

**Scenario**: Critical issue discovered with Sports Monks integration

**Action**: Set master switch to `false`

```bash
REACT_APP_FF_USE_SPORTMONKS=false
```

**Result**:
- All Sports Monks features instantly disabled
- Fallback to Football-Data.org API
- Manual entry workflow restored
- Zero downtime

**Time to Rollback**: ~30 seconds (deploy time)

## Testing

Run the test suite to verify flag behavior:

```bash
node scripts/test-feature-flags.mjs
```

**Tests**:
- ✅ Master switch hierarchy
- ✅ Competition filtering
- ✅ Array parsing (comma-separated IDs)
- ✅ Test mode flag
- ✅ Rollback scenario
- ✅ Helper function behavior

## Files

| File | Purpose |
|------|---------|
| `src/config/featureFlags.ts` | Feature flag implementation |
| `.env.example` | Flag documentation and examples |
| `scripts/test-feature-flags.mjs` | Test suite |

## Implementation Details

### Flag Loading

```typescript
const getEnvFlag = (name: string, defaultValue: boolean = false): boolean => {
  const envVar = process.env[`REACT_APP_FF_${name}`];
  return envVar ? envVar.toLowerCase() === 'true' : defaultValue;
};

const getEnvArray = (name: string, defaultValue: number[] = []): number[] => {
  const envVar = process.env[`REACT_APP_FF_${name}`];
  if (!envVar) return defaultValue;
  return envVar.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
};
```

### Hierarchical Logic

```typescript
const useSportMonks = getEnvFlag('USE_SPORTMONKS', false);

sportMonksFeatures: {
  enableSync: useSportMonks && getEnvFlag('SPORTMONKS_ENABLE_SYNC', false),
  syncCompetitions: useSportMonks ? getEnvArray('SPORTMONKS_SYNC_COMPETITIONS', []) : [],
  showTVStations: useSportMonks && getEnvFlag('SPORTMONKS_TV_STATIONS', false),
  // ...
}
```

**Key**: All Sports Monks features check `useSportMonks` first, ensuring master switch control.

## Next Steps

1. ✅ Feature flag system complete
2. ⏳ Build sync pipeline scripts
3. ⏳ Create admin panel for flag controls
4. ⏳ Start Week 1 rollout (test mode)

---

**Questions?** See:
- `docs/SPORTMONKS_API_FINDINGS.md` - API research
- `docs/AVAILABLE_COMPETITIONS.md` - League coverage
- `.env.example` - Configuration examples
