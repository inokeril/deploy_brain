#!/bin/bash

echo "🧠 Brain Training Platform - Setup Script"
echo "=========================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 не найден. Установите Python 3.9+"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 18+"
    exit 1
fi

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "⚠️ Yarn не найден. Устанавливаем..."
    npm install -g yarn
fi

echo ""
echo "📦 Настройка Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# Create .env if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️ Создан файл backend/.env - отредактируйте его!"
fi

cd ..

echo ""
echo "📦 Настройка Frontend..."
cd frontend

# Install dependencies
yarn install

# Create .env if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

cd ..

echo ""
echo "✅ Установка завершена!"
echo ""
echo "Следующие шаги:"
echo "1. Отредактируйте backend/.env (добавьте API ключи)"
echo "2. Убедитесь, что MongoDB запущена"
echo "3. Запустите ./start.sh для запуска приложения"
