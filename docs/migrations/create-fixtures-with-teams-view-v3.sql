-- Create fixtures_with_teams view (Version 3 - With Broadcaster Logos)
--
-- This view combines fixture data with team details and broadcaster selection logic.
--
-- Changes in V3:
-- - Added `broadcaster_image_path` field for broadcaster logos
-- - Added `broadcaster_url` field for broadcaster website links
--
-- Changes in V2:
-- - Added `is_blackout` field to explicitly mark 3pm Saturday blackout matches
--
-- Features:
-- 1. Joins fixtures with home/away team details (name, slug, crest)
-- 2. Selects UK broadcasters with priority ordering (TNT Sports > Discovery+ > Others)
-- 3. Filters out Irish ROI-specific channels
-- 4. Filters out Amazon Prime (no PL or UCL rights this season)
-- 5. Applies 3pm Saturday blackout for Premier League only
-- 6. Adds `is_blackout` boolean field for UI display
-- 7. ⭐ NEW: Adds `broadcaster_image_path` and `broadcaster_url` for logos
--
-- Usage: Execute this SQL to create or update the view

DROP VIEW IF EXISTS fixtures_with_teams CASCADE;

CREATE OR REPLACE VIEW fixtures_with_teams AS
SELECT
  f.id,
  f.competition_id,
  f.home_team_id,
  f.away_team_id,
  f.utc_kickoff,
  f.venue,
  f.status,
  f.stage,
  f.round,
  f.home_score,
  f.away_score,
  f.sportmonks_fixture_id,
  f.data_source,
  f.last_synced_at,
  f.sync_status,

  -- Home team details
  ht.name as home_team,
  ht.slug as home_team_slug,
  ht.crest_url as home_crest,

  -- Away team details
  at.name as away_team,
  at.slug as away_team_slug,
  at.crest_url as away_crest,

  -- 3pm Saturday blackout flag (from V2)
  (
    f.competition_id = 1
    AND EXTRACT(DOW FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 6  -- Saturday
    AND EXTRACT(HOUR FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 15  -- 3pm UK time
  ) AS is_blackout,

  -- Broadcaster selection with priority and filtering
  (
    SELECT b.channel_name
    FROM broadcasts b
    WHERE b.fixture_id = f.id
      AND b.country_code IN ('EN', 'GB', 'GBR')  -- UK only
      -- Filter out Irish (ROI) broadcasters
      AND b.channel_name NOT ILIKE '%ROI%'
      -- Filter out Amazon Prime (no PL or UCL rights this season)
      AND b.channel_name NOT ILIKE '%amazon%'
      -- Apply 3pm Saturday blackout for Premier League
      AND NOT (
        f.competition_id = 1
        AND EXTRACT(DOW FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 6  -- Saturday
        AND EXTRACT(HOUR FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 15  -- 3pm UK time
      )
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
      -- Filter out Irish (ROI) broadcasters
      AND b.channel_name NOT ILIKE '%ROI%'
      -- Filter out Amazon Prime
      AND b.channel_name NOT ILIKE '%amazon%'
      -- Apply 3pm Saturday blackout
      AND NOT (
        f.competition_id = 1
        AND EXTRACT(DOW FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 6
        AND EXTRACT(HOUR FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 15
      )
    ORDER BY
      CASE
        WHEN b.channel_name ILIKE '%tnt%' THEN 1
        WHEN b.channel_name ILIKE '%discovery%' THEN 2
        ELSE 3
      END,
      b.channel_name ASC
    LIMIT 1
  ) AS broadcaster_id,

  -- ⭐ NEW: Broadcaster logo image path
  (
    SELECT b.image_path
    FROM broadcasts b
    WHERE b.fixture_id = f.id
      AND b.country_code IN ('EN', 'GB', 'GBR')
      -- Filter out Irish (ROI) broadcasters
      AND b.channel_name NOT ILIKE '%ROI%'
      -- Filter out Amazon Prime
      AND b.channel_name NOT ILIKE '%amazon%'
      -- Apply 3pm Saturday blackout
      AND NOT (
        f.competition_id = 1
        AND EXTRACT(DOW FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 6
        AND EXTRACT(HOUR FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 15
      )
    ORDER BY
      CASE
        WHEN b.channel_name ILIKE '%tnt%' THEN 1
        WHEN b.channel_name ILIKE '%discovery%' THEN 2
        ELSE 3
      END,
      b.channel_name ASC
    LIMIT 1
  ) AS broadcaster_image_path,

  -- ⭐ NEW: Broadcaster website URL
  (
    SELECT b.url
    FROM broadcasts b
    WHERE b.fixture_id = f.id
      AND b.country_code IN ('EN', 'GB', 'GBR')
      -- Filter out Irish (ROI) broadcasters
      AND b.channel_name NOT ILIKE '%ROI%'
      -- Filter out Amazon Prime
      AND b.channel_name NOT ILIKE '%amazon%'
      -- Apply 3pm Saturday blackout
      AND NOT (
        f.competition_id = 1
        AND EXTRACT(DOW FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 6
        AND EXTRACT(HOUR FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 15
      )
    ORDER BY
      CASE
        WHEN b.channel_name ILIKE '%tnt%' THEN 1
        WHEN b.channel_name ILIKE '%discovery%' THEN 2
        ELSE 3
      END,
      b.channel_name ASC
    LIMIT 1
  ) AS broadcaster_url

FROM fixtures f
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id;

-- Grant permissions
GRANT SELECT ON fixtures_with_teams TO anon, authenticated;

-- Verify the view includes new fields
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'fixtures_with_teams'
  AND column_name IN ('broadcaster', 'broadcaster_id', 'broadcaster_image_path', 'broadcaster_url', 'is_blackout')
ORDER BY column_name;
