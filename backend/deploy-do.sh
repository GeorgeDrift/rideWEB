#!/bin/bash
# Quick Deployment Script for Digital Ocean
# Run this on your DO server

echo "🚀 Starting Deployment..."

# Navigate to backend directory
cd /var/www/rideweb/backend

# Backup current version
echo "📦 Creating backup..."
cp -r . ../backend_backup_$(date +%Y%m%d_%H%M%S)

# Pull latest changes (if using Git)
echo "📥 Pulling latest code..."
git pull origin main || echo "⚠️  Not using Git, manual upload needed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run database migration
echo "💾 Running database migration..."
node run-trial-dates-migration.js

# Restart backend
echo "🔄 Restarting backend..."
pm2 restart ridex-api

# Show logs
echo "📋 Checking logs..."
sleep 2
pm2 logs ridex-api --lines 10 --nostream

# Test endpoint
echo ""
echo "🧪 Testing backend..."
curl -s http://localhost:5000/api/subscriptions/plans | head -c 100

echo ""
echo "✅ Deployment complete!"
echo "🌐 Test at: www.ridexmw.com"
