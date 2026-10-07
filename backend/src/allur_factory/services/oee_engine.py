from typing import TypedDict

TOTAL_PLANNED_MINUTES = 16 * 60  # 960 мин (2 смены по 8 ч)


class OeeCalculationResult(TypedDict):
	oee: float
	availability: float
	performance: float
	quality: float
	is_alert: bool


def calculate_oee(
	downtime_minutes: int, fact_units: int, plan_units: int, defects_count: int
) -> OeeCalculationResult:
	# 1. Availability (Доступность оборудования)
	operating_time = max(0, TOTAL_PLANNED_MINUTES - downtime_minutes)
	availability = operating_time / TOTAL_PLANNED_MINUTES

	# 2. Performance (Производительность линии)
	performance = min(1.0, fact_units / plan_units) if plan_units > 0 else 0.0

	# 3. Quality (Качество / доля годных авто)
	good_units = max(0, fact_units - defects_count)
	quality = good_units / fact_units if fact_units > 0 else 1.0

	oee = availability * performance * quality * 100

	return {
		'oee': round(oee, 2),
		'availability': round(availability * 100, 2),
		'performance': round(performance * 100, 2),
		'quality': round(quality * 100, 2),
		'is_alert': oee < 85.0,  # SLA лимит завода: цель >= 85%
	}
