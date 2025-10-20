@echo off
echo ========================================
echo Green Lines CFO Platform - Startup
echo ========================================
echo.

cd apps\hq-console

echo [1/3] Stopping any running servers...
taskkill /F /IM node.exe >nul 2>&1

echo [2/3] Starting HQ Console on http://localhost:3000...
start "HQ-Console-Dev" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Prisma Studio on http://localhost:5555...
start "Prisma-Studio" cmd /k "npm run db:studio"

echo.
echo ========================================
echo SUCCESS! Servers are starting...
echo ========================================
echo.
echo Main App:      http://localhost:3000
echo Database UI:   http://localhost:5555
echo.
echo Press any key to return...
pause >nul

