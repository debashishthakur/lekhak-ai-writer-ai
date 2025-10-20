#!/bin/bash
# Deployment fix script for Lekhak AI

echo "🔧 Starting deployment fixes..."

# Clear any npm cache issues
echo "📦 Clearing npm cache..."
npm cache clean --force 2>/dev/null || echo "Cache already clean"

# Install dependencies with legacy peer deps to avoid conflicts
echo "📥 Installing dependencies with compatibility fixes..."
npm install --legacy-peer-deps --no-audit --no-fund

# Run build
echo "🏗️ Building project..."
npm run build

echo "✅ Deployment fixes complete!"