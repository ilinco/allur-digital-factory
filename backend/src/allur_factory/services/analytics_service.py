from datetime import date

from allur_factory.repositories.production import ProductionRepository
from allur_factory.schemas.factory import KpiSummaryResponse, ModelProgressItem
from allur_factory.services.oee_engine import calculate_oee


class AnalyticsService:
	"""Business logic service for factory KPIs and executive analytics."""

	def __init__(self, repository: ProductionRepository) -> None:
		self.repository = repository

	async def get_kpi(self, target_date: date | None = None) -> KpiSummaryResponse:
		"""Calculate overall factory OEE, total downtimes, and vehicle monthly plan progress."""
		resolved_date = target_date
		if resolved_date is None:
			resolved_date = await self.repository.get_latest_record_date()
			if resolved_date is None:
				resolved_date = date(2026, 10, 2)

		metrics = await self.repository.get_shift_metrics_by_date(resolved_date)
		downtimes = await self.repository.get_downtimes_by_date(resolved_date)
		monthly_plans = await self.repository.get_monthly_plans()

		total_downtime_min = sum(d.duration_minutes for d in downtimes)
		total_fact = sum(m.fact for m in metrics)
		total_plan = sum(m.plan if m.plan is not None else 0 for m in metrics)
		total_defects = sum(m.defects_count if m.defects_count is not None else 0 for m in metrics)

		if metrics and total_plan > 0:
			oee_result = calculate_oee(
				downtime_minutes=total_downtime_min,
				fact_units=total_fact,
				plan_units=total_plan,
				defects_count=total_defects,
			)
			overall_oee = oee_result['oee']
		else:
			overall_oee = 0.0

		models_progress: list[ModelProgressItem] = []
		for plan in monthly_plans:
			fact = plan.produced_fact if plan.produced_fact is not None else 0
			percent = (
				round((fact / plan.target_monthly) * 100, 2) if plan.target_monthly > 0 else 0.0
			)
			models_progress.append(
				ModelProgressItem(
					model_name=plan.model_name,
					target_monthly=plan.target_monthly,
					produced_fact=fact,
					target=plan.target_monthly,
					fact=fact,
					percent=percent,
				)
			)

		return KpiSummaryResponse(
			record_date=resolved_date.isoformat(),
			overall_oee=overall_oee,
			target_oee=85.0,
			total_fact=total_fact,
			total_plan=total_plan,
			total_downtime_min=total_downtime_min,
			models_progress=models_progress,
		)
