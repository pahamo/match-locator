-- Add is_production_visible column to competitions table
-- This column controls whether a competition is visible on the public site

-- Step 1: Add the column with default value
ALTER TABLE competitions 
ADD COLUMN is_production_visible BOOLEAN DEFAULT TRUE;

-- Step 2: Set initial visibility values
-- Only Premier League should be visible by default, UCL should be hidden
UPDATE competitions 
SET is_production_visible = CASE 
    WHEN id = 1 THEN TRUE  -- Premier League visible
    WHEN id = 2 THEN FALSE -- UCL hidden by default
    ELSE TRUE              -- Other competitions visible by default
END;

-- Step 3: Verify the changes
SELECT id, name, short_name, is_active, is_production_visible 
FROM competitions 
ORDER BY id;