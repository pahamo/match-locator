-- =============================================================================
-- SCORES & LEAGUE TABLES DATABASE SETUP - FIXED VERSION
-- =============================================================================
-- Run this in Supabase SQL Editor step by step

-- -----------------------------------------------------------------------------
-- STEP 1: ENHANCE EXISTING FIXTURES TABLE
-- -----------------------------------------------------------------------------
-- Add comprehensive score tracking columns to existing fixtures table

ALTER TABLE fixtures
ADD COLUMN IF NOT EXISTS full_time_home_score INTEGER,
ADD COLUMN IF NOT EXISTS full_time_away_score INTEGER,
ADD COLUMN IF NOT EXISTS half_time_home_score INTEGER,
ADD COLUMN IF NOT EXISTS half_time_away_score INTEGER,
ADD COLUMN IF NOT EXISTS extra_time_home_score INTEGER,
ADD COLUMN IF NOT EXISTS extra_time_away_score INTEGER,
ADD COLUMN IF NOT EXISTS penalty_home_score INTEGER,
ADD COLUMN IF NOT EXISTS penalty_away_score INTEGER,
ADD COLUMN IF NOT EXISTS winner TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT 'REGULAR';

-- Add constraints for winner and duration
DO $$
BEGIN
    -- Add winner constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fixtures_winner_check'
        AND table_name = 'fixtures'
    ) THEN
        ALTER TABLE fixtures ADD CONSTRAINT fixtures_winner_check
        CHECK (winner IS NULL OR winner IN ('HOME_TEAM', 'AWAY_TEAM', 'DRAW'));
    END IF;

    -- Add duration constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fixtures_duration_check'
        AND table_name = 'fixtures'
    ) THEN
        ALTER TABLE fixtures ADD CONSTRAINT fixtures_duration_check
        CHECK (duration IN ('REGULAR', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'));
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_fixtures_status_finished ON fixtures(status) WHERE status = 'FINISHED';
CREATE INDEX IF NOT EXISTS idx_fixtures_competition_season ON fixtures(competition_id, season);
CREATE INDEX IF NOT EXISTS idx_fixtures_scores ON fixtures(full_time_home_score, full_time_away_score)
  WHERE full_time_home_score IS NOT NULL;

-- Add comments
COMMENT ON COLUMN fixtures.full_time_home_score IS 'Final score for home team (90 minutes + injury time)';
COMMENT ON COLUMN fixtures.half_time_home_score IS 'Score at half-time for home team';
COMMENT ON COLUMN fixtures.winner IS 'Match winner: HOME_TEAM, AWAY_TEAM, or DRAW';
COMMENT ON COLUMN fixtures.duration IS 'How the match ended: REGULAR, EXTRA_TIME, or PENALTY_SHOOTOUT';

-- Test that columns were added successfully
SELECT 'Step 1 Complete: Fixtures table enhanced' as status;