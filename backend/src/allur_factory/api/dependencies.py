from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from allur_factory.core.database import get_db
from allur_factory.repositories.production import ProductionRepository
from allur_factory.services.analytics_service import AnalyticsService
from allur_factory.services.downtime_service import DowntimeService
from allur_factory.services.factory_layout_service import FactoryLayoutService
from allur_factory.services.factory_service import FactoryService
from allur_factory.services.section_event_service import SectionEventService
from allur_factory.services.simulation_service import SimulationService

GET_DB_DEPENDENCY = Depends(get_db)


def get_production_repository(
	db: AsyncSession = GET_DB_DEPENDENCY,
) -> ProductionRepository:
	return ProductionRepository(db)


GET_PRODUCTION_REPOSITORY_DEPENDENCY = Depends(get_production_repository)


def get_factory_service(
	repo: ProductionRepository = GET_PRODUCTION_REPOSITORY_DEPENDENCY,
) -> FactoryService:
	return FactoryService(repo)


def get_analytics_service(
	repo: ProductionRepository = GET_PRODUCTION_REPOSITORY_DEPENDENCY,
) -> AnalyticsService:
	return AnalyticsService(repo)


def get_factory_layout_service(
	repo: ProductionRepository = GET_PRODUCTION_REPOSITORY_DEPENDENCY,
) -> FactoryLayoutService:
	return FactoryLayoutService(repo)


def get_downtime_service(
	repo: ProductionRepository = GET_PRODUCTION_REPOSITORY_DEPENDENCY,
) -> DowntimeService:
	return DowntimeService(repo)


def get_section_event_service(
	repo: ProductionRepository = GET_PRODUCTION_REPOSITORY_DEPENDENCY,
) -> SectionEventService:
	return SectionEventService(repo)


def get_simulation_service(
	repo: ProductionRepository = GET_PRODUCTION_REPOSITORY_DEPENDENCY,
) -> SimulationService:
	return SimulationService(repo)


GET_FACTORY_SERVICE_DEPENDENCY = Depends(get_factory_service)
GET_ANALYTICS_SERVICE_DEPENDENCY = Depends(get_analytics_service)
GET_FACTORY_LAYOUT_SERVICE_DEPENDENCY = Depends(get_factory_layout_service)
GET_DOWNTIME_SERVICE_DEPENDENCY = Depends(get_downtime_service)
GET_SECTION_EVENT_SERVICE_DEPENDENCY = Depends(get_section_event_service)
GET_SIMULATION_SERVICE_DEPENDENCY = Depends(get_simulation_service)
