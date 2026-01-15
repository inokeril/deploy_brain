#!/bin/bash

echo "🧠 Brain Training Platform - Starting..."
echo "========================================="

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env не найден. Запустите ./setup.sh сначала"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Останавливаем сервисы..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo "🚀 Запуск Backend на порту 8001..."
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!
cd ..

echo ""
echo "🚀 Запуск Frontend на порту 3000..."
cd frontend
yarn start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Сервисы запущены!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:8001"
echo "📍 API Docs: http://localhost:8001/docs"
echo ""
echo "Нажмите Ctrl+C для остановки"

# Wait for processes
wait
