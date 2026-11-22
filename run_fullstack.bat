@echo off
title SoundWave Studio Full-Stack Launcher
echo ========================================================
echo   🎵 Starting SoundWave Studio Full-Stack Suite 🎵
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Python FastAPI Backend on http://localhost:8000 ...
start "SoundWave Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Waiting for Backend to initialize...
timeout /t 2 /nobreak > nul

echo [3/3] Starting React Vite Frontend & Opening Browser...
start "" "http://localhost:5173"
cmd /c "npm.cmd run dev"

pause
