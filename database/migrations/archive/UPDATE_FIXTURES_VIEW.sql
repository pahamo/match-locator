-- Update the fixtures_with_teams view to include url_slug fields
-- This is the proper way to fix the fixture/team relationship

-- First, let's see what the current view looks like
-- (Run this to understand the current structure)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'fixtures_with_teams'
ORDER BY ordinal_position;

-- Drop and recreate the view to include url_slug fields
DROP VIEW IF EXISTS fixtures_with_teams;

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

  -- Home team info (including url_slug)
  f.home_team_id,
  ht.name as home_team,
  ht.slug as home_slug,
  ht.url_slug as home_url_slug,
  ht.crest_url as home_crest,

  -- Away team info (including url_slug)
  f.away_team_id,
  at.name as away_team,
  at.slug as away_slug,
  at.url_slug as away_url_slug,
  at.crest_url as away_crest

FROM fixtures f
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id;

-- Verify the updated view includes url_slug fields
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'fixtures_with_teams'
AND column_name LIKE '%url_slug%'
ORDER BY ordinal_position;