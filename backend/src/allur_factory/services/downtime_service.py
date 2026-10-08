from datetime import date

from allur_factory.core.exceptions import NotFoundException
from allur_factory.models import Downtime
from allur_factory.repositories.production import ProductionRepository
from allur_factory.schemas.downtime import (
	DowntimeCreateRequest,
	DowntimeCreateResponse,
	DowntimeRecordResponse,
	OeeImpact,
)
from allur_factory.services.factory_service import LINE_NAME_TO_ID, determine_station_status
from allur_factory.services.oee_engine import calculate_oee


class DowntimeService:
	"""Business logic service for logging equipment downtimes and recalculating OEE."""

	def __init__(self, repository: ProductionRepository) -> None:
		self.repository = repository

	async def record_downtime(self, payload: DowntimeCreateRequest) -> DowntimeCreateResponse:
		normalized_section_id = payload.section_id.strip().lower()
		resolved_id = LINE_NAME_TO_ID.get(normalized_section_id, payload.section_id.strip())

		line = await self.repository.get_line_by_id(resolved_id)
		if line is None:
			raise NotFoundException(f"Section '{payload.section_id}' not found")

		eq_id = payload.equipment_id
		if eq_id is not None:
			equipment = await self.repository.get_equipment_by_id(eq_id)
			if equipment is None:
				raise NotFoundException(f'Equipment with ID {eq_id} not found')
		else:
			line_equipments = await self.repository.get_equipment_by_line(line.id)
			for eq in line_equipments:
				if eq.name.strip().lower() == payload.equipment.strip().lower():
					eq_id = eq.id
					break

		target_date = payload.record_date
		if target_date is None:
			target_date = await self.repository.get_latest_record_date() or date(2026, 10, 2)

		prev_downtimes = await self.repository.get_downtimes_by_date(target_date)
		prev_metrics = await self.repository.get_shift_metrics_by_date(target_date)

		prev_total_dt = sum(d.duration_minutes for d in prev_downtimes)
		prev_section_dt = sum(
			d.duration_minutes
			for d in prev_downtimes
			if (d.line_id == line.id)
			or (
				LINE_NAME_TO_ID.get(d.section.strip().lower(), d.section.strip().lower()) == line.id
			)
		)

		total_fact = sum(m.fact for m in prev_metrics)
		total_plan = sum(m.plan if m.plan is not None else 0 for m in prev_metrics)
		total_defects = sum(
			m.defects_count if m.defects_count is not None else 0 for m in prev_metrics
		)

		if prev_metrics and total_plan > 0:
			prev_oee_res = calculate_oee(prev_total_dt, total_fact, total_plan, total_defects)
		else:
			prev_oee_res = {
				'availability': 100.0,
				'performance': 100.0,
				'quality': 100.0,
				'oee': 100.0,
				'is_alert': False,
			}

		downtime = Downtime(
			record_date=target_date,
			section=line.name,
			line_id=line.id,
			equipment=payload.equipment.strip(),
			equipment_id=eq_id,
			reason=payload.reason.strip(),
			duration_minutes=payload.duration_minutes,
		)
		saved_downtime = await self.repository.add_downtime(downtime)
		await self.repository.commit()

		new_section_dt = prev_section_dt + payload.duration_minutes
		metric = await self.repository.get_shift_metric_for_line(line.id, target_date)
		defect_pct = (
			float(metric.defect_percent) if metric and metric.defect_percent is not None else 0.0
		)

		new_status = determine_station_status(new_section_dt, defect_pct)

		new_total_dt = prev_total_dt + payload.duration_minutes
		if prev_metrics and total_plan > 0:
			new_oee_res = calculate_oee(new_total_dt, total_fact, total_plan, total_defects)
		else:
			new_oee_res = calculate_oee(new_total_dt, 0, 0, 0)

		return DowntimeCreateResponse(
			downtime=DowntimeRecordResponse(
				id=saved_downtime.id,
				record_date=target_date.isoformat(),
				section_id=line.id,
				section_name=line.name,
				equipment=saved_downtime.equipment,
				equipment_id=saved_downtime.equipment_id,
				reason=saved_downtime.reason,
				duration_minutes=saved_downtime.duration_minutes,
			),
			section_id=line.id,
			section_name=line.name,
			section_downtime_min=new_section_dt,
			section_status=new_status,
			oee_impact=OeeImpact(
				previous_availability=prev_oee_res['availability'],
				new_availability=new_oee_res['availability'],
				previous_oee=prev_oee_res['oee'],
				new_oee=new_oee_res['oee'],
				is_alert=new_oee_res['is_alert'],
			),
		)

	async def get_downtimes(self, target_date: date | None = None) -> list[DowntimeRecordResponse]:
		"""Retrieve list of downtimes for given date, defaulting to latest date."""
		resolved_date = target_date or await self.repository.get_latest_record_date() or date(2026, 10, 8)
		records = await self.repository.get_downtimes_by_date(resolved_date)
		lines = await self.repository.get_lines()
		line_map = {line.id: line.name for line in lines}

		return [
			DowntimeRecordResponse(
				id=d.id,
				record_date=d.record_date.isoformat(),
				section_id=d.line_id or 'unknown',
				section_name=line_map.get(d.line_id or '', d.section),
				equipment=d.equipment,
				equipment_id=d.equipment_id,
				reason=d.reason,
				duration_minutes=d.duration_minutes,
			)
			for d in records
		]
