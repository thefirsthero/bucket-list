-- Create schema
CREATE SCHEMA IF NOT EXISTS bucket_list;

-- Set search path
SET search_path TO bucket_list, public;

-- Create enum types
CREATE TYPE item_status AS ENUM ('active', 'in_progress', 'postponed', 'maybe', 'completed');
CREATE TYPE item_category AS ENUM ('upcoming_year', 'general');

-- Create bucket_items table
CREATE TABLE IF NOT EXISTS bucket_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category item_category NOT NULL DEFAULT 'general',
    status item_status NOT NULL DEFAULT 'active',
    priority INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_bucket_items_category ON bucket_items(category);
CREATE INDEX idx_bucket_items_status ON bucket_items(status);
CREATE INDEX idx_bucket_items_completed ON bucket_items(completed);
CREATE INDEX idx_bucket_items_priority ON bucket_items(priority);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bucket_items_updated_at BEFORE UPDATE
    ON bucket_items FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO bucket_items (title, description, category, status, priority) VALUES
('Learn a new language', 'Master Spanish or French', 'upcoming_year', 'active', 1),
('Run a marathon', 'Complete a full 42km marathon', 'upcoming_year', 'in_progress', 2),
('Visit Japan', 'Experience Japanese culture and cuisine', 'general', 'active', 1),
('Write a book', 'Finish writing my first novel', 'general', 'maybe', 3),
('Learn to play guitar', 'Play at least 10 songs fluently', 'upcoming_year', 'postponed', 4);
