@echo off
title SmartRentals System Startup
color 0A

echo.
echo  ███████╗███╗   ███╗ █████╗ ██████╗ ████████╗██████╗ ███████╗███╗   ██╗████████╗ █████╗ ██╗     ███████╗
echo  ██╔════╝████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗██╔════╝████╗  ██║╚══██╔══╝██╔══██╗██║     ██╔════╝
echo  ███████╗██╔████╔██║███████║██████╔╝   ██║   ██████╔╝█████╗  ██╔██╗ ██║   ██║   ███████║██║     ███████╗
echo  ╚════██║██║╚██╔╝██║██╔══██║██╔══██╗   ██║   ██╔══██╗██╔══╝  ██║╚██╗██║   ██║   ██╔══██║██║     ╚════██║
echo  ███████║██║ ╚═╝ ██║██║  ██║██║  ██║   ██║   ██║  ██║███████╗██║ ╚████║   ██║   ██║  ██║███████╗███████║
echo  ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝
echo.
echo                                    Professional Equipment Rental System
echo                                           Production Ready Version
echo.
echo ================================================================================================

echo Starting SmartRentals System...
echo.

echo [1/3] Starting Backend API Server...
start "SmartRentals Backend" cmd /k "python start_server.py"
timeout /t 5 /nobreak >nul

echo [2/3] Starting Admin Portal...
start "SmartRentals Admin" cmd /k "cd frontend && npm start"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Customer Portal...
start "SmartRentals Customer" cmd /k "cd customer-portal && npm start"

echo.
echo ================================================================================================
echo System startup initiated successfully!
echo.
echo Access URLs:
echo   Backend API:     http://localhost:8000
echo   Admin Portal:    http://localhost:3000
echo   Customer Portal: http://localhost:3001
echo.
echo All services are starting in separate windows...
echo Wait 30-60 seconds for full system initialization.
echo ================================================================================================
echo.
pause
