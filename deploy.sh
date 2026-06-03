#!/bin/bash

set -e

APP_DIR="/var/www/myapp/portfolio"

echo "========================================"
echo "🚀 Deployment started at $(date)"
echo "========================================"

git config --global --add safe.directory $APP_DIR

cd $APP_DIR

# Fix permissions
echo "🔒 Fixing permissions..."
chown -R $(whoami):$(whoami) $APP_DIR
chmod -R 755 $APP_DIR

echo "📦 Pulling latest code..."
# Stash server-only files, pull, then restore
git stash --include-untracked
git pull origin main
git stash pop || true

echo "📚 Installing dependencies..."
npm install --production=false

echo "🔨 Building application..."
npm run build

echo "♻️  Restarting application..."
pm2 restart nextjs-app || pm2 start $APP_DIR/ecosystem.config.js

echo "========================================"
echo "✅ Deployment complete at $(date)"
echo "========================================"

pm2 status