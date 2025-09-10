-- Fix fixtures_with_teams view to only show Premier League fixtures
-- This resolves the issue where FA Cup and other non-PL fixtures were appearing

BEGIN;

-- Drop the existing view that includes all competitions
DROP VIEW IF EXISTS fixtures_with_teams;

-- Recreate the view to ONLY show Premier League fixtures (competition_id = 1)
CREATE OR REPLACE VIEW fixtures_with_teams AS
SELECT 
  f.id,
  f.competition_id,
  f.home_team_id,
  f.away_team_id,
  COALESCE(f.home_team, ht.name) as home_team,
  COALESCE(f.away_team, at.name) as away_team,
  ht.slug as home_slug,
  at.slug as away_slug,
  ht.crest_url as home_crest,
  at.crest_url as away_crest,
  f.utc_kickoff,
  f.status,
  f.matchday,
  f.stage,
  f.round,
  f.season,
  f.venue,
  c.name as competition_name,
  c.slug as competition_slug,
  c.type as competition_type
FROM fixtures f
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id
LEFT JOIN competitions c ON f.competition_id = c.id
WHERE f.competition_id = 1;  -- ONLY Premier League fixtures

-- Create a separate view for FA Cup if needed
CREATE OR REPLACE VIEW fa_cup_fixtures_with_teams AS
SELECT 
  f.id,
  f.competition_id,
  f.home_team_id,
  f.away_team_id,
  COALESCE(f.home_team, ht.name) as home_team,
  COALESCE(f.away_team, at.name) as away_team,
  ht.slug as home_slug,
  at.slug as away_slug,
  ht.crest_url as home_crest,
  at.crest_url as away_crest,
  f.utc_kickoff,
  f.status,
  f.matchday,
  f.stage,
  f.round,
  f.season,
  f.venue,
  c.name as competition_name,
  c.slug as competition_slug,
  c.type as competition_type,
  CASE 
    WHEN f.stage = 'FIRST_ROUND' THEN 'First Round'
    WHEN f.stage = 'SECOND_ROUND' THEN 'Second Round'
    WHEN f.stage = 'THIRD_ROUND' THEN 'Third Round'
    WHEN f.stage = 'FOURTH_ROUND' THEN 'Fourth Round'
    WHEN f.stage = 'FIFTH_ROUND' THEN 'Fifth Round'
    WHEN f.stage = 'SIXTH_ROUND' THEN 'Sixth Round'
    WHEN f.stage = 'QUARTER_FINALS' THEN 'Quarter-finals'
    WHEN f.stage = 'SEMI_FINALS' THEN 'Semi-finals'
    WHEN f.stage = 'FINAL' THEN 'Final'
    ELSE f.stage
  END as round_display_name
FROM fixtures f
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id
LEFT JOIN competitions c ON f.competition_id = c.id
WHERE f.competition_id = 6;  -- ONLY FA Cup fixtures

-- Verify the fix
SELECT 'fixtures_with_teams now only shows Premier League:' as status;
SELECT COUNT(*) as fixture_count, competition_name 
FROM fixtures_with_teams 
GROUP BY competition_name;

COMMIT;