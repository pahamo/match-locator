-- Multi-Competition Fixture Import SQL
-- Generated: 2025-09-07T06:28:20.783Z
-- Source: TheSportsDB API (with fallback to sample data)
-- Competitions: premier-league, bundesliga, la-liga, serie-a, ligue-1

-- Prerequisites:
-- 1. Database migration completed (database-migration.sql)
-- 2. Teams imported (teams-manual-import.sql)
-- 3. Competitions table populated with correct competition IDs

-- Note: This script resolves team names to IDs via database JOINs
-- Make sure team names match exactly between teams and fixtures

-- Insert fixtures (48 records)
-- This uses team names that will be resolved to IDs via JOIN

-- Create temporary table for team name resolution and fixture insert
WITH fixture_data AS (
  SELECT * FROM (VALUES
    ('sample_1_1', '2024-08-17T13:00:00.000Z', 1, 'Sample Stadium 1', 'scheduled', 1, 'Arsenal', 'Aston Villa'),
    ('sample_1_2', '2024-08-24T13:00:00.000Z', 2, 'Sample Stadium 2', 'scheduled', 1, 'Aston Villa', 'AFC Bournemouth'),
    ('sample_1_3', '2024-08-31T13:00:00.000Z', 3, 'Sample Stadium 3', 'scheduled', 1, 'AFC Bournemouth', 'Brentford'),
    ('sample_1_4', '2024-09-07T13:00:00.000Z', 4, 'Sample Stadium 4', 'scheduled', 1, 'Brentford', 'Brighton & Hove Albion'),
    ('sample_1_5', '2024-09-14T13:00:00.000Z', 5, 'Sample Stadium 5', 'scheduled', 1, 'Brighton & Hove Albion', 'Chelsea'),
    ('sample_1_6', '2024-09-21T13:00:00.000Z', 6, 'Sample Stadium 6', 'scheduled', 1, 'Chelsea', 'Crystal Palace'),
    ('sample_1_7', '2024-09-28T13:00:00.000Z', 7, 'Sample Stadium 7', 'scheduled', 1, 'Crystal Palace', 'Everton'),
    ('sample_1_8', '2024-10-05T13:00:00.000Z', 8, 'Sample Stadium 8', 'scheduled', 1, 'Everton', 'Fulham'),
    ('sample_1_9', '2024-10-12T13:00:00.000Z', 9, 'Sample Stadium 9', 'scheduled', 1, 'Fulham', 'Ipswich Town'),
    ('sample_1_10', '2024-10-19T13:00:00.000Z', 10, 'Sample Stadium 10', 'scheduled', 1, 'Ipswich Town', 'Leicester City'),
    ('sample_2_1', '2024-08-24T13:00:00.000Z', 1, 'Sample Stadium 1', 'scheduled', 2, 'FC Augsburg', 'Bayer 04 Leverkusen'),
    ('sample_2_2', '2024-08-31T13:00:00.000Z', 2, 'Sample Stadium 2', 'scheduled', 2, 'Bayer 04 Leverkusen', 'Bayern Munich'),
    ('sample_2_3', '2024-09-07T13:00:00.000Z', 3, 'Sample Stadium 3', 'scheduled', 2, 'Bayern Munich', 'Borussia Dortmund'),
    ('sample_2_4', '2024-09-14T13:00:00.000Z', 4, 'Sample Stadium 4', 'scheduled', 2, 'Borussia Dortmund', 'Borussia Mönchengladbach'),
    ('sample_2_5', '2024-09-21T13:00:00.000Z', 5, 'Sample Stadium 5', 'scheduled', 2, 'Borussia Mönchengladbach', 'Eintracht Frankfurt'),
    ('sample_2_6', '2024-09-28T13:00:00.000Z', 6, 'Sample Stadium 6', 'scheduled', 2, 'Eintracht Frankfurt', '1. FC Heidenheim'),
    ('sample_2_7', '2024-10-05T13:00:00.000Z', 7, 'Sample Stadium 7', 'scheduled', 2, '1. FC Heidenheim', 'TSG Hoffenheim'),
    ('sample_2_8', '2024-10-12T13:00:00.000Z', 8, 'Sample Stadium 8', 'scheduled', 2, 'TSG Hoffenheim', 'Holstein Kiel'),
    ('sample_2_9', '2024-10-19T13:00:00.000Z', 9, 'Sample Stadium 9', 'scheduled', 2, 'Holstein Kiel', 'RB Leipzig'),
    ('sample_3_1', '2024-08-18T13:00:00.000Z', 1, 'Sample Stadium 1', 'scheduled', 3, 'Athletic Bilbao', 'Atlético Madrid'),
    ('sample_3_2', '2024-08-25T13:00:00.000Z', 2, 'Sample Stadium 2', 'scheduled', 3, 'Atlético Madrid', 'FC Barcelona'),
    ('sample_3_3', '2024-09-01T13:00:00.000Z', 3, 'Sample Stadium 3', 'scheduled', 3, 'FC Barcelona', 'Real Betis'),
    ('sample_3_4', '2024-09-08T13:00:00.000Z', 4, 'Sample Stadium 4', 'scheduled', 3, 'Real Betis', 'Cádiz CF'),
    ('sample_3_5', '2024-09-15T13:00:00.000Z', 5, 'Sample Stadium 5', 'scheduled', 3, 'Cádiz CF', 'Celta Vigo'),
    ('sample_3_6', '2024-09-22T13:00:00.000Z', 6, 'Sample Stadium 6', 'scheduled', 3, 'Celta Vigo', 'Deportivo Alavés'),
    ('sample_3_7', '2024-09-29T13:00:00.000Z', 7, 'Sample Stadium 7', 'scheduled', 3, 'Deportivo Alavés', 'Espanyol'),
    ('sample_3_8', '2024-10-06T13:00:00.000Z', 8, 'Sample Stadium 8', 'scheduled', 3, 'Espanyol', 'Getafe CF'),
    ('sample_3_9', '2024-10-13T13:00:00.000Z', 9, 'Sample Stadium 9', 'scheduled', 3, 'Getafe CF', 'Girona FC'),
    ('sample_3_10', '2024-10-20T13:00:00.000Z', 10, 'Sample Stadium 10', 'scheduled', 3, 'Girona FC', 'Las Palmas'),
    ('sample_4_1', '2024-08-18T13:00:00.000Z', 1, 'Sample Stadium 1', 'scheduled', 4, 'Atalanta', 'Bologna FC'),
    ('sample_4_2', '2024-08-25T13:00:00.000Z', 2, 'Sample Stadium 2', 'scheduled', 4, 'Bologna FC', 'Cagliari'),
    ('sample_4_3', '2024-09-01T13:00:00.000Z', 3, 'Sample Stadium 3', 'scheduled', 4, 'Cagliari', 'Como 1907'),
    ('sample_4_4', '2024-09-08T13:00:00.000Z', 4, 'Sample Stadium 4', 'scheduled', 4, 'Como 1907', 'Empoli FC'),
    ('sample_4_5', '2024-09-15T13:00:00.000Z', 5, 'Sample Stadium 5', 'scheduled', 4, 'Empoli FC', 'ACF Fiorentina'),
    ('sample_4_6', '2024-09-22T13:00:00.000Z', 6, 'Sample Stadium 6', 'scheduled', 4, 'ACF Fiorentina', 'Genoa CFC'),
    ('sample_4_7', '2024-09-29T13:00:00.000Z', 7, 'Sample Stadium 7', 'scheduled', 4, 'Genoa CFC', 'Hellas Verona'),
    ('sample_4_8', '2024-10-06T13:00:00.000Z', 8, 'Sample Stadium 8', 'scheduled', 4, 'Hellas Verona', 'Inter Milan'),
    ('sample_4_9', '2024-10-13T13:00:00.000Z', 9, 'Sample Stadium 9', 'scheduled', 4, 'Inter Milan', 'Juventus'),
    ('sample_4_10', '2024-10-20T13:00:00.000Z', 10, 'Sample Stadium 10', 'scheduled', 4, 'Juventus', 'Lazio'),
    ('sample_5_1', '2024-08-17T13:00:00.000Z', 1, 'Sample Stadium 1', 'scheduled', 5, 'Angers SCO', 'AJ Auxerre'),
    ('sample_5_2', '2024-08-24T13:00:00.000Z', 2, 'Sample Stadium 2', 'scheduled', 5, 'AJ Auxerre', 'Stade Brestois 29'),
    ('sample_5_3', '2024-08-31T13:00:00.000Z', 3, 'Sample Stadium 3', 'scheduled', 5, 'Stade Brestois 29', 'Le Havre AC'),
    ('sample_5_4', '2024-09-07T13:00:00.000Z', 4, 'Sample Stadium 4', 'scheduled', 5, 'Le Havre AC', 'RC Lens'),
    ('sample_5_5', '2024-09-14T13:00:00.000Z', 5, 'Sample Stadium 5', 'scheduled', 5, 'RC Lens', 'Lille OSC'),
    ('sample_5_6', '2024-09-21T13:00:00.000Z', 6, 'Sample Stadium 6', 'scheduled', 5, 'Lille OSC', 'Olympique Lyonnais'),
    ('sample_5_7', '2024-09-28T13:00:00.000Z', 7, 'Sample Stadium 7', 'scheduled', 5, 'Olympique Lyonnais', 'Olympique de Marseille'),
    ('sample_5_8', '2024-10-05T13:00:00.000Z', 8, 'Sample Stadium 8', 'scheduled', 5, 'Olympique de Marseille', 'AS Monaco'),
    ('sample_5_9', '2024-10-12T13:00:00.000Z', 9, 'Sample Stadium 9', 'scheduled', 5, 'AS Monaco', 'FC Nantes')
  ) AS fd(external_ref, utc_kickoff, matchday, venue, status, competition_id, home_team_name, away_team_name)
),
team_resolution AS (
  SELECT 
    fd.external_ref,
    fd.utc_kickoff::timestamp as utc_kickoff,
    fd.matchday,
    fd.venue,
    fd.status,
    fd.competition_id,
    ht.id as home_team_id,
    at.id as away_team_id
  FROM fixture_data fd
  JOIN teams ht ON ht.name = fd.home_team_name AND ht.competition_id = fd.competition_id
  JOIN teams at ON at.name = fd.away_team_name AND at.competition_id = fd.competition_id
)
INSERT INTO fixtures (
  external_ref, utc_kickoff, matchday, venue, status, 
  competition_id, home_team_id, away_team_id
)
SELECT 
  external_ref, utc_kickoff, matchday, venue, status,
  competition_id, home_team_id, away_team_id
FROM team_resolution
ON CONFLICT (external_ref) DO UPDATE SET
  utc_kickoff = EXCLUDED.utc_kickoff,
  matchday = EXCLUDED.matchday,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Verify the import
-- SELECT 
--   c.name as competition,
--   COUNT(f.id) as fixture_count,
--   MIN(f.utc_kickoff) as earliest_fixture,
--   MAX(f.utc_kickoff) as latest_fixture
-- FROM competitions c
-- LEFT JOIN fixtures f ON c.id = f.competition_id
-- GROUP BY c.name, c.display_order
-- ORDER BY c.display_order;
