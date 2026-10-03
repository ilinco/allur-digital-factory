from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from python_fastapi.models.task import TaskModel


class TaskRepository:
	def __init__(self, db: AsyncSession) -> None:
		self.db = db

	async def get_all(self) -> Sequence[TaskModel]:
		result = await self.db.scalars(select(TaskModel))
		return result.all()

	async def get_by_id(self, task_id: str) -> TaskModel | None:
		return await self.db.get(TaskModel, task_id)

	async def create(self, title: str) -> TaskModel:
		new_task = TaskModel(title=title, completed=False)
		self.db.add(new_task)
		await self.db.commit()
		await self.db.refresh(new_task)
		return new_task

	async def update(self, task: TaskModel) -> TaskModel:
		await self.db.commit()
		await self.db.refresh(task)
		return task

	async def delete(self, task: TaskModel) -> None:
		await self.db.delete(task)
		await self.db.commit()
