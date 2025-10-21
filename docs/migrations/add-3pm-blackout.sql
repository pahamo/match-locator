-- Add 3pm Saturday blackout rule to fixtures_with_teams view
-- Premier League matches at 3pm on Saturdays are not shown on UK TV

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

  -- Broadcaster selection with priority and filtering
  -- Applies 3pm Saturday blackout for Premier League
  (
    SELECT b.channel_name
    FROM broadcasts b
    WHERE b.fixture_id = f.id
      AND b.country_code IN ('EN', 'GB', 'GBR')  -- UK only
      -- Filter out Irish (ROI) broadcasters
      AND b.channel_name NOT ILIKE '%ROI%'
      -- Filter out Amazon Prime for Premier League (no PL rights this season)
      AND NOT (f.competition_id = 1 AND b.channel_name ILIKE '%amazon%')
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
      AND NOT (f.competition_id = 1 AND b.channel_name ILIKE '%amazon%')
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
