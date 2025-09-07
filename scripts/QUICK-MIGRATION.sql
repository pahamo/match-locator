-- =============================================
-- QUICK MULTI-COMPETITION MIGRATION
-- =============================================
-- Run this in Supabase SQL Editor to enable multi-competition support
-- URL: https://supabase.com/dashboard/project/ksqyurqkqznzrntdpood/sql/new

-- 1. Add competition_id to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS competition_id INTEGER;

-- 2. Add competition_id to fixtures table  
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS competition_id INTEGER;

-- 3. Set all existing teams to Premier League (competition_id = 1)
UPDATE teams SET competition_id = 1 WHERE competition_id IS NULL;

-- 4. Set all existing fixtures to Premier League (competition_id = 1)
UPDATE fixtures SET competition_id = 1 WHERE competition_id IS NULL;

-- 5. Insert additional competitions
INSERT INTO competitions (id, name, slug, short_name, country, country_code, total_rounds, total_teams, display_order, is_active, primary_color, secondary_color) 
VALUES 
  (2, 'Bundesliga', 'bundesliga', 'BL1', 'Germany', 'GER', 34, 18, 2, true, '#d20515', '#ffcc02'),
  (3, 'La Liga', 'la-liga', 'LL1', 'Spain', 'ESP', 38, 20, 3, true, '#ee8707', '#ffffff'),
  (4, 'Serie A', 'serie-a', 'SA', 'Italy', 'ITA', 38, 20, 4, true, '#024494', '#ffffff'),
  (5, 'Ligue 1', 'ligue-1', 'L1', 'France', 'FRA', 34, 18, 5, true, '#dae025', '#000000')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color;

-- 6. Insert sample teams for other competitions (for testing)
INSERT INTO teams (name, slug, competition_id, country) VALUES
  -- Bundesliga
  ('Bayern Munich', 'bayern-munich', 2, 'Germany'),
  ('Borussia Dortmund', 'borussia-dortmund', 2, 'Germany'), 
  ('RB Leipzig', 'rb-leipzig', 2, 'Germany'),
  ('Bayer 04 Leverkusen', 'bayer-leverkusen', 2, 'Germany'),
  
  -- La Liga  
  ('Real Madrid', 'real-madrid', 3, 'Spain'),
  ('FC Barcelona', 'fc-barcelona', 3, 'Spain'),
  ('Atlético Madrid', 'atletico-madrid', 3, 'Spain'),
  ('Athletic Bilbao', 'athletic-bilbao', 3, 'Spain'),
  
  -- Serie A
  ('Juventus', 'juventus', 4, 'Italy'),
  ('Inter Milan', 'inter-milan', 4, 'Italy'),
  ('AC Milan', 'ac-milan', 4, 'Italy'),
  ('Atalanta', 'atalanta', 4, 'Italy'),
  
  -- Ligue 1
  ('Paris Saint-Germain', 'paris-saint-germain', 5, 'France'),
  ('Olympique Lyonnais', 'olympique-lyonnais', 5, 'France'),
  ('Olympique de Marseille', 'olympique-marseille', 5, 'France'),
  ('AS Monaco', 'as-monaco', 5, 'France')
ON CONFLICT (slug) DO NOTHING;

-- Verify the migration
SELECT 'Competitions' as table_name, COUNT(*) as count FROM competitions
UNION ALL
SELECT 'Teams', COUNT(*) FROM teams
UNION ALL  
SELECT 'Fixtures', COUNT(*) FROM fixtures;

-- Show teams by competition
SELECT 
  c.name as competition,
  COUNT(t.id) as team_count
FROM competitions c
LEFT JOIN teams t ON c.id = t.competition_id
GROUP BY c.name, c.display_order
ORDER BY c.display_order;