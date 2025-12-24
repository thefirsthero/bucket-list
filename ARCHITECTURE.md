# Bucket List Application - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                   http://localhost:80                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  React Components                                  │     │
│  │  - BucketList (Main Page)                          │     │
│  │  - BucketListSection (Upcoming Year / General)     │     │
│  │  - BucketListItem (Individual Items)               │     │
│  │  - ItemDialog (Add/Edit Modal)                     │     │
│  │                                                     │     │
│  │  Features:                                          │     │
│  │  - Drag & Drop (@dnd-kit)                          │     │
│  │  - Checkboxes (complete/incomplete)                │     │
│  │  - Status badges (5 statuses)                      │     │
│  │  - CRUD operations                                  │     │
│  └────────────────────────────────────────────────────┘     │
│                           │                                  │
│  ┌────────────────────────▼──────────────────────────┐     │
│  │  API Service                                       │     │
│  │  - HTTP client to backend                          │     │
│  │  - Handles all CRUD operations                     │     │
│  │  - Reorder endpoint for drag-and-drop              │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  Tech: React 19, TypeScript, Tailwind CSS, Vite             │
│  Port: 80 (Docker) / 5173 (Dev)                             │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js/Express)                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │  REST API Endpoints                                │     │
│  │  GET    /api/bucket-items                          │     │
│  │  GET    /api/bucket-items/category/:cat            │     │
│  │  GET    /api/bucket-items/:id                      │     │
│  │  POST   /api/bucket-items                          │     │
│  │  PATCH  /api/bucket-items/:id                      │     │
│  │  DELETE /api/bucket-items/:id                      │     │
│  │  POST   /api/bucket-items/reorder                  │     │
│  └────────────────────────────────────────────────────┘     │
│                           │                                  │
│  ┌────────────────────────▼──────────────────────────┐     │
│  │  Controllers                                       │     │
│  │  - Request validation                              │     │
│  │  - Business logic                                  │     │
│  │  - Response formatting                             │     │
│  └────────────────────────┬──────────────────────────┘     │
│                           │                                  │
│  ┌────────────────────────▼──────────────────────────┐     │
│  │  Models (Data Access Layer)                       │     │
│  │  - SQL queries                                     │     │
│  │  - CRUD operations                                 │     │
│  │  - Priority management                             │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  Tech: Express, TypeScript, pg (PostgreSQL client)          │
│  Port: 3001                                                  │
└────────────────────────────┬─────────────────────────────────┘
                             │ TCP/SSL
                             ▼
┌─────────────────────────────────────────────────────────────┐
│               PostgreSQL Database (Aiven)                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Schema: bucket_list                               │     │
│  │                                                     │     │
│  │  Table: bucket_items                               │     │
│  │  ├─ id (PK)                                        │     │
│  │  ├─ title                                          │     │
│  │  ├─ description                                    │     │
│  │  ├─ category (upcoming_year / general)            │     │
│  │  ├─ status (5 states)                              │     │
│  │  ├─ priority (for ordering)                        │     │
│  │  ├─ completed (boolean)                            │     │
│  │  ├─ completed_at                                   │     │
│  │  ├─ created_at                                     │     │
│  │  └─ updated_at                                     │     │
│  │                                                     │     │
│  │  Indexes: category, status, completed, priority   │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  Features:                                                    │
│  - SSL/TLS encryption                                        │
│  - Connection pooling                                        │
│  - Auto-updating timestamps                                  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### Creating a New Item

```
User fills form → ItemDialog → API Service → POST /api/bucket-items
                                                    ↓
                                            Backend Controller
                                                    ↓
                                              Model Layer
                                                    ↓
                                         INSERT INTO bucket_items
                                                    ↓
                                              PostgreSQL
                                                    ↓
                                            Return new item
                                                    ↓
                                          Update React state
                                                    ↓
                                            Re-render UI
```

### Drag and Drop Reorder

```
User drags item → DndContext detects → Calculate new priorities
                                              ↓
                              POST /api/bucket-items/reorder
                                              ↓
                                   Backend processes batch
                                              ↓
                              UPDATE priority for each item
                                              ↓
                                        PostgreSQL
                                              ↓
                                    Optimistic UI update
```

### Completing an Item

```
User clicks checkbox → onToggleComplete → PATCH /api/bucket-items/:id
                                                    ↓
                                          Update completed=true
                                                    ↓
                                     Set completed_at=timestamp
                                                    ↓
                                              PostgreSQL
                                                    ↓
                                         Fetch updated items
                                                    ↓
                                    Item moves to bottom in UI
```

## Docker Architecture

```
docker-compose.yml
    │
    ├─── Backend Service
    │    ├─ Build: backend/Dockerfile
    │    ├─ Port: 3001:3001
    │    ├─ Network: bucket-list-network
    │    └─ Env: DATABASE_URL, DB_SCHEMA
    │
    └─── Frontend Service
         ├─ Build: frontend/Dockerfile
         ├─ Port: 80:80
         ├─ Network: bucket-list-network
         ├─ Nginx serves static files
         └─ Reverse proxy /api → backend:3001
```

## Technology Stack Summary

| Layer    | Technology   | Purpose           |
| -------- | ------------ | ----------------- |
| Frontend | React 19     | UI Framework      |
|          | TypeScript   | Type Safety       |
|          | Vite         | Build Tool        |
|          | Tailwind CSS | Styling           |
|          | shadcn/ui    | UI Components     |
|          | @dnd-kit     | Drag & Drop       |
| Backend  | Node.js 20   | Runtime           |
|          | Express      | Web Framework     |
|          | TypeScript   | Type Safety       |
|          | pg           | PostgreSQL Client |
| Database | PostgreSQL   | Data Persistence  |
|          | Aiven        | Cloud Hosting     |
| DevOps   | Docker       | Containerization  |
|          | Nginx        | Web Server        |
|          | Git          | Version Control   |

## Key Features Implementation

| Feature             | Frontend                              | Backend                  | Database             |
| ------------------- | ------------------------------------- | ------------------------ | -------------------- |
| Two Categories      | Separate BucketListSection components | Filter by category field | category ENUM        |
| Drag & Drop         | @dnd-kit SortableContext              | /reorder endpoint        | priority field       |
| Checkboxes          | Checkbox component                    | Update completed field   | completed boolean    |
| Status Management   | Select dropdown                       | Update status field      | status ENUM          |
| Auto-move completed | useEffect sorting                     | Priority adjustment      | completed + priority |

## Security Features

- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)
- ✅ SSL/TLS for database connection
- ✅ Environment variables for secrets
- ✅ Docker network isolation

## Performance Optimizations

- ✅ Database indexes on frequently queried fields
- ✅ Connection pooling for database
- ✅ React hooks for efficient re-renders
- ✅ Optimistic UI updates for drag-and-drop
- ✅ Nginx caching for static assets
- ✅ Compression middleware
- ✅ Production build minification
