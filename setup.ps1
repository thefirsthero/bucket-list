# Bucket List Application - Setup Script
# Run this in PowerShell

Write-Host "🚀 Bucket List Application - Setup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit .env with your database credentials!" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ Root .env file already exists" -ForegroundColor Green
    Write-Host ""
}

# Setup backend
Write-Host "🔧 Setting up backend..." -ForegroundColor Cyan
Set-Location backend

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
} else {
    Write-Host "✅ Backend .env already exists" -ForegroundColor Green
}

if (-not (Test-Path node_modules)) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Backend dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
Write-Host "⚠️  Make sure your database credentials in .env are correct!" -ForegroundColor Yellow
$continue = Read-Host "Press Enter to continue or Ctrl+C to cancel"
npm run migrate

Set-Location ..

# Setup frontend
Write-Host ""
Write-Host "🎨 Setting up frontend..." -ForegroundColor Cyan
Set-Location frontend

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created frontend/.env" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend .env already exists" -ForegroundColor Green
}

if (-not (Test-Path node_modules)) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Frontend dependencies already installed" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Edit .env and backend/.env with your database credentials"
Write-Host "   2. Run migrations if you skipped it: cd backend; npm run migrate"
Write-Host ""
Write-Host "🚀 To start the application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Option A - Docker (Recommended):"
Write-Host "   PS> docker-compose up --build"
Write-Host ""
Write-Host "   Option B - Local Development:"
Write-Host "   Terminal 1: cd backend; npm run dev"
Write-Host "   Terminal 2: cd frontend; npm run dev"
Write-Host ""
Write-Host "🌐 Access:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost (Docker) or http://localhost:5173 (Local)"
Write-Host "   Backend:  http://localhost:3001"
Write-Host ""
Write-Host "📖 For more details, see QUICKSTART.md" -ForegroundColor Cyan
