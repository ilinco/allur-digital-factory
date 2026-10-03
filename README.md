# Python FastAPI Todos API

Асинхронный REST API сервис для управления задачами.

---

## 🛠 Стек технологий

- **Язык**: Python 3.12+
- **Веб-фреймворк**: [FastAPI](https://fastapi.tiangolo.com/) + [Uvicorn](https://www.uvicorn.org/)
- **База данных**: PostgreSQL
- **ORM / Слой данных**: [SQLAlchemy 2.0](https://docs.sqlalchemy.org/) (полностью асинхронный режим) + драйвер [asyncpg](https://github.com/MagicStack/asyncpg)
- **Миграции**: [Alembic](https://alembic.sqlalchemy.org/)
- **Валидация и схемы**: [Pydantic v2](https://docs.pydantic.dev/) + [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- **Менеджер пакетов и окружения**: [uv](https://docs.astral.sh/uv/)
- **Линтинг и форматирование**: [Ruff](https://docs.astral.sh/ruff/) + [pre-commit](https://pre-commit.com/)

---

## 🏗 Архитектура и как всё работает

Проект организован по принципам **слоистой чистой архитектуры (Layered Architecture)** с разделением ответственности:

```text
src/python_fastapi/
├── api/                   # Презентационный слой (HTTP API)
│   ├── dependencies.py    # Внедрение зависимостей (DI) для сервисов и сессий
│   └── routers/           # Контроллеры/эндпоинты (health, task)
├── core/                  # Системное ядро приложения
│   ├── config.py          # Настройки (читаются из переменных окружения и .env)
│   ├── database.py        # Асинхронный движок SQLAlchemy и фабрика сессий
│   ├── exceptions.py      # Кастомные доменные исключения (TaskNotFoundError и т.д.)
│   └── exception_handlers.py # Централизованная обработка ошибок с понятными HTTP-ответами
├── models/                # Модели базы данных SQLAlchemy ORM
│   ├── base.py            # Базовый декларативный класс с автогенерацией UUID
│   └── task.py            # Модель таблицы tasks
├── repositories/          # Слой работы с БД (CRUD операции)
│   └── task.py            # TaskRepository: прямой доступ к данным
├── schemas/               # Схемы валидации и сериализации Pydantic (DTO)
│   └── task.py            # Схемы для создания, чтения и обновления задач
├── services/              # Слой бизнес-логики
│   └── task.py            # TaskService: координация логики и репозитория
└── main.py                # Точка входа в приложение и регистрация роутов
```

### Поток обработки запроса (Request Flow)
1. **Клиент** отправляет HTTP-запрос (например, `POST /tasks/`).
2. **Роутер (`api/routers/task.py`)** принимает запрос, автоматически валидирует тело через Pydantic-схему `TaskCreateSchema` и запрашивает сервис через механизм зависимостей (`Depends`).
3. **Зависимости (`api/dependencies.py` & `core/database.py`)** открывают асинхронную сессию БД (`AsyncSession`) и передают её в `TaskService`.
4. **Сервис (`services/task.py`)** содержит бизнес-правила, вызывает методы репозитория и трансформирует сущности базы данных в Pydantic-схемы для ответа.
5. **Репозиторий (`repositories/task.py`)** выполняет асинхронные запросы к PostgreSQL через SQLAlchemy.
6. **Обработчики ошибок (`core/exception_handlers.py`)**: если сущность не найдена, выбрасывается `TaskNotFoundError`, который централизованно превращается в аккуратный JSON со статусом `404 Not Found` (без падения сервера).

---

## 🚀 Быстрый запуск

### 1. Предварительные требования

- **Python 3.12** или выше
- **Менеджер пакетов [uv](https://docs.astral.sh/uv/)** (рекомендуется) либо классический `pip`
- **PostgreSQL** (запущенный локально или в Docker)

> **Подсказка по установке `uv`:**
> ```bash
> # Linux / macOS
> curl -LsSf https://astral.sh/uv/install.sh | sh
> ```

---

### 2. Клонирование репозитория и установка зависимостей

```bash
git clone <URL_РЕПОЗИТОРИЯ>
cd python-fastapi

# Установка всех зависимостей проекта и создание виртуального окружения (.venv)
uv sync
```

*(Если вы используете стандартный `pip`):*
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

---

### 3. Настройка переменных окружения

Скопируйте шаблон файла конфигурации `.env.example` в `.env`:

```bash
cp .env.example .env
```

Отредактируйте `.env`, указав параметры вашей базы данных:

```env
user=postgres
password=postgres
host=localhost
port=5432
dbname=postgres
ssl_mode=disable
```

> **Примечание:** Если у вас локальный PostgreSQL без SSL-сертификата, обязательно укажите `ssl_mode=disable`.

---

### 4. Запуск PostgreSQL (если нет готовой БД)

Быстрее всего поднять локальную базу через Docker:

```bash
docker run -d \
  --name fastapi-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  postgres:16-alpine
```

---

### 5. Применение миграций базы данных

Перед первым запуском приложения создайте таблицы в базе данных с помощью Alembic:

```bash
# Через uv
uv run alembic upgrade head

# Либо с активированным виртуальным окружением
alembic upgrade head
```

---

### 6. Запуск сервера разработки

Запустите сервер приложения:

```bash
# Вариант 1 (через зарегистрированный скрипт проекта):
uv run python-fastapi

# Вариант 2 (напрямую через uvicorn):
uv run uvicorn python_fastapi.main:app --host 127.0.0.1 --port 8000 --reload
```

После старта сервер будет доступен по адресу: **http://127.0.0.1:8000**

---

## 📖 Документация API

FastAPI автоматически генерирует интерактивную документацию:

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) — интерактивное тестирование всех эндпоинтов прямо из браузера.
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) — альтернативная визуализация спецификации OpenAPI.

---

## 📌 Доступные эндпоинты

### Health Check (Проверка состояния)
| Метод | Эндпоинт | Описание |
| :--- | :--- | :--- |
| `GET` | `/health/` | Проверка доступности сервиса (возвращает `{"message": "Server is fine!"}`) |

### Задачи (Tasks)
| Метод | Эндпоинт | Описание |
| :--- | :--- | :--- |
| `GET` | `/tasks/` | Получить список всех задач |
| `POST` | `/tasks/` | Создать новую задачу |
| `GET` | `/tasks/{task_id}` | Получить задачу по её ID |
| `PATCH`| `/tasks/{task_id}` | Частично обновить задачу (`title`, `completed`) |
| `DELETE`| `/tasks/{task_id}` | Удалить задачу по ID |

---

## 💡 Примеры работы с API (cURL)

#### 1. Создать задачу
```bash
curl -X POST "http://127.0.0.1:8000/tasks/" \
  -H "Content-Type: application/json" \
  -d '{"title": "Изучить FastAPI и SQLAlchemy"}'
```
*Ответ (201 Created):*
```json
{
  "id": "e4b6c31f-0fb3-4b68-8cf9-c3c2f0f4a82a",
  "title": "Изучить FastAPI и SQLAlchemy",
  "completed": false
}
```

#### 2. Получить список всех задач
```bash
curl -X GET "http://127.0.0.1:8000/tasks/"
```

#### 3. Обновить статус задачи (отметить как выполненную)
```bash
curl -X PATCH "http://127.0.0.1:8000/tasks/<TASK_ID>" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

#### 4. Удалить задачу
```bash
curl -X DELETE "http://127.0.0.1:8000/tasks/<TASK_ID>"
```

---

## 🔧 Команды для разработки

### Проверка и форматирование кода (Ruff)
```bash
# Проверка линтером с автоисправлением
uv run ruff check --fix

# Автоматическое форматирование кода
uv run ruff format
```

### Настройка Git pre-commit хуков
В репозитории настроен `pre-commit`, который проверяет файлы и форматирует код перед каждым коммитом:
```bash
# Установка хуков в репозиторий
uv run pre-commit install

# Ручной запуск проверки всех файлов
uv run pre-commit run --all-files
```

### Создание новых миграций Alembic
Если вы добавили или изменили модели в `models/`:
```bash
uv run alembic revision --autogenerate -m "описание изменений"
uv run alembic upgrade head
```
