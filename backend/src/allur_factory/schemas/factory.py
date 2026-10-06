from pydantic import BaseModel


class StationStatus(BaseModel):
	id: str
	name: str
	status: str  # "normal" | "warning" | "critical"
	fact: int
	plan: int
	load_percent: float
	defect_percent: float
	downtime_min: int


class PipelineResponse(BaseModel):
	record_date: str
	stations: list[StationStatus]


class KpiSummaryResponse(BaseModel):
	record_date: str
	overall_oee: float
	target_oee: float = 85.0
	total_fact: int
	total_plan: int
	total_downtime_min: int
	models_progress: list[dict]
