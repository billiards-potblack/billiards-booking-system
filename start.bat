@echo off
echo ========================================
echo   Enhanced Billiards Booking System
echo ========================================
echo.
echo Starting server...
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Server starting on http://localhost:3001
echo.

start http://localhost:3001
node server.js

pause