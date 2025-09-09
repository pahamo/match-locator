-- Database Schema Updates for FA Cup Support
-- This script adds support for knockout competitions like FA Cup

BEGIN;

-- Drop existing views that might conflict with schema changes
DROP VIEW IF EXISTS fixtures_with_teams;
DROP VIEW IF EXISTS fa_cup_fixtures_with_rounds;

-- Add columns to support FA Cup knockout structure
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS home_team VARCHAR(100);
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS away_team VARCHAR(100);
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS stage VARCHAR(50);
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS round VARCHAR(50);
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS season INTEGER;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS venue VARCHAR(255);
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS external_id INTEGER;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add columns to teams table for additional FA Cup team data
ALTER TABLE teams ADD COLUMN IF NOT EXISTS short_name VARCHAR(50);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS tla VARCHAR(10);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS venue VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS founded INTEGER;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS club_colors VARCHAR(100);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS external_id INTEGER;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add columns to competitions table for enhanced metadata
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS short_name VARCHAR(20);
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS country VARCHAR(50);
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS country_code VARCHAR(10);
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS season VARCHAR(20);
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS total_teams INTEGER;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS total_rounds INTEGER;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'LEAGUE';
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS external_id INTEGER;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS external_code VARCHAR(10);
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS colors_primary VARCHAR(7);
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS colors_secondary VARCHAR(7);
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fixtures_stage ON fixtures(stage);
CREATE INDEX IF NOT EXISTS idx_fixtures_round ON fixtures(round);
CREATE INDEX IF NOT EXISTS idx_fixtures_external_id ON fixtures(external_id);
CREATE INDEX IF NOT EXISTS idx_teams_external_id ON teams(external_id);
CREATE INDEX IF NOT EXISTS idx_competitions_external_id ON competitions(external_id);
CREATE INDEX IF NOT EXISTS idx_competitions_type ON competitions(type);

-- Insert FA Cup competition if it doesn't exist
INSERT INTO competitions (
  id, name, slug, short_name, country, country_code, season, 
  total_teams, total_rounds, type, is_active, external_id, external_code,
  colors_primary, colors_secondary, last_updated
) VALUES (
  6, 'FA Cup', 'fa-cup', 'FAC', 'England', 'ENG', '2024-25',
  NULL, NULL, 'CUP', true, 2055, 'FAC',
  '#003366', '#ffffff', NOW()
) ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  external_id = EXCLUDED.external_id,
  external_code = EXCLUDED.external_code,
  colors_primary = EXCLUDED.colors_primary,
  colors_secondary = EXCLUDED.colors_secondary,
  is_active = EXCLUDED.is_active,
  last_updated = NOW();

-- Update existing Premier League competition with type
UPDATE competitions 
SET type = 'LEAGUE', is_active = true, last_updated = NOW()
WHERE id = 1;

-- Create a view for FA Cup fixtures with round names
CREATE OR REPLACE VIEW fa_cup_fixtures_with_rounds AS
SELECT 
  f.*,
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
WHERE f.competition_id = 6;

-- Create a view for all fixtures with team names (including FA Cup)
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
LEFT JOIN competitions c ON f.competition_id = c.id;

-- Verify the changes
SELECT 'Schema Update Summary:' as status;

SELECT 'Competitions:' as info;
SELECT id, name, type, external_id, external_code, is_active
FROM competitions 
ORDER BY id;

SELECT 'Team count by competition:' as info;
SELECT 
  c.name as competition,
  c.type,
  COUNT(t.id) as team_count
FROM competitions c
LEFT JOIN teams t ON c.id = t.competition_id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.type
ORDER BY c.id;

SELECT 'Fixture count by competition:' as info;
SELECT 
  c.name as competition,
  c.type,
  COUNT(f.id) as fixture_count
FROM competitions c
LEFT JOIN fixtures f ON c.id = f.competition_id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.type
ORDER BY c.id;

COMMIT;