import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from allur_factory.api.routers import (
	analytics_router,
	api_v1_router,
	factory_router,
	health_router,
)
from allur_factory.core.config import settings
from allur_factory.core.database import (
	DATABASE_URL,
	engine,
)
from allur_factory.core.exception_handlers import setup_exception_handlers

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
app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.CORS_ALLOW_ORIGINS if settings.CORS_ALLOW_ORIGINS and settings.CORS_ALLOW_ORIGINS != [''] else ['*'],
	allow_credentials=True,
	allow_methods=['*'],
	allow_headers=['*'],
)

setup_exception_handlers(app)

app.include_router(health_router)
app.include_router(api_v1_router)
app.include_router(factory_router, include_in_schema=False)
app.include_router(analytics_router, include_in_schema=False)


def main():
	uvicorn.run('allur_factory.main:app', host='0.0.0.0', port=8000, reload=True)


if __name__ == '__main__':
	main()
