from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from allur_factory.schemas.factory import StationSlaStatus

SimulationActionType = Literal['breakdown', 'defect_spike', 'critical_stop', 'reset']
AlertSeverity = Literal['critical', 'warning', 'info']


class SimulationActionRequest(BaseModel):
	model_config = ConfigDict(extra='forbid')

	action: SimulationActionType = Field(
		default='breakdown',
		description="Тип триггера: 'breakdown' (авария оборудования), 'defect_spike' (всплеск брака), 'critical_stop' (критический останов), 'reset' (сброс симуляции)",
		examples=['breakdown'],
	)
	section_id: str | None = Field(
		default=None,
		max_length=50,
		description="Целевой участок (по умолчанию 'welding-1')",
		examples=['welding-1'],
	)
	reason: str | None = Field(
		default=None,
		max_length=255,
		description='Описание внештатной ситуации для показа жюри',
		examples=['Аварийная остановка главного привода робота ABB-04'],
	)
	duration_minutes: int | None = Field(
		default=None,
		gt=0,
		le=960,
		description='Длительность простоя (по умолчанию 75 мин для превышения лимита 60 мин)',
		examples=[75],
	)
	record_date: date | None = Field(
		default=None,
		description='Дата симуляции (YYYY-MM-DD). По умолчанию последняя дата с данными',
	)


class AiAssistantAlert(BaseModel):
	title: str
	warning: str
	severity: AlertSeverity
	suggested_actions: list[str]


class AffectedSectionInfo(BaseModel):
	id: str
	name: str
	status: StationSlaStatus
	downtime_min: int
	defect_percent: float


class SimulationActionResponse(BaseModel):
	action: SimulationActionType
	status: str
	message: str
	affected_section: AffectedSectionInfo
	overall_oee: float
	availability: float
	is_oee_alert: bool
	ai_assistant: AiAssistantAlert
