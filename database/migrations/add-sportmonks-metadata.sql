-- Add Sports Monks API Metadata to Existing Tables
-- Generated: 2025-10-02
-- Purpose: Track API sync status and enable hybrid manual/API workflow

-- ============================================================================
-- FIXTURES TABLE - Add API tracking
-- ============================================================================

ALTER TABLE fixtures
ADD COLUMN IF NOT EXISTS sportmonks_fixture_id INT,
ADD COLUMN IF NOT EXISTS data_source VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50) DEFAULT 'pending';

-- Add index for API fixture lookups
CREATE INDEX IF NOT EXISTS idx_fixtures_sportmonks_id ON fixtures(sportmonks_fixture_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_data_source ON fixtures(data_source);
CREATE INDEX IF NOT EXISTS idx_fixtures_sync_status ON fixtures(sync_status);

-- Add comments for documentation
COMMENT ON COLUMN fixtures.sportmonks_fixture_id IS 'Sports Monks API fixture ID for sync matching';
COMMENT ON COLUMN fixtures.data_source IS 'Source of fixture data: manual, sportmonks, or hybrid';
COMMENT ON COLUMN fixtures.last_synced_at IS 'Last successful sync with Sports Monks API';
COMMENT ON COLUMN fixtures.sync_status IS 'Sync status: pending, synced, error, manual_override';

-- ============================================================================
-- TEAMS TABLE - Add API tracking
-- ============================================================================

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS sportmonks_team_id INT,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;

-- Add index for API team lookups
CREATE INDEX IF NOT EXISTS idx_teams_sportmonks_id ON teams(sportmonks_team_id);

-- Add comments
COMMENT ON COLUMN teams.sportmonks_team_id IS 'Sports Monks API team ID for sync matching';
COMMENT ON COLUMN teams.last_synced_at IS 'Last successful sync with Sports Monks API';

-- ============================================================================
-- BROADCASTS TABLE - Add API tracking
-- ============================================================================

ALTER TABLE broadcasts
ADD COLUMN IF NOT EXISTS sportmonks_tv_station_id INT,
ADD COLUMN IF NOT EXISTS data_source VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;

-- Add index for API TV station lookups
CREATE INDEX IF NOT EXISTS idx_broadcasts_sportmonks_id ON broadcasts(sportmonks_tv_station_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_data_source ON broadcasts(data_source);

-- Add comments
COMMENT ON COLUMN broadcasts.sportmonks_tv_station_id IS 'Sports Monks TV station ID from API';
COMMENT ON COLUMN broadcasts.data_source IS 'Source: manual, sportmonks, or hybrid';
COMMENT ON COLUMN broadcasts.last_synced_at IS 'Last successful sync with Sports Monks API';

-- ============================================================================
-- CREATE SYNC LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_sync_log (
  id SERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- 'fixtures', 'tv_stations', 'lineups', 'scores'
  competition_id INT REFERENCES competitions(id),
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'running', -- 'running', 'success', 'error', 'partial'
  fixtures_processed INT DEFAULT 0,
  fixtures_created INT DEFAULT 0,
  fixtures_updated INT DEFAULT 0,
  fixtures_errors INT DEFAULT 0,
  error_message TEXT,
  api_calls_made INT DEFAULT 0,
  duration_seconds INT,
  sync_metadata JSONB, -- Store additional sync details
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for log queries
CREATE INDEX IF NOT EXISTS idx_sync_log_type ON api_sync_log(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_log_competition ON api_sync_log(competition_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON api_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_sync_log_started ON api_sync_log(started_at DESC);

-- Add comments
COMMENT ON TABLE api_sync_log IS 'Tracks all Sports Monks API sync operations';
COMMENT ON COLUMN api_sync_log.sync_metadata IS 'JSON metadata about the sync (rate limits, warnings, etc)';

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Fixtures pending sync
CREATE OR REPLACE VIEW fixtures_pending_sync AS
SELECT
  f.id,
  f.utc_kickoff,
  f.home_team_id,
  f.away_team_id,
  f.competition_id,
  f.data_source,
  f.sync_status,
  f.last_synced_at,
  c.name as competition_name
FROM fixtures f
JOIN competitions c ON f.competition_id = c.id
WHERE f.sync_status IN ('pending', 'error')
  AND f.utc_kickoff > NOW() - INTERVAL '7 days' -- Only recent/upcoming
ORDER BY f.utc_kickoff ASC;

COMMENT ON VIEW fixtures_pending_sync IS 'Fixtures that need to be synced with Sports Monks API';

-- View: Recent sync activity
CREATE OR REPLACE VIEW recent_sync_activity AS
SELECT
  s.id,
  s.sync_type,
  c.name as competition_name,
  s.started_at,
  s.completed_at,
  s.status,
  s.fixtures_processed,
  s.fixtures_created,
  s.fixtures_updated,
  s.fixtures_errors,
  s.api_calls_made,
  s.duration_seconds,
  s.error_message
FROM api_sync_log s
LEFT JOIN competitions c ON s.competition_id = c.id
ORDER BY s.started_at DESC
LIMIT 100;

COMMENT ON VIEW recent_sync_activity IS 'Last 100 sync operations for monitoring';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show current API metadata status
SELECT 'fixtures' as table_name,
       COUNT(*) as total,
       COUNT(sportmonks_fixture_id) as has_api_id,
       COUNT(*) - COUNT(sportmonks_fixture_id) as missing_api_id
FROM fixtures
UNION ALL
SELECT 'teams' as table_name,
       COUNT(*) as total,
       COUNT(sportmonks_team_id) as has_api_id,
       COUNT(*) - COUNT(sportmonks_team_id) as missing_api_id
FROM teams
UNION ALL
SELECT 'broadcasts' as table_name,
       COUNT(*) as total,
       COUNT(sportmonks_tv_station_id) as has_api_id,
       COUNT(*) - COUNT(sportmonks_tv_station_id) as missing_api_id
FROM broadcasts;

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================

-- To rollback these changes, run:
/*
ALTER TABLE fixtures
  DROP COLUMN IF EXISTS sportmonks_fixture_id,
  DROP COLUMN IF EXISTS data_source,
  DROP COLUMN IF EXISTS last_synced_at,
  DROP COLUMN IF EXISTS sync_status;

ALTER TABLE teams
  DROP COLUMN IF EXISTS sportmonks_team_id,
  DROP COLUMN IF EXISTS last_synced_at;

ALTER TABLE broadcasts
  DROP COLUMN IF EXISTS sportmonks_tv_station_id,
  DROP COLUMN IF EXISTS data_source,
  DROP COLUMN IF EXISTS last_synced_at;

DROP VIEW IF EXISTS fixtures_pending_sync;
DROP VIEW IF EXISTS recent_sync_activity;
DROP TABLE IF EXISTS api_sync_log;
*/
