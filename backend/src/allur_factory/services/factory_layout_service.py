from collections import defaultdict
from collections.abc import Sequence
from datetime import date
from typing import cast

from allur_factory.core.exceptions import NotFoundException
from allur_factory.models import Downtime, ProductionLine, ShiftMetric
from allur_factory.repositories.production import ProductionRepository
from allur_factory.schemas.factory import (
	DowntimeEvent,
	EquipmentNode,
	FactoryLayoutResponse,
	LayoutStatus,
	SectionMetrics,
	SectionNode,
	SectionType,
)
from allur_factory.services.factory_service import LINE_NAME_TO_ID, determine_station_status


def _resolve_line_id(downtime: Downtime) -> str:
	"""Prefer the FK; fall back to normalizing the raw section name for legacy rows."""
	if downtime.line_id:
		return downtime.line_id
	norm = downtime.section.strip().lower()
	return LINE_NAME_TO_ID.get(norm, norm)


def determine_section_status(
	metric: ShiftMetric | None,
	downtime_minutes: int,
	has_equipment: bool = False,
) -> LayoutStatus:
	"""Section status: SLA by metrics when present, by downtime/equipment otherwise."""
	if metric is not None:
		defect_pct = float(metric.defect_percent or 0.0)
		return determine_station_status(downtime_minutes, defect_pct)
	if downtime_minutes > 0:
		return determine_station_status(downtime_minutes, 0.0)
	if has_equipment:
		return 'normal'
	return 'no_data'


class FactoryLayoutService:
	"""Builds the factory layout tree (sections -> equipment) with computed statuses."""

	def __init__(self, repository: ProductionRepository) -> None:
		self.repository = repository

	async def get_layout(self, target_date: date | None = None) -> FactoryLayoutResponse:
		resolved_date = target_date or await self.repository.get_latest_record_date()
		if resolved_date is None:
			raise NotFoundException('No production data available')

		metrics = await self.repository.get_shift_metrics_by_date(resolved_date)
		downtimes = await self.repository.get_downtimes_by_date(resolved_date)
		if not metrics and not downtimes:
			raise NotFoundException(f'No production data for {resolved_date.isoformat()}')

		lines = await self.repository.get_lines_with_equipment()
		return FactoryLayoutResponse(
			record_date=resolved_date.isoformat(),
			sections=self._build_sections(lines, metrics, downtimes),
		)

	def _build_sections(
		self,
		lines: Sequence[ProductionLine],
		metrics: Sequence[ShiftMetric],
		downtimes: Sequence[Downtime],
	) -> list[SectionNode]:
		metric_by_line = {m.line_id: m for m in metrics}
		downtimes_by_line: dict[str, list[Downtime]] = defaultdict(list)
		for dt in downtimes:
			downtimes_by_line[_resolve_line_id(dt)].append(dt)

		sections: list[SectionNode] = []
		for line in lines:
			line_downtimes = downtimes_by_line.get(line.id, [])
			section_dt = sum(dt.duration_minutes for dt in line_downtimes)
			metric = metric_by_line.get(line.id)
			sections.append(
				SectionNode(
					id=line.id,
					name=line.name,
					step_order=line.step_order,
					section_type=cast(SectionType, line.section_type),
					status=determine_section_status(
						metric, section_dt, has_equipment=bool(line.equipment)
					),
					downtime_min=section_dt,
					metrics=self._build_metrics(metric),
					equipment=self._build_equipment(line, line_downtimes),
				)
			)
		return sections

	@staticmethod
	def _build_metrics(metric: ShiftMetric | None) -> SectionMetrics | None:
		if metric is None:
			return None
		return SectionMetrics(
			fact=metric.fact,
			plan=metric.plan if metric.plan is not None else 0,
			load_percent=round(metric.load_percent, 2),
			defect_percent=round(
				metric.defect_percent if metric.defect_percent is not None else 0.0, 2
			),
		)

	@staticmethod
	def _build_equipment(
		line: ProductionLine,
		line_downtimes: Sequence[Downtime],
	) -> list[EquipmentNode]:
		nodes: list[EquipmentNode] = []
		for eq in line.equipment:
			events = [
				dt
				for dt in line_downtimes
				if dt.equipment_id == eq.id
				or (dt.equipment_id is None and dt.equipment.strip() == eq.name)
			]
			eq_dt = sum(dt.duration_minutes for dt in events)
			nodes.append(
				EquipmentNode(
					id=eq.id,
					name=eq.name,
					equipment_type=eq.equipment_type,
					status=determine_station_status(eq_dt, 0.0),
					downtime_min=eq_dt,
					downtimes=[
						DowntimeEvent(reason=dt.reason, duration_minutes=dt.duration_minutes)
						for dt in events
					],
				)
			)
		return nodes
