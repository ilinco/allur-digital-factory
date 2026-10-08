from typing import Literal

from pydantic import BaseModel

StationSlaStatus = Literal['normal', 'warning', 'critical']
LayoutStatus = Literal['normal', 'warning', 'critical', 'no_data']
SectionType = Literal['process', 'warehouse']


class StationStatus(BaseModel):
	id: str
	name: str
	status: StationSlaStatus
	fact: int
	plan: int
	load_percent: float
	defect_percent: float
	downtime_min: int


class PipelineResponse(BaseModel):
	record_date: str
	stations: list[StationStatus]


class AvailableDatesResponse(BaseModel):
	dates: list[str]
	latest_date: str


class ModelProgressItem(BaseModel):
	model_name: str
	target_monthly: int
	produced_fact: int
	target: int
	fact: int
	percent: float


class KpiSummaryResponse(BaseModel):
	record_date: str
	overall_oee: float
	target_oee: float = 85.0
	total_fact: int
	total_plan: int
	total_downtime_min: int
	models_progress: list[ModelProgressItem]


class DowntimeEvent(BaseModel):
	reason: str
	duration_minutes: int


class EquipmentNode(BaseModel):
	id: int
	name: str
	equipment_type: str
	status: LayoutStatus
	downtime_min: int
	downtimes: list[DowntimeEvent]


class SectionMetrics(BaseModel):
	fact: int
	plan: int
	load_percent: float
	defect_percent: float


class SectionNode(BaseModel):
	id: str
	name: str
	step_order: int
	section_type: SectionType
	status: LayoutStatus
	downtime_min: int
	metrics: SectionMetrics | None
	equipment: list[EquipmentNode]


class FactoryLayoutResponse(BaseModel):
	record_date: str
	sections: list[SectionNode]
