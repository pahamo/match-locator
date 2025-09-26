-- Phase 3: Database Slug Consolidation Migration
-- This migration consolidates the dual slug system (slug + url_slug) into a single slug system
--
-- STRATEGY:
-- 1. Migrate to use url_slug as the primary slug (it has the better format)
-- 2. Update all existing slug values to match url_slug values
-- 3. Drop the url_slug column
-- 4. Update views and functions to use single slug system
--
-- SAFETY: This migration is designed to be zero-downtime
-- The application code already handles both slug formats via TeamResolver

-- Step 1: Create backup table for rollback safety
CREATE TABLE IF NOT EXISTS teams_backup_phase3 AS SELECT * FROM teams;

-- Step 2: Update slug field to match url_slug where url_slug is not null
-- This ensures slug field has the optimized values
UPDATE teams
SET slug = url_slug
WHERE url_slug IS NOT NULL AND url_slug != slug;

-- Step 3: Verify the update worked correctly
-- Count mismatches (should be 0 after update)
DO $$
DECLARE
    mismatch_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO mismatch_count
    FROM teams
    WHERE url_slug IS NOT NULL AND url_slug != slug;

    IF mismatch_count > 0 THEN
        RAISE EXCEPTION 'Migration validation failed: % teams still have slug/url_slug mismatches', mismatch_count;
    END IF;

    RAISE NOTICE 'Migration validation passed: All teams have consistent slug values';
END $$;

-- Step 4: Update fixtures_with_teams view to use consolidated slug
-- This will be handled in application code transition

-- Step 5: Create migration log entry
INSERT INTO migration_log (migration_name, executed_at, notes)
VALUES ('phase3-slug-consolidation', NOW(), 'Consolidated dual slug system to single slug field');

-- Note: The url_slug column drop will be done in a separate migration after
-- confirming the application code works correctly with the consolidated slugs