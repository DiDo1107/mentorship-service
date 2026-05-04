# Система наставничества — Руководство по запуску

## Требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## Запуск

**Шаг 1 — Запустить Docker Desktop** и дождаться статуса **"Engine running"** в трее

**Шаг 2 — Зайти в папку проекта через консоль:**
```
cd mentorship-service
```

**Шаг 3 — Собрать и запустить контейнеры:**
```
docker-compose up --build
```
Дождаться сообщения `Сервер запущен на порту 4000`

**Шаг 4 — Заполнить тестовыми данными:**
```
docker exec mentorship_backend npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts
```

---

## Открытие

| Адрес | Описание |
|-------|----------|
| http://localhost:3000 | Веб-приложение |
| http://localhost:4000/api/health | Проверка backend |

---

## Тестовые аккаунты

Пароль для всех: `password123`

| Роль | Email |
|------|-------|
| HR-менеджер | hr@company.ru |
| Наставник 1 | mentor1@company.ru |
| Наставник 2 | mentor2@company.ru |
| Сотрудник 1 | employee1@company.ru |
| Сотрудник 2 | employee2@company.ru |
| Сотрудник 3 | employee3@company.ru |

---

## Остановка

```
docker-compose down
```
