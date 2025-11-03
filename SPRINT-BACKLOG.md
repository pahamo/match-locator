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

### ✅ #3: Broadcast Data Requires 2-Month Lookback Workaround
**Priority:** HIGH
**Status:** ✅ Completed (2025-11-03)
**Resolution:** Fixed broadcaster filter in sync scripts

**Problem:**
70% of November 2025 fixtures were missing broadcaster data because sync script filtered out NOW TV (country 251) and Amazon Prime Video UK (country 458).

**Root Cause:**
The `shouldIncludeBroadcast()` filter in sync scripts only accepted country IDs [11, 455, 462], missing:
- Country 251: NOW TV (UK streaming)
- Country 458: Amazon Prime Video UK

**Solution Applied:**
- ✅ Updated `scripts/production/sync-sportmonks-fixtures.mjs` (lines 411-435)
- ✅ Updated `scripts/production/sync-upcoming-broadcasters.mjs` (lines 150-152)
- ✅ Added missing country IDs 251 and 458 to broadcaster filters
- ✅ Removed outdated Amazon Prime filter for Premier League
- ✅ Re-synced fixtures to populate missing broadcaster data

**Verification:**
- Sync completed successfully (commit 5b9d6d34)
- NOW TV and Amazon Prime broadcasts now being saved
- Broadcast coverage improved from ~30% to expected ~80-90%

**Investigation Documentation:**
- Full analysis: `scripts/diagnostics/INVESTIGATION-SUMMARY.md`
- Root cause details: `scripts/diagnostics/ROOT-CAUSE-ANALYSIS.md`
- Diagnostic scripts created for future verification

**Optional Next Step:**
Remove 2-month lookback workaround from `src/pages/ClubPage.tsx` (lines 38-44) once broadcaster coverage is verified in production.

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
- ✅ Completed: 3 (#2 - Duplicate files, #3 - Broadcast data, #5 - Unused components)
- 🔴 High: 1 (#4 - Hook dependencies)
- 🟡 Medium: 3 (#6 - Console logs, #7 - Scripts, #8 - Deprecated code)
- 🔵 Low: 2 (#9 - Magic numbers, #10 - Error handling)

**Estimated Remaining Time:** 2-4 hours

**Status Distribution:**
- ⏸️ Deferred: 1
- ✅ Completed: 3
- 🔴 Not Started: 6
- 🟡 In Progress: 0

**Progress:** 30% complete (3 of 10 issues resolved)

---

## 🎯 RECOMMENDED ORDER (UPDATED 2025-11-03)

**Day 1 - Today (COMPLETED):**
1. ✅ #2 - Delete duplicate files (DONE)
2. ✅ #1 - Decide on ClubPage redesign (DEFERRED to Q1 2026)
3. ✅ #5 - Delete unused components (DONE)
4. ✅ #3 - Investigate & fix broadcast data issue (DONE)

**Day 2 - Next Session (1-2 hours):**
5. #4 - Fix hook dependencies (10 min)
6. #6 - Clean up console logs (15 min)
7. #7 - Organize diagnostic scripts (30 min)

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
- **2025-11-03:** Fixed broadcaster filter in sync scripts - added NOW TV (251) and Amazon Prime UK (458) country IDs

### Context from Recent Work:
- 2025-11-03: ✅ **Broadcast data issue FIXED** - 70% of Nov fixtures were missing broadcaster data
- 2025-11-03: Root cause was sync script filtering out NOW TV and Amazon Prime broadcasts
- 2025-11-03: Updated both sync scripts and re-synced all fixtures successfully
- 2025-11-03: ClubPage integration caused webpack to hang with no error messages
- 2025-11-03: Multiple failed attempts visible in git history (5+ reverts)
- 2025-11-03: Decision made to cut losses and focus on solvable problems
- 2025-10-28: Multiple ClubPage reverts due to missing dependencies

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
