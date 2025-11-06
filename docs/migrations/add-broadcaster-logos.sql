-- Add Broadcaster Logos to broadcasts table
--
-- Adds image_path and url columns from SportMonks TV stations API
-- This allows us to display broadcaster logos instead of just text
--
-- Usage: Run this in Supabase SQL Editor

-- Add image_path column for broadcaster logo URL
ALTER TABLE broadcasts
ADD COLUMN IF NOT EXISTS image_path TEXT;

-- Add url column for broadcaster website
ALTER TABLE broadcasts
ADD COLUMN IF NOT EXISTS url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN broadcasts.image_path IS 'URL to broadcaster logo from SportMonks API (e.g., https://cdn.sportmonks.com/images/core/tvstations/10/42.png)';
COMMENT ON COLUMN broadcasts.url IS 'Broadcaster website URL from SportMonks API';

-- Create index for faster logo lookups
CREATE INDEX IF NOT EXISTS idx_broadcasts_image_path ON broadcasts(image_path) WHERE image_path IS NOT NULL;

-- Verify the changes
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'broadcasts'
  AND column_name IN ('image_path', 'url')
ORDER BY column_name;
