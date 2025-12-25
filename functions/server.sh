#!/bin/bash
# Firebase Functions Server Script
# This script helps run Firebase Functions locally

echo "🚀 Starting Firebase Functions Server..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Start Firebase Emulator
echo "🔥 Starting Firebase Functions Emulator..."
npm run serve

