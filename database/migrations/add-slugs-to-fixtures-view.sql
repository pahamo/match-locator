/**
 * Add Team Slugs to Fixtures View
 *
 * Purpose: Ensure fixtures_with_teams view includes home_slug and away_slug fields
 * for direct SEO URL generation
 *
 * This migration:
 * 1. Drops existing fixtures_with_teams view
 * 2. Recreates it with slug fields included (based on phase3-drop-url-slug.sql)
 * 3. Uses correct database column names from existing schema
 */

-- Drop existing view
DROP VIEW IF EXISTS fixtures_with_teams CASCADE;

-- Recreate with all fields including slugs
CREATE VIEW fixtures_with_teams AS
SELECT
    f.id,
    f.matchday,
    f.utc_kickoff,
    f.venue,
    f.status,
    f.competition_id,
    f.stage,
    f.round,

    -- Home team info
    ht.id as home_team_id,
    ht.name as home_team,
    ht.slug as home_slug,           -- ✅ Slug for SEO URLs
    ht.crest_url as home_crest,

    -- Away team info
    at.id as away_team_id,
    at.name as away_team,
    at.slug as away_slug,           -- ✅ Slug for SEO URLs
    at.crest_url as away_crest

FROM fixtures f
JOIN teams ht ON f.home_team_id = ht.id
JOIN teams at ON f.away_team_id = at.id;

-- Verify view was created
SELECT
  'fixtures_with_teams view created' as status,
  COUNT(*) as fixture_count
FROM fixtures_with_teams;

-- Sample query to verify slug fields exist
SELECT
  id,
  home_slug,
  away_slug,
  CASE
    WHEN home_slug IS NULL THEN '⚠️  home_slug is NULL'
    WHEN away_slug IS NULL THEN '⚠️  away_slug is NULL'
    WHEN home_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND away_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN '✅ Slugs valid'
    ELSE '❌ Invalid slug format'
  END as slug_status
FROM fixtures_with_teams
LIMIT 10;

-- Health check: Count fixtures with valid slugs
SELECT
  COUNT(*) as total_fixtures,
  COUNT(*) FILTER (WHERE home_slug IS NOT NULL AND away_slug IS NOT NULL) as fixtures_with_slugs,
  COUNT(*) FILTER (
    WHERE home_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    AND away_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ) as fixtures_with_valid_slugs,
  ROUND(
    100.0 * COUNT(*) FILTER (
      WHERE home_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      AND away_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ) / NULLIF(COUNT(*), 0),
    2
  ) as percent_valid
FROM fixtures_with_teams;

/**
 * Expected result:
 * - total_fixtures: (some number)
 * - fixtures_with_slugs: Should equal total_fixtures
 * - fixtures_with_valid_slugs: Should equal total_fixtures
 * - percent_valid: Should be 100.00%
 *
 * If percent_valid < 100%, some team slugs need to be fixed in the teams table.
 */
