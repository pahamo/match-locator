-- Fix fixtures_with_teams view to select broadcasters correctly
-- Priority: TNT Sports > Sky Sports > BBC > Amazon Prime
-- This ensures the PRIMARY broadcaster is shown, not just the first by ID

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
  f.home_score,
  f.away_score,
  f.home_team_id,
  ht.name AS home_team,
  ht.slug AS home_slug,
  ht.crest_url AS home_crest,
  f.away_team_id,
  at.name AS away_team,
  at.slug AS away_slug,
  at.crest_url AS away_crest,
  -- Select broadcaster with priority: TNT (2) > Sky (1) > BBC (3) > Amazon (4)
  -- Use DISTINCT ON to get only one broadcaster per fixture
  (
    SELECT p.name
    FROM broadcasts b
    LEFT JOIN providers p ON b.provider_id = p.id
    WHERE b.fixture_id = f.id
      AND b.provider_id IS NOT NULL
    ORDER BY
      CASE b.provider_id
        WHEN 2 THEN 1  -- TNT Sports (highest priority)
        WHEN 1 THEN 2  -- Sky Sports
        WHEN 3 THEN 3  -- BBC
        WHEN 4 THEN 4  -- Amazon Prime
        ELSE 99
      END,
      b.id  -- Tie-breaker by ID
    LIMIT 1
  ) AS broadcaster,
  (
    SELECT b.provider_id
    FROM broadcasts b
    WHERE b.fixture_id = f.id
      AND b.provider_id IS NOT NULL
    ORDER BY
      CASE b.provider_id
        WHEN 2 THEN 1  -- TNT Sports
        WHEN 1 THEN 2  -- Sky Sports
        WHEN 3 THEN 3  -- BBC
        WHEN 4 THEN 4  -- Amazon Prime
        ELSE 99
      END,
      b.id
    LIMIT 1
  ) AS broadcaster_id
FROM fixtures f
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id;

-- Grant access
GRANT SELECT ON fixtures_with_teams TO anon, authenticated, service_role;
