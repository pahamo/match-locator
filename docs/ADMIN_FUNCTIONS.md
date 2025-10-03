# Admin Functions - Critical Documentation

## Environment Variables (PRODUCTION)
**NEVER CHANGE THESE NAMES - THEY ARE SET IN NETLIFY**
- `REACT_APP_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (NOT SUPABASE_SERVICE_KEY)

## Database Schema Requirements
- `broadcasts` table does NOT have unique constraint on `fixture_id`
- Must use UPDATE/INSERT pattern, NOT upsert with onConflict
- `teams` table does NOT have `home_venue` column

## Critical Functions
1. **save-broadcaster.js** - Updates match broadcaster assignments
   - Uses UPDATE then INSERT if no rows affected
   - Environment: `SUPABASE_SERVICE_ROLE_KEY`

2. **update-team-slug.js** - Updates team slugs
   - Environment: `SUPABASE_SERVICE_ROLE_KEY`

## When Adding New Functions
1. ALWAYS use `SUPABASE_SERVICE_ROLE_KEY` (not SUPABASE_SERVICE_KEY)
2. NEVER assume upsert with onConflict will work
3. Test with the existing test-broadcaster function first
4. Check this document before making changes

## Last Broken: September 2025
## Root Causes:
- Environment variable name mismatch (SERVICE_KEY vs SERVICE_ROLE_KEY)
- Database constraint assumption (upsert onConflict failed)
- Insufficient testing of actual production environment