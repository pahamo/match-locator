# Team URL Slug Migration

This document describes the smart team slug generation and migration system.

## Overview

We're upgrading from basic team slugs (like `arsenal-fc`, `manchester-united-fc`) to smart, shortened slugs that are more user-friendly while maintaining identity (like `arsenal`, `man-united`).

## Implementation

### 1. Database Changes
- Added `url_slug` column to `teams` table
- Column is nullable to allow gradual migration
- Unique index on `url_slug` where not null

### 2. Smart Slug Generation Rules

**Special Cases:**
- Manchester United → `man-united` (not just "united")
- Manchester City → `man-city` (not just "city")
- Newcastle United → `newcastle-united` (keep full identity)
- Leeds United → `leeds-united` (keep full identity)
- AC Milan → `milan` (remove AC prefix)
- FC Barcelona → `barcelona` (remove FC prefix)
- Wolverhampton Wanderers → `wolves`
- Tottenham Hotspur → `tottenham`
- Nottingham Forest → `forest`

**General Rules:**
- Use `short_name` field as starting point
- Remove redundant suffixes like "-fc" but keep "-united", "-city", "-town" when they're part of identity
- Remove prefixes like "AC", "FC", "AS" for European teams
- When multiple teams could have same name, keep distinguishing part
- Handle conflicts by appending team ID

### 3. Migration Scripts

**Generate New Slugs:**
```bash
# Update your .env file with credentials first
node scripts/update-team-slugs.js
```

**Update Redirects:**
```bash
node scripts/update-redirects.js
```

### 4. Application Updates

**Updated Components:**
- `ClubPage.tsx` - Now handles both old and new slugs, redirects automatically
- `ClubCard.tsx` - Uses new `getTeamUrlSlug()` utility
- `MatchPage.tsx` - Team links use new slugs
- `generate_sitemaps.mjs` - Sitemap generation uses new slugs

**New Utilities:**
- `src/utils/slugUtils.ts` - Utility functions for slug handling
  - `getTeamUrlSlug(team)` - Get preferred slug for links
  - `teamMatchesSlug(team, slug)` - Check if team matches a slug
  - `getPreferredSlug(team)` - Alias for getTeamUrlSlug

### 5. Redirect System

**Netlify Functions:**
- `generate-team-redirects.js` - API endpoint to get redirect mappings
- `update-team-url-slug.js` - Update individual team slug

**Static Redirects:**
- `public/_redirects` - Contains redirect rules for old → new URLs
- Automatically redirects `/clubs/old-slug` → `/club/new-slug`
- General redirect from `/clubs/:slug` → `/club/:slug`

### 6. Backward Compatibility

The system maintains full backward compatibility:
- Old slugs continue to work
- Database queries check both `slug` and `url_slug` fields
- Automatic 301 redirects from old to new URLs
- ClubPage component handles both formats

### 7. Environment Setup

Required environment variables:
```
REACT_APP_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 8. Testing

After migration:
1. Test old URLs redirect properly: `/clubs/arsenal-fc` → `/club/arsenal`
2. Verify new URLs work: `/club/man-united`
3. Check sitemap generation includes new URLs
4. Confirm all team links in app use new slugs

### 9. Rollback Plan

If issues arise:
1. Remove `url_slug` values from database: `UPDATE teams SET url_slug = NULL;`
2. Remove redirects from `_redirects` file
3. Revert application code changes

The system gracefully falls back to old slugs when `url_slug` is null.

## Files Modified

- `src/types/index.ts` - Added `url_slug` field to Team interface
- `src/services/supabase.ts` - Updated queries and filtering logic
- `src/pages/ClubPage.tsx` - Added redirect logic and slug utilities
- `src/design-system/components/ClubCard.tsx` - Uses new slug utilities
- `src/pages/MatchPage.tsx` - Team links use new slugs
- `scripts/generate_sitemaps.mjs` - Uses new slugs in sitemap
- `public/_redirects` - Redirect rules for old URLs

## Files Created

- `src/utils/slugUtils.ts` - Slug utility functions
- `scripts/update-team-slugs.js` - Slug generation and migration
- `scripts/update-redirects.js` - Redirect file generation
- `netlify/functions/generate-team-redirects.js` - Redirect API
- `netlify/functions/update-team-url-slug.js` - Individual slug updates
- `netlify/functions/add-url-slug-column.js` - Database column creation
- `netlify/functions/generate-smart-slugs.js` - Bulk slug generation