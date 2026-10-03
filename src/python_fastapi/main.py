import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from python_fastapi.api.routers.health import router as health_router
from python_fastapi.api.routers.task import router as task_router
from python_fastapi.core.config import settings
from python_fastapi.core.database import (
	DATABASE_URL,
	engine,
)
from python_fastapi.core.exception_handlers import setup_exception_handlers

__all__ = ['DATABASE_URL', 'app', 'main']

logging.basicConfig(
	level=logging.INFO,
	format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
	try:
		async with engine.connect():
			logger.info('Database connection successful!')
	except (SQLAlchemyError, OSError) as e:
		logger.error('Failed to connect to database: %s', e)
	yield
	await engine.dispose()


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ALLOW_ORIGINS, allow_methods=['*'])

setup_exception_handlers(app)

app.include_router(health_router)
app.include_router(task_router)


def main():
	uvicorn.run('python_fastapi.main:app', port=8000, reload=True)


if __name__ == '__main__':
	main()
