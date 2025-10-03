# H2H Pages Validation Checklist

## 🎯 **Post-Streamlining Validation**

After implementing the 3-phase streamlining system, these H2H URLs should now work correctly without "Team not found" errors.

### ✅ **URLs to Test**

#### **Previously Broken URLs (Should now work)**
- [ ] `/h2h/afc-bournemouth-vs-aston-villa` → Should load or redirect to canonical
- [ ] `/h2h/brentford-vs-manchester-united` → Should redirect to `/h2h/brentford-vs-man-united`
- [ ] `/h2h/brighton-hove-albion-vs-chelsea` → Should redirect to `/h2h/brighton-vs-chelsea`
- [ ] `/h2h/manchester-united-vs-arsenal` → Should redirect to `/h2h/arsenal-vs-man-united`
- [ ] `/h2h/manchester-city-vs-liverpool` → Should redirect to `/h2h/liverpool-vs-man-city`

#### **Canonical Format URLs (Should work directly)**
- [ ] `/h2h/arsenal-vs-man-united` → Should load directly
- [ ] `/h2h/chelsea-vs-man-city` → Should load directly
- [ ] `/h2h/liverpool-vs-tottenham` → Should load directly

#### **Edge Cases to Test**
- [ ] `/h2h/man-united-vs-arsenal` → Should redirect to `/h2h/arsenal-vs-man-united` (alphabetical)
- [ ] `/h2h/brighton-vs-brighton-hove-albion` → Should handle gracefully
- [ ] `/h2h/invalid-team-vs-arsenal` → Should show proper error message

### 🔍 **What to Check For**

#### **Functionality**
- [ ] **No "Team not found" errors** on valid team combinations
- [ ] **Proper redirects** to canonical format (alphabetical order)
- [ ] **Correct team names** displayed in page headers
- [ ] **Fixtures loaded** for the matchup (if they exist)
- [ ] **Provider names** show correctly (e.g., "Sky Sports" not "Provider 999")

#### **Performance**
- [ ] **Page loads quickly** (should benefit from 5-minute team caching)
- [ ] **No repeated API calls** in Network tab
- [ ] **Smooth redirects** without flickering

#### **SEO/URLs**
- [ ] **Clean canonical URLs** in address bar after redirects
- [ ] **Proper page titles** reflect the team matchup
- [ ] **Meta descriptions** are relevant

### 🚨 **Red Flags to Watch For**

- ❌ Any "Team not found" errors on valid Premier League teams
- ❌ Infinite redirect loops
- ❌ Provider numbers (999, 998) instead of names
- ❌ Slow page loads or repeated API calls
- ❌ Console errors related to team resolution
- ❌ URLs that don't redirect to canonical format

### 📊 **Expected Behavior Changes**

| **Before Streamlining** | **After Streamlining** |
|------------------------|------------------------|
| Static Netlify redirects | Dynamic JavaScript resolution |
| "Team not found" errors | Intelligent slug variation handling |
| Provider 999 displayed | "Sky Sports" displayed |
| Scattered lookup logic | Centralized TeamResolver service |
| No caching | 5-minute team cache |

### 🔧 **Debugging**

If issues are found:
1. **Check browser console** for JavaScript errors
2. **Check Network tab** for failed API requests
3. **Test in incognito mode** to rule out caching issues
4. **Check TeamResolver cache** in dev tools
5. **Verify database migration** completed successfully

### ✨ **Success Criteria**

The streamlining is successful if:
- ✅ **Zero "Team not found" errors** on valid team combinations
- ✅ **All URLs redirect** to proper canonical format
- ✅ **Provider names display** instead of numbers
- ✅ **Page loads are fast** due to caching
- ✅ **Admin tools work** with single slug system
- ✅ **No static redirects needed** in Netlify

---

**Testing Date:** ___________
**Tested By:** ___________
**Results:** ___________