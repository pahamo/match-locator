-- =============================================================================
-- STEP 2: CREATE LEAGUE STANDINGS TABLE
-- =============================================================================
-- Run this AFTER Step 1 is complete

CREATE TABLE IF NOT EXISTS league_standings (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER REFERENCES competitions(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    season VARCHAR(10) NOT NULL,

    -- League position and stats
    position INTEGER,
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    drawn INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER GENERATED ALWAYS AS (goals_for - goals_against) STORED,
    points INTEGER DEFAULT 0,

    -- Additional metadata
    form_last_5 VARCHAR(5), -- e.g., 'WWLDW'
    home_played INTEGER DEFAULT 0,
    home_won INTEGER DEFAULT 0,
    home_drawn INTEGER DEFAULT 0,
    home_lost INTEGER DEFAULT 0,
    away_played INTEGER DEFAULT 0,
    away_won INTEGER DEFAULT 0,
    away_drawn INTEGER DEFAULT 0,
    away_lost INTEGER DEFAULT 0,

    -- Timestamps
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),

    -- Ensure one record per team per competition per season
    UNIQUE(competition_id, team_id, season)
);

-- Add indexes for league standings
CREATE INDEX IF NOT EXISTS idx_standings_competition_season ON league_standings(competition_id, season);
CREATE INDEX IF NOT EXISTS idx_standings_position ON league_standings(competition_id, season, position);
CREATE INDEX IF NOT EXISTS idx_standings_points ON league_standings(competition_id, season, points DESC);

-- Add comments
COMMENT ON TABLE league_standings IS 'Calculated league table standings for each competition and season';
COMMENT ON COLUMN league_standings.goal_difference IS 'Automatically calculated as goals_for - goals_against';
COMMENT ON COLUMN league_standings.form_last_5 IS 'Last 5 results in order (e.g., WWLDW for Win-Win-Loss-Draw-Win)';

-- Test that table was created successfully
SELECT 'Step 2 Complete: League standings table created' as status;