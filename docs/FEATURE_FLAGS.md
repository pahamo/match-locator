# Feature Flags System

## Overview

The Match Locator application uses feature flags to control the visibility of components that require complete or reliable data. This prevents users from seeing incorrect information like `0` values, null data, or broken functionality while we work on data quality improvements.

## Configuration

Feature flags are configured in `src/config/featureFlags.ts`:

```typescript
export const FEATURE_FLAGS: FeatureFlags = {
  // Head-to-Head page features
  showH2HStats: false,        // Win/loss/draw statistics
  showH2HPastResults: false,  // Historical match results
  showMatchScores: false,     // Individual match scores
  showGoalStats: false        // Goal statistics and totals
};
```

## Current Status (as of September 2025)

All H2H-related features are **disabled** because:

- **H2H Statistics**: Database shows 0-0-0 records for all team matchups
- **Past Results**: Match scores are null/incomplete in historical data
- **Goal Statistics**: Goal totals showing 0 for all teams
- **Match Scores**: Score data not properly synced from data sources

## User Experience

When features are disabled, users see:

### H2H Statistics (disabled)
```
📊
Head-to-Head Stats Coming Soon
We're working on bringing you detailed historical statistics between these teams.
```

### Goal Statistics (disabled)
Hidden entirely - no confusing 0-0 displays

### Past Results (disabled)
Hidden entirely - no empty or null score displays

## Enabling Features

When data quality improves, enable features by changing flags to `true`:

### 1. Enable H2H Statistics
```typescript
showH2HStats: true  // When win/loss/draw data is accurate
```

### 2. Enable Goal Statistics
```typescript
showGoalStats: true  // When goal totals are populated correctly
```

### 3. Enable Past Results
```typescript
showH2HPastResults: true  // When historical match scores are complete
```

### 4. Enable Match Scores
```typescript
showMatchScores: true  // When individual match score data is reliable
```

## Implementation Details

### FeatureFlag Component

Features are controlled using the `FeatureFlag` wrapper component:

```tsx
import { FeatureFlag } from '../config/featureFlags';

<FeatureFlag
  feature="showH2HStats"
  fallback={<ComingSoonMessage />}
>
  <H2HStatistics data={stats} />
</FeatureFlag>
```

### Files Using Feature Flags

- `src/components/H2HStatsCard.tsx` - Main statistics and past results
- `src/components/NextFixtureHero.tsx` - Individual match scores
- Any component displaying historical data

## Data Requirements

Before enabling each feature, ensure:

### H2H Statistics (`showH2HStats`)
- [ ] Win/loss/draw counts are accurate for team matchups
- [ ] Database contains sufficient historical fixture data
- [ ] Statistics calculation logic is tested and verified

### Goal Statistics (`showGoalStats`)
- [ ] Goal totals are populated from match results
- [ ] Historical goal data is complete and accurate
- [ ] Goal calculation includes all relevant competitions

### Past Results (`showH2HPastResults`)
- [ ] Historical match scores are complete (not null)
- [ ] Score data format is consistent
- [ ] Results include proper match context (date, competition)

### Match Scores (`showMatchScores`)
- [ ] Individual match score data is reliable
- [ ] Live score updates work correctly
- [ ] Score display handles all match states (upcoming, live, finished)

## Testing Feature Flags

### Local Development
1. Change flag value in `src/config/featureFlags.ts`
2. Restart development server
3. Test component behavior with flag enabled/disabled

### Production Deployment
1. Update feature flags in source code
2. Commit and deploy changes
3. Verify user experience in production

## Monitoring

When enabling features, monitor for:

- User reports of incorrect data
- Analytics showing confusion or high bounce rates
- Support tickets about "wrong scores" or "missing data"

If issues arise, immediately disable the feature flag and investigate data quality.

## Future Improvements

Consider implementing:

- **Environment-based flags**: Different settings for dev/staging/prod
- **Remote configuration**: Update flags without deployment
- **A/B testing**: Gradual rollout of features to user segments
- **Admin dashboard**: UI for managing feature flags

## Related Files

- `src/config/featureFlags.ts` - Feature flag configuration
- `src/components/H2HStatsCard.tsx` - Main H2H statistics display
- `src/components/NextFixtureHero.tsx` - Individual match information
- `src/services/supabase.ts` - Database queries for H2H data
- `src/utils/headToHead.ts` - H2H calculation utilities

---

*Last updated: September 17, 2025*
*Next review: When H2H data quality improves*