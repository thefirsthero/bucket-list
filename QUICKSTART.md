# Quick Start Guide

## Step 1: Set up your database

1. Create a PostgreSQL database (you can use Aiven, AWS RDS, or local PostgreSQL)
2. Note down your connection details

## Step 2: Configure environment

```bash
# Root directory
cp .env.example .env

# Edit .env with your actual database credentials
# DATABASE_URL=postgresql://user:password@host-project.aivencloud.com:12345/defaultdb
# DATABASE_SSL=true
# DB_SCHEMA=bucket_list
```

Also configure backend:

```bash
cd backend
cp .env.example .env
# Edit backend/.env with the same database credentials
```

And frontend:

```bash
cd ../frontend
cp .env.example .env
# Default is: VITE_API_URL=http://localhost:3001
```

## Step 3: Run database migrations

```bash
cd backend
npm install
npm run migrate
```

This will create the `bucket_list` schema and tables in your database.

## Step 4: Start the application

### Option A: Using Docker (Recommended)

From the root directory:

```bash
docker-compose up --build
```

Access:

- Frontend: http://localhost
- Backend API: http://localhost:3001

### Option B: Local Development

Terminal 1 (Backend):

```bash
cd backend
npm install
npm run dev
```

Terminal 2 (Frontend):

```bash
cd frontend
npm install
npm run dev
```

Access:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Step 5: Start using!

Your bucket list application is now running! You can:

- Add items to "Upcoming Year" or "General" categories
- Drag and drop to reorder items
- Check items off as complete (they'll move to the bottom)
- Set status: Active, In Progress, Postponed, Maybe
- Edit and delete items

## Troubleshooting

### Database connection issues

- Check your DATABASE_URL is correct
- Ensure your database allows connections from your IP
- For Aiven, make sure SSL is enabled

### Frontend can't connect to backend

- Check that backend is running on port 3001
- Update VITE_API_URL in frontend/.env if needed
- For Docker, both services should be on the same network

### Port conflicts

- Change ports in docker-compose.yml if 80 or 3001 are taken
- Update VITE_API_URL accordingly
