# Bucket List Application

A full-stack bucket list application with drag-and-drop functionality, status management, and PostgreSQL database.

## Features

- 📋 **Two Categories**: Separate sections for "Upcoming Year" and "General" goals
- 🔄 **Drag & Drop**: Reorder items within each category by priority
- ✅ **Checkboxes**: Mark items as complete (automatically moves to bottom)
- 🎯 **Status Management**: Track progress with statuses:
  - Active
  - In Progress
  - Postponed
  - Maybe
  - Completed
- 🎨 **Modern UI**: Built with React, TypeScript, Tailwind CSS, and shadcn/ui
- ️ **PostgreSQL**: Database with Aiven cloud support

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- @dnd-kit for drag-and-drop
- React Router

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Aiven cloud database support

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL database (Aiven or local)

### Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd bucket-list
```

2. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` and add your database credentials:

```env
DATABASE_URL=postgresql://user:password@host-project.aivencloud.com:12345/defaultdb
DATABASE_SSL=true
DB_SCHEMA=bucket_list
```

3. **Run database migrations**

First, set up the backend environment:

```bash
cd backend
cp .env.example .env
# Edit backend/.env with your database credentials
npm install
npm run migrate
cd ..
```

4. **Start with Docker Compose**

```bash
docker-compose up --build
```

The application will be available at:

- Frontend: http://localhost
- Backend API: http://localhost:3001

### Local Development

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run dev
```

Backend runs on http://localhost:3001

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env to point to your backend
npm run dev
```

Frontend runs on http://localhost:5173

## Database Schema

The application uses a PostgreSQL schema called `bucket_list` with the following structure:

### Tables

**bucket_items**

- `id` - Primary key
- `title` - Item title (required)
- `description` - Detailed description
- `category` - Either 'upcoming_year' or 'general'
- `status` - One of: active, in_progress, postponed, maybe, completed
- `priority` - Integer for ordering
- `completed` - Boolean flag
- `completed_at` - Timestamp when completed
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## API Endpoints

### Bucket Items

- `GET /api/bucket-items` - Get all items
- `GET /api/bucket-items/category/:category` - Get items by category
- `GET /api/bucket-items/:id` - Get single item
- `POST /api/bucket-items` - Create new item
- `PATCH /api/bucket-items/:id` - Update item
- `DELETE /api/bucket-items/:id` - Delete item
- `POST /api/bucket-items/reorder` - Reorder items (for drag-and-drop)

### Health Check

- `GET /health` - Check backend health

## Project Structure

```
bucket-list/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── db/             # Database migrations
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   └── server.ts       # Express server
│   └── package.json
└── frontend/               # React frontend
    ├── src/
    │   ├── components/    # React components
    │   ├── config/        # App configuration
    │   ├── contexts/      # React contexts
    │   ├── hooks/         # Custom hooks
    │   ├── lib/           # Utilities
    │   ├── pages/         # Page components
    │   ├── services/      # API service
    │   └── types/         # TypeScript types
    └── package.json
```

## License

MIT

## Contributing

Feel free to submit issues and pull requests!
