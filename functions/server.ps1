# Firebase Functions Server Script
# This script helps run Firebase Functions locally
# Usage: .\server.ps1

Write-Host "Starting Firebase Functions Server..." -ForegroundColor Green

# Check if we're in the functions directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run this script from the functions directory." -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "npm install failed!" -ForegroundColor Red
        exit 1
    }
}

# Build TypeScript
Write-Host "Building TypeScript..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Start Firebase Emulator
Write-Host "Starting Firebase Functions Emulator..." -ForegroundColor Green
Write-Host "Note: Use 'npm run server' or 'npm run serve' for the same result" -ForegroundColor Cyan
firebase emulators:start --only functions
