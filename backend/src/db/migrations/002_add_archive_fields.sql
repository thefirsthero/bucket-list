-- Add archive fields to bucket_items table
SET search_path TO bucket_list, public;

-- Add archived flag
ALTER TABLE bucket_items 
ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Add archived_year to track which year items were archived for
ALTER TABLE bucket_items 
ADD COLUMN IF NOT EXISTS archived_year INTEGER;

-- Add goal_year to track which year "Current Goals" items are meant for
ALTER TABLE bucket_items 
ADD COLUMN IF NOT EXISTS goal_year INTEGER;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bucket_items_archived ON bucket_items(archived);
CREATE INDEX IF NOT EXISTS idx_bucket_items_archived_year ON bucket_items(archived_year);
CREATE INDEX IF NOT EXISTS idx_bucket_items_goal_year ON bucket_items(goal_year);

-- Set goal_year for existing upcoming_year items to current year
UPDATE bucket_items 
SET goal_year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
WHERE category = 'upcoming_year' AND goal_year IS NULL;
