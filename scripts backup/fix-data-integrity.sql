-- Data Integrity Fix Script
-- Remove teams that should not be in current Premier League 2025-26
-- Based on analysis showing Leicester, Southampton, Burnley, Leeds, Sunderland incorrectly included

BEGIN;

-- First, let's see what we're working with
-- Current incorrect teams in Premier League (competition_id = 1):
-- 1: Leeds United (relegated 2022-23)
-- 2: Sunderland (not Premier League)  
-- 51: Leicester City (relegated 2022-23)
-- 60: Southampton (relegated 2022-23)
-- 61: Burnley (relegated 2022-23)

-- Step 1: Remove incorrect teams from Premier League
UPDATE teams 
SET competition_id = NULL 
WHERE id IN (1, 2, 51, 60, 61) AND competition_id = 1;

-- Step 2: Fix the season name to be consistent (2025-26 since we're in Sept 2025)
UPDATE competitions 
SET season = '2025-26' 
WHERE id = 1;

-- Step 3: Update other competitions to also use consistent 2025-26 season
UPDATE competitions 
SET season = '2025-26' 
WHERE season = '2024-25';

-- Step 4: Verify the changes
SELECT 'Premier League Teams After Cleanup:' as status;
SELECT t.id, t.name 
FROM teams t 
WHERE t.competition_id = 1 
ORDER BY t.name;

SELECT 'Competition Seasons After Update:' as status;
SELECT id, name, season 
FROM competitions 
ORDER BY display_order;

-- Step 5: Count teams per competition
SELECT 
  c.name as competition,
  c.season,
  COUNT(t.id) as team_count,
  c.total_teams as expected_teams
FROM competitions c
LEFT JOIN teams t ON c.id = t.competition_id
GROUP BY c.id, c.name, c.season, c.total_teams
ORDER BY c.display_order;

COMMIT;