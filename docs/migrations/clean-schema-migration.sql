-- ============================================================================
-- Clean Data Architecture Migration
-- Date: 2025-10-09
--
-- Purpose: Remove derived/duplicate data, use API structures as-is
-- Philosophy: Store API data in native formats (jsonb), don't transform
--
-- IMPORTANT: Run backups before executing this migration!
-- ============================================================================

-- ============================================================================
-- PHASE 1A: CREATE BACKUPS
-- ============================================================================

-- Backup fixtures table
CREATE TABLE IF NOT EXISTS fixtures_backup_20251009 AS
SELECT * FROM fixtures;

-- Backup broadcasts table
CREATE TABLE IF NOT EXISTS broadcasts_backup_20251009 AS
SELECT * FROM broadcasts;

-- Verify backups
SELECT
  'fixtures_backup_20251009' as table_name,
  COUNT(*) as row_count
FROM fixtures_backup_20251009
UNION ALL
SELECT
  'broadcasts_backup_20251009' as table_name,
  COUNT(*) as row_count
FROM broadcasts_backup_20251009;

-- ============================================================================
-- PHASE 1B: UPDATE fixtures TABLE
-- ============================================================================

-- First, find and drop ALL views that reference the fixtures table
-- This generates DROP VIEW statements for all dependent views
DO $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN
        SELECT schemaname, viewname
        FROM pg_views
        WHERE schemaname = 'public'
          AND (definition ILIKE '%from fixtures%'
               OR definition ILIKE '%join fixtures%'
               OR definition ILIKE '%fixtures f%')
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE',
                      view_record.schemaname,
                      view_record.viewname);
        RAISE NOTICE 'Dropped view: %.%', view_record.schemaname, view_record.viewname;
    END LOOP;
END $$;

-- Change round column from varchar to jsonb
-- (stores full API round object: {id, name, league_id, season_id, ...})
ALTER TABLE fixtures
  ALTER COLUMN round TYPE jsonb
  USING CASE
    WHEN round IS NULL THEN NULL
    WHEN round ~ '^\{' THEN round::jsonb  -- Already JSON
    ELSE jsonb_build_object('name', round)  -- Convert string to object
  END;

-- Change stage column from varchar to jsonb
-- (stores full API stage object)
ALTER TABLE fixtures
  ALTER COLUMN stage TYPE jsonb
  USING CASE
    WHEN stage IS NULL THEN NULL
    WHEN stage ~ '^\{' THEN stage::jsonb  -- Already JSON
    ELSE jsonb_build_object('name', stage)  -- Convert string to object
  END;

-- Drop matchday column (derived from round.name - frontend will calculate)
ALTER TABLE fixtures DROP COLUMN IF EXISTS matchday;

-- Drop home_team and away_team columns (duplicates of FK data)
ALTER TABLE fixtures DROP COLUMN IF EXISTS home_team;
ALTER TABLE fixtures DROP COLUMN IF EXISTS away_team;

-- Verify fixtures table structure
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'fixtures'
  AND column_name IN ('round', 'stage', 'matchday', 'home_team', 'away_team')
ORDER BY ordinal_position;

-- ============================================================================
-- PHASE 1C: UPDATE broadcasts TABLE
-- ============================================================================

-- Make provider_id nullable (deprecated column, not used anymore)
ALTER TABLE broadcasts
  ALTER COLUMN provider_id DROP NOT NULL;

-- Drop foreign key constraint on country_id (causes issues with API IDs)
ALTER TABLE broadcasts
  DROP CONSTRAINT IF EXISTS broadcasts_country_id_fkey;

-- Make country_id nullable (we use country_code string instead)
ALTER TABLE broadcasts
  ALTER COLUMN country_id DROP NOT NULL;

-- Verify broadcasts table constraints
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'broadcasts'
  AND constraint_type = 'FOREIGN KEY';

-- ============================================================================
-- PHASE 1D: DROP DEPRECATED TABLES
-- ============================================================================

-- Drop api_tv_station_mapping (not needed - we store API IDs directly)
DROP TABLE IF EXISTS api_tv_station_mapping CASCADE;

-- Drop affiliate_destinations (related to deprecated providers system)
DROP TABLE IF EXISTS affiliate_destinations CASCADE;

-- Note: Keeping providers table for now (may have legacy dependencies)
-- Can be dropped in future if confirmed unused

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that fixtures.round is now jsonb
SELECT
  id,
  round,
  round->>'name' as round_name,
  round->>'id' as round_id
FROM fixtures
WHERE round IS NOT NULL
LIMIT 5;

-- Count fixtures by round name
SELECT
  round->>'name' as matchweek,
  COUNT(*) as fixture_count
FROM fixtures
WHERE competition_id = 1  -- Premier League
  AND round IS NOT NULL
GROUP BY round->>'name'
ORDER BY (round->>'name')::int;

-- Verify matchday column is gone
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'fixtures'
    AND column_name = 'matchday'
) as matchday_still_exists;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================

/*
-- To rollback this migration:

-- 1. Restore fixtures table
DROP TABLE fixtures;
ALTER TABLE fixtures_backup_20251009 RENAME TO fixtures;

-- 2. Restore broadcasts table
DROP TABLE broadcasts;
ALTER TABLE broadcasts_backup_20251009 RENAME TO broadcasts;

-- 3. Recreate the old view (run old fixtures_with_teams CREATE VIEW SQL)
*/

-- ============================================================================
-- NEXT STEPS
-- ============================================================================

/*
After running this migration:

1. Run Phase 2: Update fixtures_with_teams view (see clean-view-migration.sql)
2. Update TypeScript interfaces (src/types/index.ts)
3. Update sync script to filter Amazon Prime
4. Update frontend components to use getMatchweek() helper
5. Re-sync full season data
6. Test all pages
*/
