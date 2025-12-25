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

Backend `.env`:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host-project.aivencloud.com:12345/defaultdb
DATABASE_SSL=true
DB_SCHEMA=bucket_list
JWT_SECRET=<generate-with-command-below>
PORT=3001
API_KEY=<generate-with-command-below>
```

Generate JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Generate API key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Frontend `.env`:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_API_KEY=<same-as-backend-API_KEY>
```

3. **Set up authentication**

a. Generate password hash:

```bash
cd backend
node generate-hash.js yourpassword
```

b. Edit `backend/src/db/simple-auth.sql` with your email and generated hash:

```sql
INSERT INTO public.users (email, password_hash)
VALUES ('your@email.com', 'paste-hash-here')
ON CONFLICT (email) DO NOTHING;
```

c. Run the SQL in your PostgreSQL database (copy/paste into your database client)

4. **Run database migrations**

```bash
cd backend
npm install
npm run migrate
cd ..
```

5. **Start the application**

From root directory:

```bash
npm run dev
```

This runs both frontend and backend concurrently.

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

**First login**: Use the email/password you set up in step 3.

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

The application uses PostgreSQL with two schemas:

### Authentication Schema (public.users)

**Shared across apps** - Store user credentials here

**users**

- `id` - Primary key
- `email` - Unique email address
- `password_hash` - bcrypt hashed password
- `created_at` - Creation timestamp

### Bucket List Schema (bucket_list)

**bucket_items**

- `id` - Primary key
- `title` - Item title (required)
- `description` - Detailed description
- `category` - Either 'upcoming_year' or 'general'
- `status` - One of: active, in_progress, postponed, maybe, completed
- `priority` - Integer for ordering
- `completed` - Boolean flag
- `completed_at` - Timestamp when completed
- `archived` - Boolean for archived items
- `archived_year` - Year archived
- `goal_year` - Target year for completion
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Authentication

This app uses simple password-gate authentication for personal use:

- **No registration** - Users manually added to database
- **Single user design** - Built for personal use
- **JWT tokens** - 30-day expiration, stored in localStorage
- **Protected routes** - All bucket list pages require login

### How It Works

1. User visits app → redirected to login page
2. Enter email/password → server validates against `public.users`
3. Server returns JWT token signed with `JWT_SECRET`
4. Token stored in localStorage, included in all API requests
5. Logout clears token and redirects to login

### Adding New Users

```bash
# Generate password hash
cd backend
node generate-hash.js newpassword

# Insert into database
INSERT INTO public.users (email, password_hash)
VALUES ('new@email.com', 'generated-hash');
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login and receive JWT token
  - Body: `{ "email": "your@email.com", "password": "yourpassword" }`
  - Returns: `{ "token": "jwt-token", "user": { "id": 1, "email": "..." } }`

**All other endpoints require authentication** - Include token in header:

```
Authorization: Bearer <your-token>
```

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
