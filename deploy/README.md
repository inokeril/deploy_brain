# 🧠 Brain Training Platform - Руководство по развёртыванию

Платформа для тренировки мозга с мини-играми, таблицами лидеров и системой прогресса.

---

## 📋 Содержание

1. [Требования](#требования)
2. [Быстрый старт](#быстрый-старт)
3. [Структура проекта](#структура-проекта)
4. [Переменные окружения](#переменные-окружения)
5. [Настройка для production](#настройка-для-production)
6. [Настройка Nginx на хосте](#настройка-nginx-на-хосте)
7. [Полезные команды Docker](#полезные-команды-docker)
8. [Troubleshooting](#troubleshooting)
9. [Доступные игры](#доступные-игры)

---

## 📦 Требования

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Git**

### Проверка установки Docker

```bash
docker --version
docker compose version
```

### Установка Docker (Ubuntu/Debian)

```bash
# Обновление пакетов
sudo apt update

# Установка зависимостей
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Добавление GPG ключа Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавление репозитория
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Добавление пользователя в группу docker (чтобы не использовать sudo)
sudo usermod -aG docker $USER

# Перелогиньтесь или выполните:
newgrp docker
```

---

## 🚀 Быстрый старт

### Шаг 1: Клонирование репозитория

```bash
git clone <your-repo-url> brain-training
cd brain-training/deploy
```

### Шаг 2: Настройка переменных окружения

Файл `.env` уже содержит рабочие ключи. Если нужно изменить:

```bash
# Посмотреть текущие значения
cat .env

# Отредактировать при необходимости
nano .env
```

### Шаг 3: Запуск приложения

```bash
# Сборка и запуск всех сервисов
docker compose up -d

# Или с логами (для первого запуска рекомендуется)
docker compose up
```

### Шаг 4: Проверка работы

```bash
# Проверить статус контейнеров
docker compose ps

# Все контейнеры должны быть в состоянии "Up" или "healthy"
```

### Шаг 5: Открытие приложения

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **Health check**: http://localhost:8001/api/health

---

## 📁 Структура проекта

```
deploy/
├── docker-compose.yml          # Основная конфигурация Docker Compose
├── docker-compose.prod.yml     # Override для production (с доменом)
├── .env                        # Переменные окружения (с реальными ключами)
├── .env.example                # Пример переменных окружения
├── .gitignore                  # Git ignore файл
├── .dockerignore               # Docker ignore файл
├── nginx.host.conf.example     # Пример конфига Nginx для хоста
├── README.md                   # Это руководство
│
├── backend/                    # FastAPI Backend
│   ├── Dockerfile             # Dockerfile для backend
│   ├── requirements.txt       # Python зависимости
│   ├── server.py              # Основной файл сервера
│   └── spot_difference_logic.py # Логика игры "Найди отличия"
│
└── frontend/                   # React Frontend
    ├── Dockerfile             # Multi-stage Dockerfile (build + nginx)
    ├── nginx.conf             # Nginx конфиг для контейнера
    ├── package.json           # Node.js зависимости
    └── src/                   # Исходный код React
```

---

## 🔐 Переменные окружения

### Файл `.env`

| Переменная | Описание | Где получить |
|------------|----------|--------------|
| `EMERGENT_LLM_KEY` | API ключ для AI генерации (изображения, текст) | [emergentagent.com](https://emergentagent.com) → Profile → Universal Key |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота для авторизации | [@BotFather](https://t.me/BotFather) в Telegram |

### Важно!

- Файл `.env` содержит ваши реальные ключи
- Репозиторий должен быть **приватным**
- Никогда не коммитьте `.env` в публичные репозитории

---

## 🌐 Настройка для Production (с доменом)

### Вариант 1: Изменение docker-compose.yml

Отредактируйте `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      # Замените localhost на ваш домен
      - CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

  frontend:
    build:
      args:
        # URL до backend API через nginx
        - REACT_APP_BACKEND_URL=https://your-domain.com
```

Затем пересоберите:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Вариант 2: Использование docker-compose.prod.yml

1. Отредактируйте `docker-compose.prod.yml`, заменив `your-domain.com` на ваш домен

2. Запустите с override:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🔧 Настройка Nginx на хосте

После запуска Docker контейнеров, настройте Nginx на вашем сервере для проксирования.

### Шаг 1: Установка Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

### Шаг 2: Создание конфигурации

```bash
# Скопируйте пример конфигурации
sudo cp nginx.host.conf.example /etc/nginx/sites-available/brain-training

# Откройте для редактирования
sudo nano /etc/nginx/sites-available/brain-training
```

### Шаг 3: Замените домен

В файле `/etc/nginx/sites-available/brain-training`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # ← Замените на ваш домен
    
    # ... остальная конфигурация ...
}
```

### Шаг 4: Активация и запуск

```bash
# Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/brain-training /etc/nginx/sites-enabled/

# Удалите default конфиг (если нужен только один сайт)
sudo rm /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl reload nginx
```

### Шаг 5: Проверка

```bash
# Проверьте статус Nginx
sudo systemctl status nginx

# Проверьте доступность
curl http://your-domain.com/api/health
```

---

## 🐳 Полезные команды Docker

### Управление контейнерами

```bash
# Запуск всех сервисов
docker compose up -d

# Остановка всех сервисов
docker compose down

# Перезапуск конкретного сервиса
docker compose restart backend
docker compose restart frontend

# Просмотр статуса
docker compose ps
```

### Логи

```bash
# Логи всех сервисов
docker compose logs

# Логи конкретного сервиса с follow
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb

# Последние 100 строк
docker compose logs --tail=100 backend
```

### Пересборка

```bash
# Пересборка одного сервиса
docker compose build backend
docker compose build frontend

# Пересборка без кэша
docker compose build --no-cache

# Пересборка и запуск
docker compose up -d --build
```

### Работа с данными

```bash
# Просмотр volumes
docker volume ls

# Бэкап MongoDB
docker compose exec mongodb mongodump --out /dump
docker cp brain-training-mongo:/dump ./backup

# Восстановление MongoDB
docker cp ./backup brain-training-mongo:/dump
docker compose exec mongodb mongorestore /dump
```

### Очистка

```bash
# Удалить контейнеры и сети (данные сохранятся)
docker compose down

# Удалить контейнеры, сети И данные
docker compose down -v

# Удалить неиспользуемые образы
docker image prune

# Полная очистка Docker (ОСТОРОЖНО!)
docker system prune -a
```

---

## ❓ Troubleshooting

### Проблема: Контейнер не запускается

```bash
# Проверьте логи
docker compose logs backend
docker compose logs frontend

# Проверьте .env файл
cat .env
```

### Проблема: MongoDB не подключается

```bash
# Проверьте статус MongoDB
docker compose ps mongodb
docker compose logs mongodb

# Перезапустите MongoDB
docker compose restart mongodb
```

### Проблема: Frontend не видит Backend

1. Проверьте что backend запущен:
```bash
curl http://localhost:8001/api/health
```

2. Проверьте CORS_ORIGINS в docker-compose.yml

3. Проверьте REACT_APP_BACKEND_URL при сборке

### Проблема: Игра "Найди отличия" не генерирует изображения

1. Проверьте EMERGENT_LLM_KEY в .env
2. Проверьте логи backend:
```bash
docker compose logs -f backend
```

### Проблема: Telegram авторизация не работает

1. Проверьте TELEGRAM_BOT_TOKEN в .env
2. Убедитесь что бот создан через @BotFather
3. WebApp должен быть настроен для вашего домена в BotFather

### Проблема: Порт занят

```bash
# Найти процесс на порту
sudo lsof -i :3000
sudo lsof -i :8001

# Убить процесс
sudo kill -9 <PID>

# Или изменить порты в docker-compose.yml
```

---

## 🎮 Доступные игры

| Игра | Описание | Категория |
|------|----------|-----------|
| **Таблицы Шульте** | Тренировка периферийного зрения | Внимание |
| **Найди отличия** | AI-генерируемые изображения | Внимание |
| **Тест Струпа** | Когнитивная гибкость | Внимание |
| **Поймай букву** | Ловите падающие буквы | Скорость |
| **Поймай крота** | Классическая игра на реакцию | Скорость |
| **Запоминание последовательностей** | Тренировка памяти | Память |
| **Математические задачи** | Устный счёт | Логика |
| **Скорость печати** | AI-генерируемые тексты | Скорость |

---

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте раздел [Troubleshooting](#troubleshooting)
2. Посмотрите логи: `docker compose logs`
3. Убедитесь что все требования выполнены

---

## 📝 Лицензия

MIT License
