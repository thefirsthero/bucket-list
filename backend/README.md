# Bucket List Backend

Backend API for the Bucket List application built with Express, TypeScript, and PostgreSQL.

## Features

- RESTful API for bucket list items
- PostgreSQL database with Aiven support
- Priority sorting and drag-and-drop support
- Status management (active, in_progress, postponed, maybe, completed)
- Category separation (upcoming_year, general)
- Automatic timestamp tracking

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials and generate a JWT secret:

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Add to `.env`:

```env
DATABASE_URL=postgres://user:password@host:port/database
DATABASE_SSL=true
DB_SCHEMA=bucket_list
JWT_SECRET=<generated-secret-from-above>
PORT=3001

# API Security
# Generate a secure random key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
API_KEY=your-secure-api-key-here
```

4. Run database migrations:

```bash
npm run migrate
```

5. **Set up authentication** (first time only):

a. Generate a password hash for your login:

```bash
node generate-hash.js yourpassword
```

b. Copy the generated hash and edit `src/db/simple-auth.sql`:

```sql
INSERT INTO public.users (email, password_hash)
VALUES ('your@email.com', 'paste-hash-here')
ON CONFLICT (email) DO NOTHING;
```

c. Run the authentication setup SQL in your PostgreSQL database:

```bash
# Connect to your database and run the SQL file
# Or copy/paste the contents into your database client
```

6. Start the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

**All bucket item endpoints require authentication.** Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

- `POST /api/auth/login` - Login with email/password, returns JWT token
  - Body: `{ "email": "your@email.com", "password": "yourpassword" }`
  - Response: `{ "token": "jwt-token", "user": { "id": 1, "email": "your@email.com" } }`

### Bucket Items

- `GET /api/bucket-items` - Get all items
- `GET /api/bucket-items/category/:category` - Get items by category (upcoming_year, general)
- `GET /api/bucket-items/:id` - Get single item
- `POST /api/bucket-items` - Create new item
- `PATCH /api/bucket-items/:id` - Update item
- `DELETE /api/bucket-items/:id` - Delete item
- `POST /api/bucket-items/reorder` - Reorder items (for drag-and-drop)

### Health Check

- `GET /health` - Check if the server is running

## Docker

Build and run with Docker:

```bash
docker build -t bucket-list-backend .
docker run -p 3001:3001 --env-file .env bucket-list-backend
```

## Database Schema

The application uses a PostgreSQL database with the following schemas:

### Authentication (public schema)

- **Table**: `public.users` - Shared across apps
  - id (serial, primary key)
  - email (varchar, unique)
  - password_hash (varchar) - bcrypt hashed
  - created_at (timestamp)

### Bucket List (bucket_list schema)

- **Table**: `bucket_list.bucket_items`
  - id (serial, primary key)
  - title (varchar)
  - description (text)
  - category (enum: 'upcoming_year', 'general')
  - status (enum: 'active', 'in_progress', 'postponed', 'maybe', 'completed')
  - priority (integer)
  - completed (boolean)
  - completed_at (timestamp)
  - archived (boolean)
  - archived_year (integer)
  - goal_year (integer)
  - created_at (timestamp)
  - updated_at (timestamp)

## Authentication System

This app uses a simple password-gate authentication:

- **No registration** - Users are manually added to the database
- **Single user** - Designed for personal use
- **JWT tokens** - 30-day expiration
- **Shared auth table** - `public.users` can be used across multiple apps

### How It Works

1. User logs in via `/api/auth/login` with email/password
2. Server verifies credentials against `public.users` table
3. On success, server generates a JWT token signed with `JWT_SECRET`
4. Frontend stores token in localStorage
5. All API requests include token in `Authorization: Bearer <token>` header
6. Backend middleware validates token before processing requests

### JWT_SECRET

The `JWT_SECRET` is used to cryptographically sign authentication tokens:

- **Purpose**: Prevents token forgery and tampering
- **Security**: Must be long, random, and kept secret
- **Length**: Minimum 32 characters, recommend 64+
- **Generation**: Use `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- **Storage**: Only in `.env` file (never commit to git)

### Adding New Users

1. Generate password hash:

```bash
node generate-hash.js yourpassword
```

2. Insert into database:

```sql
INSERT INTO public.users (email, password_hash)
VALUES ('new@email.com', 'generated-hash');
```
