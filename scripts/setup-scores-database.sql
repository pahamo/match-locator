-- =============================================================================
-- SCORES & LEAGUE TABLES DATABASE SETUP
-- =============================================================================
-- Run this in Supabase SQL Editor to set up scores and league tables

-- -----------------------------------------------------------------------------
-- 1. ENHANCE EXISTING FIXTURES TABLE WITH SCORE COLUMNS
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
ADD COLUMN IF NOT EXISTS winner TEXT CHECK (winner IN ('HOME_TEAM', 'AWAY_TEAM', 'DRAW')),
ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT 'REGULAR' CHECK (duration IN ('REGULAR', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'));

-- Update existing home_score and away_score to be aliases for full_time scores
-- (We'll handle this in the import script)

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_fixtures_status_finished ON fixtures(status) WHERE status = 'FINISHED';
CREATE INDEX IF NOT EXISTS idx_fixtures_competition_season ON fixtures(competition_id, season);
CREATE INDEX IF NOT EXISTS idx_fixtures_scores ON fixtures(full_time_home_score, full_time_away_score) WHERE full_time_home_score IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 2. CREATE LEAGUE STANDINGS TABLE
-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------
-- 3. CREATE TOP SCORERS TABLE (Optional - for later enhancement)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS top_scorers (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER REFERENCES competitions(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    season VARCHAR(10) NOT NULL,

    -- Player info (simplified - could be normalized later)
    player_name VARCHAR(255) NOT NULL,
    player_position VARCHAR(50),
    player_nationality VARCHAR(100),

    -- Scoring stats
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,

    -- Timestamps
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(competition_id, player_name, season)
);

-- Add indexes for top scorers
CREATE INDEX IF NOT EXISTS idx_top_scorers_competition_season ON top_scorers(competition_id, season);
CREATE INDEX IF NOT EXISTS idx_top_scorers_goals ON top_scorers(competition_id, season, goals DESC);

-- -----------------------------------------------------------------------------
-- 4. CREATE FUNCTIONS FOR LEAGUE TABLE CALCULATION
-- -----------------------------------------------------------------------------

-- Function to recalculate league standings for a competition/season
CREATE OR REPLACE FUNCTION calculate_league_standings(
    comp_id INTEGER,
    season_str VARCHAR(10)
)
RETURNS void AS $$
DECLARE
    team_record RECORD;
    fixture_record RECORD;
    points_calc INTEGER;
BEGIN
    -- Clear existing standings for this competition/season
    DELETE FROM league_standings
    WHERE competition_id = comp_id AND season = season_str;

    -- Get all teams in this competition
    FOR team_record IN
        SELECT DISTINCT t.id, t.name
        FROM teams t
        WHERE t.competition_id = comp_id
    LOOP
        -- Initialize standings record for this team
        INSERT INTO league_standings (
            competition_id, team_id, season, position,
            played, won, drawn, lost, goals_for, goals_against, points,
            home_played, home_won, home_drawn, home_lost,
            away_played, away_won, away_drawn, away_lost
        ) VALUES (
            comp_id, team_record.id, season_str, 0,
            0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        );

        -- Calculate stats from finished fixtures
        FOR fixture_record IN
            SELECT
                home_team_id, away_team_id,
                full_time_home_score as home_score,
                full_time_away_score as away_score
            FROM fixtures
            WHERE competition_id = comp_id
                AND season = season_str
                AND status = 'FINISHED'
                AND full_time_home_score IS NOT NULL
                AND full_time_away_score IS NOT NULL
                AND (home_team_id = team_record.id OR away_team_id = team_record.id)
        LOOP
            -- Update stats based on whether team was home or away
            IF fixture_record.home_team_id = team_record.id THEN
                -- Team was playing at home
                UPDATE league_standings SET
                    played = played + 1,
                    home_played = home_played + 1,
                    goals_for = goals_for + fixture_record.home_score,
                    goals_against = goals_against + fixture_record.away_score,
                    won = CASE
                        WHEN fixture_record.home_score > fixture_record.away_score THEN won + 1
                        ELSE won
                    END,
                    home_won = CASE
                        WHEN fixture_record.home_score > fixture_record.away_score THEN home_won + 1
                        ELSE home_won
                    END,
                    drawn = CASE
                        WHEN fixture_record.home_score = fixture_record.away_score THEN drawn + 1
                        ELSE drawn
                    END,
                    home_drawn = CASE
                        WHEN fixture_record.home_score = fixture_record.away_score THEN home_drawn + 1
                        ELSE home_drawn
                    END,
                    lost = CASE
                        WHEN fixture_record.home_score < fixture_record.away_score THEN lost + 1
                        ELSE lost
                    END,
                    home_lost = CASE
                        WHEN fixture_record.home_score < fixture_record.away_score THEN home_lost + 1
                        ELSE home_lost
                    END,
                    points = points + CASE
                        WHEN fixture_record.home_score > fixture_record.away_score THEN 3
                        WHEN fixture_record.home_score = fixture_record.away_score THEN 1
                        ELSE 0
                    END,
                    updated_at = NOW()
                WHERE competition_id = comp_id
                    AND team_id = team_record.id
                    AND season = season_str;

            ELSE
                -- Team was playing away
                UPDATE league_standings SET
                    played = played + 1,
                    away_played = away_played + 1,
                    goals_for = goals_for + fixture_record.away_score,
                    goals_against = goals_against + fixture_record.home_score,
                    won = CASE
                        WHEN fixture_record.away_score > fixture_record.home_score THEN won + 1
                        ELSE won
                    END,
                    away_won = CASE
                        WHEN fixture_record.away_score > fixture_record.home_score THEN away_won + 1
                        ELSE away_won
                    END,
                    drawn = CASE
                        WHEN fixture_record.away_score = fixture_record.home_score THEN drawn + 1
                        ELSE drawn
                    END,
                    away_drawn = CASE
                        WHEN fixture_record.away_score = fixture_record.home_score THEN away_drawn + 1
                        ELSE away_drawn
                    END,
                    lost = CASE
                        WHEN fixture_record.away_score < fixture_record.home_score THEN lost + 1
                        ELSE lost
                    END,
                    away_lost = CASE
                        WHEN fixture_record.away_score < fixture_record.home_score THEN away_lost + 1
                        ELSE away_lost
                    END,
                    points = points + CASE
                        WHEN fixture_record.away_score > fixture_record.home_score THEN 3
                        WHEN fixture_record.away_score = fixture_record.home_score THEN 1
                        ELSE 0
                    END,
                    updated_at = NOW()
                WHERE competition_id = comp_id
                    AND team_id = team_record.id
                    AND season = season_str;
            END IF;
        END LOOP;
    END LOOP;

    -- Update positions based on points (with goal difference tiebreaker)
    WITH ranked_teams AS (
        SELECT
            team_id,
            ROW_NUMBER() OVER (
                ORDER BY
                    points DESC,
                    goal_difference DESC,
                    goals_for DESC,
                    won DESC
            ) as new_position
        FROM league_standings
        WHERE competition_id = comp_id AND season = season_str
    )
    UPDATE league_standings
    SET position = ranked_teams.new_position,
        updated_at = NOW()
    FROM ranked_teams
    WHERE league_standings.team_id = ranked_teams.team_id
        AND league_standings.competition_id = comp_id
        AND league_standings.season = season_str;

END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 5. CREATE TRIGGER TO AUTO-UPDATE STANDINGS WHEN SCORES ARE ADDED
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_standings_on_score_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only recalculate if this is a finished match with scores
    IF NEW.status = 'FINISHED'
       AND NEW.full_time_home_score IS NOT NULL
       AND NEW.full_time_away_score IS NOT NULL
       AND NEW.competition_id IS NOT NULL
       AND NEW.season IS NOT NULL THEN

        -- Recalculate standings for this competition/season
        PERFORM calculate_league_standings(NEW.competition_id, NEW.season);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_standings ON fixtures;
CREATE TRIGGER trigger_update_standings
    AFTER INSERT OR UPDATE ON fixtures
    FOR EACH ROW
    EXECUTE FUNCTION update_standings_on_score_change();

-- -----------------------------------------------------------------------------
-- 6. ADD COMMENTS FOR DOCUMENTATION
-- -----------------------------------------------------------------------------

COMMENT ON TABLE league_standings IS 'Calculated league table standings for each competition and season';
COMMENT ON COLUMN league_standings.goal_difference IS 'Automatically calculated as goals_for - goals_against';
COMMENT ON COLUMN league_standings.form_last_5 IS 'Last 5 results in order (e.g., WWLDW for Win-Win-Loss-Draw-Win)';

COMMENT ON FUNCTION calculate_league_standings(INTEGER, VARCHAR) IS 'Recalculates all league standings for a given competition and season';

COMMENT ON COLUMN fixtures.full_time_home_score IS 'Final score for home team (90 minutes + injury time)';
COMMENT ON COLUMN fixtures.half_time_home_score IS 'Score at half-time for home team';
COMMENT ON COLUMN fixtures.winner IS 'Match winner: HOME_TEAM, AWAY_TEAM, or DRAW';
COMMENT ON COLUMN fixtures.duration IS 'How the match ended: REGULAR, EXTRA_TIME, or PENALTY_SHOOTOUT';

-- -----------------------------------------------------------------------------
-- 7. CREATE VIEW FOR EASY LEAGUE TABLE ACCESS
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW current_league_tables AS
SELECT
    ls.*,
    t.name as team_name,
    t.short_name as team_short_name,
    t.slug as team_slug,
    t.crest_url as team_crest,
    c.name as competition_name,
    c.slug as competition_slug,
    c.short_name as competition_short_name
FROM league_standings ls
JOIN teams t ON ls.team_id = t.id
JOIN competitions c ON ls.competition_id = c.id
WHERE ls.season = '2025'  -- Current season
ORDER BY ls.competition_id, ls.position;

COMMENT ON VIEW current_league_tables IS 'Enriched league tables with team and competition details for current season';

-- -----------------------------------------------------------------------------
-- SETUP COMPLETE
-- -----------------------------------------------------------------------------
--
-- Next steps:
-- 1. Run the score import script to populate fixture scores
-- 2. League tables will be automatically calculated via triggers
-- 3. Query current_league_tables view to see standings
--
-- Test with: SELECT * FROM current_league_tables WHERE competition_id = 1;
--