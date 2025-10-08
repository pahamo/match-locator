-- Fix broadcasts table to allow multiple channels from same provider
--
-- Problem: Old unique constraint on (fixture_id, provider_id) prevented
-- storing multiple channels from same provider (e.g., Sky Go AND Sky Ultra HD)
--
-- Solution: Use (fixture_id, sportmonks_tv_station_id) as natural key instead
-- This allows multiple channels per provider while preventing duplicate TV stations

-- Step 1: Drop old unique constraint
ALTER TABLE broadcasts DROP CONSTRAINT IF EXISTS broadcasts_fixture_id_provider_id_key;

-- Step 2: Add new unique constraint on (fixture_id, sportmonks_tv_station_id)
-- This ensures each TV station from API only appears once per fixture
ALTER TABLE broadcasts ADD CONSTRAINT broadcasts_fixture_sportmonks_unique
  UNIQUE (fixture_id, sportmonks_tv_station_id);

-- Step 3: Delete non-UK Sky channels that slipped through
-- These should have been filtered by isUKBroadcaster but got through
DELETE FROM broadcasts
WHERE LOWER(channel_name) LIKE '%sky%'
  AND (
    LOWER(channel_name) LIKE '%italia%' OR
    LOWER(channel_name) LIKE '%deutschland%' OR
    LOWER(channel_name) LIKE '%austria%' OR
    LOWER(channel_name) LIKE '%germany%' OR
    LOWER(channel_name) LIKE '%bundesliga%' OR
    LOWER(channel_name) LIKE '%sport uno%'
  );

-- Step 4: Update unmapped UK Sky channels to provider_id = 1
-- Now we can have multiple Sky channels per fixture without constraint violations
UPDATE broadcasts
SET provider_id = 1  -- Sky Sports
WHERE provider_id IS NULL
  AND LOWER(channel_name) LIKE '%sky%';

-- Show what we updated
SELECT
  channel_name,
  provider_id,
  COUNT(*) as updated_count
FROM broadcasts
WHERE provider_id = 1
  AND LOWER(channel_name) LIKE '%sky%'
GROUP BY channel_name, provider_id
ORDER BY channel_name;
