#!/bin/bash

echo "🚀 Bucket List Application - Setup Script"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your database credentials!"
    echo ""
else
    echo "✅ Root .env file already exists"
    echo ""
fi

# Setup backend
echo "🔧 Setting up backend..."
cd backend

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created backend/.env"
else
    echo "✅ Backend .env already exists"
fi

if [ ! -d node_modules ]; then
    echo "📦 Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

echo ""
echo "🗄️  Running database migrations..."
echo "⚠️  Make sure your database credentials in .env are correct!"
read -p "Press Enter to continue or Ctrl+C to cancel..."
npm run migrate

cd ..

# Setup frontend
echo ""
echo "🎨 Setting up frontend..."
cd frontend

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created frontend/.env"
else
    echo "✅ Frontend .env already exists"
fi

if [ ! -d node_modules ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Edit .env and backend/.env with your database credentials"
echo "   2. Run migrations if you skipped it: cd backend && npm run migrate"
echo ""
echo "🚀 To start the application:"
echo ""
echo "   Option A - Docker (Recommended):"
echo "   $ docker-compose up --build"
echo ""
echo "   Option B - Local Development:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "🌐 Access:"
echo "   Frontend: http://localhost (Docker) or http://localhost:5173 (Local)"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📖 For more details, see QUICKSTART.md"
