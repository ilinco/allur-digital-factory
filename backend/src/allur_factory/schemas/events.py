from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from allur_factory.schemas.factory import StationSlaStatus

SectionEventType = Literal['pass', 'defect']


class SectionEventRequest(BaseModel):
	model_config = ConfigDict(extra='forbid')

	event_type: SectionEventType = Field(
		...,
		description="Тип события: 'pass' (прохождение детали) или 'defect' (фиксация брака)",
		examples=['pass'],
	)
	count: int = Field(
		default=1,
		gt=0,
		le=1000,
		description='Количество обработанных или дефектных единиц (по умолчанию 1)',
		examples=[1],
	)
	reason: str | None = Field(
		default=None,
		max_length=255,
		description='Причина брака (опционально для дефектов)',
		examples=['Непровар шва'],
	)
	record_date: date | None = Field(
		default=None,
		description='Дата события (YYYY-MM-DD). По умолчанию последняя дата с данными',
	)


class SectionEventResponse(BaseModel):
	section_id: str
	section_name: str
	record_date: str
	event_type: SectionEventType
	count: int
	fact: int
	plan: int
	defects_count: int
	defect_percent: float
	load_percent: float
	status: StationSlaStatus
	is_alert: bool
	alert_message: str | None
