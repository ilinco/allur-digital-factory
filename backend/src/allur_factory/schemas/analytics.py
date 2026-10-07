from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

RiskLevel = Literal['critical', 'warning', 'low']
PlanRiskStatus = Literal['underperformed', 'on_track', 'exceeded']


class BottleneckItem(BaseModel):
	section_id: str = Field(description='ID проблемного участка')
	equipment: str = Field(description='Оборудование, создающее узкое место')
	risk_level: RiskLevel = Field(description='Уровень риска сбоя')
	reason: str = Field(description='Причина риска или характер простоя')
	impact_lost_units: int = Field(description='Оценка потерь выпуска в единицах техники')


class PlanCompletionForecast(BaseModel):
	model: str = Field(description='Название модели автомобиля')
	month_target: int = Field(description='Месячный план выпуска')
	projected_fact: int = Field(description='Прогноз фактического выпуска к концу месяца')
	risk_status: PlanRiskStatus = Field(
		description='Статус выполнения плана: underperformed / on_track / exceeded'
	)


class PredictiveForecastRequest(BaseModel):
	model_config = ConfigDict(extra='forbid')

	target_date: date | None = Field(
		default=None,
		description='Целевая дата для прогноза (YYYY-MM-DD)',
		examples=['2026-10-02'],
	)
	simulate_extra_downtime_min: int = Field(
		default=0,
		ge=0,
		le=960,
		description='Дополнительный простой в минутах для симуляции сценария "Что если?"',
		examples=[0],
	)
	target_model: str = Field(
		default='Chevrolet Onix',
		max_length=100,
		description='Модель автомобиля для оценки выполнения плана',
		examples=['Chevrolet Onix'],
	)


class PredictiveForecastResponse(BaseModel):
	forecast_date: str = Field(description='Дата прогноза (YYYY-MM-DD)')
	predicted_shift_oee: float = Field(description='Прогнозируемый сменный OEE завода (%)')
	oee_target_met: bool = Field(description='Выполняется ли целевой OEE (>= 85%)')
	bottlenecks: list[BottleneckItem] = Field(description='Выявленные узкие места и риски простоя')
	plan_completion_forecast: PlanCompletionForecast = Field(
		description='Прогноз выполнения месячного плана по целевой модели'
	)
	ai_recommendations: list[str] = Field(
		description='Рекомендации ИИ (сгенерированные LLM на основе производственных данных)'
	)
