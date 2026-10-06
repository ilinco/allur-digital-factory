FROM python:3.12-slim

# Install uv from official Astral image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

# Install dependencies using cache
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# Copy application source
COPY . .

# Install application package
RUN uv sync --frozen --no-dev

EXPOSE 8000

CMD ["uvicorn", "allur_factory.main:app", "--host", "0.0.0.0", "--port", "8000"]
