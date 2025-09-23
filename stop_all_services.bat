@echo off
echo.
echo ========================================
echo   RSLAF Equipment Rental System
echo   Stopping All Services...
echo ========================================
echo.

REM Kill all Node.js processes
echo Stopping Node.js services...
taskkill /f /im node.exe >nul 2>&1

REM Kill all npm processes  
echo Stopping npm processes...
taskkill /f /im npm.cmd >nul 2>&1

REM Kill React development servers
echo Stopping React development servers...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3002" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3003" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo.
echo ========================================
echo   All Services Stopped Successfully!
echo ========================================
echo.
echo All RSLAF services have been terminated.
echo You can now restart them using start_all_services.bat
echo.
pause
