# Technical Architecture

> Comprehensive guide to the Football TV Schedule technical architecture, patterns, and conventions

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Project Structure](#project-structure)
3. [Feature Flag System](#feature-flag-system)
4. [Type System & Data Models](#type-system--data-models)
5. [React Patterns & Best Practices](#react-patterns--best-practices)
6. [Dynamic Data Architecture](#dynamic-data-architecture)
7. [Component Architecture](#component-architecture)
8. [Troubleshooting & Common Issues](#troubleshooting--common-issues)
9. [Code Quality & Refactoring](#code-quality--refactoring)

---

## System Overview

### Technology Stack

**Frontend Architecture**
- **React 18** with functional components and hooks
- **TypeScript 5.3** for type safety and developer experience
- **CSS3** with CSS Grid and Flexbox for responsive layouts
- **React Router** for client-side routing
- **Create React App** build toolchain

**Backend & Data Layer**
- **Supabase** for real-time database and authentication
- **PostgreSQL** with custom views and functions
- **Row Level Security (RLS)** for admin access control
- **Real-time subscriptions** for live data updates

**Development & Deployment**
- **npm** package management
- **ESLint + Prettier** for code quality
- **TypeScript strict mode** for maximum type safety
- **Netlify** for hosting and deployment

### Application Flow

```
User Request → React Router → Page Component → Service Layer → Supabase → Database
     ↓              ↓              ↓              ↓              ↓
   Browser ← Component Tree ← React State ← API Response ← PostgreSQL
```

---

## Project Structure

### Organized Folder Architecture

```
src/
├── components/          # Reusable React components
│   ├── admin/          # Admin-specific components
│   ├── affiliate/      # Affiliate marketing components
│   ├── design-system/  # Core design system components
│   ├── Header.tsx      # Main navigation
│   ├── SkeletonLoader.tsx # Loading states
│   └── ...
├── pages/              # Route-based page components
│   ├── admin/          # Admin interface pages
│   │   ├── AdminFixturesPage.tsx
│   │   ├── AdminCompetitionsPage.tsx
│   │   └── ...
│   ├── competitions/   # Competition-specific pages
│   ├── legal/          # Legal and compliance pages
│   ├── HomePage.tsx    # Main landing page
│   └── ...
├── services/           # Data layer and API services
│   ├── supabase.ts     # Main Supabase client
│   ├── supabase-simple.ts # Simplified queries for homepage
│   └── ...
├── utils/              # Utility functions
│   ├── seo.ts          # SEO meta generation
│   ├── dateFormat.ts   # Date formatting utilities
│   ├── teamNames.ts    # Team name processing
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useCompetitions.ts # Dynamic competition loading
│   ├── useDynamicData.ts  # Generic data loading
│   └── ...
├── types/              # TypeScript type definitions
│   ├── index.ts        # Core types
│   └── supabase.ts     # Database types
└── App.tsx            # Root application component
```

### Key Architectural Principles

1. **Separation of Concerns**: Clear boundaries between UI, business logic, and data
2. **Component Reusability**: Shared components in design system
3. **Type Safety**: Comprehensive TypeScript coverage
4. **Performance**: Optimized queries and lazy loading
5. **Maintainability**: Consistent patterns and conventions

---

## Feature Flag System

### Overview

The application uses a centralized feature flag system to control the visibility of components that require complete or reliable data. This prevents users from seeing incorrect information while data quality is being improved.

### Architecture

**Configuration File: `src/config/featureFlags.ts`**
```typescript
export interface FeatureFlags {
  showH2HStats: boolean;
  showH2HPastResults: boolean;
  showMatchScores: boolean;
  showGoalStats: boolean;
}

export const FEATURE_FLAGS: FeatureFlags = {
  showH2HStats: false,        // Hide win/loss/draw stats
  showH2HPastResults: false,  // Hide historical results
  showMatchScores: false,     // Hide individual scores
  showGoalStats: false        // Hide goal statistics
};
```

### Usage Pattern

**FeatureFlag Component Wrapper**
```typescript
import { FeatureFlag } from '../config/featureFlags';

<FeatureFlag
  feature="showH2HStats"
  fallback={<ComingSoonMessage />}
>
  <H2HStatistics data={stats} />
</FeatureFlag>
```

### Implementation Benefits

1. **Clean UX**: Users see "Coming Soon" instead of confusing `0` values
2. **Easy Rollout**: Enable features when data becomes reliable
3. **No Code Changes**: Toggle visibility without refactoring components
4. **Documentation**: Clear tracking of incomplete features

### When to Use Feature Flags

- **Incomplete Data**: Database contains null, 0, or incorrect values
- **Work in Progress**: Features under development
- **A/B Testing**: Gradual rollout to user segments
- **Emergency Rollback**: Quick disable of problematic features

**📖 See [FEATURE_FLAGS.md](FEATURE_FLAGS.md) for complete implementation details**

---

## Type System & Data Models

### Core Data Types

#### Team Interface
```typescript
interface Team {
  id: number;
  name: string;
  slug: string;
  crest: string | null;
  competition_id?: number;
}
```

**Usage Notes:**
- Use `name` for display, `slug` for routing
- `crest` can be null, handle with fallback
- `competition_id` available in some queries

#### Fixture Types (Critical Distinction)

**SimpleFixture (HomePage/Performance)**
```typescript
interface SimpleFixture {
  id: number;
  kickoff_utc: string;          // ⚠️ Use kickoff_utc (NOT utc_kickoff)
  home_team: string;            // Pre-joined team name
  away_team: string;            // Pre-joined team name
  home_crest?: string;          // Optional crest URL
  away_crest?: string;          // Optional crest URL
  competition_id: number;
  matchweek?: number;
  broadcaster?: string;
}
```

**Fixture (Admin/Full Data)**
```typescript
interface Fixture {
  id: number;
  kickoff_utc: string;          // Same property name
  home: Team;                   // Full team object
  away: Team;                   // Full team object
  competition_id: number;
  matchweek?: number;
  home_score?: number;
  away_score?: number;
  broadcaster_id?: number;
  status: 'upcoming' | 'live' | 'finished';
}
```

**Competition Interface**
```typescript
interface Competition {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  is_visible: boolean;
  priority: number;
  current_season_start: string;
  current_season_end: string;
}
```

### 🚨 Critical Property Guidelines

#### Most Common TypeScript Mistakes

**✅ CORRECT Property Names:**
```typescript
// Time - ALWAYS use kickoff_utc
fixture.kickoff_utc     // Both SimpleFixture and Fixture

// Team Names (Context-dependent)
// HomePage (SimpleFixture)
fixture.home_team       // string
fixture.away_team       // string

// Admin/FixturesPage (Fixture)
fixture.home.name       // Team object
fixture.away.name       // Team object

// Team Crests
// HomePage (SimpleFixture)
fixture.home_crest      // string | undefined
fixture.away_crest      // string | undefined

// Admin/FixturesPage (Fixture)
fixture.home.crest      // string | null
fixture.away.crest      // string | null
```

**❌ COMMON MISTAKES:**
```typescript
fixture.utc_kickoff     // ❌ Wrong property name
fixture.home_team.name  // ❌ Wrong for Fixture type
fixture.home            // ❌ Wrong for SimpleFixture type
```

### Type Safety Best Practices

1. **Always run TypeScript checks**: `npm run type-check`
2. **Use strict mode**: Enabled in `tsconfig.json`
3. **Prefer interfaces over types**: For object shapes
4. **Export types from single location**: `src/types/index.ts`
5. **Document property differences**: Use comments for context

---

## React Patterns & Best Practices

### ✅ Correct Patterns

#### Derived State with useMemo
```typescript
const [teams, setTeams] = useState<Team[]>([]);
const stats = useMemo(() => calculateStats(teams), [teams]); // ✅ Recalculates when teams change

useEffect(() => {
  loadTeams().then(setTeams);
}, []);
```

#### Async Data Loading
```typescript
const [fixtures, setFixtures] = useState<SimpleFixture[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  let isCancelled = false;

  (async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSimpleFixtures();
      if (!isCancelled) {
        setFixtures(data);
      }
    } catch (err) {
      if (!isCancelled) {
        setError('Failed to load fixtures');
      }
    } finally {
      if (!isCancelled) {
        setLoading(false);
      }
    }
  })();

  return () => { isCancelled = true; };
}, []);
```

#### Component Composition
```typescript
// Good: Reusable components with clear props
interface FixtureCardProps {
  fixture: SimpleFixture;
  variant?: 'compact' | 'detailed';
  showViewButton?: boolean;
  groupPosition?: 'single' | 'first' | 'middle' | 'last';
}

const FixtureCard: React.FC<FixtureCardProps> = ({
  fixture,
  variant = 'detailed',
  showViewButton = false,
  groupPosition = 'single'
}) => {
  // Component implementation
};
```

### ❌ Anti-Patterns to Avoid

#### Derived State Without Dependencies
```typescript
// ❌ NEVER do this:
const [teams, setTeams] = useState([]);
const stats = calculateStats(teams); // ❌ Calculated once at mount, never updates

useEffect(() => {
  loadTeams().then(setTeams); // teams update, but stats don't!
}, []);
```

#### Missing Cleanup in Effects
```typescript
// ❌ Memory leak risk:
useEffect(() => {
  const timer = setInterval(updateData, 1000);
  // Missing cleanup!
}, []);

// ✅ Proper cleanup:
useEffect(() => {
  const timer = setInterval(updateData, 1000);
  return () => clearInterval(timer);
}, []);
```

### Code Review Checklist

- [ ] All derived state uses `useMemo()` with proper dependencies
- [ ] No calculations happen outside hooks when using async data
- [ ] All `useEffect` have proper dependency arrays
- [ ] Stats/counts update when underlying data changes
- [ ] Async effects have cleanup and cancellation
- [ ] Components have proper TypeScript props interfaces

---

## Dynamic Data Architecture

### Problem Solved

**Before:** Manual code updates required when adding new data:
- Header navigation had hardcoded competition lists
- Admin filters had hardcoded competition options
- Components used static configuration

**After:** Automatic database-driven loading without code changes.

### Key Components

#### Dynamic Hooks (`src/hooks/`)

**useCompetitions.ts**
```typescript
// Public competitions (production-visible only)
const { competitions, loading, error } = usePublicCompetitions();

// Admin competitions (all including hidden)
const { competitions, loading, error } = useAdminCompetitions();
```

**useDynamicData.ts**
```typescript
// Generic hook for any dynamic data loading
const { data, loading, error, refetch } = useDynamicData(
  'competitions',
  getCompetitions
);
```

#### Updated Components

**Header Navigation**
- **Before**: Hardcoded list of 6 competitions
- **After**: Dynamically loads all production-visible competitions
- **Result**: New competitions automatically appear in navigation

**Admin Filters**
- **Before**: Static competition dropdown options
- **After**: Database-driven filter options
- **Result**: Admin filters update automatically

### Implementation Pattern

```typescript
// 1. Create dynamic hook
export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompetitions().then(setCompetitions);
  }, []);

  return { competitions, loading };
}

// 2. Use in components
const Header: React.FC = () => {
  const { competitions, loading } = usePublicCompetitions();

  if (loading) return <HeaderSkeleton />;

  return (
    <nav>
      {competitions.map(comp => (
        <Link key={comp.slug} to={`/competitions/${comp.slug}`}>
          {comp.name}
        </Link>
      ))}
    </nav>
  );
};
```

---

## Component Architecture

### Design System Components (`src/components/design-system/`)

#### Core Components
- **FixtureCard**: Flexible match display with variants
- **ContentCard**: Standardized content containers
- **TextContainer**: Typography and spacing consistency
- **Button**: Consistent button styling and interactions

#### Admin Components (`src/components/admin/`)
- **AdminLayout**: Common admin page structure
- **FilterControls**: Reusable filter interfaces
- **BulkActions**: Batch operation controls

#### Affiliate Components (`src/components/affiliate/`)
- **AffiliateLink**: FTC-compliant affiliate links
- **AffiliateDisclosure**: Legal compliance components

### Page Architecture Patterns

#### Standard Page Structure
```typescript
const PageComponent: React.FC = () => {
  // 1. State management
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Data loading
  useEffect(() => {
    // Async data loading with cleanup
  }, []);

  // 3. SEO metadata
  useEffect(() => {
    const meta = generatePageMeta();
    updateDocumentMeta(meta);
  }, [data]);

  // 4. Loading states
  if (loading) return <PageSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  if (!data) return <EmptyState />;

  // 5. Main content
  return (
    <div className="page">
      <Header />
      <main>
        <div className="wrap">
          {/* Page content */}
        </div>
      </main>
    </div>
  );
};
```

### Service Layer Architecture (`src/services/`)

#### Supabase Service Pattern
```typescript
// Primary service (supabase.ts)
export async function getFixtures(): Promise<Fixture[]> {
  const { data, error } = await supabase
    .from('fixtures_with_teams')  // Use views for complex joins
    .select('*')
    .order('kickoff_utc', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Optimized service (supabase-simple.ts)
export async function getSimpleFixtures(): Promise<SimpleFixture[]> {
  // Simplified queries for performance-critical pages
  const { data, error } = await supabase
    .from('simple_fixtures_view')
    .select('*')
    .limit(50);

  if (error) throw error;
  return data || [];
}
```

---

## Troubleshooting & Common Issues

### TypeScript Issues

**Property Access Errors**
```bash
# Quick property checks
grep -r "kickoff_utc" src/        # Find correct usage
grep -r "utc_kickoff" src/        # Find incorrect usage (should be none)
grep -r "home_team\|away_team" src/ # Check team property usage
```

**Type Verification**
```bash
npm run type-check               # Full TypeScript check
npm run build                    # Build with type checking
```

### Performance Issues

**Slow Fixture Loading**
1. Check if using correct service (`supabase-simple.ts` for homepage)
2. Verify database indexes on frequently queried columns
3. Use `LIMIT` clauses for pagination

**React Rendering Issues**
1. Check for missing `useMemo` on expensive calculations
2. Verify proper dependency arrays in `useEffect`
3. Use React DevTools Profiler to identify bottlenecks

### Data Issues

**Missing Fixtures**
1. Check environment variables (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`)
2. Verify Supabase RLS policies
3. Check database views exist and have correct permissions

**Timezone Problems**
1. Ensure all dates stored as UTC in database
2. Use `formatDynamicDate()` utility for user timezone conversion
3. Check `kickoff_utc` vs `utc_kickoff` property names

### Debug Techniques

**React State Debugging**
```typescript
// Add temporary debugging
useEffect(() => {
  console.log('Teams updated:', teams);
  console.log('Stats recalculated:', stats);
}, [teams, stats]);
```

**Network Debugging**
```typescript
// Log API calls
const fixtures = await getSimpleFixtures();
console.log('API Response:', fixtures.length, 'fixtures loaded');
```

---

## Code Quality & Refactoring

### Current Technical Debt

#### Priority Issues (from CODEBASE_ANALYSIS.md)

1. **Dual Type Systems**: `SimpleFixture` vs `Fixture` confusion
   - **Impact**: High - Development friction, potential runtime errors
   - **Solution**: Standardize on single fixture type with optional properties

2. **Inline Styling Duplication**: Same styles repeated across components
   - **Impact**: High - Maintenance nightmare, bundle size
   - **Solution**: Extract to design system components

3. **Missing Design System**: Colors, spacing, typography hardcoded
   - **Impact**: Medium - Inconsistent UI, difficult to rebrand
   - **Solution**: Create CSS custom properties and design tokens

### Refactoring Guidelines

#### Component Extraction
```typescript
// Before: Inline styles and logic
const HomePage = () => (
  <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
    {fixtures.map(fixture => (
      <div key={fixture.id} style={{ /* 50 lines of inline styles */ }}>
        {/* Complex fixture display logic */}
      </div>
    ))}
  </div>
);

// After: Extracted components
const HomePage = () => (
  <ContentCard>
    {fixtures.map(fixture => (
      <FixtureCard key={fixture.id} fixture={fixture} variant="compact" />
    ))}
  </ContentCard>
);
```

#### Design System Implementation
```css
/* CSS Custom Properties */
:root {
  --color-primary: #6366f1;
  --color-border: #e2e8f0;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --border-radius: 8px;
}

/* Component Classes */
.content-card {
  padding: var(--spacing-md);
  background: var(--color-background);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
}
```

### Code Review Standards

#### TypeScript
- [ ] All components have proper TypeScript interfaces
- [ ] No `any` types used (except for specific third-party integrations)
- [ ] Proper null checking and optional chaining

#### React
- [ ] Functional components with hooks
- [ ] Proper dependency arrays in useEffect
- [ ] useMemo for expensive calculations
- [ ] Cleanup functions for side effects

#### Performance
- [ ] Lazy loading for route components
- [ ] Optimized Supabase queries
- [ ] Proper image optimization
- [ ] CSS-in-JS avoided for performance-critical components

#### Accessibility
- [ ] Proper semantic HTML
- [ ] ARIA labels where needed
- [ ] Keyboard navigation support
- [ ] Color contrast compliance

---

## Quick Reference Commands

### Development
```bash
npm start                        # Start development server
npm run build                    # Production build
npm run type-check              # TypeScript verification
npm run lint                    # ESLint checking
```

### Debugging
```bash
# Find type definitions
grep -r "interface.*Fixture" src/types/
grep -r "kickoff" src/types/

# Check property usage
grep -r "kickoff_utc" src/
grep -r "home_team\|away_team" src/

# Find component usage
grep -r "FixtureCard" src/
grep -r "useEffect" src/
```

### Database
```bash
# Test Supabase connection
node -e "console.log(process.env.REACT_APP_SUPABASE_URL)"

# Check environment variables
env | grep REACT_APP
env | grep SUPABASE
```

---

**Last Updated:** September 17, 2025
**Related Documentation:** [DEPLOYMENT.md](DEPLOYMENT.md), [DATA_MANAGEMENT.md](DATA_MANAGEMENT.md)