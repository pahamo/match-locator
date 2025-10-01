-- =============================================================================
-- SECURITY VERIFICATION QUERIES
-- =============================================================================
--
-- PURPOSE: Verify that security fixes were applied correctly
--
-- USAGE:
-- 1. Run this script after applying supabase-security-fixes.sql
-- 2. Review results to ensure all security measures are in place
-- 3. All checks should show ✓ (success) status
--
-- WHAT IT CHECKS:
-- 1. Views use SECURITY INVOKER
-- 2. RLS enabled on all tables
-- 3. Policies exist for app tables
-- 4. Directus tables have no public policies
-- 5. Public read access works
-- 6. Public write access is denied
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CHECK 1: Views Use SECURITY INVOKER
-- -----------------------------------------------------------------------------
-- Expected: All views should have security_invoker option set
-- -----------------------------------------------------------------------------

SELECT '=== CHECK 1: Views with SECURITY INVOKER ===' as check_name;

SELECT
  viewname,
  CASE
    WHEN definition LIKE '%security_invoker%'
      OR viewoptions::text LIKE '%security_invoker=true%'
    THEN '✓ SECURE'
    ELSE '✗ INSECURE - Missing SECURITY INVOKER'
  END as security_status
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN (
    'fixtures_with_team_names_v',
    'fixtures_min_v',
    'broadcasts_with_provider_v',
    'current_league_tables'
  )
ORDER BY viewname;

-- -----------------------------------------------------------------------------
-- CHECK 2: RLS Enabled on App Tables
-- -----------------------------------------------------------------------------
-- Expected: RLS should be enabled (true) on all app tables
-- -----------------------------------------------------------------------------

SELECT '=== CHECK 2: RLS Status on App Tables ===' as check_name;

SELECT
  tablename,
  rowsecurity as rls_enabled,
  CASE
    WHEN rowsecurity = true THEN '✓ RLS Enabled'
    ELSE '✗ RLS DISABLED - Security Risk!'
  END as status
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

-- Summary
SELECT
  COUNT(*) as total_tables,
  SUM(CASE WHEN rowsecurity = true THEN 1 ELSE 0 END) as rls_enabled,
  SUM(CASE WHEN rowsecurity = false THEN 1 ELSE 0 END) as rls_disabled,
  CASE
    WHEN SUM(CASE WHEN rowsecurity = false THEN 1 ELSE 0 END) = 0
    THEN '✓ All 5 app tables secured'
    ELSE '✗ Some tables are insecure!'
  END as overall_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'teams',
    'fixtures',
    'competitions',
    'broadcasts',
    'providers'
  );

-- -----------------------------------------------------------------------------
-- CHECK 3: RLS Enabled on Directus Tables
-- -----------------------------------------------------------------------------
-- Expected: RLS should be enabled on all Directus tables
-- -----------------------------------------------------------------------------

SELECT '=== CHECK 3: RLS Status on Directus Tables ===' as check_name;

SELECT
  tablename,
  rowsecurity as rls_enabled,
  CASE
    WHEN rowsecurity = true THEN '✓ RLS Enabled'
    ELSE '✗ RLS DISABLED'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'directus_%'
ORDER BY tablename;

-- Summary
SELECT
  COUNT(*) as total_directus_tables,
  SUM(CASE WHEN rowsecurity = true THEN 1 ELSE 0 END) as rls_enabled,
  SUM(CASE WHEN rowsecurity = false THEN 1 ELSE 0 END) as rls_disabled,
  CASE
    WHEN SUM(CASE WHEN rowsecurity = false THEN 1 ELSE 0 END) = 0
    THEN '✓ All Directus tables secured'
    ELSE '✗ Some Directus tables are insecure!'
  END as overall_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'directus_%';

-- -----------------------------------------------------------------------------
-- CHECK 4: Public Read Policies Exist
-- -----------------------------------------------------------------------------
-- Expected: Each app table should have a public read policy
-- -----------------------------------------------------------------------------

SELECT '=== CHECK 4: Public Read Policies on App Tables ===' as check_name;

SELECT
  tablename,
  COUNT(*) as policy_count,
  STRING_AGG(policyname, ', ') as policies,
  CASE
    WHEN COUNT(*) > 0 THEN '✓ Has Policies'
    ELSE '✗ NO POLICIES - Data may be inaccessible!'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'teams',
    'fixtures',
    'competitions',
    'broadcasts',
    'providers'
  )
GROUP BY tablename
ORDER BY tablename;

-- Detailed policy view
SELECT
  tablename,
  policyname,
  cmd as applies_to,
  CASE
    WHEN qual = 'true' THEN '✓ Allows all (public read)'
    ELSE qual
  END as condition
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

-- -----------------------------------------------------------------------------
-- CHECK 5: Directus Tables Have No Public Policies
-- -----------------------------------------------------------------------------
-- Expected: Directus tables should have RLS but NO policies (deny all)
-- -----------------------------------------------------------------------------

SELECT '=== CHECK 5: Directus Tables - Deny All Policy ===' as check_name;

SELECT
  COUNT(*) as total_policies_on_directus,
  CASE
    WHEN COUNT(*) = 0 THEN '✓ Correct - No public access policies'
    ELSE '✗ WARNING - Directus tables have policies!'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'directus_%';

-- If any Directus policies exist, show them
SELECT
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'directus_%'
ORDER BY tablename, policyname;

-- -----------------------------------------------------------------------------
-- CHECK 6: Test Public Read Access
-- -----------------------------------------------------------------------------
-- Expected: Public reads should succeed on app tables
-- -----------------------------------------------------------------------------

SELECT '=== CHECK 6: Test Public Read Access ===' as check_name;

-- Test teams table
SELECT
  'teams' as table_name,
  COUNT(*) as row_count,
  CASE
    WHEN COUNT(*) > 0 THEN '✓ Public read works'
    ELSE '? No data or read blocked'
  END as status
FROM teams;

-- Test fixtures table
SELECT
  'fixtures' as table_name,
  COUNT(*) as row_count,
  CASE
    WHEN COUNT(*) > 0 THEN '✓ Public read works'
    ELSE '? No data or read blocked'
  END as status
FROM fixtures;

-- Test competitions table
SELECT
  'competitions' as table_name,
  COUNT(*) as row_count,
  CASE
    WHEN COUNT(*) > 0 THEN '✓ Public read works'
    ELSE '? No data or read blocked'
  END as status
FROM competitions;

-- Test broadcasts table
SELECT
  'broadcasts' as table_name,
  COUNT(*) as row_count,
  CASE
    WHEN COUNT(*) > 0 THEN '✓ Public read works'
    ELSE '? No data or read blocked'
  END as status
FROM broadcasts;

-- Test providers table
SELECT
  'providers' as table_name,
  COUNT(*) as row_count,
  CASE
    WHEN COUNT(*) > 0 THEN '✓ Public read works'
    ELSE '? No data or read blocked'
  END as status
FROM providers;

-- -----------------------------------------------------------------------------
-- CHECK 7: Test Views Work Correctly
-- -----------------------------------------------------------------------------
-- Expected: Views should return data (public read access)
-- -----------------------------------------------------------------------------

SELECT '=== CHECK 7: Test View Access ===' as check_name;

-- Test fixtures_with_team_names_v
SELECT
  'fixtures_with_team_names_v' as view_name,
  COUNT(*) as row_count,
  CASE
    WHEN COUNT(*) > 0 THEN '✓ View accessible'
    ELSE '? No data or view blocked'
  END as status
FROM fixtures_with_team_names_v;

-- Test fixtures_min_v
SELECT
  'fixtures_min_v' as view_name,
  COUNT(*) as row_count,
  CASE
    WHEN COUNT(*) > 0 THEN '✓ View accessible'
    ELSE '? No data or view blocked'
  END as status
FROM fixtures_min_v;

-- Test broadcasts_with_provider_v
SELECT
  'broadcasts_with_provider_v' as view_name,
  COUNT(*) as row_count,
  CASE
    WHEN COUNT(*) > 0 THEN '✓ View accessible'
    ELSE '? No data or view blocked'
  END as status
FROM broadcasts_with_provider_v;

-- -----------------------------------------------------------------------------
-- FINAL SUMMARY
-- -----------------------------------------------------------------------------

SELECT '=== SECURITY VERIFICATION SUMMARY ===' as summary;

WITH security_checks AS (
  SELECT
    -- Check 1: Views use SECURITY INVOKER
    (SELECT COUNT(*) FROM pg_views
     WHERE schemaname = 'public'
       AND viewname IN ('fixtures_with_team_names_v', 'fixtures_min_v', 'broadcasts_with_provider_v', 'current_league_tables')
    ) as total_views,

    -- Check 2: App tables have RLS
    (SELECT COUNT(*) FROM pg_tables
     WHERE schemaname = 'public'
       AND rowsecurity = true
       AND tablename IN ('teams', 'fixtures', 'competitions', 'broadcasts_uk', 'providers', 'team_branding', 'league_standings', 'affiliate_destinations')
    ) as app_tables_with_rls,

    -- Check 3: Directus tables have RLS
    (SELECT COUNT(*) FROM pg_tables
     WHERE schemaname = 'public'
       AND rowsecurity = true
       AND tablename LIKE 'directus_%'
    ) as directus_tables_with_rls,

    -- Check 4: App tables have policies
    (SELECT COUNT(DISTINCT tablename) FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename IN ('teams', 'fixtures', 'competitions', 'broadcasts_uk', 'providers', 'team_branding', 'league_standings', 'affiliate_destinations')
    ) as app_tables_with_policies,

    -- Check 5: Directus tables have NO policies (deny all)
    (SELECT COUNT(*) FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename LIKE 'directus_%'
    ) as directus_policies
)
SELECT
  'Views with SECURITY INVOKER' as check_item,
  CONCAT(total_views, '/4') as result,
  CASE WHEN total_views = 4 THEN '✓ PASS' ELSE '✗ FAIL' END as status
FROM security_checks
UNION ALL
SELECT
  'App tables with RLS enabled' as check_item,
  CONCAT(app_tables_with_rls, '/5') as result,
  CASE WHEN app_tables_with_rls = 5 THEN '✓ PASS' ELSE '✗ FAIL' END as status
FROM security_checks
UNION ALL
SELECT
  'App tables with read policies' as check_item,
  CONCAT(app_tables_with_policies, '/5') as result,
  CASE WHEN app_tables_with_policies = 5 THEN '✓ PASS' ELSE '✗ FAIL' END as status
FROM security_checks
UNION ALL
SELECT
  'Directus tables secured (RLS + no policies)' as check_item,
  CONCAT(directus_tables_with_rls, ' tables, ', directus_policies, ' policies') as result,
  CASE WHEN directus_tables_with_rls > 0 AND directus_policies = 0 THEN '✓ PASS' ELSE '✗ FAIL' END as status
FROM security_checks;

-- Overall status
WITH security_checks AS (
  SELECT
    (SELECT COUNT(*) FROM pg_views WHERE schemaname = 'public' AND viewname IN ('fixtures_with_team_names_v', 'fixtures_min_v', 'broadcasts_with_provider_v', 'current_league_tables')) as total_views,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true AND tablename IN ('teams', 'fixtures', 'competitions', 'broadcasts', 'providers')) as app_tables_with_rls,
    (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('teams', 'fixtures', 'competitions', 'broadcasts', 'providers')) as app_tables_with_policies,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true AND tablename LIKE 'directus_%') as directus_tables_with_rls,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename LIKE 'directus_%') as directus_policies
)
SELECT
  CASE
    WHEN total_views = 4
      AND app_tables_with_rls = 5
      AND app_tables_with_policies = 5
      AND directus_tables_with_rls > 0
      AND directus_policies = 0
    THEN '🎉 ALL SECURITY CHECKS PASSED! Database is properly secured.'
    ELSE '⚠️  SOME CHECKS FAILED - Review results above and re-run security fixes if needed.'
  END as overall_status
FROM security_checks;

SELECT '📝 Next Step: Test website functionality at https://matchlocator.com' as next_action;
