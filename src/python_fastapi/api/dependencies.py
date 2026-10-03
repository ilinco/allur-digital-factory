from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from python_fastapi.core.database import get_db
from python_fastapi.services.task import TaskService

GET_DB_DEPENDENCY = Depends(get_db)


def get_tasks_service(db: AsyncSession = GET_DB_DEPENDENCY):
	return TaskService(db)
