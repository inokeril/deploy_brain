@echo off
echo 🧠 Brain Training Platform - Setup Script
echo ==========================================

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Python не найден. Установите Python 3.9+
    pause
    exit /b 1
)

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js не найден. Установите Node.js 18+
    pause
    exit /b 1
)

echo.
echo 📦 Настройка Backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
pip install -r requirements.txt
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

REM Create .env if not exists
if not exist ".env" (
    copy .env.example .env
    echo ⚠️ Создан файл backend\.env - отредактируйте его!
)

cd ..

echo.
echo 📦 Настройка Frontend...
cd frontend

REM Install dependencies
call yarn install

REM Create .env if not exists
if not exist ".env" (
    copy .env.example .env
)

cd ..

echo.
echo ✅ Установка завершена!
echo.
echo Следующие шаги:
echo 1. Отредактируйте backend\.env (добавьте API ключи)
echo 2. Убедитесь, что MongoDB запущена
echo 3. Запустите start.bat для запуска приложения
pause
