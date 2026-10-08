from datetime import date
from typing import Annotated

from fastapi import APIRouter, Query, status

from allur_factory.api.dependencies import GET_ANALYTICS_SERVICE_DEPENDENCY
from allur_factory.schemas.analytics import (
	PredictiveForecastRequest,
	PredictiveForecastResponse,
)
from allur_factory.schemas.factory import KpiSummaryResponse
from allur_factory.services.analytics_service import AnalyticsService

router = APIRouter(prefix='/analytics', tags=['Analytics'])


@router.get('/kpi', status_code=status.HTTP_200_OK, response_model=KpiSummaryResponse)
async def get_kpi(
	date: Annotated[
		date | None,
		Query(
			description='Record date for KPI calculation (YYYY-MM-DD)',
			examples=['2026-10-02'],
		),
	] = None,
	analytics_service: AnalyticsService = GET_ANALYTICS_SERVICE_DEPENDENCY,
) -> KpiSummaryResponse:
	"""Fetch plant-wide aggregated OEE, total downtime, and monthly models plan progress."""
	return await analytics_service.get_kpi(target_date=date)


@router.post(
	'/predictive-forecast',
	status_code=status.HTTP_200_OK,
	response_model=PredictiveForecastResponse,
)
async def post_predictive_forecast(
	payload: PredictiveForecastRequest,
	analytics_service: AnalyticsService = GET_ANALYTICS_SERVICE_DEPENDENCY,
) -> PredictiveForecastResponse:
	"""Predictive shift OEE, downtime bottlenecks, and LLM engineering recommendations with 'What If' simulation."""
	return await analytics_service.get_predictive_forecast(
		target_date=payload.target_date,
		simulate_extra_downtime_min=payload.simulate_extra_downtime_min,
		target_model=payload.target_model,
	)


@router.get(
	'/forecast',
	status_code=status.HTTP_200_OK,
	response_model=PredictiveForecastResponse,
)
async def get_forecast(
	date: Annotated[
		date | None,
		Query(
			description='Target forecast date (YYYY-MM-DD)',
			examples=['2026-10-02'],
		),
	] = None,
	target_model: Annotated[
		str,
		Query(
			description='Vehicle model to forecast',
			examples=['Chevrolet Onix'],
		),
	] = 'Chevrolet Onix',
	analytics_service: AnalyticsService = GET_ANALYTICS_SERVICE_DEPENDENCY,
) -> PredictiveForecastResponse:
	"""Convenience GET endpoint for predictive forecast without downtime simulation."""
	return await analytics_service.get_predictive_forecast(
		target_date=date,
		simulate_extra_downtime_min=0,
		target_model=target_model,
	)
