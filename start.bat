@echo off
echo =========================================
echo   StrikeZone Auctions - Starting...
echo =========================================

echo [1/3] Starting MongoDB service...
net start MongoDB 2>nul
if %errorlevel% neq 0 (
  echo MongoDB service already running or not installed as service.
  echo Trying to start mongod directly...
  start "MongoDB" mongod --dbpath "C:\data\db"
  timeout /t 3 /nobreak >nul
)

echo [2/3] Starting Backend server...
start "StrikeZone Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend...
start "StrikeZone Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo =========================================
echo   Done! Open http://localhost:5173
echo   Admin login: http://localhost:5173/admin/login
echo =========================================
pause
