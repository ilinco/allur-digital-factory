# Backend API (FastAPI)

Асинхронный REST API сервис на FastAPI, построенный по принципам слоистой чистой архитектуры (Layered Architecture).

## Стек технологий

- **Python 3.12+**
- **FastAPI** + **Uvicorn**
- **PostgreSQL** + **SQLAlchemy 2.0 (Async)** + **asyncpg**
- **Alembic** (миграции базы данных)
- **Pydantic v2** + **pydantic-settings**
- **uv** (пакетный менеджер)
- **Ruff** (линтер и форматтер)

## Архитектура проекта

```text
backend/
├── src/allur_factory/
│   ├── api/                   # Презентационный слой (HTTP API)
│   │   ├── dependencies.py    # Внедрение зависимостей (DI: db-сессии, сервисы)
│   │   └── routers/           # Эндпоинты/роутеры (health, бизнес-сущности)
│   ├── core/                  # Ядро приложения
│   │   ├── config.py          # Конфигурация и переменные окружения (Pydantic Settings)
│   │   ├── database.py        # Async Engine, фабрика сессий AsyncSession, get_db
│   │   ├── exceptions.py      # Доменные и базовые исключения (AppException и т.д.)
│   │   └── exception_handlers.py # Глобальные обработчики исключений
│   ├── models/                # SQLAlchemy ORM модели
│   │   └── base.py            # Базовый декларативный класс с UUID идентификатором
│   ├── repositories/          # Слой доступа к данным (CRUD / DB-операции)
│   ├── schemas/               # Схемы валидации и сериализации (Pydantic DTO)
│   ├── services/              # Слой бизнес-логики
│   └── main.py                # Инициализация приложения FastAPI и регистрация роутов
├── alembic/                   # Миграции базы данных
├── alembic.ini                # Конфигурация Alembic
├── pyproject.toml             # Зависимости и метаданные проекта
└── .env.example               # Пример переменных окружения
```

## Быстрый старт

### 1. Установка зависимостей и активация окружения

```bash
uv sync

# Активация виртуального окружения:
# Linux / macOS:
source .venv/bin/activate
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (CMD):
.venv\Scripts\activate.bat
```

### 2. Настройка переменных окружения

Создайте `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

### 3. Запуск миграций базы данных

После добавления моделей в `src/allur_factory/models/`:

```bash
# Генерация новой миграции
uv run alembic revision --autogenerate -m "initial migration"

# Применение миграций
uv run alembic upgrade head
```

### 4. Запуск сида тестовых данных

Для наполнения базы данных тестовыми данными из кейса:

```bash
uv run seed
# или
uv run python seed.py
# или указать путь к файлу явно:
uv run seed --docx /home/nick/Downloads/Кейс_Цифровой_двойник_Тестовые_данные.docx
```

### 5. Запуск сервера разработки

```bash
uv run uvicorn allur_factory.main:app --reload --host 0.0.0.0 --port 8000
# или
uv run allur_factory
```

Документация Swagger UI будет доступна по адресу: [http://localhost:8000/docs](http://localhost:8000/docs)

### 6. Запуск тестов

```bash
uv run pytest
# или с подробным выводом:
uv run pytest -v
# или через стандартный модуль unittest:
uv run python -m unittest discover tests
```
