#!/bin/bash

# Navigate to the script directory
cd "$(dirname "$0")"

echo "🚀 Starting Resume Builder..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not found. Installing..."
    npm install
    echo ""
fi

# Start the dev server
npm run dev

# Keep terminal open
echo ""
echo "Server stopped. Press any key to close..."
read -n 1 -s
