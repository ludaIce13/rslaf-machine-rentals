@echo off
echo Checking backend server status...

echo.
echo === Checking if port 8000 is in use ===
netstat -ano | findstr :8000

echo.
echo === Checking backend logs ===
if exist smartrentals_mvp\logs\backend.log (
    type smartrentals_mvp\logs\backend.log
) else (
    echo No backend log file found at smartrentals_mvp\logs\backend.log
)

echo.
echo === Checking Python processes ===
tasklist | findstr python

pause
