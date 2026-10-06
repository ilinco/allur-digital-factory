import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from allur_factory.core.exceptions import AppException

logger = logging.getLogger(__name__)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
	logger.warning(
		'Application error on %s %s: status_code=%s, detail=%s',
		request.method,
		request.url.path,
		exc.status_code,
		exc.message,
	)
	return JSONResponse(
		status_code=exc.status_code,
		content={'detail': exc.message},
	)


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
	logger.error(
		'Database error on %s %s: %s',
		request.method,
		request.url.path,
		exc,
		exc_info=exc,
	)
	return JSONResponse(
		status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
		content={'detail': 'Database error occurred'},
	)


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
	logger.error(
		'Unhandled error on %s %s: %s',
		request.method,
		request.url.path,
		exc,
		exc_info=exc,
	)
	return JSONResponse(
		status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
		content={'detail': 'Internal server error'},
	)


def setup_exception_handlers(app: FastAPI) -> None:
	app.exception_handler(AppException)(app_exception_handler)
	app.exception_handler(SQLAlchemyError)(sqlalchemy_exception_handler)
	app.exception_handler(Exception)(unhandled_exception_handler)
