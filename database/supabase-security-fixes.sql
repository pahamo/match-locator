-- =============================================================================
-- SUPABASE SECURITY FIXES
-- =============================================================================
--
-- PURPOSE: Fix 34 critical security issues identified in Supabase security scan
-- DATE: October 2025
-- AUTHOR: Match Locator Development Team
--
-- ISSUES ADDRESSED:
-- 1. SECURITY DEFINER Views (3 views) - Potential privilege escalation
-- 2. Missing Row Level Security (31 tables) - Unauthorized data access
--    - 5 App Tables: teams, fixtures, competitions, broadcasts, providers
--    - 27 Directus Tables: Reserved for future CMS integration
--
-- DEPLOYMENT INSTRUCTIONS:
-- 1. Review this entire script before running
-- 2. Run in Supabase SQL Editor on production database
-- 3. After running, test website functionality:
--    - Homepage fixture display
--    - H2H pages
--    - Admin panel access
-- 4. If issues arise, use rollback-security-fixes.sql
--
-- ADMIN ACCESS NOTE:
-- This app uses username/password admin auth (NOT Supabase auth).
-- Admin writes may need service_role key or policy adjustments.
-- See SECURITY_IMPLEMENTATION.md for details.
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: FIX SECURITY DEFINER VIEWS
-- -----------------------------------------------------------------------------
-- ISSUE: Views without explicit SECURITY INVOKER can cause privilege escalation
-- FIX: Recreate all views with SECURITY INVOKER to run with caller's privileges
-- IMPACT: Views will only show data the user is authorized to see
-- -----------------------------------------------------------------------------

-- View 1: fixtures_with_team_names_v
-- Purpose: Homepage fixture list with team names
-- Used by: Frontend fixture displays
DROP VIEW IF EXISTS public.fixtures_with_team_names_v CASCADE;

CREATE OR REPLACE VIEW public.fixtures_with_team_names_v
WITH (security_invoker = true)
AS
SELECT
  f.id,
  f.utc_kickoff,
  f.matchday,
  ht.name as home_team,
  at.name as away_team
FROM fixtures f
JOIN teams ht ON ht.id = f.home_team_id
JOIN teams at ON at.id = f.away_team_id;

COMMENT ON VIEW public.fixtures_with_team_names_v IS
'Homepage fixture list with team names. SECURITY INVOKER enforced - runs with caller privileges.';

-- View 2: fixtures_min_v
-- Purpose: Minimal fixture data for match pages
-- Used by: Match page headers
DROP VIEW IF EXISTS public.fixtures_min_v CASCADE;

CREATE OR REPLACE VIEW public.fixtures_min_v
WITH (security_invoker = true)
AS
SELECT
  f.id,
  f.utc_kickoff,
  f.home_team_id,
  f.away_team_id,
  f.venue,
  COALESCE(f.status, 'scheduled') as status,
  f.matchday
FROM fixtures f;

COMMENT ON VIEW public.fixtures_min_v IS
'Minimal fixture data for match pages. SECURITY INVOKER enforced - runs with caller privileges.';

-- View 3: broadcasts_with_provider_v
-- Purpose: Broadcast info with provider details
-- Used by: Match pages showing broadcast availability
DROP VIEW IF EXISTS public.broadcasts_with_provider_v CASCADE;

CREATE OR REPLACE VIEW public.broadcasts_with_provider_v
WITH (security_invoker = true)
AS
SELECT
  b.fixture_id,
  b.provider_id,
  b.channel_name,
  b.stream_type,
  b.verified,
  b.verified_at,
  p.display_name as provider_display_name
FROM broadcasts b
JOIN providers p ON p.id = b.provider_id;

COMMENT ON VIEW public.broadcasts_with_provider_v IS
'Broadcast listings with provider names. SECURITY INVOKER enforced - runs with caller privileges.';

-- View 4: current_league_tables (if exists)
-- Purpose: League standings with team details
-- Used by: League table displays
DROP VIEW IF EXISTS public.current_league_tables CASCADE;

CREATE OR REPLACE VIEW public.current_league_tables
WITH (security_invoker = true)
AS
SELECT
    ls.*,
    t.name as team_name,
    t.short_name as team_short_name,
    t.slug as team_slug,
    t.crest_url as team_crest,
    c.name as competition_name,
    c.slug as competition_slug,
    c.short_name as competition_short_name
FROM league_standings ls
JOIN teams t ON ls.team_id = t.id
JOIN competitions c ON ls.competition_id = c.id
WHERE ls.season = '2025'  -- Current season
ORDER BY ls.competition_id, ls.position;

COMMENT ON VIEW public.current_league_tables IS
'League tables with enriched data. SECURITY INVOKER enforced - runs with caller privileges.';

SELECT 'Section 1 Complete: All views now use SECURITY INVOKER' as status;

-- -----------------------------------------------------------------------------
-- SECTION 2: ENABLE RLS ON APP TABLES
-- -----------------------------------------------------------------------------
-- ISSUE: Core app tables have no Row Level Security, allowing unrestricted access
-- FIX: Enable RLS and create appropriate policies
-- TABLES: teams, fixtures, competitions, broadcasts, providers
-- POLICY: Public read access, no public write (admin writes handled separately)
-- -----------------------------------------------------------------------------

-- Enable RLS on app tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

SELECT 'Section 2 Complete: RLS enabled on 5 app tables' as status;

-- -----------------------------------------------------------------------------
-- SECTION 3: CREATE READ POLICIES FOR APP TABLES
-- -----------------------------------------------------------------------------
-- POLICY DESIGN:
-- - Allow public SELECT (read) access to all users
-- - Deny public INSERT/UPDATE/DELETE
-- - Admin writes will use service_role key (bypasses RLS)
--
-- WHY: The website needs to display fixtures, teams, broadcasts publicly
-- HOW: Anyone can read, but only service_role can write
-- -----------------------------------------------------------------------------

-- TEAMS TABLE
-- Allow anyone to view team data (needed for fixture displays)
CREATE POLICY "Public read access for teams"
  ON public.teams
  FOR SELECT
  USING (true);

COMMENT ON POLICY "Public read access for teams" ON public.teams IS
  'Allows all users to read team data. Write access requires service_role key.';

-- FIXTURES TABLE
-- Allow anyone to view fixtures (core functionality)
CREATE POLICY "Public read access for fixtures"
  ON public.fixtures
  FOR SELECT
  USING (true);

COMMENT ON POLICY "Public read access for fixtures" ON public.fixtures IS
  'Allows all users to read fixture data. Write access requires service_role key.';

-- COMPETITIONS TABLE
-- Allow anyone to view competitions
CREATE POLICY "Public read access for competitions"
  ON public.competitions
  FOR SELECT
  USING (true);

COMMENT ON POLICY "Public read access for competitions" ON public.competitions IS
  'Allows all users to read competition data. Write access requires service_role key.';

-- BROADCASTS TABLE
-- Allow anyone to view broadcast information
CREATE POLICY "Public read access for broadcasts"
  ON public.broadcasts
  FOR SELECT
  USING (true);

COMMENT ON POLICY "Public read access for broadcasts" ON public.broadcasts IS
  'Allows all users to read broadcast data. Write access requires service_role key.';

-- PROVIDERS TABLE
-- Allow anyone to view provider information (Sky Sports, TNT, etc.)
CREATE POLICY "Public read access for providers"
  ON public.providers
  FOR SELECT
  USING (true);

COMMENT ON POLICY "Public read access for providers" ON public.providers IS
  'Allows all users to read provider data. Write access requires service_role key.';

SELECT 'Section 3 Complete: Public read policies created for 5 app tables' as status;

-- -----------------------------------------------------------------------------
-- SECTION 4: ENABLE RLS ON DIRECTUS TABLES (OPTION C)
-- -----------------------------------------------------------------------------
-- ISSUE: 27 Directus tables have no RLS, exposing CMS data
-- STRATEGY: Enable RLS with DENY-ALL policies
-- REASON: We plan to use Directus later, so keep tables but secure them
-- RESULT: Tables exist but are inaccessible from public interface
--
-- DIRECTUS TABLES (27):
-- - directus_activity, directus_collections, directus_dashboards
-- - directus_fields, directus_files, directus_flows, directus_folders
-- - directus_migrations, directus_notifications, directus_operations
-- - directus_panels, directus_permissions, directus_presets
-- - directus_relations, directus_revisions, directus_roles
-- - directus_sessions, directus_settings, directus_shares
-- - directus_translations, directus_users, directus_versions
-- - directus_webhooks, directus_extensions, directus_comments
-- - directus_operations_log, directus_activity_log
-- -----------------------------------------------------------------------------

-- Enable RLS on all Directus tables
ALTER TABLE IF EXISTS public.directus_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_operations_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_activity_log ENABLE ROW LEVEL SECURITY;

-- Create deny-all policies for Directus tables
-- NOTE: No SELECT policy = no public access
-- Future: When Directus is integrated, create appropriate access policies

SELECT 'Section 4 Complete: RLS enabled on all Directus tables with deny-all policies' as status;

-- -----------------------------------------------------------------------------
-- SECTION 5: VERIFICATION QUERIES
-- -----------------------------------------------------------------------------
-- Run these queries to verify the security fixes were applied correctly
-- -----------------------------------------------------------------------------

-- Check that views use SECURITY INVOKER
SELECT
  schemaname,
  viewname,
  definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN (
    'fixtures_with_team_names_v',
    'fixtures_min_v',
    'broadcasts_with_provider_v',
    'current_league_tables'
  );

-- Check that RLS is enabled on app tables
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'teams',
    'fixtures',
    'competitions',
    'broadcasts',
    'providers'
  )
ORDER BY tablename;

-- Check that RLS is enabled on Directus tables
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'directus_%'
ORDER BY tablename;

-- Check policies on app tables
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'teams',
    'fixtures',
    'competitions',
    'broadcasts',
    'providers'
  )
ORDER BY tablename, policyname;

SELECT 'Section 5 Complete: Run verification queries above to confirm fixes' as status;

-- -----------------------------------------------------------------------------
-- SECTION 6: ADMIN ACCESS NOTES
-- -----------------------------------------------------------------------------
-- IMPORTANT: Admin write operations need special handling
--
-- CURRENT SETUP:
-- - Your admin panel uses username/password auth (not Supabase auth)
-- - RLS policies above allow public reads, but deny public writes
-- - Admin writes MUST use service_role key (bypasses RLS)
--
-- IMPLEMENTATION OPTIONS:
--
-- Option A: Use service_role key for admin operations (RECOMMENDED)
-- - In your admin code, create separate Supabase client with service_role key
-- - Service role bypasses RLS and can write to all tables
-- - Keep service_role key secure (environment variable, never in frontend)
--
-- Option B: Create authenticated user policies
-- - Migrate admin to use Supabase authentication
-- - Create policies like: FOR INSERT USING (auth.role() = 'authenticated')
-- - Requires refactoring admin authentication system
--
-- Option C: Temporary elevated policies
-- - Create time-limited policies for specific admin operations
-- - Less secure, not recommended for production
--
-- RECOMMENDED ACTION:
-- 1. Test website public functionality (should work fine)
-- 2. Test admin writes (may fail due to RLS)
-- 3. If admin writes fail, implement Option A (service_role key)
--
-- See SECURITY_IMPLEMENTATION.md for detailed implementation guide
-- -----------------------------------------------------------------------------

SELECT '🎉 All Security Fixes Complete! See verification queries above.' as final_status;
SELECT '⚠️  NEXT STEPS: Test website and admin panel functionality' as next_action;
SELECT '📖 See SECURITY_IMPLEMENTATION.md for admin access setup' as documentation;
