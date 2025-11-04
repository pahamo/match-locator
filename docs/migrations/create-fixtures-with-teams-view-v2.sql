-- Create fixtures_with_teams view (Version 2 - With Blackout Flag)
--
-- This view combines fixture data with team details and broadcaster selection logic.
--
-- Changes in V2:
-- - Added `is_blackout` field to explicitly mark 3pm Saturday blackout matches
-- - This allows UI to show "🚫 No UK Broadcast" instead of "TBD"
--
-- Features:
-- 1. Joins fixtures with home/away team details (name, slug, crest)
-- 2. Selects UK broadcasters with priority ordering (TNT Sports > Discovery+ > Others)
-- 3. Filters out Irish ROI-specific channels
-- 4. Filters out Amazon Prime (no PL or UCL rights this season)
-- 5. Applies 3pm Saturday blackout for Premier League only
-- 6. ⭐ NEW: Adds `is_blackout` boolean field for UI display
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

  -- ⭐ NEW: 3pm Saturday blackout flag
  -- TRUE if Premier League match at 3pm Saturday UK time
  (
    f.competition_id = 1
    AND EXTRACT(DOW FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 6  -- Saturday
    AND EXTRACT(HOUR FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 15  -- 3pm UK time
  ) AS is_blackout,

  -- Broadcaster selection with priority and filtering
  -- Applies 3pm Saturday blackout for Premier League
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
      -- 3pm UK time = 14:00 UTC (BST in summer) or 15:00 UTC (GMT in winter)
      AND NOT (
        f.competition_id = 1
        AND EXTRACT(DOW FROM f.utc_kickoff AT TIME ZONE 'Europe/London') = 6  -- Saturday in UK
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
      -- Filter out Amazon Prime (no PL or UCL rights this season)
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
  ) AS broadcaster_id

FROM fixtures f
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id;

-- Grant permissions
GRANT SELECT ON fixtures_with_teams TO anon, authenticated;

-- Verification query - Check that blackout flag works
-- SELECT
--   id,
--   home_team,
--   away_team,
--   utc_kickoff,
--   is_blackout,
--   broadcaster
-- FROM fixtures_with_teams
-- WHERE competition_id = 1
--   AND is_blackout = TRUE
-- LIMIT 10;
