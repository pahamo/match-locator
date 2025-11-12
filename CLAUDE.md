# Match Locator - Claude Development Guide

## ⚠️ MANDATORY PRE-IMPLEMENTATION CHECKLIST

**Before implementing ANY feature, you MUST:**

1. ✅ **ALWAYS use design system components** - NEVER use inline styles, use Card/Flex/Stack and Tailwind
2. ✅ **Read App.tsx routing** - Verify current URL structure, don't assume
3. ✅ **Check existing utility functions** - Look at what they actually return, test if unsure
4. ✅ **Never expose database IDs to users** - IDs are internal only, never in URLs
5. ✅ **Ask clarifying questions FIRST** - If URLs/routing/architecture are involved, ask the user before coding
6. ✅ **When uncertain, ask** - Don't make assumptions, don't guess, ASK

**Failure to follow this checklist results in wasted work and user frustration.**

---

## Critical Rules - READ BEFORE ANY CODE CHANGES

### 1. Design System - NEVER Hard-Code Styles

**RULE**: Always use the design system components. Never hard-code inline styles or CSS values.

**Why**: We have a comprehensive design system in `src/design-system/`. Hard-coding styles breaks consistency, theme support, and maintainability.

**How**:
-  Use `Card`, `Flex`, `Stack`, `Button` from design system
-  Use Tailwind utility classes
-  Extend design system with new variants when needed
- L NEVER use inline `style={{ background: '#1234ab' }}`
- L NEVER hard-code colors, spacing, or sizes

**Example**:
```tsx
// L WRONG - Hard-coded styles
<div style={{ background: '#2563eb', color: 'white', padding: '24px' }}>
  Content
</div>

//  CORRECT - Design system
<Card variant="primary" className="p-6">
  Content
</Card>
```

**Files to reference**:
- `src/design-system/components/Card.tsx` - Card variants (primary, success, warning, error, etc.)
- `src/design-system/components/Layout/Flex.tsx` - Flexbox layouts
- `src/design-system/components/Layout/Stack.tsx` - Vertical/horizontal stacks
- `src/design-system/components/Button/Button.tsx` - Button variants

**Real Example from Codebase**:
```tsx
// ❌ WRONG - Inline styles (what NOT to do)
<div style={{
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '10px 16px',
  display: 'flex',
  gap: '12px'
}}>
  <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>
    {count} matches
  </span>
</div>

// ✅ CORRECT - Design system + Tailwind
<Card variant="outline" className="mb-4">
  <Flex justify="between" align="center" gap="md" className="px-4 py-2.5">
    <span className="text-sm font-semibold text-foreground">
      {count} matches
    </span>
  </Flex>
</Card>
```

**When creating new components:**
1. Extract reusable UI into a component (e.g., `StatusBar.tsx`)
2. Use design system components (Card, Flex, Stack) as building blocks
3. Apply Tailwind classes for spacing and colors
4. Use theme tokens: `text-foreground`, `bg-card`, `border-border`, etc.

**Reference**: See `src/components/StatusBar.tsx` for a properly implemented component.

---

### 2. Team Names - ALWAYS Use formatTeamNameShort

**RULE**: Never display raw `team.name` or `fixture.home.name`. Always use `formatTeamNameShort()`.

**Why**: Team names in the database include "FC", "Football Club", etc. (e.g., "Arsenal Football Club"). Users expect short names (e.g., "Arsenal").

**How**:
```tsx
// L WRONG
<div>{team.name}</div>
<div>{fixture.home.name} vs {fixture.away.name}</div>

//  CORRECT
import { formatTeamNameShort } from '../utils/seo';
<div>{formatTeamNameShort(team.name)}</div>
<div>{formatTeamNameShort(fixture.home.name)} vs {formatTeamNameShort(fixture.away.name)}</div>
```

**What it does**:
- Removes "FC", "AFC", "Football Club", "Association Football Club"
- Shortens "United" � "Utd"
- Returns clean, short team names for display

**File**: `src/utils/seo.ts:54-61`

---

### 3. SEO Meta - Use Existing Utility Functions

**RULE**: Use SEO utility functions for all meta tags. Never create new meta generation logic.

**Functions**:
- `generateMatchMeta(fixture)` - For match pages (full Fixture object)
- `generateSimpleMatchMeta(fixture)` - For match pages (SimpleFixture object)
- `generateTeamMeta(team, upcomingCount)` - For team pages
- `generateHomeMeta()` - For homepage
- `updateDocumentMeta(meta)` - To apply meta tags to document

**Pattern**:
```tsx
useEffect(() => {
  if (team && fixtures.length > 0) {
    const meta = generateTeamMeta(team, fixtures.length);
    updateDocumentMeta(meta);
  }
}, [team, fixtures]);
```

**File**: `src/utils/seo.ts`

---

### 4. FAQ Schema - Use StructuredData Component

**RULE**: Always add FAQ structured data to main landing pages for SEO.

**Why**: FAQ schema captures Google featured snippets, driving 3-5x more traffic.

**How**:
```tsx
import StructuredData from '../components/StructuredData';

const faqData = [
  {
    question: "What time is Arsenal playing?",
    answer: "Arsenal's next match is..."
  }
];

return (
  <div>
    <StructuredData type="faq" data={faqData} />
    {/* rest of page */}
  </div>
);
```

**Where to add**:
-  Team pages (ClubPage.tsx) - DONE
-  Today/Tomorrow/Weekend fixtures pages - DONE
- Competition pages (Premier League, Champions League, etc.) - DONE
- Match detail/H2H pages - DONE

**File**: `src/components/StructuredData.tsx`

---

### 5. Data Fetching - Never Hard-Code Limits

**RULE**: Use appropriate limits for data queries. Document why each limit exists.

**Common limits**:
- `limit: 500` - Team fixtures (full season)
- `limit: 300` - Competition fixtures (Champions League season)
- `limit: 100` - Default pagination
- NO LIMIT - When loading all teams or competitions

**Champions League Issue** (PREVIOUSLY FIXED):
The page should show ALL teams that have fixtures, not a hard-coded limit. The code extracts unique teams from fixtures:

```tsx
//  CORRECT - Extracts all teams from fixtures
const uniqueTeams = new Map<number, Team>();
relevantFixtures.forEach(fixture => {
  uniqueTeams.set(fixture.home.id, fixture.home);
  uniqueTeams.set(fixture.away.id, fixture.away);
});
const teamsFromFixtures = Array.from(uniqueTeams.values());
```

**File**: `src/pages/ChampionsLeagueGroupStagePage.tsx:56-63`

---

### 6. Date Handling - Always Use Utilities

**RULE**: Never manually format dates. Use the utility functions.

**Functions**:
- `getUKDate()` - Get current date in UK timezone
- `getFormattedDateForSEO(date)` - Format for SEO (e.g., "Monday 1 January 2025")
- `formatDateForTitle(date)` - Short format for titles (e.g., "1 Jan 2025")
- `formatTimeForMeta(date)` - Format time (e.g., "15:00")
- `getTodayUTCRange()` - Get start/end of today in UTC
- `getTimeUntilMidnight()` - Milliseconds until midnight

**Files**:
- `src/utils/dateRange.ts`
- `src/utils/seo.ts`

---

## Common Bugs & Fixes

### Bug: Team Names Show "Arsenal FC" Instead of "Arsenal"

**Symptoms**: Team names display with "FC", "Football Club", "United", etc.

**Root cause**: Using `team.name` directly instead of `formatTeamNameShort(team.name)`

**Fix**: Import and use `formatTeamNameShort` from `src/utils/seo.ts`

**Fixed in**: ClubPage.tsx (2025-01-XX)

---

### Bug: Champions League Shows Only 10 Teams

**Symptoms**: Matrix shows fewer teams than expected

**Root cause**: Usually a data issue (not enough fixtures in date range), NOT a code limit

**What to check**:
1. `limit: 300` in getFixtures call (line 42)
2. Date range covers full season (lines 32-34)
3. Fixtures data actually exists in database

**Fixed in**: ChampionsLeagueGroupStagePage.tsx (previous session)

---

### Bug: Dark Mode Text Not Visible

**Symptoms**: Light text on light background in dark mode

**Root cause**: Hard-coded colors instead of design system

**Fix**: Use Card variants with proper text colors, or Tailwind dark mode classes

**Fixed in**: ClubPage.tsx Next Match callout (2025-01-XX) - Now uses `Card variant="primary"`

---

## Architecture Patterns

### URL Structure & Routing

**CRITICAL: Always check App.tsx for current routes before linking**

**Current URL patterns:**

| URL Pattern | Page Type | Example | Function to Use |
|------------|-----------|---------|-----------------|
| `/h2h/team1-vs-team2` | H2H page (all matches between 2 teams) | `/h2h/arsenal-vs-chelsea` | `generateH2HUrl(team1Slug, team2Slug)` |
| `/clubs/team-slug` | Team page | `/clubs/arsenal` | `/clubs/${team.slug}` |
| `/matches` | All fixtures list | `/matches` | Static route |
| `/competitions/slug` | Competition page | `/competitions/premier-league` | `/competitions/${slug}` |

**Legacy routes (DO NOT USE for new links):**
- `/fixtures/:matchSlug` - Legacy, redirects to H2H
- `/matches/:matchSlug` - Legacy, redirects to H2H

**Key functions:**
- `generateH2HUrl(team1Slug, team2Slug)` → `/h2h/arsenal-vs-chelsea` (alphabetically sorted)
- File: `src/utils/headToHead.ts`

**Rules:**
1. ❌ **NEVER expose database IDs in URLs** - Use team slugs instead
2. ✅ **Always use `generateH2HUrl()`** for match/H2H links
3. ✅ **Check App.tsx** if uncertain about routing
4. ✅ **Ask user** before creating new URL patterns

---

### Multi-Competition Team Architecture

**IMPORTANT: Teams participate in multiple competitions simultaneously.**

#### The Problem
The database `teams` table has a `competition_id` field representing a team's PRIMARY/DOMESTIC competition (e.g., Arsenal = Premier League). However, teams compete in multiple competitions (Premier League, Champions League, Europa League, etc.). Querying by `team.competition_id` only shows primary competition, missing multi-competition participation.

#### The Solution: Fixture-Based Team Discovery

**Core Principle**: A team is "in" a competition if they have fixtures in that competition within a time window.

**Benefits**:
- ✅ Single source of truth (fixtures table)
- ✅ Automatic updates (new fixtures = auto-included)
- ✅ Handles eliminations, cup runs, multi-competition participation
- ✅ Time-windowed (past 3 months + future = current season)
- ✅ Consistent across entire site

#### Implementation

**New Utility File**: `src/utils/teamCompetitions.ts`

```typescript
/**
 * Get teams actively participating in a competition
 * Based on fixture data within a time range
 */
export async function getTeamsInCompetition(
  competitionId: number,
  options: {
    pastMonths?: number;      // Default: 3 (current season)
    includeMetadata?: boolean; // Include fixture counts
  } = {}
): Promise<TeamInCompetition[]>

/**
 * Get all competitions a team is currently participating in
 */
export async function getTeamCompetitionIds(
  teamSlug: string,
  options: { pastMonths?: number } = {}
): Promise<number[]>

/**
 * Get participation summary for all competitions
 * Returns a map of competition ID to team count
 */
export async function getCompetitionParticipation(
  options: {
    pastMonths?: number;
    competitionIds?: number[];
  } = {}
): Promise<Map<number, number>>
```

#### Usage Examples

**ClubsPage.tsx - Show teams in all competitions:**
```typescript
import { getTeamsInCompetition } from '../utils/teamCompetitions';

// Load teams for each competition based on fixtures
const teamsByComp: Record<number, Team[]> = {};

await Promise.all(
  competitions.map(async (competition) => {
    const teams = await getTeamsInCompetition(competition.id, {
      pastMonths: 3, // Current season
      includeMetadata: false
    });
    teamsByComp[competition.id] = teams;
  })
);

// Result: Arsenal appears in BOTH Premier League AND Champions League
```

**TeamHeader.tsx - Show all competition badges:**
```typescript
import type { CompetitionFixtureGroup } from '../utils/teamFixtures';

// Pass competitionGroups from fixturesData
<TeamHeader
  metadata={teamMetadata}
  competitionGroups={fixturesData.competitionGroups}
/>

// Displays: "Playing in: [Premier League Badge] [Champions League Badge]"
```

**CompetitionPage.tsx - Already uses fixture-based approach:**
```typescript
// Extract unique team IDs from fixtures (no changes needed)
const teamIdsInFixtures = new Set<number>();
fixtures.forEach((fixture) => {
  teamIdsInFixtures.add(fixture.home_team_id);
  teamIdsInFixtures.add(fixture.away_team_id);
});

const competitionTeams = allTeams
  .filter(team => teamIdsInFixtures.has(team.id));
```

#### When to Use What

**Use `getTeamsInCompetition()` (fixture-based):**
- ✅ ClubsPage - Grouping teams by competition
- ✅ Competition pages - Listing teams in a competition
- ✅ Multi-competition displays
- ✅ When you want ALL teams currently participating

**Use `team.competition_id` (primary competition):**
- ✅ RelatedTeamsSection - Showing teams from same domestic league
- ✅ When you specifically need the primary/domestic competition
- ✅ Team metadata displays (e.g., "Premier League team")

**Use `fixturesData.competitionGroups` (from teamFixtures.ts):**
- ✅ ClubPage - Already groups fixtures by competition
- ✅ TeamHeader - Show all competition badges
- ✅ TeamStatsCard - Show multi-competition participation
- ✅ When displaying fixture-based data

#### Expected Results

**Before**: Champions League page showed 10 teams (only those with `competition_id=2`)
**After**: Champions League page shows 53 teams (all with Champions League fixtures)

**Before**: Arsenal only showed Premier League badge
**After**: Arsenal shows both Premier League and Champions League badges

#### Files Modified

- ✅ **NEW**: `src/utils/teamCompetitions.ts` - Fixture-based team discovery utilities
- ✅ `src/pages/ClubsPage.tsx` - Uses `getTeamsInCompetition()` for dynamic loading
- ✅ `src/components/TeamHeader.tsx` - Shows all competition badges
- ✅ `src/components/TeamStatsCard.tsx` - Shows multi-competition participation
- ✅ `src/pages/ClubPage.tsx` - Passes `competitionGroups` to components
- ✅ `src/utils/teamFixtures.ts` - Fixed 'live' status in filters

---

### Component Structure

```
src/
   components/          # Shared components (Header, StructuredData, etc.)
   design-system/       # Design system (Card, Button, Flex, Stack)
      components/
      index.ts
   pages/              # Page components (one per route)
   services/           # API calls (supabase.ts)
   utils/              # Utilities (seo.ts, dateRange.ts, slugUtils.ts)
   types/              # TypeScript types
```

### SEO-First Development

Every page must have:
1.  **Meta tags** - Title, description, canonical, OG tags
2.  **H1 with keywords** - Include time-sensitive keywords ("What time is X playing?")
3.  **FAQ schema** - 3-4 dynamic questions targeting user queries
4.  **Structured data** - SportsEvent, FAQPage, BreadcrumbList
5.  **Clean URLs** - `/clubs/arsenal`, `/matches/arsenal-vs-liverpool-premier-league-1-jan-2025`

### Performance Rules

1. **Memoize expensive calculations** - Use `useMemo` for data transformations
2. **Lazy load routes** - React.lazy() for code splitting
3. **Optimize images** - WebP format, proper sizing
4. **Minimize re-renders** - useCallback for event handlers

---

## Responsive Design & Accessibility Patterns

### Responsive Behavior - useMediaQuery Hook

**RULE**: Never use `window.innerWidth` checks in render logic. Always use the `useMediaQuery` hook.

**Why**:
- `window.innerWidth` causes SSR hydration mismatches
- Doesn't update automatically on window resize
- Breaks server-side rendering

**How**:
```tsx
// ❌ WRONG - Direct window access
const isMobile = window.innerWidth <= 768;

// ✅ CORRECT - useMediaQuery hook
import { useIsMobile } from '../hooks/useMediaQuery';
const isMobile = useIsMobile();

// ✅ CORRECT - Custom breakpoint
import { useMediaQuery } from '../hooks/useMediaQuery';
const isNarrow = useMediaQuery('(max-width: 640px)');
```

**Available hooks**:
- `useIsMobile()` - Max width 768px
- `useIsTablet()` - 769px to 1024px
- `useIsDesktop()` - Min width 1025px
- `useMediaQuery(query)` - Custom media query

**Breakpoints**:
- Mobile: `≤768px`
- Tablet: `769px - 1024px`
- Desktop: `≥1025px`

**File**: `src/hooks/useMediaQuery.ts`

---

### Touch Targets - WCAG 2.1 Level AA Compliance

**RULE**: All interactive elements must have a minimum touch target of 44x44 pixels on mobile.

**Pattern**:
```tsx
const isMobile = useIsMobile();

<a
  href="/page"
  style={{
    minHeight: isMobile ? '44px' : 'auto',
    display: 'flex',
    alignItems: 'center',
    padding: isMobile ? '8px 0' : '0'
  }}
>
  Link Text
</a>
```

**Examples**:
- `src/components/Footer.tsx` - All footer links and buttons
- `src/components/Header.tsx` - Mobile menu items

**Testing**: Check on mobile viewport (375px width) that all links/buttons are easy to tap.

---

### Keyboard Navigation

**RULE**: All interactive UI elements must be fully keyboard accessible.

**Dropdown Menus Pattern**:
```tsx
<a
  href="/page"
  role="button"
  aria-haspopup="true"
  aria-expanded={dropdownOpen}
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setDropdownOpen(!dropdownOpen);
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDropdownOpen(true);
    }
  }}
>
  Menu Trigger
</a>

<div role="menu" onKeyDown={(e) => {
  if (e.key === 'Escape') {
    setDropdownOpen(false);
  }
}}>
  <a href="/item" role="menuitem">Item 1</a>
  <a href="/item" role="menuitem">Item 2</a>
</div>
```

**ARIA attributes**:
- `role="button"` - For link-styled buttons
- `role="menu"` - For dropdown containers
- `role="menuitem"` - For dropdown items
- `aria-haspopup="true"` - Indicates popup menu
- `aria-expanded` - Current open/closed state
- `aria-current="page"` - Indicates active page

**Example**: `src/components/Header.tsx` Competitions dropdown (lines 233-289)

---

### Focus Trap for Modals/Menus

**RULE**: When a modal or dropdown menu is open, keyboard focus must stay trapped within it.

**Pattern**:
```tsx
React.useEffect(() => {
  if (!menuOpen) return;

  const menu = document.getElementById('menu-id');
  if (!menu) return;

  const focusableElements = menu.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab: wrap from first to last
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab: wrap from last to first
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  document.addEventListener('keydown', handleTabKey);
  firstElement?.focus(); // Focus first element when menu opens

  return () => document.removeEventListener('keydown', handleTabKey);
}, [menuOpen]);
```

**Example**: `src/components/Header.tsx` mobile menu focus trap (lines 37-74)

---

### Active Page Indicators

**RULE**: Show users which page they're currently on with visual indicators.

**Pattern**:
```tsx
// Track current page
const [currentPath, setCurrentPath] = useState('');

React.useEffect(() => {
  setCurrentPath(window.location.pathname);
}, []);

// Helper function
const isActive = (path: string) => {
  if (path === '/') {
    return currentPath === '/';
  }
  return currentPath.startsWith(path);
};

// Desktop navigation - bottom border
<a
  href="/page"
  style={{
    backgroundColor: isActive('/page') ? '#eef2ff' : 'transparent',
    borderBottom: isActive('/page') ? '2px solid #6366f1' : '2px solid transparent'
  }}
  aria-current={isActive('/page') ? 'page' : undefined}
>
  Page
</a>

// Mobile navigation - left border
<a
  href="/page"
  style={{
    backgroundColor: isActive('/page') ? '#eef2ff' : 'transparent',
    borderLeft: isActive('/page') ? '3px solid #6366f1' : '3px solid transparent'
  }}
  aria-current={isActive('/page') ? 'page' : undefined}
>
  Page
</a>
```

**Visual indicators**:
- Desktop nav: Light indigo background + bottom border
- Mobile nav: Light indigo background + left border
- Background color: `#eef2ff` (indigo-50)
- Border color: `#6366f1` (indigo-500)

**Example**: `src/components/Header.tsx` (lines 171-609)

---

### Mobile Layout Patterns

**Pattern 1: Vertical Stacking**
```tsx
const isMobile = useIsMobile();

<div style={{
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? 8 : 16
}}>
  {/* Content */}
</div>
```

**Pattern 2: Conditional Display**
```tsx
<nav style={{
  display: isMobile ? 'none' : 'flex'
}}>
  {/* Desktop nav */}
</nav>

<button style={{
  display: isMobile ? 'flex' : 'none'
}}>
  {/* Mobile menu button */}
</button>
```

**Pattern 3: Responsive Padding**
```tsx
<div style={{
  padding: isMobile ? '8px' : '16px'
}}>
  {/* Content */}
</div>
```

---

## Git Workflow

### Commit Messages

Format: `[category]: [concise description]`

Categories:
- `feat:` - New feature
- `fix:` - Bug fix
- `seo:` - SEO improvements
- `refactor:` - Code refactoring (no behavior change)
- `style:` - Design system updates
- `docs:` - Documentation
- `perf:` - Performance improvements

Examples:
- `fix: use formatTeamNameShort for team display names`
- `seo: add FAQ schema to team pages`
- `feat: add primary variant to Card component`

---

## Testing Checklist

Before deploying ANY changes:

### Visual Testing
- [ ] Check team names are SHORT (Arsenal, not Arsenal FC)
- [ ] Check all text is visible in both light and dark mode
- [ ] Check responsive layout on mobile (375px) and desktop (1920px)
- [ ] Check all interactive elements have hover states

### SEO Testing
- [ ] View page source - check meta tags are correct
- [ ] Check H1 includes target keywords
- [ ] Search for "FAQPage" in source - schema should exist
- [ ] Run Lighthouse - SEO score should be 100

### Data Testing
- [ ] Check no hard-coded limits preventing data display
- [ ] Verify date ranges cover expected period
- [ ] Check error states display properly
- [ ] Verify loading states work

---

## Quick Reference

### Import Patterns

```tsx
// Design System
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/components/Card';
import Flex from '../design-system/components/Layout/Flex';
import Stack from '../design-system/components/Layout/Stack';

// SEO
import { formatTeamNameShort, generateTeamMeta, updateDocumentMeta } from '../utils/seo';
import StructuredData from '../components/StructuredData';

// Data
import { getFixtures, getTeams } from '../services/supabase';

// Utils
import { getMatchStatus } from '../utils/matchStatus';
import { getUKDate, getFormattedDateForSEO } from '../utils/dateRange';
```

---

## When in Doubt

1. **Search the codebase** - Use grep/glob to find existing patterns
2. **Check similar pages** - TodayFixturesPage is a good reference
3. **Use design system** - Don't create custom components
4. **Ask before breaking patterns** - Consistency > cleverness
5. **Document new patterns** - Update this file

---

## Page Architecture Reference

### Competition Page (`/competitions/{slug}`)

**Purpose**: Main landing page for each competition (Premier League, Champions League, etc.)

**Layout**: 2-column grid (left: fixtures/results, right: standings/teams)

**Components**:
1. **Competition Header**
   - Logo + H1 with competition name
   - SEO-optimized page overview paragraph
   - Example: "View the latest Premier League fixtures, results, and league table. Check kick-off times, TV broadcast information, and where to watch every match live in the UK."

2. **MatchdaySection** (Left Column)
   - Tabbed interface: "Upcoming" / "Results"
   - Dynamic title based on matchday and date range
   - Title format: "Matchday 7 Fixtures" (without competition name to avoid repetition)
   - Date metadata below title: "4 Oct 2025"
   - SEO description: "View all 10 upcoming Premier League fixtures for Matchday 7. Check kick-off times, TV broadcast channels, and where to watch every match live in the UK."
   - Shows ALL fixtures from current matchday (not just 5)
   - Uses `withTimeNoCompetition` variant (time shown, no competition badge, no matchweek pill)
   - Tab buttons: Underline style (less prominent), e.g., "Upcoming (10)" and "Results (10)"
   - Results tab hides broadcaster info (shows scores only)

3. **LeagueStandings** (Right Column) OR Teams List Fallback
   - Title: "League Table" (not "Premier League Standings")
   - Compact mode: Shows only Position, Team, GD, Points, Form
   - Hides columns: P, W, D, L, GF, GA
   - Only displays if `seasonId` is configured in competition config
   - Falls back to teams list if no standings available

**Key Files**:
- `src/pages/CompetitionPage.tsx` - Main page component
- `src/components/MatchdaySection.tsx` - Fixtures/results tabs
- `src/components/LeagueStandings.tsx` - League table

**SEO Strategy**:
- Competition name in H1, URL, and descriptions (but not repeated in section titles)
- Dynamic matchday-specific content
- Keyword-rich descriptions mentioning "kick-off times", "TV broadcast", "where to watch"
- Date ranges for time-sensitive queries

**Responsive Behavior**:
- 2-column grid on desktop
- Stacks to single column on mobile via `.competition-content-grid` CSS class

---

## Recent Changes Log

### 2025-10-07 - Mobile UX & Accessibility Improvements
-  Created `useMediaQuery` hook for responsive behavior (replaces `window.innerWidth`)
-  Fixed Header.tsx responsive behavior with `useIsMobile()` hook
-  Fixed Footer.tsx mobile layout with vertical stacking and proper touch targets
-  Added keyboard navigation to Competitions dropdown (Enter/Space/Escape/Arrow keys)
-  Added focus trap to mobile menu to keep keyboard focus contained
-  Added active page indicators to all navigation links (desktop + mobile)
-  Updated CLAUDE.md with comprehensive responsive and accessibility patterns
-  All changes comply with WCAG 2.1 Level AA standards

**Files Modified**:
- `src/hooks/useMediaQuery.ts` (NEW) - Custom hook for media queries
- `src/components/Header.tsx` - Responsive behavior, keyboard nav, focus trap, active indicators
- `src/components/Footer.tsx` - Mobile layout fixes, 44px touch targets
- `CLAUDE.md` - New "Responsive Design & Accessibility Patterns" section

### 2025-10-03 - Competition Page Overhaul
-  Added 2-column layout (fixtures left, standings right)
-  Created `withTimeNoCompetition` variant for FixtureCard
-  Added dynamic SEO-optimized titles to MatchdaySection
-  Removed competition name repetition from section titles
-  Added date metadata labels below titles
-  Added SEO description paragraphs to each section
-  Simplified tab buttons to underline style
-  Removed matchweek pills from cards (redundant)
-  Added compact mode to LeagueStandings component
-  Added page overview paragraph under competition header

### 2025-10-01 - Internal Linking Strategy Implementation
-  Added LiveMatchesTicker component (scrolling ticker for same-day matches)
-  Added RelatedTeamsSection component (6-8 teams from same competition)
-  Added CompetitionBadge component (competition badge with filtering link)
-  Created helper functions: getTeamsByCompetition, getFixturesForDay, getPopularTeamSlugs
-  Added mandatory pre-implementation checklist to prevent URL/routing mistakes
-  Documented URL structure and routing patterns

### 2025-01-XX - Team Page SEO Optimization
-  Added FAQ schema to ClubPage (4 dynamic questions)
-  Updated H1 to "Team TV Schedule - What Time Are [Team] Playing?"
-  Added "Next Match" callout with Card primary variant
-  Fixed team names to use formatTeamNameShort
-  Updated meta descriptions for better CTR

### 2025-01-XX - Initial SEO Improvements
-  Fixed empty team sitemap (177 teams now indexed)
-  Optimized meta descriptions for 2x better CTR
-  Added dynamic date to homepage H1
-  Submitted sitemap to Google Search Console

---

## SEO Patterns - Internal Linking Strategy

### Components for Internal Linking

**LiveMatchesTicker** (`src/components/LiveMatchesTicker.tsx`)
- Shows matches on same day in same competition
- Links to H2H pages using `generateH2HUrl()`
- Title format: "Today's Other {Competition} Matches - {Date}"
- Integrated on: ClubPage, MatchPage, HeadToHeadPage

**RelatedTeamsSection** (`src/components/RelatedTeamsSection.tsx`)
- Shows 6-8 teams from same competition
- Falls back to popular Premier League teams if needed
- Grid layout with team crests and names
- Links to team pages via `/clubs/${slug}`
- Integrated on: ClubPage (after fixtures list)

**CompetitionBadge** (`src/components/CompetitionBadge.tsx`)
- Displays competition badge with icon and name
- Uses competition brand colors from config
- Links to `/matches?competition=${slug}`
- Integrated on: ClubPage (below H1)

**Helper Functions:**
- `getTeamsByCompetition(competitionId, limit)` - Fetch teams by competition
- `getFixturesForDay(date, competitionIds?)` - Fetch fixtures for specific day
- `getPopularTeamSlugs()` - Returns hardcoded popular PL teams

**Expected SEO Impact:**
- 1,416+ new internal links across 177 team pages
- Better crawl depth and PageRank distribution
- 15-25% organic traffic increase expected

---

*This document should be updated whenever a significant pattern is established or bug is fixed.*

**Design System Reminder:** When making changes to design elements and components, be aware of, maintain and add to the design system and component library.