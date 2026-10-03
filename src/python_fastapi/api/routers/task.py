from fastapi import APIRouter, Depends, status

from python_fastapi.api.dependencies import get_tasks_service
from python_fastapi.schemas.task import TaskCreateSchema, TaskSchema, TaskUpdateSchema
from python_fastapi.services.task import TaskService

router = APIRouter(prefix='/tasks', tags=['tasks'])

GET_TASKS_SERVICE_DEPENDENCY = Depends(get_tasks_service)


@router.get('', response_model=list[TaskSchema])
async def read_tasks(
	task_service: TaskService = GET_TASKS_SERVICE_DEPENDENCY,
) -> list[TaskSchema]:
	return await task_service.list_tasks()


@router.get('/{task_id}', response_model=TaskSchema)
async def read_task(
	task_id: str,
	task_service: TaskService = GET_TASKS_SERVICE_DEPENDENCY,
) -> TaskSchema:
	return await task_service.get_task(task_id=task_id)


@router.post('', status_code=status.HTTP_201_CREATED, response_model=TaskSchema)
async def create_tasks(
	payload: TaskCreateSchema, task_service: TaskService = GET_TASKS_SERVICE_DEPENDENCY
) -> TaskSchema:
	return await task_service.create_task(task_create=payload)


@router.patch('/{task_id}', response_model=TaskSchema)
async def edit_task(
	task_id: str,
	payload: TaskUpdateSchema,
	task_service: TaskService = GET_TASKS_SERVICE_DEPENDENCY,
) -> TaskSchema:
	return await task_service.update_task(task_id=task_id, task_update=payload)


@router.delete('/{task_id}', response_model=TaskSchema)
async def delete_task(
	task_id: str,
	task_service: TaskService = GET_TASKS_SERVICE_DEPENDENCY,
) -> TaskSchema:
	return await task_service.delete_task(task_id=task_id)
