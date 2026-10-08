from datetime import date
from typing import Annotated

from fastapi import APIRouter, Query, status

from allur_factory.api.dependencies import GET_DOWNTIME_SERVICE_DEPENDENCY
from allur_factory.schemas.downtime import (
	DowntimeCreateRequest,
	DowntimeCreateResponse,
	DowntimeRecordResponse,
)
from allur_factory.services.downtime_service import DowntimeService

router = APIRouter(tags=['Downtimes'])


@router.get(
	'/downtimes',
	status_code=status.HTTP_200_OK,
	response_model=list[DowntimeRecordResponse],
)
async def get_downtimes(
	date: Annotated[
		date | None,
		Query(
			description='Дата инцидентов (YYYY-MM-DD). По умолчанию последняя дата',
			examples=['2026-10-08'],
		),
	] = None,
	downtime_service: DowntimeService = GET_DOWNTIME_SERVICE_DEPENDENCY,
) -> list[DowntimeRecordResponse]:
	"""Получение списка простоев за указанную дату."""
	return await downtime_service.get_downtimes(target_date=date)


@router.post(
	'/downtimes',
	status_code=status.HTTP_201_CREATED,
	response_model=DowntimeCreateResponse,
	responses={
		status.HTTP_404_NOT_FOUND: {'description': 'Участок или оборудование не найдены'},
		status.HTTP_422_UNPROCESSABLE_CONTENT: {'description': 'Ошибка валидации входных данных'},
	},
)
async def create_downtime(
	payload: DowntimeCreateRequest,
	downtime_service: DowntimeService = GET_DOWNTIME_SERVICE_DEPENDENCY,
) -> DowntimeCreateResponse:
	"""Регистрация новой остановки оборудования.

	Пересчитывает downtime_min, обновляет статус участка
	(warning/critical при превышении лимита 60 мин) и снижает
	коэффициент Availability в OEE.
	"""
	return await downtime_service.record_downtime(payload)
