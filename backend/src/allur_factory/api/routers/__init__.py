from fastapi import APIRouter

from allur_factory.api.routers.analytics import router as analytics_router
from allur_factory.api.routers.downtimes import router as downtimes_router
from allur_factory.api.routers.factory import router as factory_router
from allur_factory.api.routers.health import router as health_router
from allur_factory.api.routers.sections import router as sections_router
from allur_factory.api.routers.simulation import router as simulation_router

api_v1_router = APIRouter(prefix='/api/v1')
api_v1_router.include_router(factory_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(downtimes_router)
api_v1_router.include_router(sections_router)
api_v1_router.include_router(simulation_router)

__all__ = [
	'analytics_router',
	'api_v1_router',
	'downtimes_router',
	'factory_router',
	'health_router',
	'sections_router',
	'simulation_router',
]
