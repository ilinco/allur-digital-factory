from datetime import date

from allur_factory.core.exceptions import NotFoundException
from allur_factory.models import Downtime, ShiftMetric
from allur_factory.repositories.production import ProductionRepository
from allur_factory.schemas.simulation import (
	AffectedSectionInfo,
	AiAssistantAlert,
	SimulationActionRequest,
	SimulationActionResponse,
)
from allur_factory.services.factory_service import LINE_NAME_TO_ID, determine_station_status
from allur_factory.services.oee_engine import calculate_oee


class SimulationService:
	"""Business logic service for triggering simulated emergency situations for jury demo."""

	def __init__(self, repository: ProductionRepository) -> None:
		self.repository = repository

	async def trigger_action(self, payload: SimulationActionRequest) -> SimulationActionResponse:
		target_date = payload.record_date
		if target_date is None:
			target_date = await self.repository.get_latest_record_date() or date(2026, 10, 2)
		elif isinstance(target_date, str):
			target_date = date.fromisoformat(target_date)

		target_section_id = payload.section_id or 'welding-1'
		normalized_id = target_section_id.strip().lower()
		resolved_id = LINE_NAME_TO_ID.get(normalized_id, target_section_id.strip())

		line = await self.repository.get_line_by_id(resolved_id)
		if line is None:
			raise NotFoundException(f"Section '{target_section_id}' not found")

		action = payload.action or 'breakdown'
		message = ''

		if action in ('breakdown', 'critical_stop'):
			duration = int(payload.duration_minutes or 75)
			target_equipment_name = 'ABB-04' if action == 'breakdown' else 'Конвейер-03'
			equipments = await self.repository.get_equipment_by_line(line.id)
			matched_equipment = next(
				(e for e in equipments if e.name.strip().lower() == target_equipment_name.lower()),
				equipments[0] if equipments else None,
			)
			eq_name = matched_equipment.name if matched_equipment else target_equipment_name
			eq_id = matched_equipment.id if matched_equipment else None
			reason = (
				payload.reason
				or f'[SIMULATION] Аварийный останов: заклинивание поворотного редуктора робота {eq_name}'
			)
			dt = Downtime(
				record_date=target_date,
				section=line.name,
				line_id=line.id,
				equipment=eq_name,
				equipment_id=eq_id,
				reason=reason,
				duration_minutes=duration,
			)
			await self.repository.add_downtime(dt)
			await self.repository.commit()
			message = (
				f'Внештатная ситуация активирована: зафиксирован критический простой '
				f'({duration} мин) на участке {line.name}.'
			)

		elif action == 'defect_spike':
			metric = await self.repository.get_shift_metric_for_line(line.id, target_date)
			if metric is None:
				metric = ShiftMetric(
					record_date=target_date,
					line_id=line.id,
					plan=120,
					fact=120,
					work_hours=8.0,
					load_percent=100.0,
					defects_count=0,
					defect_percent=0.0,
				)
			defects = int(metric.defects_count or 0) + 8
			metric.defects_count = defects
			metric.fact = max(int(metric.fact or 0), defects)
			plan_val = int(metric.plan if metric.plan is not None else 120)
			metric.defect_percent = (
				round(float((defects / metric.fact) * 100), 2) if metric.fact > 0 else 0.0
			)
			metric.load_percent = (
				round(float((metric.fact / plan_val) * 100), 2) if plan_val > 0 else 0.0
			)
			await self.repository.add_or_update_shift_metric(metric)
			await self.repository.commit()
			message = (
				f'Внештатная ситуация активирована: зафиксирован всплеск брака '
				f'на участке {line.name}.'
			)

		elif action == 'reset':
			deleted_count = await self.repository.delete_simulation_downtimes(target_date)
			await self.repository.commit()
			message = f'Режим симуляции сброшен: удалено {deleted_count} тестовых инцидентов.'

		downtimes = await self.repository.get_downtimes_by_date(target_date)
		metrics = await self.repository.get_shift_metrics_by_date(target_date)

		section_dt = sum(
			int(d.duration_minutes or 0)
			for d in downtimes
			if (d.line_id == line.id)
			or (
				LINE_NAME_TO_ID.get(d.section.strip().lower(), d.section.strip().lower()) == line.id
			)
		)

		section_metric = await self.repository.get_shift_metric_for_line(line.id, target_date)
		defect_pct = (
			round(float(section_metric.defect_percent or 0.0), 2)
			if section_metric and section_metric.defect_percent is not None
			else 0.0
		)

		section_status = determine_station_status(int(section_dt), float(defect_pct))

		total_dt = sum(int(d.duration_minutes or 0) for d in downtimes)
		total_fact = sum(int(m.fact or 0) for m in metrics)
		total_plan = sum(int(m.plan if m.plan is not None else 0) for m in metrics)
		total_defects = sum(int(m.defects_count if m.defects_count is not None else 0) for m in metrics)

		if metrics and total_plan > 0:
			oee_res = calculate_oee(int(total_dt), int(total_fact), int(total_plan), int(total_defects))
		else:
			oee_res = {
				'availability': 0.0,
				'performance': 0.0,
				'quality': 0.0,
				'oee': 0.0,
				'is_alert': True,
			}

		if action == 'reset':
			ai_assistant = AiAssistantAlert(
				title='ИИ-Ассистент: Демонстрационный режим сброшен',
				warning='Все тестовые инциденты симуляции удалены. Метрики OEE и статус оборудования возвращены к исходным значениям.',
				severity='info',
				suggested_actions=[
					'Система цифрового двойника переведена в штатный режим мониторинга.'
				],
			)
		elif action == 'defect_spike':
			ai_assistant = AiAssistantAlert(
				title=f'ИИ-Ассистент: Критический всплеск брака на участке {line.name}',
				warning=(
					f'Внимание! Уровень дефектов достиг {defect_pct}% (критический порог >5.0%). '
					f'Качественная составляющая OEE снизилась, общий OEE упал до {oee_res["oee"]}%. '
					f'Требуется срочная остановка конвейера для калибровки оборудования.'
				),
				severity='critical',
				suggested_actions=[
					'1. Остановить подачу деталей и инициировать внеплановый аудит контролерами ОТК.',
					'2. Проверить калибровку сварочных клещей и стабильность подачи сварочного газа.',
					'3. Изолировать последнюю партию деталей для выборочного контроля геометрии кузова.',
				],
			)
		else:
			ai_assistant = AiAssistantAlert(
				title=f'ИИ-Ассистент: Критический инцидент на участке {line.name}',
				warning=(
					f'Внимание! Превышен критический лимит простоя оборудования (>60 мин): '
					f'текущий суммарный простой {section_dt} мин. '
					f'Коэффициент готовности (Availability) упал до {oee_res["availability"]}%, '
					f'общий OEE завода просел до {oee_res["oee"]}% (целевой уровень >= 85%). '
					f'Возникла угроза срыва суточного плана выпуска автомобилей.'
				),
				severity='critical',
				suggested_actions=[
					'1. Срочно направить дежурную ремонтную бригаду и инженера по робототехнике на ячейку ABB-04.',
					'2. Перевести буферный накопитель кузовов на резервную схему питания участка окраски.',
					'3. Скорректировать почасовой график сборки на вторую смену для минимизации потерь.',
				],
			)

		return SimulationActionResponse(
			action=action,
			status='success',
			message=message,
			affected_section=AffectedSectionInfo(
				id=line.id,
				name=line.name,
				status=section_status,
				downtime_min=int(section_dt),
				defect_percent=float(defect_pct),
			),
			overall_oee=float(oee_res['oee']),
			availability=float(oee_res['availability']),
			is_oee_alert=bool(oee_res['is_alert']),
			ai_assistant=ai_assistant,
		)
