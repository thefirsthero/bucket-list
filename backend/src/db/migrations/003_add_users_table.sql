-- Migration: Add users table to bucket_list schema and add user_id to bucket_items
-- This migration moves from public.users to bucket_list.users

-- Add users table in the bucket_list schema
CREATE TABLE IF NOT EXISTS bucket_list.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON bucket_list.users(email);

-- Add user_id column to bucket_items (allow NULL initially for migration)
ALTER TABLE bucket_list.bucket_items 
ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- Add foreign key constraint
ALTER TABLE bucket_list.bucket_items
ADD CONSTRAINT fk_bucket_items_user
FOREIGN KEY (user_id) REFERENCES bucket_list.users(id) ON DELETE CASCADE;

-- Create index on user_id for faster queries
CREATE INDEX idx_bucket_items_user_id ON bucket_list.bucket_items(user_id);

-- Add trigger to update users.updated_at timestamp
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON bucket_list.users FOR EACH ROW
    EXECUTE FUNCTION bucket_list.update_updated_at_column();
