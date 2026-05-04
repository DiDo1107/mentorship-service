# Система наставничества

Веб-сервис для поддержки процесса наставничества новых сотрудников на предприятии.

## Технологии

| Слой | Стек |
|------|------|
| Backend | Node.js + Express.js + Prisma ORM + TypeScript |
| Frontend | React 18 + Vite + TailwindCSS + TypeScript |
| База данных | PostgreSQL 15 |
| Аутентификация | JWT (access 15м + refresh 7д) |
| Упаковка | Docker + Docker Compose |

## Быстрый старт (Docker)

```bash
# 1. Клонировать и перейти в директорию
cd mentorship-service

# 2. Скопировать файл окружения
cp .env.example .env

# 3. Собрать и запустить
docker-compose up --build
```

**Приложение:** http://localhost:3000  
**API:** http://localhost:4000/api  
**Health-check:** http://localhost:4000/api/health

## Тестовые аккаунты (после seed)

| Роль | Email | Пароль |
|------|-------|--------|
| HR | hr@company.ru | password123 |
| Наставник 1 | mentor1@company.ru | password123 |
| Наставник 2 | mentor2@company.ru | password123 |
| Сотрудник 1 | employee1@company.ru | password123 |
| Сотрудник 2 | employee2@company.ru | password123 |
| Сотрудник 3 | employee3@company.ru | password123 |

## Запустить seed-скрипт

```bash
# Внутри контейнера backend
docker exec -it mentorship_backend npx ts-node prisma/seed.ts

# Или локально (см. раздел "Локальная разработка")
cd backend && npm run seed
```

## Роли пользователей

### HR-менеджер
- Создаёт пары наставник → сотрудник
- Управляет статусами пар (активна / приостановлена / завершена)
- Видит общую статистику: прогресс, просроченные задачи

### Наставник
- Создаёт и управляет задачами для подопечного
- Планирует встречи 1-on-1, добавляет итоги
- Оставляет обратную связь об успехах сотрудника

### Новый сотрудник
- Видит свои задачи и обновляет их статус
- Следит за личным прогресс-баром
- Оставляет оценку работы наставника

## API эндпоинты

### Аутентификация
```
POST   /api/auth/register    Регистрация
POST   /api/auth/login       Вход
POST   /api/auth/refresh     Обновление токена
POST   /api/auth/logout      Выход
GET    /api/auth/me          Текущий пользователь
GET    /api/auth/users       Список пользователей (hr, mentor)
```

### Пары наставничества
```
GET    /api/pairs            Список пар (по роли)
POST   /api/pairs            Создать пару (hr)
GET    /api/pairs/:id        Детали пары
PATCH  /api/pairs/:id/status Обновить статус (hr)
```

### Задачи
```
GET    /api/tasks/pair/:pairId  Задачи пары
POST   /api/tasks               Создать задачу (mentor)
PATCH  /api/tasks/:id           Обновить задачу
DELETE /api/tasks/:id           Удалить задачу (mentor)
```

### Встречи
```
GET    /api/meetings/pair/:pairId  Встречи пары
POST   /api/meetings               Создать встречу (mentor)
PATCH  /api/meetings/:id           Обновить / добавить итоги (mentor)
DELETE /api/meetings/:id           Удалить встречу (mentor)
```

### Обратная связь
```
GET    /api/feedback/pair/:pairId  Отзывы пары
POST   /api/feedback               Оставить отзыв (mentor, employee)
PATCH  /api/feedback/:id           Обновить отзыв
```

### Дашборд
```
GET    /api/dashboard   Данные дашборда (по роли пользователя)
```

## Локальная разработка (без Docker)

### Требования
- Node.js 20+
- PostgreSQL 15

### Backend

```bash
cd backend
npm install
cp ../.env.example .env
# Заполните DATABASE_URL в .env

npx prisma migrate dev
npx prisma generate
npm run seed      # тестовые данные
npm run dev       # http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
# Создайте .env.local:
# VITE_API_URL=http://localhost:4000/api
npm run dev       # http://localhost:3000
```

## Деплой на VPS

### Требования
- Ubuntu 22.04+
- Docker + Docker Compose

```bash
# 1. Установить Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Клонировать репозиторий
git clone <repo-url> /opt/mentorship
cd /opt/mentorship

# 3. Настроить окружение
cp .env.example .env
nano .env
# Обязательно измените:
# JWT_SECRET=<длинный_случайный_ключ>
# JWT_REFRESH_SECRET=<другой_длинный_случайный_ключ>
# POSTGRES_PASSWORD=<надёжный_пароль>
# FRONTEND_URL=https://your-domain.com
# VITE_API_URL=https://your-domain.com/api

# 4. Запустить
docker-compose up -d --build

# 5. Заполнить тестовыми данными (опционально)
docker exec mentorship_backend npx ts-node prisma/seed.ts

# 6. Проверить статус
docker-compose ps
docker-compose logs -f backend
```

### Nginx (reverse proxy, необязательно)

Если хотите использовать домен с SSL:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Структура проекта

```
mentorship-service/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Обработка HTTP запросов
│   │   ├── services/        # Бизнес-логика
│   │   ├── routes/          # Маршруты API
│   │   ├── middleware/      # Auth, roleGuard, errorHandler
│   │   ├── types/           # TypeScript типы
│   │   └── index.ts         # Точка входа
│   ├── prisma/
│   │   ├── schema.prisma    # Схема БД
│   │   └── seed.ts          # Тестовые данные
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios клиент и запросы
│   │   ├── components/      # Layout, PrivateRoute
│   │   ├── pages/           # Страницы по ролям
│   │   ├── store/           # Zustand (authStore)
│   │   └── types/           # TypeScript типы
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## Переменные окружения

| Переменная | Описание | По умолчанию |
|-----------|----------|-------------|
| `POSTGRES_USER` | Пользователь БД | `mentorship` |
| `POSTGRES_PASSWORD` | Пароль БД | `mentorship_pass` |
| `POSTGRES_DB` | Имя БД | `mentorship` |
| `JWT_SECRET` | Секрет access-токена | — |
| `JWT_REFRESH_SECRET` | Секрет refresh-токена | — |
| `JWT_EXPIRES_IN` | Время жизни access | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Время жизни refresh | `7d` |
| `FRONTEND_URL` | URL фронтенда (CORS) | `http://localhost:3000` |
| `VITE_API_URL` | URL API для фронтенда | `/api` |
