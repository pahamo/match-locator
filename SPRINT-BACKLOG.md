# Sprint Backlog - Match Locator

**Created:** 2025-10-28
**Last Updated:** 2025-11-03

This document tracks all identified bugs, issues, and unfinished work for the Match Locator application.

---

## 📋 DEFERRED ISSUES

### ⏸️ #1: Club Page Redesign - DEFERRED TO Q1 2026
**Priority:** CRITICAL (when resumed)
**Status:** ⏸️ Deferred
**Decision Date:** 2025-11-03
**Reason:** Webpack compilation hangs with no error messages

**Problem:**
Multiple attempts to integrate enhanced ClubPage components resulted in webpack hanging indefinitely during both production build and dev server compilation. No error messages provided, making debugging impractical.

**Components Deleted:**
- ❌ `src/components/TeamHeader.tsx` (deleted)
- ❌ `src/components/EnhancedNextMatch.tsx` (deleted)
- ❌ `src/components/TeamStatsCard.tsx` (deleted)
- ❌ `src/components/CompetitionFixturesSection.tsx` (deleted)
- ❌ `src/hooks/useTeamData.ts` (deleted)
- ❌ `src/utils/structuredDataHelpers.ts` (deleted)

**Estimated Lost Impact:**
- 40-60% potential SEO traffic gains
- 8-10 dynamic FAQ questions (vs current 4)
- Multi-competition display
- Enhanced metadata and structured data

**Next Steps:**
See `/CLUB-PAGE-REDESIGN-DEFERRED.md` for full documentation of:
- What we're losing
- Why we deferred
- Prerequisites before retry
- Alternative approaches

**Review Date:** Q1 2026 or when webpack compatibility issue resolved

---

## 🔴 HIGH PRIORITY ISSUES (P1 - Fix This Week)

### ✅ #2: Duplicate Files in Codebase
**Priority:** HIGH
**Status:** ✅ Completed (2025-11-03)
**Effort:** 2 minutes
**Impact:** Code cleanliness, potential import errors

**Problem:**
macOS Finder created duplicate files with " 2" suffix.

**Files to Delete:**
```bash
rm "src/design-system/tokens/index 2.ts"
rm "src/design-system/tokens/dark-mode 2.ts"
rm "src/design-system/tokens/breakpoints 2.ts"
rm "src/services/URLBuilder 2.ts"
```

**Commands:**
```bash
# Verify files are identical first
diff "src/design-system/tokens/index.ts" "src/design-system/tokens/index 2.ts"
# Then delete
git rm "src/design-system/tokens/index 2.ts"
# Repeat for other files
```

---

### ❌ #3: Broadcast Data Requires 2-Month Lookback Workaround
**Priority:** HIGH
**Status:** 🔴 Not Started
**Effort:** Investigation required
**Impact:** Poor data freshness, slow queries

**Problem:**
`ClubPage.tsx` fetches fixtures from 2 months ago because new fixtures (Nov/Dec 2025) lack broadcaster data. Only old fixtures (Aug/Sep 2025) have it.

**Current Workaround:**
```typescript
// src/pages/ClubPage.tsx:38-44
const twoMonthsAgo = new Date();
twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
```

**Root Cause:**
Data sync/import process not populating broadcaster data on new fixtures.

**Investigation Steps:**
- [ ] Check which script imports fixtures
- [ ] Verify broadcaster data in SportMonks API response
- [ ] Check if broadcaster field is being mapped correctly
- [ ] Test fixture import with recent data

**Scripts to Check:**
- `scripts/sync-*.mjs`
- Look for SportMonks API calls

**Fix Required:**
1. Find why new fixtures lack broadcaster data
2. Fix sync/import scripts to populate it
3. Remove 2-month lookback workaround
4. Change to: `dateFrom: new Date().toISOString()`

**Files to Modify:**
- Import/sync scripts (TBD)
- `src/pages/ClubPage.tsx` (revert workaround)

---

### ❌ #4: Missing Hook Dependencies
**Priority:** HIGH
**Status:** 🔴 Not Started
**Effort:** 10 minutes
**Impact:** Potential runtime bugs, stale closures

**Problem:**
`FixturesPage.tsx` disables React hook dependency warnings.

**Location:**
```typescript
// src/pages/FixturesPage.tsx:63
// eslint-disable-next-line react-hooks/exhaustive-deps
```

**Fix:**
1. Remove eslint-disable comment
2. Add missing dependencies to useEffect
3. Use `useCallback` to stabilize function references if needed

**Files to Modify:**
- `src/pages/FixturesPage.tsx`

---

### ✅ #5: Unused Enhanced Components Create Confusion
**Priority:** HIGH
**Status:** ✅ Completed (2025-11-03)
**Resolution:** Deleted components and deferred redesign

**Problem:**
32KB of unused components existed in codebase. Linked to Issue #1 - when redesign was deferred, components were deleted.

**Components Deleted:**
- ✅ `src/components/TeamHeader.tsx`
- ✅ `src/components/EnhancedNextMatch.tsx`
- ✅ `src/components/TeamStatsCard.tsx`
- ✅ `src/components/CompetitionFixturesSection.tsx`
- ✅ `src/hooks/useTeamData.ts`
- ✅ `src/utils/structuredDataHelpers.ts`

**Documentation:**
- ✅ Moved `CLUB-PAGE-REDESIGN-STATUS.md` to `archive/`
- ✅ Created `/CLUB-PAGE-REDESIGN-DEFERRED.md` to document decision

---

## 🟡 MEDIUM PRIORITY ISSUES (P2 - Fix Soon)

### ❌ #6: Console Logs in Production Code
**Priority:** MEDIUM
**Status:** 🔴 Not Started
**Effort:** 15 minutes
**Impact:** Console noise, minor performance overhead

**Problem:**
Debug console.log statements left in production code.

**Files:**
- `src/pages/admin/AdminTeamsPage.tsx` - 6 logs
- `src/utils/generateH2HRoutes.ts` - 7 logs
- `src/utils/generateSitemap.ts` - 5 logs
- `src/utils/testH2H.ts` - 13 logs (test file - OK)

**Fix Pattern:**
```typescript
// Either remove:
// console.log('debug info');

// Or wrap in dev check:
if (process.env.NODE_ENV === 'development') {
  console.log('debug info');
}
```

**Files to Modify:**
- `src/pages/admin/AdminTeamsPage.tsx`
- `src/utils/generateH2HRoutes.ts`
- `src/utils/generateSitemap.ts`

---

### ❌ #7: 48 Diagnostic Scripts Need Organization
**Priority:** MEDIUM
**Status:** 🔴 Not Started
**Effort:** 30 minutes
**Impact:** Repository cleanliness, developer confusion

**Problem:**
`scripts/diagnostics/` contains 48 scripts, many are one-time fixes.

**One-Time Fix Scripts:**
- `check-bournemouth-data.mjs`
- `find-duplicate-teams.mjs`
- `merge-duplicate-teams.mjs`
- `check-fixture-6057.mjs`
- `check-fixture-6075.mjs`
- Many others...

**Action Plan:**
1. Create `scripts/archive/` folder
2. Move one-time fix scripts there
3. Keep only active diagnostic scripts
4. Create `scripts/diagnostics/README.md` explaining each script

**Files to Create:**
- `scripts/diagnostics/README.md`

---

### ❌ #8: Deprecated Code Should Be Removed
**Priority:** MEDIUM
**Status:** 🔴 Not Started
**Effort:** 1-2 hours (research + migration)
**Impact:** Code bloat, confusion

**Deprecated Items:**
1. `src/types/index.ts:111` - `matchweek` field (use `getRoundNumber()` instead)
2. `src/utils/fixtures.ts:89` - Old function
3. `src/config/featureFlags.ts:15` - `useSoccersAPI` flag

**Action Plan:**
1. Search codebase for usage of each deprecated item
2. Migrate to new APIs
3. Remove deprecated code
4. Document in CHANGELOG.md

**Files to Check:**
- Search for `matchweek` usage
- Search for deprecated function calls
- Search for `useSoccersAPI` references

---

## 🔵 LOW PRIORITY / TECHNICAL DEBT (P3 - Nice to Have)

### ❌ #9: Magic Numbers Throughout Code
**Priority:** LOW
**Status:** 🔴 Not Started
**Effort:** 20 minutes
**Impact:** Code readability

**Problem:**
Hard-coded numbers without explanation.

**Examples:**
```typescript
limit: 500,  // Why 500?
limit: 300,  // Why 300?
pastMonths: 3,  // Why 3?
setMonth(twoMonthsAgo.getMonth() - 2); // Why 2?
```

**Fix:**
Extract to named constants in a config file.

**Suggested Constants File:**
```typescript
// src/config/queryLimits.ts
export const QUERY_LIMITS = {
  TEAM_FIXTURES: 500, // Full season of fixtures
  COMPETITION_FIXTURES: 300, // Champions League season
  DEFAULT_FIXTURES: 100,
};

export const DATE_RANGES = {
  BROADCAST_DATA_LOOKBACK_MONTHS: 2,
  TEAM_COMPETITION_LOOKBACK_MONTHS: 3,
};
```

**Files to Update:**
- Various service files using these limits

---

### ❌ #10: Inconsistent Error Handling
**Priority:** LOW
**Status:** 🔴 Not Started
**Effort:** 1-2 hours
**Impact:** Code consistency

**Problem:**
Error handling varies across codebase:
- Some use `console.error`
- Some use `console.warn`
- Some set error state
- Some throw exceptions

**Recommended Solution:**
Create centralized error logging utility.

**Suggested Implementation:**
```typescript
// src/utils/errorLogger.ts
export const logError = (context: string, error: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
  }
  // Could add error tracking service here (Sentry, etc.)
};
```

---

## 📊 SPRINT PROGRESS TRACKER

**Week of:** 2025-10-28

### Sprint Goals:
- [ ] Decide on ClubPage redesign (integrate or delete)
- [ ] Fix critical broadcast data issue
- [ ] Clean up duplicate files
- [ ] Address high-priority technical issues

### Completed This Week:
*None yet*

### In Progress:
*None yet*

### Blocked:
*None yet*

---

## 📈 METRICS

**Total Issues:** 10
- ⏸️ Deferred: 1 (#1 - ClubPage redesign)
- ✅ Completed: 2 (#2 - Duplicate files, #5 - Unused components)
- 🔴 High: 2 (#3 - Broadcast data, #4 - Hook dependencies)
- 🟡 Medium: 3 (#6 - Console logs, #7 - Scripts, #8 - Deprecated code)
- 🔵 Low: 2 (#9 - Magic numbers, #10 - Error handling)

**Estimated Remaining Time:** 4-6 hours

**Status Distribution:**
- ⏸️ Deferred: 1
- ✅ Completed: 2
- 🔴 Not Started: 7
- 🟡 In Progress: 0

**Progress:** 20% complete (2 of 10 issues resolved)

---

## 🎯 RECOMMENDED ORDER (UPDATED 2025-11-03)

**Day 1 - Today (2-3 hours):**
1. ✅ #2 - Delete duplicate files (DONE)
2. ✅ #1 - Decide on ClubPage redesign (DEFERRED)
3. ✅ #5 - Delete unused components (DONE)
4. 🔜 #3 - Investigate broadcast data issue (NEXT)

**Day 2 (2-3 hours):**
5. #3 - Fix broadcast data sync (implementation - TBD after investigation)
6. #4 - Fix hook dependencies (10 min)
7. #6 - Clean up console logs (15 min)

**Day 3 (1-2 hours):**
8. #7 - Organize diagnostic scripts (30 min)

**Future Sprint:**
9. #8 - Remove deprecated code
10. #9 - Extract magic numbers
11. #10 - Standardize error handling
12. #1 - Revisit ClubPage redesign (Q1 2026)

---

## 📝 NOTES

### Key Decisions Made:
- **2025-11-03:** Deferred ClubPage redesign to Q1 2026 due to webpack compatibility issues
- **2025-11-03:** Deleted all unused enhanced components (32KB)
- **2025-11-03:** Created `/CLUB-PAGE-REDESIGN-DEFERRED.md` to document decision and future approach

### Context from Recent Work:
- 2025-11-03: ClubPage integration caused webpack to hang with no error messages
- 2025-11-03: Multiple failed attempts visible in git history (5+ reverts)
- 2025-11-03: Decision made to cut losses and focus on solvable problems
- 2025-10-28: Multiple ClubPage reverts due to missing dependencies
- Broadcaster data showing as "TBD" for new fixtures
- Fetching from 2 months ago is a workaround, not a solution

### Lessons Learned:
- Don't force broken integrations - multiple failures = stop and investigate root cause
- Silent webpack hangs with no errors = debugging nightmare
- Sunk cost fallacy: Time spent building doesn't justify continuing to break builds
- Document deferral decisions for future context
- Always commit dependent files together
- Test in production environment before declaring "done"
- Avoid workarounds that mask root problems

---

## 🔗 RELATED DOCUMENTS

- `/CLUB-PAGE-REDESIGN-DEFERRED.md` - ⭐ NEW: Deferred redesign documentation
- `/archive/CLUB-PAGE-REDESIGN-STATUS-ARCHIVED.md` - Original redesign planning (archived)
- `/scripts/diagnostics/FIX-SUMMARY.md` - Previous data fixes
- `/CLAUDE.md` - Project development guidelines

---

**Next Review:** After completing broadcast data investigation (Issue #3)
