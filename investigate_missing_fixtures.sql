-- Investigation script for missing Premier League fixtures on Saturday 13th
-- Run this to understand what fixtures exist and why some might be missing

-- Step 1: Check all fixtures on 13th (any month) with team details
SELECT 
    f.id,
    f.utc_kickoff,
    f.competition_id,
    ht.name as home_team,
    at.name as away_team,
    f.matchday,
    c.name as competition_name
FROM fixtures f
JOIN teams ht ON f.home_team_id = ht.id
JOIN teams at ON f.away_team_id = at.id
JOIN competitions c ON f.competition_id = c.id
WHERE 
    EXTRACT(day from f.utc_kickoff) = 13
    AND f.utc_kickoff >= '2024-08-01'
ORDER BY f.utc_kickoff, f.competition_id;

-- Step 2: Check specifically Premier League fixtures on 13th
SELECT 
    f.id,
    f.utc_kickoff,
    ht.name as home_team,
    at.name as away_team,
    f.matchday
FROM fixtures f
JOIN teams ht ON f.home_team_id = ht.id
JOIN teams at ON f.away_team_id = at.id
WHERE 
    f.competition_id = 1
    AND EXTRACT(day from f.utc_kickoff) = 13
    AND f.utc_kickoff >= '2024-08-01'
ORDER BY f.utc_kickoff;

-- Step 3: Check fixtures_with_teams view for the same data
SELECT 
    id,
    utc_kickoff,
    home_team,
    away_team,
    matchday,
    competition_id
FROM fixtures_with_teams
WHERE 
    competition_id = 1
    AND EXTRACT(day from utc_kickoff) = 13
    AND utc_kickoff >= '2024-08-01'
ORDER BY utc_kickoff;

-- Step 4: Check if there are any fixtures with missing team references
SELECT 
    f.id,
    f.utc_kickoff,
    f.home_team_id,
    f.away_team_id,
    f.competition_id,
    ht.name as home_team,
    at.name as away_team
FROM fixtures f
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id
WHERE 
    f.competition_id = 1
    AND EXTRACT(day from f.utc_kickoff) = 13
    AND f.utc_kickoff >= '2024-08-01'
    AND (ht.id IS NULL OR at.id IS NULL)
ORDER BY f.utc_kickoff;

-- Step 5: Count total fixtures by competition for the 13th
SELECT 
    c.name,
    c.id,
    COUNT(*) as fixture_count
FROM fixtures f
JOIN competitions c ON f.competition_id = c.id
WHERE 
    EXTRACT(day from f.utc_kickoff) = 13
    AND f.utc_kickoff >= '2024-08-01'
GROUP BY c.id, c.name
ORDER BY c.id;