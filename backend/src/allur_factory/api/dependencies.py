from collections.abc import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from allur_factory.core.database import get_db

GET_DB_DEPENDENCY: AsyncGenerator[AsyncSession, None] = Depends(get_db)
