# Team Pages Fix - Summary Report

## Problem
7 Premier League teams had no fixtures displayed on their pages:
- Bournemouth
- Brighton
- Manchester City
- Manchester United
- Nottingham Forest
- Tottenham
- Wolves

Example: https://matchlocator.com/clubs/bournemouth showed "No upcoming fixtures found"

## Root Cause Analysis

### Issue 1: Missing Sportmonks Team IDs
All 7 teams were missing their `sportmonks_team_id` in the database, which prevented the fixture sync scripts from fetching their data.

### Issue 2: Duplicate Team Records
Each of the 7 teams had **duplicate records** in the `teams` table:

| Canonical Team (slug) | ID | Duplicate Team | ID | Fixtures Location |
|----------------------|-----|----------------|-----|-------------------|
| `bournemouth` | 20 | `afc-bournemouth` | 306 | Duplicate (84) |
| `brighton` | 17 | `brighton-hove-albion` | 384 | Duplicate (38) |
| `man-city` | 7 | `manchester-city` | 279 | Duplicate (46) |
| `man-united` | 8 | `manchester-united` | 225 | Duplicate (38) |
| `forest` | 15 | `nottingham-forest` | 365 | Duplicate (93) |
| `tottenham` | 11 | `tottenham-hotspur` | 214 | Duplicate (46) |
| `wolves` | 12 | `wolverhampton-wanderers` | 302 | Duplicate (38) |

**The Problem**:
- URLs like `/clubs/bournemouth` were looking for team ID 20
- But all fixtures were assigned to team ID 306 (the duplicate)
- Result: 0 fixtures found for the canonical team

## Solution Implemented

### Step 1: Add Sportmonks Team IDs
Updated the 7 teams with their correct Sportmonks team IDs:

```sql
UPDATE teams SET sportmonks_team_id = 52 WHERE slug = 'bournemouth';     -- AFC Bournemouth
UPDATE teams SET sportmonks_team_id = 78 WHERE slug = 'brighton';        -- Brighton & Hove Albion
UPDATE teams SET sportmonks_team_id = 9 WHERE slug = 'man-city';         -- Manchester City
UPDATE teams SET sportmonks_team_id = 14 WHERE slug = 'man-united';      -- Manchester United
UPDATE teams SET sportmonks_team_id = 63 WHERE slug = 'forest';          -- Nottingham Forest
UPDATE teams SET sportmonks_team_id = 6 WHERE slug = 'tottenham';        -- Tottenham Hotspur
UPDATE teams SET sportmonks_team_id = 29 WHERE slug = 'wolves';          -- Wolverhampton Wanderers
```

### Step 2: Merge Duplicate Teams
Migrated all fixtures from duplicate team IDs to canonical team IDs:

```javascript
// For each team:
// 1. UPDATE fixtures SET home_team_id = <canonical_id> WHERE home_team_id = <duplicate_id>
// 2. UPDATE fixtures SET away_team_id = <canonical_id> WHERE away_team_id = <duplicate_id>
// 3. DELETE FROM teams WHERE id = <duplicate_id>
```

Results:
- ✅ Bournemouth: 84 fixtures migrated
- ✅ Brighton: 38 fixtures migrated
- ✅ Man City: 46 fixtures migrated
- ✅ Man United: 38 fixtures migrated
- ✅ Forest: 93 fixtures migrated
- ✅ Tottenham: 46 fixtures migrated
- ✅ Wolves: 38 fixtures migrated

### Step 3: Verification
All 7 teams now display fixtures correctly:

```
✅ bournemouth  | 3+ upcoming fixtures | Next: vs Nottingham Forest on 26 Oct
✅ brighton     | 3+ upcoming fixtures | Next: vs Manchester United on 25 Oct
✅ man-city     | 3+ upcoming fixtures | Next: vs Aston Villa on 26 Oct
✅ man-united   | 3+ upcoming fixtures | Next: vs Brighton on 25 Oct
✅ forest       | 3+ upcoming fixtures | Next: vs Bournemouth on 26 Oct
✅ tottenham    | 3+ upcoming fixtures | Next: vs Everton on 26 Oct
✅ wolves       | 3+ upcoming fixtures | Next: vs Burnley on 26 Oct
```

## Scripts Created

All diagnostic and fix scripts are located in `scripts/diagnostics/`:

1. `check-bournemouth-data.mjs` - Check team data and fixtures for Bournemouth
2. `check-all-pl-teams.mjs` - Check all Premier League teams for fixture counts
3. `check-sportmonks-ids.mjs` - Check Sportmonks team IDs for all teams
4. `find-sportmonks-team-ids.mjs` - Find correct Sportmonks IDs via API
5. `update-missing-team-ids.mjs` - Update database with correct Sportmonks IDs
6. `find-duplicate-teams.mjs` - Identify duplicate team records
7. `merge-duplicate-teams.mjs` - **Main fix script** - Merge duplicates and migrate fixtures
8. `verify-all-teams.mjs` - Verify all 7 teams now have fixtures

## Test URLs

All these URLs now work correctly:
- https://matchlocator.com/clubs/bournemouth
- https://matchlocator.com/clubs/brighton
- https://matchlocator.com/clubs/man-city
- https://matchlocator.com/clubs/man-united
- https://matchlocator.com/clubs/forest
- https://matchlocator.com/clubs/tottenham
- https://matchlocator.com/clubs/wolves

## Future Prevention

To prevent this issue in the future:

1. **Add unique constraint** on `sportmonks_team_id` in the `teams` table
2. **Add slug validation** to prevent duplicate slugs with different formats
3. **Update sync scripts** to handle team deduplication automatically
4. **Monitor team count** - should always be 20 teams for Premier League

## Files Modified

- `scripts/diagnostics/` - 8 new diagnostic/fix scripts created
- Database: `teams` table - 7 duplicates removed, 7 teams updated with Sportmonks IDs
- Database: `fixtures` table - 383 fixture records updated with correct team IDs

## Status

✅ **FIXED** - All 7 team pages now display fixtures correctly
✅ **VERIFIED** - All teams have upcoming fixtures and correct data
✅ **DOCUMENTED** - Full diagnostic scripts available for future reference

---

**Date**: 2025-10-24
**Total Time**: ~30 minutes
**Impact**: Fixed 7 broken team pages affecting ~35% of Premier League teams
