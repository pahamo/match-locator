# Frontend Matchweek Updates

## Files Requiring Updates

All instances of `fixture.matchweek` or `fixture.matchday` need to be replaced with `getMatchweek(fixture)` helper function.

### 1. src/components/MatchdaySection.tsx
**Lines**: 60, 67, 68, 114, 132
**Changes**:
- Import: `import { getMatchweek } from '../utils/fixtures';`
- Replace: `fixture.matchweek` → `getMatchweek(fixture)`
- Replace: `f.matchweek` → `getMatchweek(f)`

### 2. src/pages/FixturesPage.tsx
**Lines**: 87, 151
**Changes**:
- Import: `import { getMatchweek } from '../utils/fixtures';`
- Line 87: `filtered = filtered.filter(f => getMatchweek(f) === week);`
- Line 151: `const mw = getMatchweek(f); if (mw) weeks.add(mw);`

### 3. src/pages/admin/AdminMatchesPage.tsx
**Line**: 263
**Changes**:
- Import: `import { getMatchweek } from '../../utils/fixtures';`
- Line 263: `{getMatchweek(fixture) || '-'}`

### 4. src/pages/MatchPage.tsx
**Lines**: 227, 229
**Changes**:
- Import: `import { getMatchweek } from '../utils/fixtures';`
- Line 227: `{getMatchweek(fixture) !== null && (`
- Line 229: `Matchweek {getMatchweek(fixture)}`

### 5. src/design-system/components/FixtureCard.tsx
**Lines**: 91, 115, 227, 229
**Changes**:
- Import: `import { getMatchweek } from '../../utils/fixtures';`
- Line 91, 115: `matchweek: getMatchweek(fixture),`
- Line 227: `{showMatchweek && getMatchweek(fixture) !== null && (`
- Line 229: `{getMatchweek(fixture)}`

### 6. src/design-system/components/FixtureCard 2.tsx
**Lines**: 55, 75, 150, 152
**Changes**: Same as FixtureCard.tsx (duplicate file)

### 7. src/services/supabase-simple.ts
**Line**: 93
**Changes**:
- Import: `import { getMatchweek } from '../utils/fixtures';`
- Line 93: Calculate from round jsonb:
```typescript
matchweek: fixture.round?.name ? parseInt(fixture.round.name, 10) : undefined,
```

## Testing Checklist

After updates:
- [ ] MatchdaySection groups fixtures correctly by matchweek
- [ ] FixturesPage filter by matchweek works
- [ ] Admin page displays matchweek correctly
- [ ] MatchPage shows "Matchweek X" label
- [ ] FixtureCard displays matchweek pill when configured
- [ ] No TypeScript errors
- [ ] No console errors in browser
