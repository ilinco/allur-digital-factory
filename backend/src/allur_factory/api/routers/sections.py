from typing import Annotated

from fastapi import APIRouter, Path, status

from allur_factory.api.dependencies import GET_SECTION_EVENT_SERVICE_DEPENDENCY
from allur_factory.schemas.events import SectionEventRequest, SectionEventResponse
from allur_factory.services.section_event_service import SectionEventService

router = APIRouter(tags=['Sections & QC'])


@router.post(
	'/sections/{section_id}/events',
	status_code=status.HTTP_201_CREATED,
	response_model=SectionEventResponse,
	responses={
		status.HTTP_404_NOT_FOUND: {'description': 'Участок не найден'},
		status.HTTP_422_UNPROCESSABLE_CONTENT: {'description': 'Ошибка валидации входных данных'},
	},
)
async def create_section_event(
	section_id: Annotated[
		str,
		Path(
			description='Идентификатор участка (например, welding-1)',
			examples=['welding-1'],
		),
	],
	payload: SectionEventRequest,
	event_service: SectionEventService = GET_SECTION_EVENT_SERVICE_DEPENDENCY,
) -> SectionEventResponse:
	"""Событие прохождения детали или фиксация брака (Контроль качества / QC).

	Инкрементирует fact или defects_count, пересчитывает defect_percent
	(триггерит алерт, если >2%).
	"""
	return await event_service.record_event(section_id, payload)
