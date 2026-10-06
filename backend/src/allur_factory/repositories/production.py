from collections.abc import Sequence
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from allur_factory.models import Downtime, MonthlyPlan, ProductionLine, ShiftMetric


class ProductionRepository:
	"""Repository for accessing digital factory and analytics database records."""

	def __init__(self, db: AsyncSession) -> None:
		self.db = db

	async def get_lines(self) -> Sequence[ProductionLine]:
		"""Get all production lines ordered by conveyor step."""
		result = await self.db.scalars(select(ProductionLine).order_by(ProductionLine.step_order))
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

	async def get_downtimes_by_date(self, target_date: date) -> Sequence[Downtime]:
		"""Get equipment downtimes for a specific date."""
		result = await self.db.scalars(
			select(Downtime).where(Downtime.record_date == target_date).order_by(Downtime.id)
		)
		return result.all()

	async def get_monthly_plans(self) -> Sequence[MonthlyPlan]:
		"""Get all vehicle model monthly production plans."""
		result = await self.db.scalars(select(MonthlyPlan).order_by(MonthlyPlan.id))
		return result.all()

	async def get_latest_record_date(self) -> date | None:
		"""Get the most recent record date available in shift metrics."""
		result = await self.db.scalar(select(func.max(ShiftMetric.record_date)))
		return result
