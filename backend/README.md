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

3. Update the `.env` file with your database credentials.

4. Run database migrations:

```bash
npm run migrate
```

5. Start the development server:

```bash
npm run dev
```

## API Endpoints

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

The application uses a PostgreSQL database with the following schema:

- **Schema Name**: `bucket_list`
- **Table**: `bucket_items`
  - id (serial, primary key)
  - title (varchar)
  - description (text)
  - category (enum: 'upcoming_year', 'general')
  - status (enum: 'active', 'in_progress', 'postponed', 'maybe', 'completed')
  - priority (integer)
  - completed (boolean)
  - completed_at (timestamp)
  - created_at (timestamp)
  - updated_at (timestamp)
