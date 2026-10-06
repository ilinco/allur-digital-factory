import logging
from collections.abc import AsyncGenerator

from fastapi import Depends
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import (
	AsyncSession,
	async_sessionmaker,
	create_async_engine,
)

from allur_factory.core.config import settings

logger = logging.getLogger(__name__)

DATABASE_URL = settings.database_url

engine = create_async_engine(
	DATABASE_URL,
	echo=settings.DB_ECHO,
)

AsyncSessionLocal = async_sessionmaker(
	bind=engine,
	class_=AsyncSession,
	expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
	async with AsyncSessionLocal() as session:
		try:
			yield session
		except Exception:
			try:
				await session.rollback()
			except SQLAlchemyError as err:
				logger.warning('Failed to rollback session: %s', err)
			raise


DB_DEPENDENCY = Depends(get_db)
