from datetime import date
from typing import Annotated

from fastapi import APIRouter, Query, status

from allur_factory.api.dependencies import GET_FACTORY_SERVICE_DEPENDENCY
from allur_factory.schemas.factory import PipelineResponse
from allur_factory.services.factory_service import FactoryService

router = APIRouter(prefix='/factory', tags=['Digital Factory'])


@router.get('/pipeline', status_code=status.HTTP_200_OK, response_model=PipelineResponse)
async def get_pipeline(
	date: Annotated[
		date | None,
		Query(
			description='Record date for shift metrics and downtimes (YYYY-MM-DD)',
			examples=['2026-10-02'],
		),
	] = None,
	factory_service: FactoryService = GET_FACTORY_SERVICE_DEPENDENCY,
) -> PipelineResponse:
	"""Fetch digital factory stations status, shift metrics, and downtimes with SLA calculation."""
	return await factory_service.get_pipeline(target_date=date)
