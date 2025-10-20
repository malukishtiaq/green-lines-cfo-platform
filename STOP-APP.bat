@echo off
echo ========================================
echo Green Lines CFO Platform - Stopping
echo ========================================
echo.

echo Stopping all Node.js processes...
taskkill /F /IM node.exe

echo.
echo ========================================
echo All servers stopped!
echo ========================================
pause

