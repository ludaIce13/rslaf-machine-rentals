@echo off
echo === Backend Server Status ===
echo.

echo Checking if port 8000 is in use...
netstat -ano | findstr :8000 >nul
if %ERRORLEVEL% EQU 0 (
    echo Port 8000 is in use. Backend server might be running.
    echo.
    echo To test the API, open in your browser:
    echo http://localhost:8000/docs
) else (
    echo Port 8000 is not in use. Backend server is not running.
    echo.
    echo To start the backend server, run:
    echo .\start_backend.bat
)

echo.
pause
