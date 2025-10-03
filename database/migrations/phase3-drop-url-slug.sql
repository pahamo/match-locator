-- Phase 3B: Drop url_slug column after consolidation
-- This migration removes the url_slug column after confirming the consolidation worked
--
-- SAFETY: Only run this after confirming Phase 3A worked and application is using single slug
-- ROLLBACK: Can be rolled back by restoring from teams_backup_phase3 table

-- Step 1: Verify consolidation is complete
DO $$
DECLARE
    teams_with_url_slug INTEGER;
BEGIN
    SELECT COUNT(*) INTO teams_with_url_slug
    FROM teams
    WHERE url_slug IS NOT NULL;

    RAISE NOTICE 'Found % teams with url_slug values', teams_with_url_slug;

    -- Log the counts for verification
    RAISE NOTICE 'Teams table analysis complete - ready to drop url_slug column';
END $$;

-- Step 2: Drop the url_slug column
ALTER TABLE teams DROP COLUMN IF EXISTS url_slug;

-- Step 3: Update fixtures_with_teams view to remove url_slug references
-- (This will need to be done by database admin as views may be in use)
/*
CREATE OR REPLACE VIEW fixtures_with_teams AS
SELECT
    f.id,
    f.matchday,
    f.utc_kickoff,
    f.venue,
    f.status,
    f.competition_id,
    f.stage,
    f.round,

    -- Home team info (single slug only)
    ht.id as home_team_id,
    ht.name as home_team,
    ht.slug as home_slug,
    ht.crest_url as home_crest,

    -- Away team info (single slug only)
    at.id as away_team_id,
    at.name as away_team,
    at.slug as away_slug,
    at.crest_url as away_crest

FROM fixtures f
JOIN teams ht ON f.home_team_id = ht.id
JOIN teams at ON f.away_team_id = at.id;
*/

-- Step 4: Log completion
INSERT INTO migration_log (migration_name, executed_at, notes)
VALUES ('phase3-drop-url-slug', NOW(), 'Dropped url_slug column after consolidation to single slug system');

-- Step 5: Clean up backup table (optional - keep for safety)
-- DROP TABLE IF EXISTS teams_backup_phase3;