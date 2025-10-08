-- Remove custom provider_id mapping, use API data directly
--
-- Philosophy: Don't manipulate API data. Use SportMonks IDs and channel names as-is.
--
-- Changes:
-- 1. Drop unique constraint on (fixture_id, provider_id)
-- 2. Add unique constraint on (fixture_id, sportmonks_tv_station_id) - natural key from API
-- 3. Make provider_id nullable (deprecated, will remove later)
-- 4. Update fixtures_with_teams view to select broadcaster by channel_name instead of provider_id

-- Step 1: Drop old unique constraint
ALTER TABLE broadcasts DROP CONSTRAINT IF EXISTS broadcasts_fixture_id_provider_id_key;

-- Step 2: Add constraint on API's natural key
-- Prevents duplicate TV stations per fixture
-- First check if it exists, drop if present, then create
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'broadcasts_fixture_sportmonks_unique'
  ) THEN
    ALTER TABLE broadcasts DROP CONSTRAINT broadcasts_fixture_sportmonks_unique;
  END IF;
END $$;

ALTER TABLE broadcasts ADD CONSTRAINT broadcasts_fixture_sportmonks_unique
  UNIQUE (fixture_id, sportmonks_tv_station_id);

-- Step 3: Make provider_id nullable (it's deprecated now)
-- Don't drop the column yet in case we need to reference old data
ALTER TABLE broadcasts ALTER COLUMN provider_id DROP NOT NULL;

-- Step 4: Update fixtures_with_teams view to use channel names directly
DROP VIEW IF EXISTS fixtures_with_teams CASCADE;

CREATE VIEW fixtures_with_teams AS
SELECT
  f.id,
  f.competition_id,
  f.home_team_id,
  f.away_team_id,
  f.utc_kickoff,
  f.matchday,
  f.season,
  f.venue,
  f.status,
  f.home_score,
  f.away_score,
  f.sportmonks_fixture_id,
  f.round,
  f.stage,
  ht.id as home_team_db_id,
  ht.name as home_team,
  ht.slug as home_team_slug,
  ht.crest_url as home_crest,
  at.id as away_team_db_id,
  at.name as away_team,
  at.slug as away_team_slug,
  at.crest_url as away_crest,
  -- Select first UK/Ireland broadcaster alphabetically by channel name
  -- UK/Ireland share broadcast rights
  -- Country codes: IE (Ireland, 455), EN (England, 462), GB/GBR (legacy)
  (
    SELECT b.channel_name
    FROM broadcasts b
    WHERE b.fixture_id = f.id
      AND (b.country_code IN ('IE', 'EN', 'GB', 'GBR'))  -- UK/Ireland
    ORDER BY b.channel_name ASC
    LIMIT 1
  ) AS broadcaster,
  -- Store the sportmonks_tv_station_id instead of provider_id
  (
    SELECT b.sportmonks_tv_station_id
    FROM broadcasts b
    WHERE b.fixture_id = f.id
      AND (b.country_code IN ('IE', 'EN', 'GB', 'GBR'))
    ORDER BY b.channel_name ASC
    LIMIT 1
  ) AS broadcaster_id
FROM fixtures f
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id;

-- Verification query
SELECT
  id,
  home_team,
  away_team,
  broadcaster,
  broadcaster_id
FROM fixtures_with_teams
WHERE id = 6057;
