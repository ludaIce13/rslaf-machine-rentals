@echo off
echo Checking if backend server is running...

rem Check if port 8000 is in use
netstat -ano | findstr :8000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Backend server is already running on port 8000.
    echo.
    echo To test the API, open in your browser:
    echo http://localhost:8000/docs
    echo.
    pause
    exit /b
)

echo Backend server is not running.
echo.
echo Starting backend server...
start "" /D"%~dp0" start_backend.bat

echo.
echo Backend server is starting in a new window.
echo Please wait a few seconds for it to initialize...
echo.
echo To test the API, open in your browser:
echo http://localhost:8000/docs
echo.
pause
