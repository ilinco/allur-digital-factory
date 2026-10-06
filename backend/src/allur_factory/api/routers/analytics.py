from datetime import date
from typing import Annotated

from fastapi import APIRouter, Query, status

from allur_factory.api.dependencies import GET_ANALYTICS_SERVICE_DEPENDENCY
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
