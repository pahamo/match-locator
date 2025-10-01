-- Fix problematic team slugs identified by user
-- Run this in Supabase SQL Editor after the main migration

-- Fix specific teams with better slug names
UPDATE teams SET url_slug = CASE
  WHEN name LIKE '%FC Köln%' OR name LIKE '%1. FC Köln%' OR name LIKE '%FC Kln%' THEN 'koln'
  WHEN name LIKE '%Borussia Mönchengladbach%' OR name LIKE '%Borussia Monchengladbach%' THEN 'monchengladbach'
  WHEN name LIKE '%CD Leganés%' OR name LIKE '%Leganes%' THEN 'leganes'
  WHEN name LIKE '%Deportivo Alavés%' OR name LIKE '%Alaves%' THEN 'alaves'
  WHEN name LIKE '%FC København%' OR name LIKE '%FC Kobenhavn%' THEN 'kobenhavn'
  WHEN name LIKE 'AZ%' OR name LIKE '%AZ Alkmaar%' THEN 'az-alkmaar'
  WHEN name LIKE '%Como 1907%' OR name LIKE 'Como%' THEN 'como'
  ELSE url_slug
END
WHERE name LIKE '%FC Köln%'
   OR name LIKE '%1. FC Köln%'
   OR name LIKE '%FC Kln%'
   OR name LIKE '%Borussia Mönchengladbach%'
   OR name LIKE '%Borussia Monchengladbach%'
   OR name LIKE '%CD Leganés%'
   OR name LIKE '%Leganes%'
   OR name LIKE '%Deportivo Alavés%'
   OR name LIKE '%Alaves%'
   OR name LIKE '%FC København%'
   OR name LIKE '%FC Kobenhavn%'
   OR name LIKE 'AZ%'
   OR name LIKE '%AZ Alkmaar%'
   OR name LIKE '%Como 1907%'
   OR name LIKE 'Como%';

-- Show what we changed
SELECT
  name,
  slug as old_slug,
  url_slug as new_slug,
  'Fixed' as status
FROM teams
WHERE url_slug IN ('koln', 'monchengladbach', 'leganes', 'alaves', 'kobenhavn', 'az-alkmaar', 'como')
ORDER BY name;

-- Check for any remaining problematic slugs
SELECT
  name,
  url_slug,
  'Still needs fixing' as status
FROM teams
WHERE url_slug IS NOT NULL
AND (
  LENGTH(url_slug) <= 2 OR
  url_slug ~ '\d+$' OR
  url_slug ~ '^[0-9-]+' OR
  url_slug = ''
)
ORDER BY url_slug;