#!/bin/bash
set -e

APP_DIR="/var/www/myapp/portfolio"

echo "========================================"
echo "🚀 Deployment started at $(date)"
echo "========================================"

git config --global --add safe.directory "$APP_DIR"

cd "$APP_DIR"

echo "📦 Pulling latest code..."
git pull origin main


echo "📚 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

echo "♻️ Restarting application..."
pm2 restart nextjs-app || pm2 start ecosystem.config.js

echo "========================================"
echo "✅ Deployment complete at $(date)"
echo "========================================"

pm2 status