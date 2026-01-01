-- Create schema
CREATE SCHEMA IF NOT EXISTS bucket_list;

-- Set search path
SET search_path TO bucket_list, public;

-- Create enum types
CREATE TYPE item_status AS ENUM ('active', 'in_progress', 'postponed', 'maybe', 'completed');
CREATE TYPE item_category AS ENUM ('upcoming_year', 'general');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create bucket_items table
CREATE TABLE IF NOT EXISTS bucket_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category item_category NOT NULL DEFAULT 'general',
    status item_status NOT NULL DEFAULT 'active',
    priority INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bucket_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bucket_items_user_id ON bucket_items(user_id);
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

CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON users FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Note: Sample data removed - users will create their own items after signing up
