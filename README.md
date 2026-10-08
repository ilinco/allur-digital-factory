# Allur Digital Factory

Платформа цифрового двойника и операционной аналитики производственных линий для расчета OEE, мониторинга простоев и предиктивной оптимизации рабочих процессов.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-online-success?style=flat)](https://greenstonehub.digital)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat)](#)
[![Version](https://img.shields.io/badge/version-0.1.0-blue?style=flat)](#)
[![Python](https://img.shields.io/badge/python-3.12-3776AB?style=flat)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.142+-009688?style=flat)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat)](https://www.docker.com/)

> 🌐 **Демо:** [https://greenstonehub.digital](https://greenstonehub.digital)  
> 📖 **Интерактивная документация API (Swagger):** [https://greenstonehub.digital/docs](https://greenstonehub.digital/docs)

---

## Назначение и практическая польза

Система решает задачу сквозной цифровизации сборочного производства и устранения информационных разрывов между цехом и менеджментом.

### Бизнес-эффект и ценность

- **Снижение времени реакции на инциденты**: Переход от ручного заполнения журналов к мгновенному отображению аварийных остановов технологических секций.
- **Предотвращение срыва производственного плана**: Выявление риска недовыпуска продукции на ранней стадии смены с пересчетом прогнозируемого отставания.
- **Безопасная симуляция изменений**: Возможность проверить сценарии отказов оборудования и перебалансировки такта линии на цифровом двойнике без риска для реального производства.
- **Рост общей эффективности оборудования (OEE)**: Локализация хронических микропростоев и систематических причин брака за счет факторного анализа доступности, производительности и качества.
- **Интеллектуальная поддержка принятия решений**: Снижение когнитивной нагрузки на операторов и инженеров благодаря автогенерации рекомендаций по устранению узких мест с помощью LLM.

---

## Что умеет проект

### 1. Цифровой двойник и интерактивная схема цеха
- Визуализация производственной топологии завода (участки сварки, окраски, сборки и контроля качества).
- Отображение статусов постов и агрегатов в реальном времени (штатная работа, предупреждение, критический останов).
- Детализация по конкретным единицам оборудования (промышленные роботы, конвейерные приводы, посты контроля).

### 2. Автоматический расчет OEE и KPI смены
- Расчет составных компонентов OEE по международному стандарту:
  - **Availability (Доступность)**: Соотношение чистого времени работы к плановому фонду времени смены с учетом простоев.
  - **Performance (Производительность)**: Отношение фактического объема выпуска к нормативному такту линии.
  - **Quality (Качество)**: Доля годных изделий за вычетом выявленного брака.
- Сравнение совокупного OEE с целевым ориентиром (85% World Class OEE).
- Отслеживание динамики выполнения месячного плана по моделям автомобилей (план vs факт).

### 3. Мониторинг простоев и анализ узких мест (Bottlenecks)
- Журналирование инцидентов с классификацией причин остановки (механические сбои, технологические задержки, логистика).
- Автоматический скоринг критичности оборудования по накопленной длительности простоев.
- Оценка влияния единичного отказа на общие потери выпуска смены (Impact Units).

### 4. What-If симуляция и сценарный стресс-тест
- Эмуляция внештатных ситуаций (авария роботизированной ячейки, заклинивание конвейера, увеличение времени простоя).
- Мгновенный пересчет прогнозного сменного OEE при изменении параметров симуляции.
- Оценка запаса устойчивости линии при моделировании каскадных отказов.

### 5. Интеллектуальный ассистент на базе LLM
- Генерация контекстных рекомендаций через OpenRouter API на основе актуальных метрик текущей смены.
- Выработка оперативных инженерных инструкций: корректировка скорости подачи кузовов, профилактический осмотр узлов до начала следующей смены, перераспределение буферов.
- Двухуровневое кеширование и валидация ответов модели для стабильной работы интерфейса.

---

## Архитектура и стек технологий

| Компонент | Технология | Назначение |
|---|---|---|
| **Backend Core** | Python 3.12, FastAPI, Uvicorn | Высокопроизводительный асинхронный REST API |
| **Data Layer & ORM** | SQLAlchemy 2.0 (AsyncIO), asyncpg | Асинхронное взаимодействие с базой данных |
| **Миграции БД** | Alembic | Управление версиями и применение схемы данных |
| **База данных** | PostgreSQL (Supabase) | Надежное персистентное хранилище метрик и сущностей |
| **Frontend SPA** | React 19, TypeScript, Vite | Клиентский интерфейс оператора и диспетчера |
| **State & API Client** | TanStack React Query, Axios | Синхронизация данных, кеширование серверного состояния |
| **UI & Стилизация** | Tailwind CSS v4, Tabler Icons | Унифицированная дизайн-система и типографика |
| **Визуализация данных** | Recharts | Графики динамики выработки, диаграммы OEE и тренды |
| **Пакетные менеджеры** | uv (Python), pnpm (Node.js) | Быстрое детерминированное управление зависимостями |
| **Инфраструктура** | Docker, Docker Compose, Nginx | Контейнеризация сервисов и production-раздача |

---

## Быстрый старт

### Системные требования

- **Docker** >= 24.0.0
- **Docker Compose** >= 2.20.0
- *(Для локального запуска без Docker)*: Python >= 3.12, [uv](https://docs.astral.sh/uv/), Node.js >= 20.0.0, [pnpm](https://pnpm.io/)

### Установка и клонирование

```bash
git clone https://github.com/your-org/allur-digital-factory.git
cd allur-digital-factory
```

### Конфигурация окружения

Создайте файл `.env` в корневой директории проекта на основе шаблона:

```bash
cp .env.example .env
```

Пример конфигурации переменных окружения:

```env
USER=postgres
PASSWORD=your_secure_password
HOST=aws-1-eu-central-1.pooler.supabase.com
PORT=5432
DBNAME=postgres
SSL_MODE=require

OPENROUTER_API=your_openrouter_api_key
```

### Запуск приложения

#### Режим разработки (Docker Compose)

Запуск всех сервисов с поддержкой горячей перезагрузки (Hot Reload):

```bash
docker compose up -d --build
```

Доступные сервисы после старта:

| Сервис | URL | Описание |
|---|---|---|
| **Frontend** | [http://localhost:5173](http://localhost:5173) | Vite Dev Server (React) |
| **Backend API** | [http://localhost:8000](http://localhost:8000) | FastAPI сервер |
| **Swagger UI** | [http://localhost:8000/docs](http://localhost:8000/docs) | Интерактивная документация OpenAPI |
| **Health Check** | [http://localhost:8000/health](http://localhost:8000/health) | Проверка статуса сервиса |

Просмотр логов:

```bash
docker compose logs -f
# или отдельный сервис:
docker compose logs -f backend
docker compose logs -f frontend
```

#### Production-режим

Запуск оптимизированной production-сборки (бэкенд без автоперезагрузки, фронтенд собран в статический бандл и раздается через Nginx):

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

- Frontend (Nginx): `http://localhost` (порт 80)
- Backend API: `http://localhost:8000`

Остановка контейнеров:

```bash
docker compose down
# для prod:
docker compose -f docker-compose.prod.yml down
```

<details>
<summary>Инструкция по локальному запуску без Docker</summary>

### Локальный запуск Backend

```bash
cd backend

# 1. Создание виртуального окружения и установка зависимостей
uv sync

# 2. Применение миграций к БД
uv run alembic upgrade head

# 3. Запуск сервера разработки
uv run uvicorn allur_factory.main:app --reload --host 0.0.0.0 --port 8000
```

### Локальный запуск Frontend

```bash
cd frontend

# 1. Установка зависимостей
pnpm install

# 2. Запуск Vite dev-сервера
pnpm dev
```
</details>

---

## Миграции базы данных

Управление версиями схемы данных осуществляется через Alembic. Миграции применяются к базе данных Supabase.

```bash
# Применение актуальных миграций
docker compose exec backend uv run alembic upgrade head
# или локально:
cd backend && uv run alembic upgrade head

# Генерация новой миграции на основе изменений в моделях SQLAlchemy
docker compose exec backend uv run alembic revision --autogenerate -m "описание_изменений"
# или локально:
cd backend && uv run alembic revision --autogenerate -m "описание_изменений"

# Откат последней миграции
docker compose exec backend uv run alembic downgrade -1
# или локально:
cd backend && uv run alembic downgrade -1
```

---

## Примеры использования (API Reference)

### 1. Проверка доступности сервиса

```bash
curl -X GET "http://localhost:8000/health" \
  -H "Accept: application/json"
```

Пример ответа:
```json
{
  "status": "ok"
}
```

### 2. Получение текущих показателей OEE по линии

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/oee?line_id=1" \
  -H "Accept: application/json"
```

Пример ответа:
```json
{
  "line_id": 1,
  "availability": 0.942,
  "performance": 0.885,
  "quality": 0.991,
  "oee": 0.826,
  "calculated_at": "2026-10-08T09:30:00Z"
}
```

### 3. Регистрация простоя секции оборудования

```bash
curl -X POST "http://localhost:8000/api/v1/downtimes" \
  -H "Content-Type: application/json" \
  -d '{
    "section_id": 4,
    "reason_category": "mechanical_failure",
    "description": "Перегрев привода конвейерной ленты",
    "started_at": "2026-10-08T09:15:00Z"
  }'
```

### 4. Запуск What-If симуляции аварийной ситуации

```bash
curl -X POST "http://localhost:8000/api/v1/simulation/action" \
  -H "Content-Type: application/json" \
  -d '{
    "section_id": "welding-1",
    "action": "breakdown",
    "duration_minutes": 75,
    "reason": "Заклинивание поворотного редуктора робота ABB-04"
  }'
```

---

## Контроль качества кода и тестирование

```bash
# Запуск автоматических тестов бэкенда
docker compose exec backend uv run pytest
# или локально:
cd backend && uv run pytest

# Статический анализ и форматирование кода бэкенда (ruff)
docker compose exec backend uv run ruff check .
docker compose exec backend uv run ruff format --check .

# Проверка типов и линтинг фронтенда (eslint & tsc)
docker compose exec frontend pnpm lint
docker compose exec frontend pnpm build
```
