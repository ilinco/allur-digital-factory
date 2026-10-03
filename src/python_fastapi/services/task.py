from sqlalchemy.ext.asyncio import AsyncSession

from python_fastapi.core.exceptions import TaskNotFoundError
from python_fastapi.repositories.task import TaskRepository
from python_fastapi.schemas.task import (
	TaskCreateSchema,
	TaskSchema,
	TaskUpdateSchema,
)


class TaskService:
	def __init__(self, db: AsyncSession) -> None:
		self.db = db
		self.task_repository = TaskRepository(db)

	async def list_tasks(self) -> list[TaskSchema]:
		tasks = await self.task_repository.get_all()
		return [TaskSchema.model_validate(task) for task in tasks]

	async def get_task(self, task_id: str) -> TaskSchema:
		task = await self.task_repository.get_by_id(task_id=task_id)
		if task is None:
			raise TaskNotFoundError(task_id=task_id)
		return TaskSchema.model_validate(task)

	async def create_task(self, task_create: TaskCreateSchema) -> TaskSchema:
		new_task = await self.task_repository.create(title=task_create.title)
		return TaskSchema.model_validate(new_task)

	async def update_task(self, task_id: str, task_update: TaskUpdateSchema) -> TaskSchema:
		task_for_update = await self.task_repository.get_by_id(task_id=task_id)
		if task_for_update is None:
			raise TaskNotFoundError(task_id=task_id)

		if task_update.title is not None:
			task_for_update.title = task_update.title
		if task_update.completed is not None:
			task_for_update.completed = task_update.completed

		updated_task = await self.task_repository.update(task_for_update)
		return TaskSchema.model_validate(updated_task)

	async def delete_task(self, task_id: str) -> TaskSchema:
		task_for_delete = await self.task_repository.get_by_id(task_id=task_id)
		if task_for_delete is None:
			raise TaskNotFoundError(task_id=task_id)

		await self.task_repository.delete(task_for_delete)
		return TaskSchema.model_validate(task_for_delete)
