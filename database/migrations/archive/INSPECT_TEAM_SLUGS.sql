-- Script to inspect all team slug transformations
-- Run this in your Supabase SQL Editor to see all teams and their slug changes

SELECT
  id,
  name,
  short_name,
  slug as old_slug,
  url_slug as new_slug,
  CASE
    WHEN url_slug IS NULL THEN '❌ No new slug'
    WHEN slug = url_slug THEN '➡️ No change'
    WHEN LENGTH(url_slug) <= 2 THEN '⚠️ Very short'
    WHEN url_slug ~ '\d+$' THEN '🔢 Has ID suffix'
    ELSE '✅ Changed'
  END as status
FROM teams
ORDER BY
  CASE
    WHEN url_slug IS NULL THEN 0
    WHEN LENGTH(url_slug) <= 2 THEN 1
    WHEN url_slug ~ '\d+$' THEN 2
    ELSE 3
  END,
  name;

-- Summary stats
SELECT
  'Total teams' as metric,
  COUNT(*) as count
FROM teams
UNION ALL
SELECT
  'Teams with new slugs',
  COUNT(*)
FROM teams WHERE url_slug IS NOT NULL
UNION ALL
SELECT
  'Changed slugs',
  COUNT(*)
FROM teams WHERE url_slug IS NOT NULL AND slug != url_slug
UNION ALL
SELECT
  'Potentially problematic',
  COUNT(*)
FROM teams WHERE url_slug IS NOT NULL AND (
  LENGTH(url_slug) <= 2 OR
  url_slug ~ '\d+$' OR
  url_slug = ''
);

-- Show just the changed ones for easy review
SELECT
  name,
  slug || ' → ' || url_slug as transformation
FROM teams
WHERE url_slug IS NOT NULL
AND slug != url_slug
ORDER BY name;