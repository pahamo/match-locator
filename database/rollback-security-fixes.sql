-- =============================================================================
-- ROLLBACK SCRIPT: Supabase Security Fixes
-- =============================================================================
--
-- PURPOSE: Undo all security changes applied by supabase-security-fixes.sql
--
-- ⚠️  WARNING: This script removes ALL security protections!
-- Only run this if:
-- 1. The security fixes caused critical issues
-- 2. You need to temporarily disable security for debugging
-- 3. You have a backup and understand the risks
--
-- AFTER ROLLBACK:
-- - All tables will be publicly accessible (read AND write)
-- - Views will use SECURITY DEFINER (potential privilege escalation)
-- - Database will return to insecure state
--
-- DEPLOYMENT:
-- 1. Ensure you have a database backup
-- 2. Run in Supabase SQL Editor
-- 3. After rollback, database will be INSECURE
-- 4. Plan to reapply security fixes ASAP
--
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- SECTION 1: DROP ALL RLS POLICIES
-- -----------------------------------------------------------------------------
-- Remove all security policies created by the security fix script
-- -----------------------------------------------------------------------------

-- Drop policies on app tables
DROP POLICY IF EXISTS "Public read access for teams" ON public.teams;
DROP POLICY IF EXISTS "Public read access for fixtures" ON public.fixtures;
DROP POLICY IF EXISTS "Public read access for competitions" ON public.competitions;
DROP POLICY IF EXISTS "Public read access for broadcasts" ON public.broadcasts;
DROP POLICY IF EXISTS "Public read access for providers" ON public.providers;

SELECT '✓ Section 1 Complete: All RLS policies dropped' as status;

-- -----------------------------------------------------------------------------
-- SECTION 2: DISABLE RLS ON ALL TABLES
-- -----------------------------------------------------------------------------
-- Disable Row Level Security on all tables
-- ⚠️  WARNING: Tables will be publicly writable after this!
-- -----------------------------------------------------------------------------

-- Disable RLS on app tables
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers DISABLE ROW LEVEL SECURITY;

-- Disable RLS on Directus tables
ALTER TABLE IF EXISTS public.directus_activity DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_dashboards DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_flows DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_migrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_panels DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_presets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_relations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_revisions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_shares DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_webhooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_extensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_operations_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directus_activity_log DISABLE ROW LEVEL SECURITY;

SELECT '✓ Section 2 Complete: RLS disabled on all tables' as status;

-- -----------------------------------------------------------------------------
-- SECTION 3: RECREATE VIEWS WITHOUT SECURITY INVOKER
-- -----------------------------------------------------------------------------
-- Recreate views in original (insecure) form
-- ⚠️  WARNING: Views will use SECURITY DEFINER (creator's privileges)
-- -----------------------------------------------------------------------------

-- Recreate fixtures_with_team_names_v (original version)
DROP VIEW IF EXISTS public.fixtures_with_team_names_v CASCADE;

CREATE OR REPLACE VIEW public.fixtures_with_team_names_v AS
SELECT
  f.id,
  f.utc_kickoff,
  f.matchday,
  ht.name as home_team,
  at.name as away_team
FROM fixtures f
JOIN teams ht ON ht.id = f.home_team_id
JOIN teams at ON at.id = f.away_team_id;

-- Recreate fixtures_min_v (original version)
DROP VIEW IF EXISTS public.fixtures_min_v CASCADE;

CREATE OR REPLACE VIEW public.fixtures_min_v AS
SELECT
  f.id,
  f.utc_kickoff,
  f.home_team_id,
  f.away_team_id,
  f.venue,
  COALESCE(f.status, 'scheduled') as status,
  f.matchday
FROM fixtures f;

-- Recreate broadcasts_with_provider_v (original version)
DROP VIEW IF EXISTS public.broadcasts_with_provider_v CASCADE;

CREATE OR REPLACE VIEW public.broadcasts_with_provider_v AS
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

-- Recreate current_league_tables (original version)
DROP VIEW IF EXISTS public.current_league_tables CASCADE;

CREATE OR REPLACE VIEW public.current_league_tables AS
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
WHERE ls.season = '2025'
ORDER BY ls.competition_id, ls.position;

SELECT '✓ Section 3 Complete: Views recreated without SECURITY INVOKER' as status;

-- -----------------------------------------------------------------------------
-- VERIFICATION
-- -----------------------------------------------------------------------------

-- Verify RLS is disabled
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

-- Verify no policies exist
SELECT
  COUNT(*) as remaining_policies,
  CASE
    WHEN COUNT(*) = 0 THEN '✓ All policies removed'
    ELSE '⚠️  Some policies still exist'
  END as status
FROM pg_policies
WHERE schemaname = 'public';

SELECT '⚠️  ROLLBACK COMPLETE - Database is now INSECURE!' as final_status;
SELECT '⚠️  All data is publicly readable AND writable!' as warning;
SELECT '📝 Next Steps: Re-apply security fixes as soon as possible' as next_action;

COMMIT;
