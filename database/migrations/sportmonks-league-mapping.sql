-- Sports Monks League Mapping
-- Generated: 2025-10-02T09:54:04.082Z

-- Create mapping table
CREATE TABLE IF NOT EXISTS api_competition_mapping (
  our_competition_id INT PRIMARY KEY REFERENCES competitions(id),
  sportmonks_league_id INT NOT NULL,
  sportmonks_league_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_verified_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert mappings
INSERT INTO api_competition_mapping (our_competition_id, sportmonks_league_id, sportmonks_league_name, is_active)
VALUES (1, 8, 'Premier League', true)
ON CONFLICT (our_competition_id) DO UPDATE SET
  sportmonks_league_id = EXCLUDED.sportmonks_league_id,
  sportmonks_league_name = EXCLUDED.sportmonks_league_name,
  is_active = EXCLUDED.is_active,
  last_verified_at = NOW();

INSERT INTO api_competition_mapping (our_competition_id, sportmonks_league_id, sportmonks_league_name, is_active)
VALUES (2, 2, 'Champions League', true)
ON CONFLICT (our_competition_id) DO UPDATE SET
  sportmonks_league_id = EXCLUDED.sportmonks_league_id,
  sportmonks_league_name = EXCLUDED.sportmonks_league_name,
  is_active = EXCLUDED.is_active,
  last_verified_at = NOW();

INSERT INTO api_competition_mapping (our_competition_id, sportmonks_league_id, sportmonks_league_name, is_active)
VALUES (3, 24, 'FA Cup', true)
ON CONFLICT (our_competition_id) DO UPDATE SET
  sportmonks_league_id = EXCLUDED.sportmonks_league_id,
  sportmonks_league_name = EXCLUDED.sportmonks_league_name,
  is_active = EXCLUDED.is_active,
  last_verified_at = NOW();

INSERT INTO api_competition_mapping (our_competition_id, sportmonks_league_id, sportmonks_league_name, is_active)
VALUES (4, 27, 'Carabao Cup', true)
ON CONFLICT (our_competition_id) DO UPDATE SET
  sportmonks_league_id = EXCLUDED.sportmonks_league_id,
  sportmonks_league_name = EXCLUDED.sportmonks_league_name,
  is_active = EXCLUDED.is_active,
  last_verified_at = NOW();

INSERT INTO api_competition_mapping (our_competition_id, sportmonks_league_id, sportmonks_league_name, is_active)
VALUES (5, 5, 'Europa League', true)
ON CONFLICT (our_competition_id) DO UPDATE SET
  sportmonks_league_id = EXCLUDED.sportmonks_league_id,
  sportmonks_league_name = EXCLUDED.sportmonks_league_name,
  is_active = EXCLUDED.is_active,
  last_verified_at = NOW();

INSERT INTO api_competition_mapping (our_competition_id, sportmonks_league_id, sportmonks_league_name, is_active)
VALUES (8, 9, 'Championship', true)
ON CONFLICT (our_competition_id) DO UPDATE SET
  sportmonks_league_id = EXCLUDED.sportmonks_league_id,
  sportmonks_league_name = EXCLUDED.sportmonks_league_name,
  is_active = EXCLUDED.is_active,
  last_verified_at = NOW();

-- Verify mappings
SELECT
  c.id as our_id,
  c.name as our_name,
  m.sportmonks_league_id,
  m.sportmonks_league_name,
  m.is_active
FROM competitions c
LEFT JOIN api_competition_mapping m ON c.id = m.our_competition_id
ORDER BY c.id;
