from datetime import date

from allur_factory.repositories.production import ProductionRepository
from allur_factory.schemas.analytics import (
	BottleneckItem,
	PlanCompletionForecast,
	PlanRiskStatus,
	PredictiveForecastResponse,
	RiskLevel,
)
from allur_factory.schemas.factory import KpiSummaryResponse, ModelProgressItem
from allur_factory.services.llm_service import generate_ai_recommendations
from allur_factory.services.oee_engine import TOTAL_PLANNED_MINUTES, calculate_oee


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

	async def get_predictive_forecast(
		self,
		target_date: date | None = None,
		simulate_extra_downtime_min: int = 0,
		target_model: str = 'Chevrolet Onix',
	) -> PredictiveForecastResponse:
		"""Calculate predictive shift OEE, detect equipment bottlenecks, and generate AI recommendations."""
		resolved_date = target_date
		if resolved_date is None:
			resolved_date = await self.repository.get_latest_record_date()
			if resolved_date is None:
				resolved_date = date(2026, 10, 2)

		metrics = await self.repository.get_shift_metrics_by_date(resolved_date)
		downtimes = await self.repository.get_downtimes_by_date(resolved_date)

		# Baseline metrics
		base_downtime = sum(d.duration_minutes for d in downtimes)
		total_downtime_min = base_downtime + max(0, simulate_extra_downtime_min)
		total_plan = sum(m.plan if m.plan is not None else 0 for m in metrics)
		total_fact = sum(m.fact for m in metrics)
		total_defects = sum(m.defects_count if m.defects_count is not None else 0 for m in metrics)

		# OEE calculation
		oee_components: dict[str, float] = {}
		if metrics and total_plan > 0:
			oee_result = calculate_oee(
				downtime_minutes=total_downtime_min,
				fact_units=total_fact,
				plan_units=total_plan,
				defects_count=total_defects,
			)
			predicted_shift_oee = oee_result['oee']
			oee_components = {
				'availability': oee_result['availability'],
				'performance': oee_result['performance'],
				'quality': oee_result['quality'],
			}
		else:
			predicted_shift_oee = 0.0

		oee_target_met = predicted_shift_oee >= 85.0

		# Bottlenecks analysis
		bottlenecks: list[BottleneckItem] = []
		for d in downtimes:
			dur = d.duration_minutes
			if d.equipment == 'Конвейер-03' and simulate_extra_downtime_min > 0:
				dur += simulate_extra_downtime_min

			if dur >= 30:
				risk_level: RiskLevel = 'critical' if dur >= 50 else 'warning'
				sec_id = d.line_id or 'assembly-1'
				impact_units = max(1, round(dur / 4.0))

				if dur >= 50:
					reason = f'Простой {dur} мин близок к лимиту в 60 мин'
				else:
					reason = f'{d.reason or "Простой оборудования"} ({dur} мин)'

				bottlenecks.append(
					BottleneckItem(
						section_id=sec_id,
						equipment=d.equipment,
						risk_level=risk_level,
						reason=reason,
						impact_lost_units=impact_units,
					)
				)

		# Sort bottlenecks by severity: critical first, then impact
		bottlenecks.sort(
			key=lambda b: (0 if b.risk_level == 'critical' else 1, -b.impact_lost_units)
		)

		# Plan completion forecast
		monthly_plan = await self.repository.get_monthly_plan_by_model(target_model)
		month_target = monthly_plan.target_monthly if monthly_plan is not None else 2500

		# Lost units impact from extra downtime or shift shortfall
		lost_units = max(0, total_plan - total_fact) + round(simulate_extra_downtime_min / 4.0)
		projected_fact = max(0, month_target - (90 + lost_units))

		if projected_fact < month_target * 0.98:
			risk_status: PlanRiskStatus = 'underperformed'
		elif projected_fact > month_target * 1.02:
			risk_status = 'exceeded'
		else:
			risk_status = 'on_track'

		plan_completion_forecast = PlanCompletionForecast(
			model=target_model,
			month_target=month_target,
			projected_fact=projected_fact,
			risk_status=risk_status,
		)

		# Month-to-date historical context for holistic AI analysis
		month_start = resolved_date.replace(day=1)
		mtd_metrics = await self.repository.get_shift_metrics_range(month_start, resolved_date)
		mtd_downtimes = await self.repository.get_downtimes_range(month_start, resolved_date)

		recorded_dates = {m.record_date for m in mtd_metrics}
		days_count = len(recorded_dates) or 1
		mtd_fact = sum(m.fact for m in mtd_metrics)
		mtd_plan = sum(m.plan if m.plan is not None else 0 for m in mtd_metrics)
		mtd_dt = sum(d.duration_minutes for d in mtd_downtimes)
		mtd_defects = sum(m.defects_count if m.defects_count is not None else 0 for m in mtd_metrics)

		mtd_oee = (
			calculate_oee(mtd_dt, mtd_fact, mtd_plan, mtd_defects)['oee']
			if mtd_plan > 0
			else predicted_shift_oee
		)

		eq_counts: dict[str, int] = {}
		eq_durations: dict[str, int] = {}
		for d in mtd_downtimes:
			eq_counts[d.equipment] = eq_counts.get(d.equipment, 0) + 1
			eq_durations[d.equipment] = eq_durations.get(d.equipment, 0) + d.duration_minutes

		chronic_bottlenecks = [
			f'{eq} ({count} инцидента, суммарно {eq_durations[eq]} мин)'
			for eq, count in eq_counts.items()
			if count >= 2
		]

		monthly_context = {
			'days_count': days_count,
			'mtd_oee': mtd_oee,
			'mtd_fact': mtd_fact,
			'mtd_plan': mtd_plan,
			'chronic_bottlenecks': chronic_bottlenecks,
		}

		shift_context = {
			**oee_components,
			'total_fact': total_fact,
			'total_plan': total_plan,
			'total_defects': total_defects,
			'total_downtime_min': total_downtime_min,
			'planned_minutes': TOTAL_PLANNED_MINUTES,
			'simulated_extra_downtime_min': max(0, simulate_extra_downtime_min),
			'lines': [
				{
					'line_id': m.line_id,
					'plan': m.plan,
					'fact': m.fact,
					'load_percent': m.load_percent,
					'defects': m.defects_count or 0,
					'defect_percent': m.defect_percent or 0.0,
				}
				for m in metrics
			],
			'downtimes': [
				{
					'equipment': d.equipment,
					'section': d.section,
					'reason': d.reason,
					'duration_minutes': d.duration_minutes,
				}
				for d in sorted(downtimes, key=lambda x: -x.duration_minutes)
			],
		}

		# AI recommendations via OpenRouter
		ai_recommendations = await generate_ai_recommendations(
			forecast_date=resolved_date.isoformat(),
			predicted_shift_oee=predicted_shift_oee,
			target_oee=85.0,
			bottlenecks=[b.model_dump() for b in bottlenecks],
			model_name=target_model,
			projected_fact=projected_fact,
			month_target=month_target,
			monthly_context=monthly_context,
			shift_context=shift_context,
		)

		return PredictiveForecastResponse(
			forecast_date=resolved_date.isoformat(),
			predicted_shift_oee=predicted_shift_oee,
			oee_target_met=oee_target_met,
			bottlenecks=bottlenecks,
			plan_completion_forecast=plan_completion_forecast,
			ai_recommendations=ai_recommendations,
		)
