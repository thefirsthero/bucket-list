# Quick Start Guide

## Step 1: Set up your database

1. Create a PostgreSQL database (you can use Aiven, AWS RDS, or local PostgreSQL)
2. Note down your connection details

## Step 2: Configure environment

Configure backend:

```bash
cd backend
cp .env.example .env
# Edit backend/.env with your database credentials
```

Configure frontend:

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

Terminal 1 (Backend):

```bash
cd backend
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

### Port conflicts

- Change PORT in backend/.env if 3001 is taken
- Update VITE_API_URL in frontend/.env accordingly
