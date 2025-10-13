-- Fix broadcaster view with correct country code (GBR not GB)
-- Run this in Supabase SQL Editor

DROP VIEW IF EXISTS fixtures_with_teams CASCADE;

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
  ht.name as home_team,
  ht.slug as home_slug,
  ht.crest_url as home_crest,
  f.away_team_id,
  at.name as away_team,
  at.slug as away_slug,
  at.crest_url as away_crest,
  (
    SELECT p.name
    FROM broadcasts b
    LEFT JOIN providers p ON b.provider_id = p.id
    WHERE b.fixture_id = f.id
      AND (b.country_code = 'GBR' OR b.country_code IS NULL)  -- FIXED: GBR not GB
      AND p.id IS NOT NULL  -- Only real providers
    ORDER BY
      CASE WHEN p.id IN (1, 2, 3, 4) THEN 0 ELSE 1 END,
      b.id
    LIMIT 1
  ) as broadcaster,
  (
    SELECT p.id
    FROM broadcasts b
    LEFT JOIN providers p ON b.provider_id = p.id
    WHERE b.fixture_id = f.id
      AND (b.country_code = 'GBR' OR b.country_code IS NULL)  -- FIXED: GBR not GB
      AND p.id IS NOT NULL
    ORDER BY
      CASE WHEN p.id IN (1, 2, 3, 4) THEN 0 ELSE 1 END,
      b.id
    LIMIT 1
  ) as broadcaster_id
FROM fixtures f
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id;
