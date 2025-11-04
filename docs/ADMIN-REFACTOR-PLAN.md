# Admin Area Refactor Plan

**Date:** 2025-11-04
**Status:** Planning Phase
**Goal:** Rethink, refactor, and improve the admin area

---

## Current State Analysis

### Existing Pages (9 total)
1. **Dashboard** (`AdminDashboardPage.tsx`) - Main overview
2. **Matches** (`AdminMatchesPage.tsx`) - Fixtures debug view
3. **Teams** (`AdminTeamsPage.tsx`) - Team management
4. **Broadcasters** (`AdminBroadcastersPage.tsx`) - Broadcaster data
5. **Competitions** (`AdminCompetitionsPage.tsx`) - Competition settings
6. **Fix Data** (`AdminFixDataPage.tsx`) - Data repair tools
7. **International Broadcasts** (`AdminInternationalBroadcastsPage.tsx`) - Testing tool
8. **Redirects** (`AdminRedirectsPage.tsx`) - URL management
9. **Teams Export** (`AdminTeamsExportPage.tsx`) - Export utility

### Identified Issues

#### 🔴 Critical Issues
1. **Dashboard shows 381 fixtures** - Hardcoded to Premier League only (line 61: `getSimpleFixtures(1)`)
2. **Duplicate teams** - "AZ" vs "AZ FC", "Arsenal" vs "Arsenal FC"
3. **3pm blackout shows "TBD"** - Should show "🚫 No UK Broadcast"
4. **EPL-centric design** - "20/20 EPL teams" cards everywhere

#### 🟡 Design Issues
1. **Broadcasters in general stats** - Should be in Data Quality section
2. **System Health too basic** - Just 3 metrics, needs data quality matrix
3. **Feature Flags outdated** - References old APIs (SoccersAPI), non-functional flags

#### 🔵 UX Issues
1. **No multi-competition support** - Teams can only be in one competition
2. **No data quality overview** - Can't see missing data at a glance
3. **Inconsistent navigation** - Mix of internal pages and external links

---

## Proposed New Structure

### 1. 📊 Dashboard (Redesigned)
**Purpose:** High-level overview of ALL data across ALL competitions

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ SYSTEM OVERVIEW (4 cards)                           │
│ [Teams] [Fixtures] [Competitions] [Sync Status]     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DATA QUALITY MATRIX (New!)                          │
│                                                      │
│           Teams  Crests  Venues  Fixtures  Bcasts   │
│ England    ██████ ████   █████   ███████   ████     │
│ Germany    ██████ ████   █████   ███████   ██       │
│ Spain      ██████ ████   █████   ███████   ███      │
│ Italy      ██████ ███    ████    ██████    █        │
│ France     ████   ██     ███     █████     █        │
│                                                      │
│ Legend: Green 90%+, Yellow 70-89%, Red <70%         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ QUICK ACTIONS                                        │
│ [Manage Teams] [Debug Matches] [View Broadcasters]  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ RECENT ACTIVITY (New!)                               │
│ • Last sync: 5 minutes ago (Success)                │
│ • 12 fixtures updated                                │
│ • 3 new broadcasters added                           │
└─────────────────────────────────────────────────────┘
```

**Key Changes:**
- ✅ Show ALL fixtures, not just PL
- ✅ Remove broadcaster stats from overview
- ✅ Add data quality matrix by country/competition
- ✅ Remove EPL-specific metrics
- ✅ Add sync status indicator

---

### 2. 🏟️ Matches (Enhanced)
**Purpose:** Debug and verify fixture data

**Enhancements:**
- ✅ Add `is_blackout` column
- ✅ Show "🚫 3pm Blackout" badge (red)
- ✅ Show "TBD" badge (orange) for missing broadcaster
- ✅ Filter by competition (ALL by default)
- ✅ Filter by blackout status
- ✅ Export filtered results

---

### 3. ⚽ Teams (Refactored)
**Purpose:** Manage teams across ALL competitions

**New Features:**
```
┌─────────────────────────────────────────────────────┐
│ TEAM MANAGEMENT                                      │
│                                                      │
│ Filters:                                             │
│ [Competition: All ▼] [Search: ____] [Duplicates ▼]  │
│                                                      │
│ ⚠️ Duplicate Detection (New!)                        │
│ Found 23 potential duplicates:                       │
│ • AZ vs AZ FC                   [Merge] [Keep Both]  │
│ • Arsenal vs Arsenal FC         [Merge] [Keep Both]  │
│ • Bayern Munich vs FC Bayern    [Merge] [Keep Both]  │
│                                                      │
│ 📊 Multi-Competition Teams (New!)                    │
│ • Arsenal: Premier League, Champions League          │
│ • Man City: Premier League, Champions League         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Key Changes:**
- ✅ Remove "20/20 EPL" cards
- ✅ Add duplicate detection/merge tool
- ✅ Show which competitions each team participates in
- ✅ Add "Competition Participation" column
- ✅ Bulk edit capabilities

---

### 4. 📺 Broadcasters (Enhanced)
**Purpose:** Manage broadcaster data and coverage

**To Be Designed** - Defer until we finish other pages

---

### 5. 🏆 Competitions (Enhanced)
**Purpose:** Manage competition settings and visibility

**Keep As-Is** - Already functional

---

### 6. 📈 Data Quality (New Page!)
**Purpose:** Comprehensive data quality dashboard

**Features:**
```
┌─────────────────────────────────────────────────────┐
│ DATA QUALITY OVERVIEW                                │
│                                                      │
│ BY COMPETITION:                                      │
│ Premier League:                                      │
│   Teams: 20/20 ████████████████████████ 100%        │
│   Crests: 20/20 ████████████████████████ 100%       │
│   Venues: 19/20 ███████████████████████░ 95%        │
│   Fixtures: 380/380 ███████████████████ 100%        │
│   Broadcasters: 290/380 ████████████░░░ 76%         │
│                                                      │
│ Champions League:                                    │
│   Teams: 36/36 ████████████████████████ 100%        │
│   Crests: 34/36 ████████████████████░░░ 94%         │
│   Venues: 32/36 ██████████████████░░░░░ 89%         │
│   Fixtures: 189/189 ███████████████████ 100%        │
│   Broadcasters: 145/189 ████████████░░░ 77%         │
│                                                      │
│ MISSING DATA (Actionable)                            │
│ 🔴 High Priority:                                    │
│   • 90 fixtures missing broadcasters (PL)            │
│   • 2 teams missing crests (UCL)                     │
│                                                      │
│ 🟡 Medium Priority:                                  │
│   • 1 venue missing (Southampton - new stadium?)     │
│   • 44 fixtures missing broadcasters (UCL)           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

### 7. ⚙️ Settings (Refactored)
**Purpose:** System configuration and feature flags

**Sections:**
1. **Feature Flags** (Cleaned Up)
   - Remove: SoccersAPI flags (deprecated)
   - Remove: Non-functional flags
   - Keep: Production-relevant flags
   - Add: SportMonks-specific flags

2. **Sync Configuration**
   - Sync schedules
   - API status
   - Error logs

3. **System Info**
   - Version info
   - Database stats
   - API quotas

---

### 8. 🔧 Tools (Consolidated)
**Purpose:** Utility tools for maintenance

**Tools:**
- Fix Data Issues (existing)
- International Broadcasts Test (existing)
- URL Redirects (existing)
- Teams Export (existing)
- **NEW:** Database Analyzer
- **NEW:** Sync Test Tool

---

## Removed/Archived Pages

**None Yet** - All pages have value, just need refactoring

---

## Implementation Plan

### Phase 1: Critical Fixes (This Session)
**Time:** 2-3 hours

1. ✅ Fix Dashboard - Show ALL fixtures
2. ✅ Fix Dashboard - Remove broadcaster from overview
3. ✅ Fix Matches - Add blackout indicator
4. ✅ Apply database migration for `is_blackout` field

### Phase 2: Teams Refactor (Next Session)
**Time:** 3-4 hours

1. Remove EPL-centric cards
2. Add duplicate detection
3. Add multi-competition support
4. Add bulk edit capabilities

### Phase 3: Data Quality Dashboard (Future)
**Time:** 4-5 hours

1. Create new Data Quality page
2. Build data quality matrix component
3. Add actionable missing data reports
4. Add data quality trends over time

### Phase 4: Settings & Feature Flags (Future)
**Time:** 2-3 hours

1. Audit all feature flags
2. Remove deprecated flags
3. Add SportMonks-specific flags
4. Improve UI/UX

### Phase 5: Broadcasters Page (Future)
**Time:** TBD

Design and implement broadcaster management page

---

## Technical Debt to Address

1. **Hardcoded Competition IDs** - Use constants/config
2. **Mixed Data Sources** - Some use `supabase.ts`, some use `supabase-simple.ts`
3. **Inconsistent Auth Checks** - Consolidate auth logic
4. **No Error Boundaries** - Add error handling
5. **No Loading States** - Improve UX with skeletons
6. **Inline Styles** - Move to design system

---

## Decision Points for User

### 1. Dashboard Stats
**Question:** What should the top 4 cards show?

**Option A (Current):**
- Teams, Fixtures, Broadcasters, Competitions

**Option B (Proposed):**
- Teams, Fixtures, Competitions, Sync Status

**Option C (Alternative):**
- Teams, Fixtures, Data Quality Score, Sync Status

### 2. Data Quality Matrix
**Question:** What data points should we track?

**Proposed:**
- Teams (exist in DB)
- Crests (team logos)
- Venues (stadium names)
- Fixtures (matches)
- Broadcasters (TV coverage)

**Alternative:**
- Add: Team Colors, Short Names, Slugs, etc.

### 3. Duplicate Teams
**Question:** How aggressive should duplicate detection be?

**Option A (Conservative):**
- Only flag exact matches with/without FC, AFC

**Option B (Aggressive):**
- Flag similar names (Levenshtein distance)
- Flag same country + similar name

### 4. Multi-Competition Teams
**Question:** How should we represent this?

**Option A:** In teams table schema (current - `competition_id`)
- Pro: Simple
- Con: Can only be in one competition

**Option B:** Separate junction table
- Pro: Proper relational model
- Con: Requires migration

**Option C:** Derived from fixtures (implemented in utils)
- Pro: No schema change
- Con: Can't manually override

---

## Next Steps

**Immediate:**
1. User reviews and approves plan
2. User answers decision points
3. Begin Phase 1 implementation

**Short-term:**
1. Complete Phase 1 (critical fixes)
2. Test on production
3. Plan Phase 2 (teams refactor)

**Long-term:**
1. Build out Data Quality dashboard
2. Refactor Feature Flags
3. Comprehensive testing and documentation

---

## Files to Modify (Phase 1)

### Dashboard
- `src/pages/admin/AdminDashboardPage.tsx` (major refactor)
- `src/components/admin/FeatureFlagControls.tsx` (audit)

### Matches
- `src/pages/admin/AdminMatchesPage.tsx` (add blackout badge)

### Database
- Apply `docs/migrations/create-fixtures-with-teams-view-v2.sql`

---

**Estimated Total Effort:** 15-20 hours across all phases

**Priority:** Start with Phase 1 (critical fixes) this session
