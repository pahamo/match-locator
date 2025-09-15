# Dynamic Data Architecture

## Problem Solved

Previously, when new data (like competitions, teams, or broadcasters) was added to the database, it required manual updates in multiple places across the codebase:

- Header navigation had hardcoded competition lists
- Admin filters had hardcoded competition options
- Filter dropdowns required manual addition of new options
- Components used static configuration instead of database data

## Solution: Automatic Dynamic Loading

The new architecture automatically picks up new data from the database without requiring code changes.

## Key Components

### 1. Dynamic Hooks (`src/hooks/`)

#### `useCompetitions.ts`
- **Purpose**: Load competitions dynamically from database
- **Variants**:
  - `usePublicCompetitions()` - Only production-visible competitions
  - `useAdminCompetitions()` - All competitions including hidden ones
- **Usage**: Any component needing competition data

#### `useDynamicData.ts`
- **Purpose**: Generic hook for any dynamic data loading
- **Benefits**: Consistent error handling, loading states, refetch capabilities
- **Pattern**: Can be used for teams, broadcasters, or any database entities

### 2. Updated Components

#### Header (`src/components/Header.tsx`)
- **Before**: Hardcoded list of 6 competitions
- **After**: Dynamically loads all production-visible competitions
- **Result**: New competitions automatically appear in navigation

#### Admin Matches Page (`src/pages/admin/AdminMatchesPage.tsx`)
- **Before**: Hardcoded competition filter with specific IDs/slugs
- **After**: Dynamic dropdown populated from database
- **Result**: New competitions automatically appear in filter options

## Implementation Pattern

### Old Pattern (Manual)
```typescript
// ❌ Required manual updates for each new competition
const competitions = [
  'premier-league', 'champions-league', 'bundesliga',
  'la-liga', 'serie-a', 'ligue-1'
  // Would need to manually add: 'primeira-liga', 'eredivisie', etc.
];
```

### New Pattern (Dynamic)
```typescript
// ✅ Automatically includes all competitions from database
const { competitions } = usePublicCompetitions();

// ✅ Generic pattern for any data type
const { data: teams } = useDynamicData({
  loader: () => getTeamsByCompetition(competitionId),
  dependencies: [competitionId],
  errorContext: 'loading teams'
});
```

## Benefits

### 1. Zero Manual Updates Required
When adding new competitions, teams, or broadcasters:
- Import data via scripts
- Mark as `isProductionVisible: true`
- **Automatically appears everywhere** without code changes

### 2. Consistent Error Handling
All dynamic data loading uses the same error handling patterns:
- Loading states
- Error messages
- Retry capabilities

### 3. Performance Optimized
- Data is cached once loaded
- Components share the same data instances
- Automatic refetching when dependencies change

### 4. Type Safety
- Full TypeScript support
- Proper error handling
- Consistent return types

## Usage Examples

### Load Competitions in Any Component
```typescript
import { usePublicCompetitions } from '../hooks/useCompetitions';

function MyComponent() {
  const { competitions, loading, error } = usePublicCompetitions();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <select>
      {competitions.map(comp => (
        <option key={comp.id} value={comp.id}>
          {comp.name}
        </option>
      ))}
    </select>
  );
}
```

### Load Any Data Dynamically
```typescript
import { useDynamicData } from '../hooks/useDynamicData';

function TeamsComponent({ competitionId }: { competitionId: number }) {
  const { data: teams, loading } = useDynamicData({
    loader: () => getTeamsByCompetition(competitionId),
    dependencies: [competitionId],
    errorContext: 'loading teams'
  });

  return (
    <div>
      {teams?.map(team => <div key={team.id}>{team.name}</div>)}
    </div>
  );
}
```

## Migration Guide

### For New Components
1. Import the appropriate hook: `usePublicCompetitions`, `useAdminCompetitions`, or `useDynamicData`
2. Use the returned data directly
3. Handle loading and error states

### For Existing Components
1. Replace hardcoded arrays with dynamic hooks
2. Update filter logic to use IDs instead of hardcoded strings
3. Remove manual data loading code

## Future Extensions

This pattern can be extended to:
- **Broadcasters**: Dynamic broadcaster lists
- **Teams**: Dynamic team filtering
- **Venues**: Dynamic venue options
- **Seasons**: Dynamic season selection
- **Any database entity**: Following the same pattern

## Result

**Adding new competitions, teams, or any database entities now requires zero manual code updates.** The system automatically picks up new data and makes it available across all components that need it.