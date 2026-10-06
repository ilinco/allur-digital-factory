from datetime import date

from allur_factory.repositories.production import ProductionRepository
from allur_factory.schemas.factory import PipelineResponse, StationStatus

LINE_NAME_TO_ID: dict[str, str] = {
	'сварка': 'welding-1',
	'сварка-1': 'welding-1',
	'welding': 'welding-1',
	'welding-1': 'welding-1',
	'окраска': 'painting-1',
	'окраска-1': 'painting-1',
	'painting': 'painting-1',
	'painting-1': 'painting-1',
	'сборка': 'assembly-1',
	'сборка-1': 'assembly-1',
	'assembly': 'assembly-1',
	'assembly-1': 'assembly-1',
	'контроль качества': 'qc-1',
	'контроль качества-1': 'qc-1',
	'qc': 'qc-1',
	'qc-1': 'qc-1',
}


def determine_station_status(downtime_minutes: int, defect_percent: float) -> str:
	"""Determine SLA status for a station.

	- critical: downtime > 60 min or defect > 5%
	- warning: defect > 2% or downtime > 30 min
	- normal: all within acceptable thresholds
	"""
	if downtime_minutes > 60 or defect_percent > 5.0:
		return 'critical'
	if defect_percent > 2.0 or downtime_minutes > 30:
		return 'warning'
	return 'normal'


class FactoryService:
	"""Business logic service for Digital Factory pipeline operations."""

	def __init__(self, repository: ProductionRepository) -> None:
		self.repository = repository

	async def get_pipeline(self, target_date: date | None = None) -> PipelineResponse:
		"""Retrieve pipeline stations status with shift metrics and downtimes for given date."""
		resolved_date = target_date
		if resolved_date is None:
			resolved_date = await self.repository.get_latest_record_date()
			if resolved_date is None:
				resolved_date = date(2026, 10, 2)

		metrics = await self.repository.get_shift_metrics_by_date(resolved_date)
		downtimes = await self.repository.get_downtimes_by_date(resolved_date)

		# Aggregate downtimes by normalized line ID
		line_downtimes: dict[str, int] = {}
		for dt in downtimes:
			norm_sec = dt.section.strip().lower()
			line_id = LINE_NAME_TO_ID.get(norm_sec, norm_sec)
			line_downtimes[line_id] = line_downtimes.get(line_id, 0) + dt.duration_minutes

		stations: list[StationStatus] = []
		for m in metrics:
			line_id = m.line_id
			line_name = m.line.name if m.line else line_id
			dt_min = line_downtimes.get(line_id, 0)
			defect_pct = round(m.defect_percent, 2) if m.defect_percent is not None else 0.0
			status = determine_station_status(dt_min, defect_pct)

			stations.append(
				StationStatus(
					id=line_id,
					name=line_name,
					status=status,
					fact=m.fact,
					plan=m.plan if m.plan is not None else 0,
					load_percent=round(m.load_percent, 2),
					defect_percent=defect_pct,
					downtime_min=dt_min,
				)
			)

		return PipelineResponse(
			record_date=resolved_date.isoformat(),
			stations=stations,
		)
