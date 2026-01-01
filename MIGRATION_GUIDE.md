# Migration Guide: Multi-User Support

This guide will help you migrate your bucket list app from single-user to multi-user support.

## Overview

The app has been updated to support multiple users with the following changes:

- Users table moved from `public.users` to `bucket_list.users`
- All bucket list items are now tied to specific users
- New signup functionality added
- User authentication and authorization enforced

## Migration Steps

### 1. Run Database Migration

Execute the migration SQL to add the users table and user_id column:

```bash
# From the backend directory
psql -d your_database_name -f src/db/migrations/003_add_users_table.sql
```

Or if you're recreating the schema from scratch:

```bash
# Drop and recreate (WARNING: This will delete all existing data)
psql -d your_database_name -f src/db/schema.sql
```

### 2. Migrate Existing Data (If Applicable)

If you have existing bucket list items and want to migrate them to a new user:

```sql
-- First, create your user account in the new schema
INSERT INTO bucket_list.users (email, password_hash, full_name)
VALUES ('your@email.com', '$2b$10$your_bcrypt_hash', 'Your Name')
RETURNING id;

-- Note the returned user ID, then update existing items
-- Replace <user_id> with the ID from the previous query
UPDATE bucket_list.bucket_items
SET user_id = <user_id>
WHERE user_id IS NULL;

-- Make user_id required
ALTER TABLE bucket_list.bucket_items
ALTER COLUMN user_id SET NOT NULL;
```

To generate a password hash, run this in Node.js:

```javascript
const bcrypt = require("bcrypt");
bcrypt.hash("your_password", 10).then(console.log);
```

### 3. Update Environment Variables

Make sure your `.env` file has a strong JWT secret:

```env
JWT_SECRET=your-very-secure-random-secret-key-change-this
```

Generate a secure secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Restart the Backend Server

```bash
cd backend
npm run dev
```

### 5. Test the New Features

1. **Sign Up**: Navigate to `http://localhost:5173/signup` and create a new account
2. **Login**: Log in with your new credentials
3. **Create Items**: Add bucket list items - they'll be tied to your user account
4. **Multi-User Test**: Create another account and verify items are isolated per user

## New Features

### Frontend

- **Signup Page** (`/signup`): New user registration with email, password, and optional full name
- **Login Page** (`/login`): Updated with link to signup page
- **Router**: Added `/signup` route

### Backend

- **Signup Endpoint**: `POST /api/auth/signup`

  - Body: `{ email, password, full_name? }`
  - Returns: `{ token, user: { id, email, full_name } }`
  - Validates email format and password length (min 6 chars)
  - Checks for existing users (409 if duplicate)

- **Updated Login**: `POST /api/auth/login`

  - Now queries `bucket_list.users` instead of `public.users`
  - Returns user full_name in response

- **All Bucket Item Endpoints**: Now filter by authenticated user ID
  - Items are automatically scoped to the logged-in user
  - Users can only view, create, update, and delete their own items

## Database Schema Changes

### New Table: `bucket_list.users`

```sql
CREATE TABLE bucket_list.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Updated Table: `bucket_list.bucket_items`

- Added `user_id INTEGER NOT NULL` column
- Foreign key constraint to `bucket_list.users(id)` with CASCADE delete
- All queries now filter by `user_id`

## Security Considerations

1. **Password Requirements**: Minimum 6 characters (enforced client and server-side)
2. **JWT Tokens**: 30-day expiration
3. **Data Isolation**: Users can only access their own bucket list items
4. **Email Uniqueness**: Duplicate email addresses are rejected
5. **SQL Injection**: All queries use parameterized statements

## Troubleshooting

### "relation bucket_list.users does not exist"

Run the migration script: `psql -d your_db -f src/db/migrations/003_add_users_table.sql`

### "column user_id does not exist"

The migration script should have added this. Check if it ran successfully.

### "Email already registered"

Use a different email or remove the existing user from `bucket_list.users` table.

### Can't login with old credentials

Old credentials were in `public.users`. You need to create a new account via the signup page.

## Rollback (if needed)

If you need to rollback:

```sql
-- Remove user_id column from bucket_items
ALTER TABLE bucket_list.bucket_items DROP COLUMN user_id;

-- Drop users table
DROP TABLE bucket_list.users;

-- Revert to using public.users for authentication
-- (requires manual code changes to authController.ts)
```

## Next Steps

Consider these enhancements:

- Email verification
- Password reset functionality
- User profile management
- Sharing bucket lists with other users
- Social features (friends, follows)
- Export/import bucket list data
