# Fixture ID Routing - QA Testing & Verification Guide

> **Last Updated:** October 2025
> **Related Changes:** Fixture ID routing implementation to eliminate daily H2H page breakages

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What Changed](#what-changed)
3. [Testing Checklist](#testing-checklist)
4. [Edge Cases & Robustness](#edge-cases--robustness)
5. [Performance Verification](#performance-verification)
6. [Rollback Procedure](#rollback-procedure)
7. [Monitoring & Alerts](#monitoring--alerts)

---

## Overview

### Problem Solved
H2H pages were breaking daily due to slug mismatches between database team names and URL slugs.

**Example Failures:**
- URL: `/h2h/arsenal-vs-west-ham`
- Database: `west-ham-united`
- Result: "No fixtures found for this matchup" ❌

### Solution Implemented
**Fixture ID Architecture** - Use stable database IDs internally, redirect to SEO-friendly URLs

**Flow:**
```
User clicks Info → /h2h/54321 → Load fixture by ID → Extract team slugs →
Redirect to /h2h/arsenal-vs-west-ham-united → Load H2H page
```

### Files Changed
1. **src/design-system/components/FixtureCard.tsx** - URL generation
2. **src/components/SmartFixtureRouter.tsx** - Route detection
3. **src/pages/HeadToHeadPage.tsx** - Fixture ID loading & redirect
4. **src/services/TeamResolver.ts** - Simplified (65% code reduction)

---

## What Changed

### Before (Slug-Based Routing)
```typescript
// FixtureCard generated slug-based URLs
const h2hUrl = `/h2h/${homeSlug}-vs-${awaySlug}`;

// HeadToHeadPage matched slugs against database
const teams = await TeamResolver.resolve(slug1, slug2);
// ❌ Failed when slugs didn't match exactly
```

### After (Fixture ID Routing)
```typescript
// FixtureCard generates fixture ID URLs
const h2hUrl = `/h2h/${fixture.id}`;

// HeadToHeadPage loads fixture by ID
const fixture = await supabase
  .from('fixtures_with_teams')
  .eq('id', fixtureId)
  .single();
// ✅ Always works - IDs are stable

// Redirects to SEO-friendly URL
window.location.replace(`/h2h/${team1Slug}-vs-${team2Slug}`);
```

### Breaking Changes
**None** - Backward compatible with existing slug-based URLs

### New Behavior
- Info buttons now navigate to `/h2h/[fixture-id]` first
- Page immediately redirects to `/h2h/team1-vs-team2`
- User sees clean URL in browser (~50-100ms redirect)

---

## Testing Checklist

### ✅ Functional Testing

#### Test 1: Fixture ID Redirect Flow
**Steps:**
1. Navigate to homepage: https://matchlocator.com
2. Find any fixture with "Info" button
3. Click "Info" button
4. Observe URL in address bar

**Expected Results:**
- [ ] URL briefly shows `/h2h/[number]` (fixture ID)
- [ ] URL changes to `/h2h/team1-vs-team2` within 200ms
- [ ] Page loads correctly with all fixtures
- [ ] No console errors
- [ ] Browser history works correctly (back button)

**Test Fixtures:**
- [ ] Premier League: Arsenal vs Chelsea
- [ ] Champions League: Liverpool vs Real Madrid
- [ ] Europa League: Manchester United vs Barcelona
- [ ] Blackout match: Any fixture marked as blackout

---

#### Test 2: Legacy Slug URLs (Backward Compatibility)
**Steps:**
1. Navigate directly to: `/h2h/arsenal-vs-chelsea`
2. Verify page loads without redirect
3. Check all fixtures display

**Expected Results:**
- [ ] Page loads immediately (no redirect)
- [ ] All H2H fixtures between teams display
- [ ] Statistics show correctly
- [ ] No console errors
- [ ] SEO meta tags are correct

**Test URLs:**
```
https://matchlocator.com/h2h/arsenal-vs-chelsea
https://matchlocator.com/h2h/liverpool-vs-manchester-united
https://matchlocator.com/h2h/manchester-city-vs-tottenham-hotspur
https://matchlocator.com/h2h/newcastle-united-vs-west-ham-united
```

---

#### Test 3: Legacy Match URL Redirects
**Steps:**
1. Navigate to old match URL: `/matches/123-arsenal-vs-liverpool-premier-league-2025-01-15`
2. Verify redirect to H2H page

**Expected Results:**
- [ ] URL redirects to `/h2h/arsenal-vs-liverpool`
- [ ] Page loads correctly
- [ ] No 404 errors
- [ ] Console shows redirect message

---

#### Test 4: Edge Cases - Non-Existent Fixtures
**Steps:**
1. Navigate to: `/h2h/999999999` (non-existent fixture ID)
2. Check error handling

**Expected Results:**
- [ ] Shows "Fixture not found" error message
- [ ] Page doesn't crash
- [ ] User sees clear error with navigation options
- [ ] No infinite loading state

---

#### Test 5: Edge Cases - Malformed URLs
**Steps:**
1. Navigate to: `/h2h/invalid-slug-format`
2. Navigate to: `/h2h/team1-vs-` (incomplete)
3. Navigate to: `/h2h/` (empty)

**Expected Results:**
- [ ] Shows appropriate error message
- [ ] Page doesn't crash
- [ ] Error is logged (check console)
- [ ] User can navigate away

---

### ✅ Cross-Browser Testing

#### Desktop Browsers
- [ ] **Chrome** (v120+): Fixture ID flow works
- [ ] **Firefox** (v120+): Fixture ID flow works
- [ ] **Safari** (v17+): Fixture ID flow works
- [ ] **Edge** (v120+): Fixture ID flow works

#### Mobile Browsers
- [ ] **iOS Safari**: Redirect works, no layout issues
- [ ] **Chrome Mobile**: Redirect works, buttons tappable
- [ ] **Samsung Internet**: Redirect works

**Testing Method:**
1. Open https://matchlocator.com on each browser
2. Click any "Info" button
3. Verify redirect happens within 200ms
4. Check page renders correctly

---

### ✅ Performance Testing

#### Redirect Performance
**Steps:**
1. Open Chrome DevTools → Network tab
2. Click "Info" button on fixture
3. Measure time from click to final page load

**Expected Results:**
- [ ] Initial request: `/h2h/54321` completes in <50ms
- [ ] Redirect request: `/h2h/team1-vs-team2` completes in <100ms
- [ ] Total time: <200ms from click to final page load
- [ ] No unnecessary requests
- [ ] No failed requests (all 200 OK)

**Performance Benchmarks:**
```
Fixture ID query:        <30ms  (single row by primary key)
Redirect execution:      <10ms  (window.location.replace)
H2H fixtures query:      <100ms (indexed query)
Page render:             <50ms  (React render)
-------------------------------------------
Total:                   ~200ms (acceptable)
```

---

#### Memory Leaks
**Steps:**
1. Open Chrome DevTools → Performance → Memory
2. Take heap snapshot
3. Click Info buttons on 10 different fixtures
4. Take another heap snapshot
5. Compare memory usage

**Expected Results:**
- [ ] Memory usage increases by <5MB
- [ ] No detached DOM nodes
- [ ] No leaked event listeners
- [ ] Garbage collection reclaims memory

---

### ✅ SEO Verification

#### Meta Tags
**Steps:**
1. Navigate to `/h2h/arsenal-vs-chelsea`
2. View page source
3. Check meta tags

**Expected Results:**
- [ ] Title: "Arsenal vs Chelsea - Head to Head | Match Locator"
- [ ] Description: Contains match info and fixture count
- [ ] Canonical URL: `https://matchlocator.com/h2h/arsenal-vs-chelsea`
- [ ] Open Graph tags present
- [ ] Twitter Card tags present

#### Google Search Console
**Monitor (over 2 weeks):**
- [ ] No increase in crawl errors
- [ ] No duplicate content issues
- [ ] Indexing rate remains stable
- [ ] No drop in impressions for H2H pages

---

### ✅ Database Testing

#### Fixture Query Performance
**Steps:**
1. Run query: `EXPLAIN ANALYZE SELECT * FROM fixtures_with_teams WHERE id = 54321;`
2. Check execution time

**Expected Results:**
- [ ] Uses index scan (not seq scan)
- [ ] Execution time: <10ms
- [ ] Returns 1 row
- [ ] No table locks

#### RLS Policy Verification
**Steps:**
1. Test with anon key: `SELECT * FROM fixtures_with_teams WHERE id = 54321;`
2. Verify public read access works

**Expected Results:**
- [ ] Query succeeds with anon key
- [ ] Returns fixture data with team info
- [ ] home_slug and away_slug fields present
- [ ] No permission denied errors

---

## Edge Cases & Robustness

### Edge Case 1: Team Slug Changes in Database
**Scenario:** Admin updates team slug from `west-ham` to `west-ham-united`

**Expected Behavior:**
- ✅ Fixture ID URLs still work (IDs unchanged)
- ✅ Old slug URLs may break (acceptable - rare scenario)
- ✅ New redirects use updated slug
- ✅ Google reindexes to new canonical URL

**Test:**
1. Update team slug in database
2. Click Info button on fixture with that team
3. Verify redirect uses new slug
4. Old slug URL shows "No fixtures found" (expected)

**Mitigation:** Run slug migration script to update all references

---

### Edge Case 2: Fixtures Deleted from Database
**Scenario:** Admin deletes fixture with ID 12345

**Expected Behavior:**
- ✅ Fixture ID URL shows "Fixture not found"
- ✅ No infinite loading
- ✅ No JavaScript errors
- ✅ User can navigate away

**Test:**
1. Manually delete a fixture (in test database)
2. Navigate to `/h2h/[deleted-id]`
3. Verify error handling

---

### Edge Case 3: Race Conditions (Multiple Rapid Clicks)
**Scenario:** User rapidly clicks multiple Info buttons

**Expected Behavior:**
- ✅ Each redirect completes independently
- ✅ No state conflicts
- ✅ Final URL matches last clicked fixture
- ✅ No memory leaks

**Test:**
1. Click 5 Info buttons rapidly (1 click per 100ms)
2. Observe behavior
3. Check console for errors

---

### Edge Case 4: Bookmarked Fixture ID URLs
**Scenario:** User bookmarks `/h2h/12345` and visits later

**Expected Behavior:**
- ✅ Bookmark works (redirects to SEO URL)
- ✅ Redirect happens automatically
- ✅ User sees correct H2H page

**Test:**
1. Bookmark a fixture ID URL
2. Clear browser cache
3. Visit bookmark
4. Verify redirect and page load

---

### Edge Case 5: Database Connection Failure
**Scenario:** Supabase connection fails during fixture ID query

**Expected Behavior:**
- ✅ Shows "Failed to load fixtures. Please try again later."
- ✅ Error is logged
- ✅ No redirect happens
- ✅ User can retry (refresh)

**Test:**
1. Temporarily break Supabase connection (invalid API key)
2. Click Info button
3. Verify error handling
4. Restore connection
5. Refresh and verify recovery

---

## Performance Verification

### Lighthouse Scores
**Target Scores:**
- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: >95

**Test Pages:**
- [ ] `/h2h/arsenal-vs-chelsea`
- [ ] `/h2h/liverpool-vs-manchester-united`
- [ ] `/h2h/manchester-city-vs-tottenham-hotspur`

**Run Command:**
```bash
npx lighthouse https://matchlocator.com/h2h/arsenal-vs-chelsea --view
```

---

### Core Web Vitals
**Targets:**
- LCP (Largest Contentful Paint): <2.5s
- FID (First Input Delay): <100ms
- CLS (Cumulative Layout Shift): <0.1

**Monitoring:**
- Use Google Search Console → Core Web Vitals report
- Monitor for 2 weeks after deployment
- Check for any regressions

---

### Bundle Size
**Check JavaScript bundle size:**
```bash
npm run build
# Check build/static/js/main.[hash].js size
```

**Expected:**
- [ ] Main bundle: <300KB gzipped
- [ ] No significant size increase from changes
- [ ] Code splitting working correctly
- [ ] Lazy loading HeadToHeadPage

---

## Rollback Procedure

### If Critical Issues Arise

#### Step 1: Immediate Rollback (via Netlify)
```bash
# Rollback to previous deployment
netlify rollback
```

**Or in Netlify Dashboard:**
1. Go to Deploys → Deployment History
2. Find previous working deployment
3. Click "Publish deploy"

**Expected Time:** <2 minutes

---

#### Step 2: Code Rollback (if needed)
```bash
# Revert the fixture ID changes
git revert HEAD~3..HEAD  # Adjust number based on commits
git push origin main
```

**Changed Files to Revert:**
- src/design-system/components/FixtureCard.tsx
- src/components/SmartFixtureRouter.tsx
- src/pages/HeadToHeadPage.tsx

---

#### Step 3: Verify Rollback
- [ ] Homepage loads fixtures correctly
- [ ] Info buttons work (using old slug-based approach)
- [ ] H2H pages load without errors
- [ ] No console errors

---

### Known Issues & Workarounds

**Issue 1: Redirect causes brief flash**
- **Severity:** Low (cosmetic)
- **Workaround:** Add loading skeleton during redirect
- **Future Fix:** Implement server-side redirects (Netlify Edge Functions)

**Issue 2: Browser history includes fixture ID URL**
- **Severity:** Low (UX minor annoyance)
- **Workaround:** Use `window.location.replace()` (already implemented)
- **Status:** Resolved - replaces history, back button works correctly

---

## Monitoring & Alerts

### Key Metrics to Monitor

#### Error Rates (Daily)
- [ ] 404 errors on `/h2h/*` routes
- [ ] "Fixture not found" error frequency
- [ ] JavaScript console errors
- [ ] Failed Supabase queries

**Alert Threshold:** >5% increase from baseline

---

#### Performance Metrics (Weekly)
- [ ] Average redirect time
- [ ] H2H page load time
- [ ] Bounce rate on H2H pages
- [ ] Time on page

**Alert Threshold:** >20% regression

---

#### SEO Metrics (Bi-weekly)
- [ ] Google Search Console indexing status
- [ ] Crawl errors on H2H pages
- [ ] Search impressions for H2H keywords
- [ ] Click-through rate on H2H results

**Alert Threshold:** >10% drop in impressions

---

### Monitoring Tools

**1. Browser Console**
```javascript
// Check for errors
console.log('Fixture ID routing test');

// Monitor redirects
window.addEventListener('beforeunload', (e) => {
  console.log('Redirecting from:', window.location.href);
});
```

**2. Supabase Dashboard**
- Monitor query performance
- Check RLS policy hits
- Verify connection pool usage

**3. Netlify Analytics**
- Track page views on `/h2h/[id]` patterns
- Monitor redirect response times
- Check bandwidth usage

---

## Success Criteria

### Deployment Successful If:
- ✅ All functional tests pass
- ✅ Performance within acceptable range (<200ms redirect)
- ✅ Zero increase in error rates
- ✅ Backward compatibility confirmed (legacy URLs work)
- ✅ Cross-browser testing passed
- ✅ SEO meta tags correct
- ✅ No memory leaks detected
- ✅ User feedback positive (no complaints about broken pages)

---

## Post-Deployment Checklist

### Immediate (First 24 Hours)
- [ ] Monitor Supabase logs for errors
- [ ] Check Netlify function logs
- [ ] Review Google Search Console for crawl errors
- [ ] Test on production with real fixtures
- [ ] Monitor user feedback channels

### Short-term (First Week)
- [ ] Daily check of error rates
- [ ] Performance monitoring (Lighthouse)
- [ ] User behavior analysis (analytics)
- [ ] SEO ranking checks for key H2H pages

### Long-term (First Month)
- [ ] Weekly SEO performance review
- [ ] Core Web Vitals monitoring
- [ ] User engagement metrics (time on page, bounce rate)
- [ ] Conversion rate tracking (if applicable)

---

## QA Sign-Off

### Lead Developer Review
- [ ] Code changes reviewed and documented
- [ ] Architecture documented in ARCHITECTURE.md
- [ ] Inline comments added to key functions
- [ ] TypeScript types verified
- [ ] No console warnings or errors

**Reviewer:** _______________
**Date:** _______________

---

### QA Testing Complete
- [ ] All functional tests passed
- [ ] Cross-browser testing complete
- [ ] Performance benchmarks met
- [ ] Edge cases handled correctly
- [ ] Rollback procedure tested

**QA Tester:** _______________
**Date:** _______________

---

### Production Deployment Approved
- [ ] All tests passed
- [ ] Monitoring in place
- [ ] Rollback procedure documented
- [ ] Team notified of changes

**Approved By:** _______________
**Date:** _______________

---

**Document Version:** 1.0
**Last Updated:** October 2025
**Related Docs:** [ARCHITECTURE.md](ARCHITECTURE.md), [SECURITY_IMPLEMENTATION.md](../database/SECURITY_IMPLEMENTATION.md)
