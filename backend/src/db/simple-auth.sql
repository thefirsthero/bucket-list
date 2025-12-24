-- Simple authentication setup for single user
-- Run this SQL in your PostgreSQL database
-- Users table is in public schema so it can be shared across multiple apps

-- Create users table (simple, just for credential storage)
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert your credentials (change email and password!)
-- Password below is 'test123' - CHANGE THIS!
-- To generate your own password hash, run this in node:
-- const bcrypt = require('bcrypt'); bcrypt.hash('yourpassword', 10).then(console.log);

INSERT INTO public.users (email, password_hash) 
VALUES ('vukosi90@gmail.com', '$2b$10$UX7JTtcV70mziKbVKIQkTufgVL0DVavaz/0tYiPoWrJWcJmrHMERy')
ON CONFLICT (email) DO NOTHING;

-- That's it! No user_id needed on bucket_items since it's just for you
