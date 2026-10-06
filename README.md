# Allur Digital Factory

## 🛠 Стек технологий

- **Backend**: Python 3.12, FastAPI, Uvicorn, SQLAlchemy 2.0 (Async), asyncpg, Alembic, Pydantic v2, uv
- **Frontend**: React 19, TypeScript, Vite, pnpm
- **База данных**: PostgreSQL (Supabase)
- **Контейнеризация**: Docker, Docker Compose, Nginx (для prod)

---

## 🚀 Быстрый старт через Docker (Рекомендуется)

Для работы вам понадобятся установленные **Docker** и **Docker Compose**.

### 1. Подготовка переменных окружения

Создайте файл `.env` в корне проекта (скопируйте из шаблона):

```bash
cp .env.example .env
```

Заполните ваши реквизиты доступа к Supabase в `.env`:

```env
user=postgres.<project-ref>
password=your-supabase-db-password
host=aws-0-eu-west-1.pooler.supabase.com
port=5432
dbname=postgres
ssl_mode=require
```

### 2. Запуск контейнеров

Для первого запуска или после изменения зависимостей/Dockerfile используйте флаг `--build`:

```bash
docker compose up -d --build
```

> **Примечание:** При последующих запусках, если зависимости не менялись, достаточно выполнить `docker compose up -d`. Код подмонтирован в контейнеры, поэтому правки применяются на лету (hot-reload).

### 3. Доступ к сервисам

После успешного старта будут доступны:

| Сервис | URL | Описание |
|---|---|---|
| **Frontend** | [http://localhost:5173](http://localhost:5173) | Vite Dev Server (React) |
| **Backend API** | [http://localhost:8000](http://localhost:8000) | FastAPI сервер |
| **Swagger UI** | [http://localhost:8000/docs](http://localhost:8000/docs) | Интерактивная документация API |
| **Health Check** | [http://localhost:8000/health](http://localhost:8000/health) | Проверка работоспособности бэкенда |

### 4. Просмотр логов

```bash
# Логи всех сервисов
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f backend
docker compose logs -f frontend
```

### 5. Остановка сервисов

```bash
docker compose down
```

---

## 🗄 Работа с базой данных и миграциями (Alembic)

Миграции применяются напрямую к вашей базе в **Supabase**. Все команды можно выполнять как через запущенный Docker-контейнер, так и локально.

### Применение миграций

```bash
# Через Docker:
docker compose exec backend uv run alembic upgrade head

# Локально:
cd backend && uv run alembic upgrade head
```

### Создание новой миграции (autogenerate)

После добавления или редактирования SQLAlchemy моделей в `backend/src/allur_factory/models/`:

```bash
# Через Docker:
docker compose exec backend uv run alembic revision --autogenerate -m "описание_изменений"

# Локально:
cd backend && uv run alembic revision --autogenerate -m "описание_изменений"
```

### Откат миграции

```bash
# Откат на 1 шаг назад:
docker compose exec backend uv run alembic downgrade -1
```

---

## 💻 Локальный запуск без Docker

Если вы предпочитаете запускать сервисы нативно на хост-машине:

### Требования
- **Python**: `>= 3.12` и пакетный менеджер [uv](https://docs.astral.sh/uv/)
- **Node.js**: `>= 20` и пакетный менеджер [pnpm](https://pnpm.io/)

### Запуск Backend

```bash
cd backend

# 1. Создание виртуального окружения и установка зависимостей
uv sync

# 2. Активация виртуального окружения:
# Для Linux / macOS:
source .venv/bin/activate

# Для Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Для Windows (CMD):
.venv\Scripts\activate.bat

# 3. Применение миграций к БД
alembic upgrade head
# или без активации окружения: uv run alembic upgrade head

# 4. Запуск сервера разработки с перезагрузкой
uvicorn allur_factory.main:app --reload --host 0.0.0.0 --port 8000
# или без активации окружения: uv run uvicorn allur_factory.main:app --reload --host 0.0.0.0 --port 8000
```

### Запуск Frontend

```bash
cd frontend

# Установка зависимостей
pnpm install

# Запуск dev-сервера
pnpm dev
```

---

## 🏭 Production сборка (Docker)

Для запуска production-окружения (бэкенд без автоперезагрузки, фронтенд собран в статику и раздаётся через Nginx на 80 порту):

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

- **Frontend (Nginx)**: [http://localhost](http://localhost) (порт 80)
- **Backend API**: [http://localhost:8000](http://localhost:8000)

Остановка:
```bash
docker compose -f docker-compose.prod.yml down
```

---

## 💡 Полезные команды

- **Линтинг и форматирование бэкенда**:
  ```bash
  cd backend && uv run ruff check . && uv run ruff format .
  ```
- **Линтинг фронтенда**:
  ```bash
  cd frontend && pnpm lint
  ```
- **Сборка фронтенда для проверки типов**:
  ```bash
  cd frontend && pnpm build
  ```
- **Перезапуск отдельного контейнера**:
  ```bash
  docker compose restart backend
  docker compose restart frontend
  ```
