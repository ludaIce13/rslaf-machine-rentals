@echo off
echo.
echo ========================================
echo   RSLAF Equipment Rental System
echo   Starting All Services...
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Start Settings API Server
echo [1/4] Starting Settings API Server...
start "RSLAF Settings API" cmd /k "cd /d %~dp0 && node settings_api.js"
timeout /t 3 /nobreak >nul

REM Start Shared API Server
echo [2/4] Starting Shared API Server...
start "RSLAF Shared API" cmd /k "cd /d %~dp0 && node shared_api.js"
timeout /t 3 /nobreak >nul

REM Start Admin Portal
echo [3/4] Starting Admin Portal...
start "RSLAF Admin Portal" cmd /k "cd /d %~dp0\frontend && npm start"
timeout /t 5 /nobreak >nul

REM Start Customer Portal
echo [4/4] Starting Customer Portal...
start "RSLAF Customer Portal" cmd /k "cd /d %~dp0\customer-portal && npm start"

echo.
echo ========================================
echo   All Services Started Successfully!
echo ========================================
echo.
echo Services running:
echo   - Settings API:     http://localhost:3002
echo   - Shared API:       http://localhost:3001  
echo   - Admin Portal:     http://localhost:3000
echo   - Customer Portal:  http://localhost:3003
echo.
echo Settings Sync: ACTIVE
echo Real-time updates: ENABLED
echo.
echo Press any key to open all portals in browser...
pause >nul

REM Open all portals in default browser
start http://localhost:3000
timeout /t 2 /nobreak >nul
start http://localhost:3003

echo.
echo All portals opened in browser!
echo.
echo To stop all services:
echo   1. Close all command windows
echo   2. Or run: stop_all_services.bat
echo.
pause
