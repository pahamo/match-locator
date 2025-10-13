-- Add broadcaster information to fixtures_with_teams view
-- This fixes the issue where all matches show "broadcaster TBD"
-- Run this in Supabase SQL Editor

-- Drop the existing view first
DROP VIEW IF EXISTS fixtures_with_teams CASCADE;

-- Recreate with broadcaster columns
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
  f.home_score,
  f.away_score,
  -- Home team
  f.home_team_id,
  ht.name as home_team,
  ht.slug as home_slug,
  ht.crest_url as home_crest,
  -- Away team
  f.away_team_id,
  at.name as away_team,
  at.slug as away_slug,
  at.crest_url as away_crest,
  -- Broadcaster information (first UK broadcaster found, or null)
  -- We use DISTINCT ON to get only one broadcaster per fixture
  -- Priority: actual UK broadcasters over TBD
  (
    SELECT p.name
    FROM broadcasts b
    LEFT JOIN providers p ON b.provider_id = p.id
    WHERE b.fixture_id = f.id
      AND (b.country_code = 'GB' OR b.country_code IS NULL)
      AND p.id != 998  -- Exclude TBD provider
    ORDER BY
      CASE
        WHEN p.id IN (1, 2, 3, 4) THEN 0  -- Prioritize Sky, TNT, BBC, Amazon
        ELSE 1
      END,
      b.id
    LIMIT 1
  ) as broadcaster,
  -- Broadcaster ID for linking
  (
    SELECT p.id
    FROM broadcasts b
    LEFT JOIN providers p ON b.provider_id = p.id
    WHERE b.fixture_id = f.id
      AND (b.country_code = 'GB' OR b.country_code IS NULL)
      AND p.id != 998  -- Exclude TBD provider
    ORDER BY
      CASE
        WHEN p.id IN (1, 2, 3, 4) THEN 0
        ELSE 1
      END,
      b.id
    LIMIT 1
  ) as broadcaster_id,
  -- Broadcast ID for reference
  (
    SELECT b.id
    FROM broadcasts b
    LEFT JOIN providers p ON b.provider_id = p.id
    WHERE b.fixture_id = f.id
      AND (b.country_code = 'GB' OR b.country_code IS NULL)
      AND p.id != 998
    ORDER BY
      CASE
        WHEN p.id IN (1, 2, 3, 4) THEN 0
        ELSE 1
      END,
      b.id
    LIMIT 1
  ) as broadcast_id
FROM fixtures f
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id;

-- Grant permissions (adjust as needed for your setup)
GRANT SELECT ON fixtures_with_teams TO anon;
GRANT SELECT ON fixtures_with_teams TO authenticated;
