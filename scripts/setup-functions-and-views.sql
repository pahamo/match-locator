-- =============================================================================
-- STEP 3: CREATE FUNCTIONS AND VIEWS
-- =============================================================================
-- Run this AFTER Steps 1 and 2 are complete

-- -----------------------------------------------------------------------------
-- Function to recalculate league standings for a competition/season
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION calculate_league_standings(
    comp_id INTEGER,
    season_str VARCHAR(10)
)
RETURNS void AS $$
DECLARE
    team_record RECORD;
    fixture_record RECORD;
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
                COALESCE(full_time_home_score, home_score) as home_score,
                COALESCE(full_time_away_score, away_score) as away_score
            FROM fixtures
            WHERE competition_id = comp_id
                AND season = season_str
                AND status = 'FINISHED'
                AND (
                    (full_time_home_score IS NOT NULL AND full_time_away_score IS NOT NULL)
                    OR (home_score IS NOT NULL AND away_score IS NOT NULL)
                )
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

COMMENT ON FUNCTION calculate_league_standings(INTEGER, VARCHAR) IS 'Recalculates all league standings for a given competition and season';

-- -----------------------------------------------------------------------------
-- Create view for easy league table access
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

-- Test that everything was created successfully
SELECT 'Step 3 Complete: Functions and views created' as status;

-- Show available league table query
SELECT 'Test query: SELECT * FROM current_league_tables WHERE competition_id = 1 LIMIT 5;' as test_query;