from fastapi import APIRouter, status

from allur_factory.api.dependencies import GET_SIMULATION_SERVICE_DEPENDENCY
from allur_factory.schemas.simulation import (
	SimulationActionRequest,
	SimulationActionResponse,
)
from allur_factory.services.simulation_service import SimulationService

router = APIRouter(tags=['Simulation'])


@router.post(
	'/simulation/action',
	status_code=status.HTTP_200_OK,
	response_model=SimulationActionResponse,
	responses={
		status.HTTP_404_NOT_FOUND: {'description': 'Участок не найден'},
		status.HTTP_422_UNPROCESSABLE_CONTENT: {'description': 'Ошибка валидации входных данных'},
	},
)
async def trigger_simulation_action(
	payload: SimulationActionRequest | None = None,
	simulation_service: SimulationService = GET_SIMULATION_SERVICE_DEPENDENCY,
) -> SimulationActionResponse:
	"""Управляемый триггер внештатной ситуации во время показа жюри.

	Позволяет в один клик из интерфейса показать жюри реакцию системы:
	участок моментально красится в красный, OEE проседает,
	а ИИ-ассистент выбрасывает предупреждение.
	"""
	resolved_payload = payload if payload is not None else SimulationActionRequest()
	return await simulation_service.trigger_action(resolved_payload)
