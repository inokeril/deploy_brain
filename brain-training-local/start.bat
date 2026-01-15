@echo off
echo 🧠 Brain Training Platform - Starting...
echo =========================================

REM Check if .env exists
if not exist "backend\.env" (
    echo ❌ backend\.env не найден. Запустите setup.bat сначала
    pause
    exit /b 1
)

echo.
echo 🚀 Запуск Backend на порту 8001...
start "Backend" cmd /c "cd backend && venv\Scripts\activate && uvicorn server:app --host 0.0.0.0 --port 8001 --reload"

timeout /t 3 /nobreak >nul

echo.
echo 🚀 Запуск Frontend на порту 3000...
start "Frontend" cmd /c "cd frontend && yarn start"

echo.
echo ✅ Сервисы запущены!
echo.
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend:  http://localhost:8001
echo 📍 API Docs: http://localhost:8001/docs
echo.
echo Закройте окна терминалов для остановки сервисов.
pause
