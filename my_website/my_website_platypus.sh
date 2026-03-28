#!/bin/bash
# Platypus-compatible wrapper for My Website Dev Panel
# Interface: None | Remain running: Yes

PROJECT_DIR="/Volumes/ImacExternal/docs/windsurf_projects/WindSurf_FrontEnd/my_website"
cd "$PROJECT_DIR"

# Ensure node_modules exist
if [ ! -d "node_modules" ]; then
    npm install
fi

# Start the dev panel server
node dev-panel.js &
NODE_PID=$!

# Wait for server, then open browser
sleep 2
open "http://localhost:3333"

wait $NODE_PID
