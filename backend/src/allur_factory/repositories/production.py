from collections.abc import Sequence
from datetime import date

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from allur_factory.models import Downtime, Equipment, MonthlyPlan, ProductionLine, ShiftMetric


class ProductionRepository:
	"""Repository for accessing digital factory and analytics database records."""

	def __init__(self, db: AsyncSession) -> None:
		self.db = db

	async def get_lines(self) -> Sequence[ProductionLine]:
		"""Get all production lines ordered by conveyor step."""
		result = await self.db.scalars(select(ProductionLine).order_by(ProductionLine.step_order))
		return result.all()

	async def get_line_by_id(self, line_id: str) -> ProductionLine | None:
		"""Get a specific production line by its ID."""
		result = await self.db.scalars(select(ProductionLine).where(ProductionLine.id == line_id))
		return result.first()

	async def get_lines_with_equipment(self) -> Sequence[ProductionLine]:
		"""Get all layout sections ordered by step with their equipment preloaded."""
		result = await self.db.scalars(
			select(ProductionLine)
			.options(selectinload(ProductionLine.equipment))
			.order_by(ProductionLine.step_order)
		)
		return result.all()

	async def get_equipment_by_id(self, equipment_id: int) -> Equipment | None:
		"""Get specific equipment by its ID."""
		result = await self.db.scalars(select(Equipment).where(Equipment.id == equipment_id))
		return result.first()

	async def get_equipment_by_line(self, line_id: str) -> Sequence[Equipment]:
		"""Get equipment units belonging to a specific line."""
		result = await self.db.scalars(
			select(Equipment).where(Equipment.line_id == line_id).order_by(Equipment.name)
		)
		return result.all()

	async def get_shift_metrics_by_date(self, target_date: date) -> Sequence[ShiftMetric]:
		"""Get shift metrics for a specific date joined with line information."""
		result = await self.db.scalars(
			select(ShiftMetric)
			.options(joinedload(ShiftMetric.line))
			.join(ProductionLine, ShiftMetric.line_id == ProductionLine.id)
			.where(ShiftMetric.record_date == target_date)
			.order_by(ProductionLine.step_order)
		)
		return result.all()

	async def get_shift_metric_for_line(
		self, line_id: str, target_date: date
	) -> ShiftMetric | None:
		"""Get shift metric for a specific line and date."""
		result = await self.db.scalars(
			select(ShiftMetric).where(
				ShiftMetric.line_id == line_id,
				ShiftMetric.record_date == target_date,
			)
		)
		return result.first()

	async def add_or_update_shift_metric(self, metric: ShiftMetric) -> ShiftMetric:
		"""Add or update shift metric in the database session."""
		self.db.add(metric)
		await self.db.flush()
		return metric

	async def get_downtimes_by_date(self, target_date: date) -> Sequence[Downtime]:
		"""Get equipment downtimes for a specific date."""
		result = await self.db.scalars(
			select(Downtime).where(Downtime.record_date == target_date).order_by(Downtime.id)
		)
		return result.all()

	async def add_downtime(self, downtime: Downtime) -> Downtime:
		"""Add a new equipment downtime record."""
		self.db.add(downtime)
		await self.db.flush()
		return downtime

	async def delete_simulation_downtimes(self, target_date: date | None = None) -> int:
		"""Delete simulated downtime entries created during demo mode."""
		stmt = delete(Downtime).where(Downtime.reason.like('[SIMULATION]%'))
		if target_date is not None:
			stmt = stmt.where(Downtime.record_date == target_date)
		result = await self.db.execute(stmt)
		return int(getattr(result, 'rowcount', 0) or 0)

	async def get_monthly_plans(self) -> Sequence[MonthlyPlan]:
		"""Get all vehicle model monthly production plans."""
		result = await self.db.scalars(select(MonthlyPlan).order_by(MonthlyPlan.id))
		return result.all()

	async def get_monthly_plan_by_model(self, model_name: str) -> MonthlyPlan | None:
		"""Get monthly production plan for a specific vehicle model (case-insensitive)."""
		result = await self.db.scalars(
			select(MonthlyPlan).where(func.lower(MonthlyPlan.model_name) == model_name.strip().lower())
		)
		return result.first()

	async def get_latest_record_date(self) -> date | None:
		"""Get the most recent record date available in shift metrics."""
		result = await self.db.scalar(select(func.max(ShiftMetric.record_date)))
		return result

	async def commit(self) -> None:
		"""Commit current database transaction."""
		await self.db.commit()

	async def rollback(self) -> None:
		"""Rollback current database transaction."""
		await self.db.rollback()
