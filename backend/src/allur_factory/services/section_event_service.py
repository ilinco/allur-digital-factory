from datetime import date

from allur_factory.core.exceptions import NotFoundException
from allur_factory.models import ShiftMetric
from allur_factory.repositories.production import ProductionRepository
from allur_factory.schemas.events import SectionEventRequest, SectionEventResponse
from allur_factory.services.factory_service import LINE_NAME_TO_ID, determine_station_status


class SectionEventService:
	"""Business logic service for logging part passage / defect events at factory sections."""

	def __init__(self, repository: ProductionRepository) -> None:
		self.repository = repository

	async def record_event(
		self, section_id: str, payload: SectionEventRequest
	) -> SectionEventResponse:
		normalized_section_id = section_id.strip().lower()
		resolved_id = LINE_NAME_TO_ID.get(normalized_section_id, section_id.strip())

		line = await self.repository.get_line_by_id(resolved_id)
		if line is None:
			raise NotFoundException(f"Section '{section_id}' not found")

		target_date = payload.record_date
		if target_date is None:
			target_date = await self.repository.get_latest_record_date() or date(2026, 10, 2)

		metric = await self.repository.get_shift_metric_for_line(line.id, target_date)
		if metric is None:
			metric = ShiftMetric(
				record_date=target_date,
				line_id=line.id,
				plan=120,
				fact=0,
				work_hours=8.0,
				load_percent=0.0,
				defects_count=0,
				defect_percent=0.0,
			)

		if payload.event_type == 'pass':
			metric.fact += payload.count
		elif payload.event_type == 'defect':
			metric.defects_count = (metric.defects_count or 0) + payload.count
			metric.fact = max(metric.fact, metric.defects_count)

		plan_val = metric.plan if metric.plan is not None else 120
		metric.load_percent = round((metric.fact / plan_val) * 100, 2) if plan_val > 0 else 0.0
		metric.defect_percent = (
			round((metric.defects_count / metric.fact) * 100, 2) if metric.fact > 0 else 0.0
		)

		is_alert = metric.defect_percent > 2.0

		await self.repository.add_or_update_shift_metric(metric)
		await self.repository.commit()

		downtimes = await self.repository.get_downtimes_by_date(target_date)
		section_dt = sum(
			d.duration_minutes
			for d in downtimes
			if (d.line_id == line.id)
			or (
				LINE_NAME_TO_ID.get(d.section.strip().lower(), d.section.strip().lower()) == line.id
			)
		)

		status = determine_station_status(section_dt, metric.defect_percent)

		alert_msg = (
			f"Внимание! На участке '{line.name}' уровень брака превысил порог 2.0%: "
			f'текущий показатель {metric.defect_percent}%. Необходим контроль ОТК.'
			if is_alert
			else None
		)

		return SectionEventResponse(
			section_id=line.id,
			section_name=line.name,
			record_date=target_date.isoformat(),
			event_type=payload.event_type,
			count=payload.count,
			fact=metric.fact,
			plan=plan_val,
			defects_count=metric.defects_count or 0,
			defect_percent=metric.defect_percent,
			load_percent=metric.load_percent,
			status=status,
			is_alert=is_alert,
			alert_message=alert_msg,
		)
