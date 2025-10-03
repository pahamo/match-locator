-- Update fixtures_with_teams view to include score columns
-- Run this in Supabase SQL Editor

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
  at.crest_url as away_crest
FROM fixtures f
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id;
