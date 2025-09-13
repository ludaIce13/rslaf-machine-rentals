@echo off
echo SmartRentals System Backup Script
echo ================================

set BACKUP_DIR=SmartRentals_Backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

echo Creating backup directory: %BACKUP_DIR%
mkdir "%BACKUP_DIR%"

echo Backing up database...
copy "smartrentals.db" "%BACKUP_DIR%\smartrentals.db"

echo Backing up backend code...
xcopy "smartrentals_mvp" "%BACKUP_DIR%\smartrentals_mvp" /E /I /H

echo Backing up admin portal...
xcopy "frontend\src" "%BACKUP_DIR%\frontend_src" /E /I /H
copy "frontend\package.json" "%BACKUP_DIR%\frontend_package.json"

echo Backing up customer portal...
xcopy "customer-portal\src" "%BACKUP_DIR%\customer-portal_src" /E /I /H
copy "customer-portal\package.json" "%BACKUP_DIR%\customer-portal_package.json"

echo Backing up configuration files...
copy "requirements.txt" "%BACKUP_DIR%\requirements.txt"
copy "DEPLOYMENT_GUIDE.md" "%BACKUP_DIR%\DEPLOYMENT_GUIDE.md"

echo.
echo ================================
echo Backup completed successfully!
echo Location: %BACKUP_DIR%
echo ================================
pause
