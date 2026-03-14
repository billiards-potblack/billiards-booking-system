#!/bin/bash

echo "========================================"
echo "  Billiards Booking System"
echo "========================================"
echo ""
echo "Starting server..."
echo ""

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "Server starting on http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Try to open browser (works on most systems)
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3001 &
elif command -v open > /dev/null; then
    open http://localhost:3001 &
fi

node server.js
