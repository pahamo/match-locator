-- Generate redirect mappings for team slug changes
-- Run this in Supabase to get the redirect rules for your _redirects file

SELECT
  '# Redirect from old slug to new smart slug for: ' || name as redirect_rule
FROM teams
WHERE url_slug IS NOT NULL
  AND slug != url_slug
  AND url_slug != ''
UNION ALL
SELECT
  '/club/' || slug || ' /club/' || url_slug || ' 301!' as redirect_rule
FROM teams
WHERE url_slug IS NOT NULL
  AND slug != url_slug
  AND url_slug != ''
UNION ALL
SELECT
  '/clubs/' || slug || ' /club/' || url_slug || ' 301!' as redirect_rule
FROM teams
WHERE url_slug IS NOT NULL
  AND slug != url_slug
  AND url_slug != ''
ORDER BY redirect_rule;