# Brain Training Platform

Платформа для тренировки мозга с мини-играми.

## Требования

- **Node.js** >= 18.x
- **Python** >= 3.9
- **MongoDB** (локальный или MongoDB Atlas)

## Структура проекта

```
brain-training-local/
├── backend/           # FastAPI сервер
│   ├── server.py      # Основной файл сервера
│   ├── spot_difference_logic.py  # Логика игры "Найди отличия"
│   ├── requirements.txt
│   └── .env.example
├── frontend/          # React приложение
│   ├── src/
│   ├── package.json
│   └── .env.example
├── docker-compose.yml # Docker конфигурация
└── README.md
```

## Быстрый старт с Docker

```bash
# Запуск всех сервисов
docker-compose up -d

# Приложение будет доступно:
# Frontend: http://localhost:3000
# Backend: http://localhost:8001
```

## Ручная установка

### 1. База данных MongoDB

Установите MongoDB локально или используйте MongoDB Atlas:
- Локально: https://www.mongodb.com/try/download/community
- Atlas (облако): https://www.mongodb.com/atlas

### 2. Backend (FastAPI)

```bash
cd backend

# Создайте виртуальное окружение
python -m venv venv

# Активируйте его
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Установите зависимости
pip install -r requirements.txt

# Создайте .env файл
cp .env.example .env

# Отредактируйте .env файл, добавив свои ключи

# Запустите сервер
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Frontend (React)

```bash
cd frontend

# Установите зависимости
yarn install
# или
npm install

# Создайте .env файл
cp .env.example .env

# Запустите dev сервер
yarn start
# или
npm start
```

## Переменные окружения

### Backend (.env)

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=brain_training
EMERGENT_LLM_KEY=your_openai_api_key  # Для генерации текста в игре печати
GOOGLE_CLIENT_ID=your_google_client_id  # Для авторизации через Google
GOOGLE_CLIENT_SECRET=your_google_client_secret
AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Получение API ключей

### Google OAuth (для авторизации)

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте проект или выберите существующий
3. Перейдите в "APIs & Services" → "Credentials"
4. Создайте "OAuth 2.0 Client ID"
5. Добавьте `http://localhost:3000` в "Authorized JavaScript origins"
6. Добавьте `http://localhost:8001/api/auth/google/callback` в "Authorized redirect URIs"
7. Скопируйте Client ID и Client Secret в .env

### OpenAI API (для генерации текста)

1. Перейдите на [OpenAI Platform](https://platform.openai.com/)
2. Создайте API ключ
3. Добавьте ключ в `EMERGENT_LLM_KEY` в backend/.env

**Примечание:** Если вы не хотите использовать AI для генерации текста, игра "Скорость печати" будет использовать fallback тексты.

## Доступные игры

1. **Таблицы Шульте** - тренировка внимания
2. **Найди отличия** - с AI-генерацией изображений
3. **Цветовая реакция (Струп)** - тест на когнитивную гибкость
4. **Поймай букву** - скорость реакции
5. **Поймай крота** - координация и реакция
6. **Запоминание последовательностей** - память
7. **Математические задачи** - устный счёт
8. **Скорость печати** - с AI-генерацией текста

## Troubleshooting

### MongoDB не подключается
- Убедитесь, что MongoDB запущена: `sudo systemctl status mongod`
- Проверьте MONGO_URL в .env

### CORS ошибки
- Убедитесь, что CORS_ORIGINS в backend/.env содержит URL фронтенда

### Авторизация не работает
- Проверьте Google OAuth credentials
- Убедитесь, что redirect URI настроен правильно

## Лицензия

MIT
