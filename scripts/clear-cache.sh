#!/bin/bash
# Clear Next.js cache and restart dev server
# This script helps resolve stale cache issues

echo "Clearing Next.js cache..."

# Stop any running Node processes
echo "Stopping Node processes..."
pkill -f "next dev" || true
sleep 2

# Remove .next directory
if [ -d ".next" ]; then
    echo "Removing .next directory..."
    rm -rf .next
    echo "✓ .next directory removed"
else
    echo "✓ .next directory not found (already clean)"
fi

# Remove node_modules/.cache if it exists
if [ -d "node_modules/.cache" ]; then
    echo "Removing node_modules/.cache..."
    rm -rf node_modules/.cache
    echo "✓ node_modules/.cache removed"
fi

echo ""
echo "Cache cleared successfully!"
echo "You can now run 'npm run dev' to start fresh."



