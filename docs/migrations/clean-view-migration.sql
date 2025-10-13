-- ============================================================================
-- Update fixtures_with_teams View for Clean Data Architecture
-- Date: 2025-10-09
--
-- Purpose: Update view to work with new jsonb columns and broadcaster selection
-- Changes:
--   - round is now jsonb (not varchar or integer)
--   - stage is now jsonb (not varchar)
--   - matchday column removed (calculate from round->>'name' when needed)
--   - Amazon Prime filtered out for Premier League
--   - Broadcaster priority: TNT Sports > Discovery+ > Others (alphabetical)
--
-- Prerequisites: Run clean-schema-migration.sql first
-- ============================================================================

-- Drop existing view
DROP VIEW IF EXISTS fixtures_with_teams CASCADE;

-- Create updated view with new schema
CREATE VIEW fixtures_with_teams AS
SELECT
  -- Fixture core fields
  f.id,
  f.competition_id,
  f.home_team_id,
  f.away_team_id,
  f.utc_kickoff,
  f.season,
  f.venue,
  f.status,
  f.home_score,
  f.away_score,
  f.sportmonks_fixture_id,

  -- API objects stored as jsonb
  f.round,   -- Now jsonb: {id, name, league_id, season_id, ...}
  f.stage,   -- Now jsonb

  -- Home team info (joined from teams table)
  ht.id as home_team_db_id,
  ht.name as home_team,
  ht.slug as home_team_slug,
  ht.crest_url as home_crest,

  -- Away team info (joined from teams table)
  at.id as away_team_db_id,
  at.name as away_team,
  at.slug as away_team_slug,
  at.crest_url as away_crest,

  -- Broadcaster selection with priority and filtering
  (
    SELECT b.channel_name
    FROM broadcasts b
    WHERE b.fixture_id = f.id
      AND b.country_code IN ('EN', 'GB', 'GBR')  -- England only
      -- Filter out Amazon Prime for Premier League (no PL rights this season)
      AND NOT (f.competition_id = 1 AND b.channel_name ILIKE '%amazon%')
    ORDER BY
      -- Priority order: TNT Sports > Discovery+ > Others
      CASE
        WHEN b.channel_name ILIKE '%tnt%' THEN 1
        WHEN b.channel_name ILIKE '%discovery%' THEN 2
        ELSE 3
      END,
      b.channel_name ASC  -- Alphabetical within priority group
    LIMIT 1
  ) AS broadcaster,

  -- Broadcaster ID (SportMonks TV station ID)
  (
    SELECT b.sportmonks_tv_station_id
    FROM broadcasts b
    WHERE b.fixture_id = f.id
      AND b.country_code IN ('EN', 'GB', 'GBR')
      AND NOT (f.competition_id = 1 AND b.channel_name ILIKE '%amazon%')
    ORDER BY
      CASE
        WHEN b.channel_name ILIKE '%tnt%' THEN 1
        WHEN b.channel_name ILIKE '%discovery%' THEN 2
        ELSE 3
      END,
      b.channel_name ASC
    LIMIT 1
  ) AS broadcaster_id

FROM fixtures f
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test 1: Verify view structure
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'fixtures_with_teams'
ORDER BY ordinal_position;

-- Test 2: Check that round is jsonb
SELECT
  id,
  round,
  round->>'name' as matchweek,
  round->>'id' as round_id,
  home_team,
  away_team
FROM fixtures_with_teams
WHERE round IS NOT NULL
LIMIT 5;

-- Test 3: Verify fixture 6057 shows TNT Sports (not Amazon Prime)
SELECT
  id,
  home_team,
  away_team,
  broadcaster,
  broadcaster_id
FROM fixtures_with_teams
WHERE id = 6057;

-- Expected: broadcaster should be "TNT Sports 1" or "Discovery+" (NOT "Amazon Prime Video")

-- Test 4: Count Premier League fixtures by matchweek
SELECT
  round->>'name' as matchweek,
  COUNT(*) as fixture_count
FROM fixtures_with_teams
WHERE competition_id = 1  -- Premier League
  AND round IS NOT NULL
GROUP BY round->>'name'
ORDER BY (round->>'name')::int;

-- Expected: Should see all matchweeks (1-38) with ~10 fixtures each

-- Test 5: Check that no Amazon Prime for PL
SELECT
  id,
  home_team,
  away_team,
  broadcaster
FROM fixtures_with_teams
WHERE competition_id = 1  -- Premier League
  AND broadcaster ILIKE '%amazon%';

-- Expected: 0 rows (Amazon filtered out)

-- Test 6: Check broadcaster priority (TNT > Discovery+ > others)
SELECT
  broadcaster,
  COUNT(*) as fixture_count
FROM fixtures_with_teams
WHERE competition_id = 1  -- Premier League
  AND broadcaster IS NOT NULL
GROUP BY broadcaster
ORDER BY COUNT(*) DESC;

-- Expected: TNT Sports variants at top, then Discovery+, then others

-- ============================================================================
-- QUERY EXAMPLES FOR APPLICATION USE
-- ============================================================================

-- Get fixtures with matchweek extracted from round jsonb
SELECT
  id,
  (round->>'name')::int as matchweek,  -- Extract matchweek from jsonb
  home_team,
  away_team,
  broadcaster,
  utc_kickoff
FROM fixtures_with_teams
WHERE competition_id = 1
  AND (round->>'name')::int = 4  -- Filter by matchweek
ORDER BY utc_kickoff;

-- Get all broadcasts for a fixture (not just the selected one)
SELECT
  f.id,
  f.home_team,
  f.away_team,
  f.broadcaster as selected_broadcaster,
  b.channel_name as all_broadcasters,
  b.sportmonks_tv_station_id
FROM fixtures_with_teams f
JOIN broadcasts b ON b.fixture_id = f.id
WHERE f.id = 6057
  AND b.country_code IN ('EN', 'GB', 'GBR')
ORDER BY b.channel_name;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
Key Changes from Previous View:
1. round column is now jsonb - access with round->>'name'
2. matchday column removed - calculate (round->>'name')::int when needed
3. Amazon Prime filtered out for Premier League (competition_id = 1)
4. Broadcaster selection prioritizes TNT Sports and Discovery+
5. home_team/away_team come from JOIN (not from fixtures table columns)

Frontend Impact:
- Change fixture.matchweek to getMatchweek(fixture)
- Access matchweek as: (fixture.round?.name ? parseInt(fixture.round.name, 10) : null)
- TypeScript interface needs round: RoundData (object, not string/number)
*/
