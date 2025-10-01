# Direct SQL Migration for Smart Team Slugs

Since the Netlify functions are having deployment issues, here's a direct SQL approach you can run in your Supabase dashboard.

## Step 1: Add url_slug Column

Go to your Supabase dashboard → SQL Editor and run:

```sql
-- Add url_slug column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS url_slug TEXT;

-- Add unique index for performance and uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_url_slug ON teams(url_slug) WHERE url_slug IS NOT NULL;
```

## Step 2: Generate Smart Slugs

Run this SQL to generate smart slugs for all teams:

```sql
-- Update teams with smart slugs based on our business rules
UPDATE teams SET url_slug = CASE
  -- Special cases first
  WHEN LOWER(name) LIKE '%manchester united%' THEN 'man-united'
  WHEN LOWER(name) LIKE '%manchester city%' THEN 'man-city'
  WHEN LOWER(name) LIKE '%newcastle united%' THEN 'newcastle-united'
  WHEN LOWER(name) LIKE '%leeds united%' THEN 'leeds-united'
  WHEN LOWER(name) LIKE '%sheffield united%' THEN 'sheffield-united'
  WHEN LOWER(name) LIKE '%west ham united%' THEN 'west-ham-united'
  WHEN LOWER(name) LIKE '%wolverhampton wanderers%' THEN 'wolves'
  WHEN LOWER(name) LIKE '%tottenham hotspur%' THEN 'tottenham'
  WHEN LOWER(name) LIKE '%nottingham forest%' THEN 'forest'
  WHEN LOWER(name) LIKE '%crystal palace%' THEN 'crystal-palace'
  WHEN LOWER(name) LIKE '%brighton%hove%' THEN 'brighton'
  WHEN LOWER(name) LIKE '%leicester city%' THEN 'leicester-city'
  -- AC/FC prefix removal
  WHEN LOWER(name) LIKE 'ac milan%' THEN 'milan'
  WHEN LOWER(name) LIKE 'fc barcelona%' THEN 'barcelona'
  -- General cleanup for others
  ELSE LOWER(
    TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              COALESCE(short_name, name),
              '^(AC|FC|AS|CF|SC)\s+', '', 'gi'
            ),
            '\s+(FC|AC|CF|SC)$', '', 'gi'
          ),
          '\s+F\.?C\.?$', '', 'gi'
        ),
        '[^a-zA-Z0-9\s-]', '', 'g'
      )
    )
  )
END;

-- Clean up any remaining issues with spaces and multiple hyphens
UPDATE teams SET url_slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(url_slug, '\s+', '-', 'g'),
    '-+', '-', 'g'
  )
) WHERE url_slug IS NOT NULL;

-- Remove leading/trailing hyphens
UPDATE teams SET url_slug = TRIM(BOTH '-' FROM url_slug) WHERE url_slug IS NOT NULL;
```

## Step 3: Check Results

Verify the migration worked:

```sql
-- Check the results
SELECT id, name, slug, url_slug, short_name
FROM teams
WHERE url_slug IS NOT NULL
ORDER BY name
LIMIT 20;
```

## Step 4: Handle Conflicts (if any)

If there are any duplicate slugs:

```sql
-- Check for duplicates
SELECT url_slug, COUNT(*)
FROM teams
WHERE url_slug IS NOT NULL
GROUP BY url_slug
HAVING COUNT(*) > 1;

-- Fix duplicates by appending team ID
UPDATE teams
SET url_slug = url_slug || '-' || id::text
WHERE id IN (
  SELECT DISTINCT t1.id
  FROM teams t1
  JOIN teams t2 ON t1.url_slug = t2.url_slug AND t1.id > t2.id
  WHERE t1.url_slug IS NOT NULL
);
```

## Step 5: Verify Final Results

```sql
-- Final verification
SELECT
  COUNT(*) as total_teams,
  COUNT(url_slug) as teams_with_url_slug,
  COUNT(DISTINCT url_slug) as unique_url_slugs
FROM teams;

-- Show sample of transformations
SELECT name, slug, url_slug
FROM teams
WHERE url_slug IS NOT NULL
AND slug != url_slug
ORDER BY name
LIMIT 10;
```

## After Running SQL Migration

Once you've run these SQL commands successfully, let me know and I'll:

1. Update the application code to use the new `url_slug` fields
2. Deploy the redirect system
3. Test everything is working

This approach bypasses the Netlify functions issue and gets us the same result! 🚀