-- Multi-Competition Team Import SQL
-- Generated: 2025-09-07T06:16:56.629Z
-- Source: TheSportsDB API
-- Competitions: premier-league, bundesliga, la-liga, serie-a, ligue-1

-- Insert teams (24 records)
INSERT INTO teams (
  name, slug, crest_url, competition_id, country_code, 
  thesportsdb_id, external_ref, venue, website, founded_year
) VALUES
  ('Bolton Wanderers', 'bolton-wanderers', 'https://r2.thesportsdb.com/images/media/team/logo/ah9igu1508249502.png', 1, 'ENG', 133606, 'thesportsdb_133606', 'Toughsheet Community Stadium', 'www.bwfc.co.uk', 1874),
  ('Wigan Athletic', 'wigan-athletic', 'https://r2.thesportsdb.com/images/media/team/logo/bfty3k1534961808.png', 1, 'ENG', 133607, 'thesportsdb_133607', 'The Brick Community Stadium', 'www.wiganlatics.co.uk', 1932),
  ('Blackpool', 'blackpool', 'https://r2.thesportsdb.com/images/media/team/logo/m1w9iy1536250797.png', 1, 'ENG', 133618, 'thesportsdb_133618', 'Bloomfield Road', 'www.blackpoolfc.co.uk', 1887),
  ('Doncaster Rovers', 'doncaster-rovers', 'https://r2.thesportsdb.com/images/media/team/logo/90c87g1536678708.png', 1, 'ENG', 133620, 'thesportsdb_133620', 'The Eco-Power Stadium', 'www.doncasterroversfc.co.uk', 1879),
  ('Barnsley', 'barnsley', 'https://r2.thesportsdb.com/images/media/team/logo/qpwyvu1447439467.png', 1, 'ENG', 133630, 'thesportsdb_133630', 'Oakwell', 'www.barnsleyfc.co.uk', 1887),
  ('Peterborough United', 'peterborough-united', 'https://r2.thesportsdb.com/images/media/team/logo/db3auo1536780511.png', 1, 'ENG', 133631, 'thesportsdb_133631', 'Weston Homes Stadium', 'www.theposh.com', 1934),
  ('Reading', 'reading', 'https://r2.thesportsdb.com/images/media/team/logo/zocwcp1548156693.png', 1, 'ENG', 133633, 'thesportsdb_133633', 'Select Car Leasing Stadium', 'www.readingfc.co.uk', 1871),
  ('Cardiff City', 'cardiff-city', 'https://r2.thesportsdb.com/images/media/team/logo/0pq7br1509012499.png', 1, 'ENG', 133637, 'thesportsdb_133637', 'Cardiff City Stadium', 'www.cardiffcityfc.co.uk', 1899),
  ('Plymouth Argyle', 'plymouth-argyle', 'https://r2.thesportsdb.com/images/media/team/logo/rpqvrs1423806117.png', 1, 'ENG', 133836, 'thesportsdb_133836', 'Home Park', 'www.pafc.co.uk', 1886),
  ('Luton Town', 'luton-town', 'https://r2.thesportsdb.com/images/media/team/logo/0mwfv71536679991.png', 1, 'ENG', 133888, 'thesportsdb_133888', 'Kenilworth Road', 'www.lutontown.co.uk/page/Welcome', 1885),
  ('Huddersfield Town', 'huddersfield-town', 'https://r2.thesportsdb.com/images/media/team/logo/emz7cd1504211130.png', 1, 'ENG', 133932, 'thesportsdb_133932', 'Accu Stadium', 'www.htafc.com', 1908),
  ('Bradford City', 'bradford-city', 'https://r2.thesportsdb.com/images/media/team/logo/tpsrww1447441914.png', 1, 'ENG', 134189, 'thesportsdb_134189', 'University of Bradford Stadium', 'www.bradfordcityfc.co.uk', 1903),
  ('Rotherham United', 'rotherham-united', 'https://r2.thesportsdb.com/images/media/team/logo/aeq3ka1536240440.png', 1, 'ENG', 134231, 'thesportsdb_134231', 'AESSEAL New York Stadium', 'www.themillers.co.uk', 1925),
  ('AFC Wimbledon', 'afc-wimbledon', 'https://r2.thesportsdb.com/images/media/team/logo/1jsujt1536843490.png', 1, 'ENG', 134241, 'thesportsdb_134241', 'The Cherry Red Records Stadium', 'www.afcwimbledon.co.uk', 2002),
  ('Stockport County', 'stockport-county', 'https://r2.thesportsdb.com/images/media/team/logo/mm0t3r1727355929.png', 1, 'ENG', 134258, 'thesportsdb_134258', 'Edgeley Park', 'www.stockportcounty.com', 1883),
  ('Exeter City', 'exeter-city', 'https://r2.thesportsdb.com/images/media/team/logo/51dybw1521145080.png', 1, 'ENG', 134365, 'thesportsdb_134365', 'St James Park Exeter', 'www.exetercityfc.co.uk', 1901),
  ('Leyton Orient', 'leyton-orient', 'https://r2.thesportsdb.com/images/media/team/logo/c93xvi1561110072.png', 1, 'ENG', 134367, 'thesportsdb_134367', 'BetWright Stadium', 'www.leytonorient.com', 1881),
  ('Northampton Town', 'northampton-town', 'https://r2.thesportsdb.com/images/media/team/logo/dxpzek1542836865.png', 1, 'ENG', 134370, 'thesportsdb_134370', 'Sixfields Stadium', 'www.ntfc.co.uk', 1897),
  ('Port Vale', 'port-vale', 'https://r2.thesportsdb.com/images/media/team/logo/ga6owu1540899009.png', 1, 'ENG', 134375, 'thesportsdb_134375', 'Vale Park', 'www.port-vale.co.uk', 1876),
  ('Burton Albion', 'burton-albion', 'https://r2.thesportsdb.com/images/media/team/logo/bjpqv21509012529.png', 1, 'ENG', 134376, 'thesportsdb_134376', 'Pirelli Stadium', 'www.burtonalbionfc.co.uk', 1950),
  ('Stevenage', 'stevenage', 'https://r2.thesportsdb.com/images/media/team/logo/96xjoc1540560501.png', 1, 'ENG', 134378, 'thesportsdb_134378', 'Lamex Stadium', 'www.stevenagefc.com/page/Home/0,,10839,00.html', 1976),
  ('Mansfield Town', 'mansfield-town', 'https://r2.thesportsdb.com/images/media/team/logo/yb68ap1542661122.png', 1, 'ENG', 134381, 'thesportsdb_134381', 'One Call Stadium', 'www.mansfieldtown.net', 1897),
  ('Wycombe Wanderers', 'wycombe-wanderers', 'https://r2.thesportsdb.com/images/media/team/logo/37a52o1536843511.png', 1, 'ENG', 134382, 'thesportsdb_134382', 'Adams Park', 'www.wycombewanderers.co.uk', 1887),
  ('Lincoln City', 'lincoln-city', 'https://r2.thesportsdb.com/images/media/team/logo/lk7bfk1542119120.png', 1, 'ENG', 135900, 'thesportsdb_135900', 'LNER Stadium', 'www.redimps.co.uk', 1884)
ON CONFLICT (slug) DO UPDATE SET
  crest_url = EXCLUDED.crest_url,
  competition_id = EXCLUDED.competition_id,
  country_code = EXCLUDED.country_code,
  thesportsdb_id = EXCLUDED.thesportsdb_id,
  external_ref = EXCLUDED.external_ref,
  venue = EXCLUDED.venue,
  website = EXCLUDED.website,
  founded_year = EXCLUDED.founded_year,
  updated_at = NOW();


-- Insert team aliases (61 records)
INSERT INTO team_aliases (team_slug, alias_name)
SELECT t.slug, aliases.alias_name
FROM (VALUES
  ('bolton-wanderers', 'BOL'),
  ('bolton-wanderers', 'Bolton Wanderers Football Club, BWFC'),
  ('bolton-wanderers', 'The Trotters'),
  ('wigan-athletic', 'WIG'),
  ('wigan-athletic', 'Wigan Athletic Football Club, WAFC'),
  ('wigan-athletic', 'Latics'),
  ('blackpool', 'BLK'),
  ('blackpool', 'Blackpool FC'),
  ('blackpool', 'Seasiders, BFC'),
  ('doncaster-rovers', 'DNR'),
  ('doncaster-rovers', 'Doncaster Rovers Football Club'),
  ('doncaster-rovers', 'Donny, Rovers'),
  ('barnsley', 'BRS'),
  ('barnsley', 'Barnsley Football Club'),
  ('barnsley', 'Tykes, Barnsley, Reds'),
  ('peterborough-united', 'PTU'),
  ('peterborough-united', 'Peterborough United Football Club, Peterboro'),
  ('peterborough-united', 'PUFC, The Posh'),
  ('reading', 'RDG'),
  ('reading', 'Reading FC'),
  ('reading', 'The Royals'),
  ('cardiff-city', 'CDF'),
  ('cardiff-city', 'Cardiff City Football Club'),
  ('plymouth-argyle', 'PLA'),
  ('plymouth-argyle', 'Plymouth Argyle Football Club'),
  ('plymouth-argyle', 'The Pilgrims'),
  ('luton-town', 'LUT'),
  ('luton-town', 'Luton Town Football Club'),
  ('luton-town', 'The Hatters'),
  ('huddersfield-town', 'HDD'),
  ('huddersfield-town', 'Huddersfield Town AFC'),
  ('bradford-city', 'BDC'),
  ('bradford-city', 'Bradford City Association Football Club'),
  ('bradford-city', 'Bradford, Bantams, Paraders, BCAFC'),
  ('rotherham-united', 'RTU'),
  ('rotherham-united', 'Rotherham United Football Club, RUFC'),
  ('afc-wimbledon', 'AWM'),
  ('afc-wimbledon', 'The Dons'),
  ('stockport-county', 'STO'),
  ('stockport-county', 'Stockport County Football Club'),
  ('exeter-city', 'EXE'),
  ('exeter-city', 'Exeter City Football Club, ECFC'),
  ('leyton-orient', 'LEY'),
  ('leyton-orient', 'Orient'),
  ('leyton-orient', 'Orient, The O'),
  ('northampton-town', 'NHT'),
  ('northampton-town', 'Northampton Town Football Club, NTFC'),
  ('port-vale', 'PTV'),
  ('port-vale', 'Vale, Port Vale FC'),
  ('port-vale', 'The Valiants, Vale, PVFC'),
  ('burton-albion', 'BRA'),
  ('burton-albion', 'Burton Albion Football Club'),
  ('burton-albion', 'The Brewers, BAFC'),
  ('stevenage', 'STV'),
  ('stevenage', 'Stevenage Football Club, Stevenage Borough Football Club'),
  ('mansfield-town', 'MSF'),
  ('mansfield-town', 'Mansfield Town Football Club'),
  ('wycombe-wanderers', 'WYC'),
  ('wycombe-wanderers', 'Wycombe Wanderers Football Club'),
  ('lincoln-city', 'LNC'),
  ('lincoln-city', 'Lincoln City Football Club')
) AS aliases(team_slug, alias_name)
JOIN teams t ON t.slug = aliases.team_slug
ON CONFLICT (team_slug, alias_name) DO NOTHING;
