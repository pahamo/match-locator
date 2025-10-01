# Technical Architecture

> Comprehensive guide to the Football TV Schedule technical architecture, patterns, and conventions

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Project Structure](#project-structure)
3. [H2H Architecture & SEO Strategy](#h2h-architecture--seo-strategy)
4. [Feature Flag System](#feature-flag-system)
5. [Type System & Data Models](#type-system--data-models)
6. [React Patterns & Best Practices](#react-patterns--best-practices)
7. [Dynamic Data Architecture](#dynamic-data-architecture)
8. [Component Architecture](#component-architecture)
9. [Troubleshooting & Common Issues](#troubleshooting--common-issues)
10. [Code Quality & Refactoring](#code-quality--refactoring)

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

## H2H Architecture & SEO Strategy

### Overview

The H2H (Head-to-Head) Architecture is a **major architectural shift** implemented to solve critical SEO issues. It replaces 3,400+ thin individual match pages with ~400 content-rich H2H pages, dramatically improving Google indexing and user experience.

### Problem Solved

**Before H2H Architecture:**
- ❌ **3,400+ individual match pages** like `/matches/123-arsenal-vs-liverpool-2025-01-15`
- ❌ **Google refused to index** most pages (523+ low-value pages)
- ❌ **Zero SEO authority accumulation** (pages expired after match date)
- ❌ **Poor user experience** with thin, temporary content

**After H2H Architecture:**
- ✅ **190 comprehensive H2H pages** like `/h2h/arsenal-vs-liverpool`
- ✅ **Google-friendly consolidated content** with accumulated authority
- ✅ **Rich user experience** with historical stats, future fixtures, and context
- ✅ **Evergreen content** that improves over time

### Technical Implementation

#### URL Structure (Updated October 2025)
```
# H2H Pages - Fixture ID Approach (CURRENT - Most Stable)
/h2h/12345                         # Fixture ID → redirects to SEO-friendly URL
  ↓ (client-side redirect)
/h2h/arsenal-vs-liverpool          # Final SEO-friendly URL

# H2H Pages - Direct Team Slugs (Legacy, Still Supported)
/h2h/arsenal-vs-liverpool          # Direct access works
/h2h/manchester-city-vs-tottenham-hotspur

# Legacy Match Pages (REDIRECTED)
/matches/123-arsenal-vs-liverpool-2025-01-15  → /h2h/arsenal-vs-liverpool
/match/456-chelsea-vs-tottenham    → /h2h/chelsea-vs-tottenham-hotspur
```

**Architecture Evolution:**
1. **Phase 1 (Sept 2025)**: Slug-based H2H routing (`/h2h/team1-vs-team2`)
2. **Phase 2 (Oct 2025)**: Fixture ID routing with SEO redirect (`/h2h/[id]` → `/h2h/team1-vs-team2`)

**Why Fixture IDs?**
- ✅ **Stability**: Fixture IDs never change, team slugs can be updated
- ✅ **Simplicity**: Single database query to get teams, no slug matching logic
- ✅ **Reliability**: Eliminates daily breakage from slug mismatches
- ✅ **SEO Preserved**: Client-side redirect ensures clean URLs in browser
- ✅ **Backward Compatible**: Legacy slug URLs still work

#### Core Components

**H2H Page Structure:**
```
/src/pages/HeadToHeadPage.tsx     # Main H2H page component
/src/components/H2HStatsCard.tsx  # Historical statistics display
/src/components/NextFixtureHero.tsx # Next match highlight
/src/utils/headToHead.ts          # H2H utilities and calculations
```

**Route Generation:**
```
/src/utils/generateH2HRoutes.ts   # All 190 Premier League H2H combinations
/src/utils/generateSitemap.ts     # SEO-optimized sitemap generation
```

**Team Slug Mapping:**
```
/src/utils/teamSlugs.ts           # SEO-friendly team slug management
```

#### Fixture ID Routing Architecture (October 2025)

**Problem Solved:**
- H2H pages were breaking daily due to slug mismatches
- Database: `west-ham-united` vs URL: `west-ham` → "No fixtures found"
- 304-line TeamResolver with 100+ hardcoded mappings couldn't scale
- Complex slug matching logic caused runtime failures

**Solution: Fixture ID → Team Slug Redirect Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│ USER CLICKS "INFO" BUTTON ON FIXTURE CARD                        │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ FixtureCard.tsx generates URL: /h2h/54321                       │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ SmartFixtureRouter detects numeric ID → loads HeadToHeadPage    │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ HeadToHeadPage.tsx                                               │
│ 1. Detects slug="54321" is numeric                              │
│ 2. Queries: supabase.from('fixtures_with_teams').eq('id', 54321)│
│ 3. Extracts: home_slug='arsenal', away_slug='west-ham-united'  │
│ 4. Generates: /h2h/arsenal-vs-west-ham-united (alphabetical)    │
│ 5. Sets shouldRedirect state                                     │
│ 6. Calls: window.location.replace('/h2h/arsenal-vs-west-ham...')│
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ Browser redirects to SEO-friendly URL                            │
│ HeadToHeadPage loads again with slug="arsenal-vs-west-ham..."  │
│ Parses team slugs → loads all H2H fixtures → renders page       │
└─────────────────────────────────────────────────────────────────┘
```

**Key Implementation Files:**

**1. FixtureCard.tsx** (URL Generation)
```typescript
// src/design-system/components/FixtureCard.tsx
const getFixtureData = (fixture: SimpleFixture | Fixture) => {
  const shouldCreatePage = shouldCreateMatchPage(fixture);

  // Generate H2H URL using fixture ID (new, stable approach)
  const h2hUrl = shouldCreatePage ? `/h2h/${fixture.id}` : null;

  return {
    url: h2hUrl,  // /h2h/54321
    shouldCreatePage: shouldCreatePage
  };
};
```

**2. SmartFixtureRouter.tsx** (Route Detection)
```typescript
// src/components/SmartFixtureRouter.tsx
const isFixtureIdUrl = (slug: string): boolean => {
  return /^\d+$/.test(slug);  // Check if purely numeric
};

// In component:
if (isFixtureIdUrl(slug)) {
  // Numeric ID detected → load HeadToHeadPage
  return (
    <Suspense fallback={<PageLoader />}>
      <HeadToHeadPage />
    </Suspense>
  );
}
```

**3. HeadToHeadPage.tsx** (Fixture ID Loading & Redirect)
```typescript
// src/pages/HeadToHeadPage.tsx
const loadH2HData = useCallback(async () => {
  const isNumericId = /^\d+$/.test(slug);

  if (isNumericId) {
    // NEW APPROACH: Load by fixture ID, then redirect
    const fixtureId = parseInt(slug, 10);

    // Single stable query - always works
    const { data, error } = await supabase
      .from('fixtures_with_teams')
      .select('*')
      .eq('id', fixtureId)
      .single();

    if (error || !data) {
      setError('Fixture not found');
      return;
    }

    // Extract team slugs from fixture data
    const homeSlug = data.home_slug;
    const awaySlug = data.away_slug;

    // Generate canonical H2H URL (alphabetical order for consistency)
    const [first, second] = [homeSlug, awaySlug].sort();
    const canonicalH2HUrl = `/h2h/${first}-vs-${second}`;

    // Redirect to SEO-friendly URL
    setShouldRedirect(canonicalH2HUrl);
    return;
  }

  // Legacy slug-based loading still supported...
}, [slug]);

// Handle redirect
if (shouldRedirect) {
  window.location.replace(shouldRedirect);
  return <RedirectMessage />;
}
```

**Benefits:**
- ✅ **Zero slug matching complexity** - ID lookup is instant and reliable
- ✅ **Database-driven team names** - always current, no hardcoded mappings
- ✅ **Can't break from schema changes** - IDs are permanent
- ✅ **SEO-friendly URLs preserved** - redirect ensures clean browser URLs
- ✅ **Reduced code complexity** - TeamResolver reduced from 304 to 107 lines (65% reduction)

**Performance:**
- Adds ~50-100ms for redirect (one extra HTTP request)
- Acceptable trade-off for reliability and maintainability
- Can optimize with server-side redirects if needed

#### Smart Routing System

The `SmartFixtureRouter` intelligently handles fixture IDs, H2H slugs, and legacy URLs:

```typescript
// src/components/SmartFixtureRouter.tsx
// Priority 1: Fixture ID detection (new, most stable)
const isFixtureIdUrl = (slug: string): boolean => {
  return /^\d+$/.test(slug);
};

// Priority 2: H2H slug detection (legacy, still supported)
const isH2HUrl = (slug: string): boolean => {
  // Pure H2H: team1-vs-team2
  // Match URL: team1-vs-team2-competition-date
  return !hasCompetitionOrDate(slug);
};

// Automatic redirects for legacy URLs
/matches/123-arsenal-vs-liverpool-premier-league-2025-01-15
  → /h2h/arsenal-vs-liverpool
```

#### Page Filtering Logic

```typescript
// src/utils/matchPageFilter.ts
export function shouldCreateMatchPage(fixture: Fixture): boolean {
  const isUKRelevant = UK_RELEVANT_COMPETITIONS.includes(competition);

  if (isUKRelevant) {
    // Always create H2H pages for UK competitions
    // Includes blackout matches - users want historical stats
    return true;
  }

  // Non-UK: require confirmed broadcaster + popular teams
  return hasPopularTeams && hasConfirmedBroadcaster;
}
```

### SEO Strategy

#### Consolidated Authority
- **Before**: Each match created a new URL with zero authority
- **After**: H2H pages accumulate authority over multiple seasons

#### Enhanced Content
```
H2H Page Content:
├── Next Match Hero (live broadcast info)
├── Comprehensive Statistics
│   ├── Win/Loss/Draw records
│   ├── Goals scored/conceded
│   ├── Home/away performance
│   ├── Recent form (last 5 results)
│   └── Historical averages
├── All Upcoming Fixtures
├── Recent Match Results
└── Team Navigation Links
```

#### Technical SEO
```typescript
// Dynamic meta tags with rich information
const meta = generateH2HMeta(team1, team2, fixtureCount);
// Enhanced descriptions with next match info
// Canonical URLs to prevent duplication
// Open Graph tags for social sharing
```

#### Sitemap Optimization
```xml
<!-- 190 H2H pages vs 3,400+ match pages -->
<url>
  <loc>https://matchlocator.com/h2h/arsenal-vs-chelsea</loc>
  <changefreq>daily</changefreq>
  <priority>0.9</priority> <!-- Higher for popular matchups -->
</url>
```

### Blackout Match Handling

**Special Logic for Blackout Matches:**
```typescript
// Even blackout matches get H2H pages in UK competitions
if (isUKRelevant) {
  return true; // H2H page provides historical value
}
```

**User Experience:**
- Blackout matches show "🚫 Blackout" info
- But still provide View button to H2H page
- H2H page shows historical stats and future fixtures
- Users understand why current match isn't available

### Monitoring & Analytics

#### Key Metrics to Track
1. **Google Search Console**: Index coverage for H2H vs old match pages
2. **SEO Rankings**: Position improvements for team matchup searches
3. **User Engagement**: Time on page, bounce rate for H2H pages
4. **Redirect Success**: 301 redirects from legacy match URLs

#### Debug Tools
```typescript
// Test H2H route generation
import { runAllH2HTests } from './src/utils/testH2H';
runAllH2HTests(); // Validates all 190 routes

// Validate specific H2H URL
import { validateH2HUrl } from './src/utils/testH2H';
validateH2HUrl('/h2h/arsenal-vs-chelsea');
```

### File Structure
```
src/
├── components/
│   ├── H2HStatsCard.tsx           # H2H statistics display
│   ├── NextFixtureHero.tsx        # Next match highlight
│   └── SmartFixtureRouter.tsx     # Intelligent routing
├── pages/
│   └── HeadToHeadPage.tsx         # Main H2H page
├── utils/
│   ├── headToHead.ts              # H2H calculations & utilities
│   ├── generateH2HRoutes.ts       # Route generation (190 combinations)
│   ├── generateSitemap.ts         # SEO sitemap generation
│   ├── matchPageFilter.ts         # Page filtering logic
│   ├── teamSlugs.ts              # Team slug management
│   └── testH2H.ts                # H2H testing utilities
└── design-system/components/
    └── FixtureCard.tsx            # Updated to link to H2H pages
```

### Migration Notes

#### Breaking Changes
- Individual match pages no longer created for most fixtures
- All fixture cards now link to H2H pages instead of match pages
- Legacy `/matches/*` URLs automatically redirect to H2H equivalents

#### Backward Compatibility
- Legacy URLs redirect with 301 status (preserves SEO value)
- robots.txt blocks crawling of `/matches/*` to prevent indexing issues
- Existing H2H infrastructure extended rather than replaced

### Performance Impact

#### Positive
- **Reduced page generation**: 190 vs 3,400+ pages
- **Faster crawling**: Google spends less time on thin content
- **Better caching**: H2H pages cached longer than match pages
- **Improved Core Web Vitals**: Fewer pages to optimize

#### Considerations
- H2H pages contain more data (multiple fixtures, stats)
- Database queries optimized for H2H aggregation
- Component lazy loading for non-critical sections

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
  kickoff_utc: string;          // ⚠️ Database: utc_kickoff → Interface: kickoff_utc (mapped)
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
fixture.utc_kickoff     // ❌ Wrong for interface (use kickoff_utc)
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

### Design System Components (`src/design-system/` and `src/components/ui/`)

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

**Last Updated:** September 18, 2025 - Added H2H Architecture & SEO Strategy
**Related Documentation:** [DEPLOYMENT.md](DEPLOYMENT.md), [DATA_MANAGEMENT.md](DATA_MANAGEMENT.md)