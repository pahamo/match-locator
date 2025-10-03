-- Sports Monks TV Stations Mapping
-- Generated: 2025-10-02T10:07:05.886Z

-- Create TV stations mapping table
CREATE TABLE IF NOT EXISTS api_tv_station_mapping (
  sportmonks_tv_station_id INT PRIMARY KEY,
  sportmonks_tv_station_name VARCHAR(255) NOT NULL,
  our_provider_id INT REFERENCES providers(id),
  station_type VARCHAR(50),
  is_uk_broadcaster BOOLEAN DEFAULT false,
  auto_mapped BOOLEAN DEFAULT false,
  last_verified_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert auto-mapped UK broadcasters
INSERT INTO api_tv_station_mapping (sportmonks_tv_station_id, sportmonks_tv_station_name, our_provider_id, station_type, is_uk_broadcaster, auto_mapped)
VALUES (999, 'Amazon Prime Video', 4, 'channel', true, true)
ON CONFLICT (sportmonks_tv_station_id) DO UPDATE SET
  sportmonks_tv_station_name = EXCLUDED.sportmonks_tv_station_name,
  our_provider_id = EXCLUDED.our_provider_id,
  station_type = EXCLUDED.station_type,
  last_verified_at = NOW();

INSERT INTO api_tv_station_mapping (sportmonks_tv_station_id, sportmonks_tv_station_name, our_provider_id, station_type, is_uk_broadcaster, auto_mapped)
VALUES (60, 'Sky Go', 1, 'channel', true, true)
ON CONFLICT (sportmonks_tv_station_id) DO UPDATE SET
  sportmonks_tv_station_name = EXCLUDED.sportmonks_tv_station_name,
  our_provider_id = EXCLUDED.our_provider_id,
  station_type = EXCLUDED.station_type,
  last_verified_at = NOW();

INSERT INTO api_tv_station_mapping (sportmonks_tv_station_id, sportmonks_tv_station_name, our_provider_id, station_type, is_uk_broadcaster, auto_mapped)
VALUES (928, 'TNT Sports 2', 2, 'channel', true, true)
ON CONFLICT (sportmonks_tv_station_id) DO UPDATE SET
  sportmonks_tv_station_name = EXCLUDED.sportmonks_tv_station_name,
  our_provider_id = EXCLUDED.our_provider_id,
  station_type = EXCLUDED.station_type,
  last_verified_at = NOW();

INSERT INTO api_tv_station_mapping (sportmonks_tv_station_id, sportmonks_tv_station_name, our_provider_id, station_type, is_uk_broadcaster, auto_mapped)
VALUES (929, 'TNT Sports 3', 2, 'channel', true, true)
ON CONFLICT (sportmonks_tv_station_id) DO UPDATE SET
  sportmonks_tv_station_name = EXCLUDED.sportmonks_tv_station_name,
  our_provider_id = EXCLUDED.our_provider_id,
  station_type = EXCLUDED.station_type,
  last_verified_at = NOW();

INSERT INTO api_tv_station_mapping (sportmonks_tv_station_id, sportmonks_tv_station_name, our_provider_id, station_type, is_uk_broadcaster, auto_mapped)
VALUES (930, 'TNT Sports 4', 2, 'channel', true, true)
ON CONFLICT (sportmonks_tv_station_id) DO UPDATE SET
  sportmonks_tv_station_name = EXCLUDED.sportmonks_tv_station_name,
  our_provider_id = EXCLUDED.our_provider_id,
  station_type = EXCLUDED.station_type,
  last_verified_at = NOW();



-- Verify mappings
SELECT
  t.sportmonks_tv_station_id,
  t.sportmonks_tv_station_name,
  t.our_provider_id,
  p.name as provider_name,
  t.is_uk_broadcaster,
  t.auto_mapped
FROM api_tv_station_mapping t
LEFT JOIN providers p ON t.our_provider_id = p.id
WHERE t.is_uk_broadcaster = true
ORDER BY t.our_provider_id, t.sportmonks_tv_station_name;
