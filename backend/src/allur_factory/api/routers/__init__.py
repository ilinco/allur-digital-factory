from fastapi import APIRouter

from allur_factory.api.routers.analytics import router as analytics_router
from allur_factory.api.routers.factory import router as factory_router
from allur_factory.api.routers.health import router as health_router

api_v1_router = APIRouter(prefix='/api/v1')
api_v1_router.include_router(factory_router)
api_v1_router.include_router(analytics_router)

__all__ = [
	'analytics_router',
	'api_v1_router',
	'factory_router',
	'health_router',
]
