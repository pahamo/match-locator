# Broadcaster Data Flow Analysis

## Executive Summary

**Verdict**: ✅ **The API data is clean and correct.** We ARE manipulating it, but the manipulations are mostly justified.

---

## Data Flow Overview

### Step 1: SportMonks API (Source of Truth)
**Status**: ✅ CLEAN, CORRECT, COMPLETE

- **Fixture 6057** returns **418 TV station records**
- Includes ALL countries where match is broadcast globally
- Examples: Sky Go (UK), beIN Sports (Middle East), SuperSport (Africa), etc.
- Data structure is perfect - no issues at source

**Key Insight**: The API doesn't tell us which is the "primary" broadcaster - it just lists ALL platforms showing the match.

---

## Step 2: Our Filtering (UK-Only)
**Status**: ⚠️ DATA MANIPULATION - BUT JUSTIFIED

### What We Filter Out:
- International broadcasters (beIN Sports, SuperSport, etc.)
- Non-UK Sky channels (Sky Italia, Sky Deutschland)
- Result: 418 records → ~6 UK records

###  Justification:
- Site is UK-focused
- Users don't care about international broadcasts
- Reduces data noise

### ⚠️ Potential Issue:
- If we expand internationally, we'll need to remove/adjust this filter

---

## Step 3: Provider Mapping
**Status**: ✅ GOOD - Logical grouping

### What We Do:
- Map individual channels to providers:
  - Sky Go, Sky Ultra HD, Sky Sports PL → **Sky Sports** (ID: 1)
  - TNT Sports 1, TNT Sports 2, etc. → **TNT Sports** (ID: 2)
  - BBC iPlayer, BBC Sport → **BBC** (ID: 3)
  - Amazon Prime Video → **Amazon Prime** (ID: 4)

### ✅ Justification:
- Users think in terms of providers, not individual channels
- Makes data more useful
- Channels within same provider offer same content

---

## Step 4: Database Storage
**Status**: ✅ EXCELLENT - Full data preserved

### What We Store:
- ALL UK broadcasts (6 records for fixture 6057)
- Original channel names preserved
- SportMonks IDs preserved
- Provider IDs added

### ✅ Strength:
- Complete data trail
- Can query all broadcasts if needed
- No data loss at this stage

---

## Step 5: View Selection (THE PROBLEM AREA)
**Status**: ⚠️ **SIGNIFICANT DATA MANIPULATION - QUESTIONABLE**

### What We Do:
Fixture 6057 has 6 broadcasts:
1. Sky Go (Provider: Sky Sports)
2. Sky Ultra HD (Provider: unmapped)
3. TNT Sports 1 (Provider: TNT Sports) ← **Selected by view**
4. Skylink (Provider: unmapped)
5. Sky+ (Provider: unmapped)
6. Amazon Prime Video (Provider: Amazon)

**View picks ONE using priority**: TNT > Sky > BBC > Amazon

### 🚨 Critical Issues:

#### Issue A: Arbitrary Priority
- **Why is TNT > Sky?** No clear rationale
- Sky Sports has more subscribers in UK
- Sky often has PRIMARY broadcast rights
- Decision appears arbitrary

#### Issue B: Hides Valid Options
- User might have Sky but not TNT
- User might prefer Amazon (no ads)
- We're making viewing choice for them

#### Issue C: No "Primary Broadcaster" Indicator
- SportMonks API doesn't flag primary vs simulcast
- We're guessing which is primary
- Match might actually be "co-exclusive" to multiple platforms

---

## The Reality Check

### Fixture 6057: Arsenal vs Nottingham Forest (13 Sept 2025)

**What actually happened:**
- Match WAS on TNT Sports 1 (linear TV)
- Match WAS ALSO on Sky Go (streaming)
- Match WAS ALSO on Amazon Prime (streaming)

**All three are correct!** The match was simulcast.

### The Question:
**Which should we show users?**

---

## Recommendations

### Option 1: Research Actual Broadcast Rights ⭐ RECOMMENDED

**Approach:**
- For Premier League: Sky Sports and TNT Sports share rights
- Research which fixtures are exclusive vs shared
- Add "primary_broadcaster" flag to broadcasts table
- Manual curation initially, automate later

**Priority order:**
```
1. Primary rights holder (exclusive)
2. Sky Sports (largest subscriber base)
3. TNT Sports (Champions League primary)
4. Amazon Prime (selective games)
5. BBC (highlights/special games)
```

**Pros:**
- Most accurate
- Respects actual broadcast agreements
- Better user experience

**Cons:**
- Requires research/maintenance
- Rights change each season

---

### Option 2: Show ALL Broadcasters

**Approach:**
- Change view to return array of broadcasters
- UI shows: "Watch on: Sky Sports, TNT Sports, Amazon"
- Let users choose their platform

**Pros:**
- Complete information
- No arbitrary decisions
- Users find their platform

**Cons:**
- More complex UI
- Takes more space
- Might confuse casual users

---

### Option 3: User Preference System

**Approach:**
- User selects: "I have: [Sky] [TNT] [Amazon]"
- App prioritizes their available services
- Falls back to most common if not set

**Pros:**
- Personalized experience
- Best UX
- Respects user's subscriptions

**Cons:**
- Most complex implementation
- Requires user account/local storage
- Not useful for first-time visitors

---

### Option 4: Keep Current with Adjusted Priority

**Approach:**
- Change priority to: **Sky > TNT > Amazon > BBC**
- Rationale: Sky has most subscribers + often primary rights

**Pros:**
- Minimal change
- Sky is most common
- Simple to maintain

**Cons:**
- Still arbitrary
- Still hides options
- Not always correct

---

## Conclusion

###  What We're Doing Right:
1. ✅ API data is clean (no issues there)
2. ✅ UK filtering is justified
3. ✅ Provider mapping is logical
4. ✅ Database preserves all data

### ⚠️ What Needs Improvement:
1. **View selection priority is arbitrary**
2. **We're hiding valid viewing options**
3. **No research into actual broadcast rights**

### 🎯 Recommended Action:

**SHORT TERM:**
1. Change priority to: **Sky > TNT > Amazon > BBC** (reflects UK market reality)
2. Add note in UI: "Also available on..." if multiple

**MEDIUM TERM:**
1. Research Premier League broadcast rights hierarchy
2. Add "primary_broadcaster" flag to database
3. Show multiple broadcasters in UI

**LONG TERM:**
1. Consider user preference system
2. Let users select available services
3. Personalized broadcaster recommendations

---

## Final Verdict

✅ **The API data is perfect** - no manipulation needed there

⚠️ **Our filtering is justified** - UK-only focus is reasonable

🚨 **Our view selection needs work** - priority order is questionable

**Recommendation**: Change priority to **Sky > TNT** and consider showing multiple broadcasters in UI.
