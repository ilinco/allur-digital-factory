from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from allur_factory.core.database import get_db
from allur_factory.repositories.production import ProductionRepository
from allur_factory.services.analytics_service import AnalyticsService
from allur_factory.services.factory_service import FactoryService

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


GET_FACTORY_SERVICE_DEPENDENCY = Depends(get_factory_service)
GET_ANALYTICS_SERVICE_DEPENDENCY = Depends(get_analytics_service)
