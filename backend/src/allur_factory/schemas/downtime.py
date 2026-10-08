from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from allur_factory.schemas.factory import StationSlaStatus


class DowntimeCreateRequest(BaseModel):
	model_config = ConfigDict(extra='forbid')

	section_id: str = Field(
		...,
		min_length=1,
		max_length=50,
		description='Идентификатор участка (например, welding-1)',
		examples=['welding-1'],
	)
	equipment: str = Field(
		...,
		min_length=1,
		max_length=100,
		description='Название или код оборудования',
		examples=['ABB-04'],
	)
	reason: str = Field(
		...,
		min_length=1,
		max_length=255,
		description='Причина остановки',
		examples=['Перегрев сервопривода'],
	)
	duration_minutes: int = Field(
		...,
		gt=0,
		le=960,
		description='Длительность простоя в минутах (от 1 до 960)',
		examples=[45],
	)
	equipment_id: int | None = Field(
		default=None,
		description='ID оборудования из справочника (опционально)',
	)
	record_date: date | None = Field(
		default=None,
		description='Дата инцидента (YYYY-MM-DD). По умолчанию последняя дата с данными',
	)


class DowntimeRecordResponse(BaseModel):
	id: int
	record_date: str
	section_id: str
	section_name: str
	equipment: str
	equipment_id: int | None
	reason: str
	duration_minutes: int


class OeeImpact(BaseModel):
	previous_availability: float
	new_availability: float
	previous_oee: float
	new_oee: float
	is_alert: bool


class DowntimeCreateResponse(BaseModel):
	downtime: DowntimeRecordResponse
	section_id: str
	section_name: str
	section_downtime_min: int
	section_status: StationSlaStatus
	oee_impact: OeeImpact
