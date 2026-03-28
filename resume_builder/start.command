#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Starting Resume Builder..."
echo ""
npm run dev

# Keep terminal open after the server stops
echo ""
echo "Press any key to close this window..."
read -n 1 -s
