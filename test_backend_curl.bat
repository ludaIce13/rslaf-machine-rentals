@echo off
echo Testing backend API...

echo.
echo === Testing Root Endpoint ===
curl -v http://localhost:8000/

echo.
echo === Testing Login ===
curl -v -X POST http://localhost:8000/auth/login ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "username=admin@smartrentals.com&password=admin123"

echo.
echo Note: If login was successful, you can test protected endpoints with the token.
pause
