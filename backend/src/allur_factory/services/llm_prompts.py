"""Prompt construction for the AI shift-analysis recommendations."""

from typing import Any

RECOMMENDATIONS_COUNT = 3

SYSTEM_PROMPT = f"""Ты — главный инженер по надёжности и производственной системе автозавода Allur \
(сварка → окраска → сборка → контроль качества). Ты анализируешь данные цифрового двойника и \
выдаёшь рекомендации начальнику смены и главному инженеру.

МЕТОДИКА АНАЛИЗА (выполни по шагам в поле "analysis"):
1. Разложи OEE на доступность, производительность и качество; определи, какая составляющая \
даёт наибольший разрыв до цели и сколько это в п.п. OEE и в автомобилях.
2. Ранжируй простои по потерям выпуска; отдели аварийные причины от плановых (ТО, переналадка).
3. Сопоставь смену с накопленными данными месяца: хронические отказы важнее разовых.
4. Проверь участки с повышенным браком и загрузкой близкой к 100% — это скрытые узкие места.
5. Оцени риск невыполнения месячного плана по модели и какой рычаг закрывает отставание быстрее.

ТРЕБОВАНИЯ К РЕКОМЕНДАЦИЯМ (поле "ai_recommendations"):
- Ровно {RECOMMENDATIONS_COUNT} рекомендации, отсортированные по убыванию эффекта.
- Каждая — одно законченное предложение на русском, 90–220 символов, начинается с глагола \
действия (Провести, Заменить, Перенести, Внедрить, Перераспределить...).
- Обязательно указывай конкретное оборудование или участок ИЗ ДАННЫХ, срок/окно выполнения \
(до начала смены, в межсменный перерыв, в течение суток) и ожидаемый эффект в цифрах \
(шт., мин простоя или п.п. OEE), рассчитанный из входных данных.
- Используй только оборудование, участки и числа из входных данных. Не выдумывай названия.
- Не повторяй одну и ту же мысль; разные рекомендации должны бить в разные причины потерь.
- Без markdown, нумерации, эмодзи, кавычек-ёлочек и общих фраз вроде «оптимизировать процессы».

ФОРМАТ ОТВЕТА: только валидный JSON без пояснений вокруг:
{{"analysis": "краткий анализ по шагам 1–5, до 600 символов", \
"ai_recommendations": ["...", "...", "..."]}}"""

RESPONSE_FORMAT: dict[str, Any] = {
	'type': 'json_schema',
	'json_schema': {
		'name': 'shift_recommendations',
		'strict': True,
		'schema': {
			'type': 'object',
			'properties': {
				'analysis': {'type': 'string'},
				'ai_recommendations': {'type': 'array', 'items': {'type': 'string'}},
			},
			'required': ['analysis', 'ai_recommendations'],
			'additionalProperties': False,
		},
	},
}


def _fmt_num(value: Any, digits: int = 1) -> str:
	if isinstance(value, float):
		return f'{value:.{digits}f}'
	return str(value)


def _format_bottlenecks(bottlenecks: list[dict[str, Any]]) -> str:
	if not bottlenecks:
		return '- критических узких мест не обнаружено'
	return '\n'.join(
		f'- {b.get("equipment")} (участок {b.get("section_id")}): риск {b.get("risk_level")}, '
		f'{b.get("reason")}, оценка потерь {b.get("impact_lost_units")} шт.'
		for b in bottlenecks
	)


def _format_shift(shift: dict[str, Any]) -> str:
	lines = [
		(
			f'- Доступность: {_fmt_num(shift.get("availability"))}%, '
			f'производительность: {_fmt_num(shift.get("performance"))}%, '
			f'качество: {_fmt_num(shift.get("quality"))}%'
		),
		(
			f'- Выпуск: {shift.get("total_fact")} из {shift.get("total_plan")} шт., '
			f'брак: {shift.get("total_defects")} шт., суммарный простой: '
			f'{shift.get("total_downtime_min")} мин из {shift.get("planned_minutes")} мин фонда'
		),
	]
	extra = shift.get('simulated_extra_downtime_min') or 0
	if extra:
		lines.append(f'- Сценарий what-if: дополнительный простой Конвейер-03 +{extra} мин')

	for item in shift.get('lines', []):
		lines.append(
			f'- Участок {item.get("line_id")}: план {item.get("plan")}, факт {item.get("fact")}, '
			f'загрузка {_fmt_num(item.get("load_percent"))}%, брак {item.get("defects")} шт. '
			f'({_fmt_num(item.get("defect_percent"))}%)'
		)
	for d in shift.get('downtimes', []):
		lines.append(
			f'- Простой: {d.get("equipment")} ({d.get("section")}) — {d.get("reason")}, '
			f'{d.get("duration_minutes")} мин'
		)
	return '\n'.join(lines)


def _format_month(month: dict[str, Any], forecast_date: str) -> str:
	chronic = month.get('chronic_bottlenecks') or []
	chronic_text = '; '.join(chronic) if chronic else 'не выявлены'
	return (
		f'- Период: с начала месяца по {forecast_date}, смен с данными: {month.get("days_count")}\n'
		f'- Накопленный OEE: {_fmt_num(month.get("mtd_oee"))}%\n'
		f'- Накопленный выпуск: {month.get("mtd_fact")} из {month.get("mtd_plan")} шт.\n'
		f'- Повторяющиеся отказы: {chronic_text}'
	)


def build_user_prompt(
	*,
	forecast_date: str,
	predicted_shift_oee: float,
	target_oee: float,
	bottlenecks: list[dict[str, Any]],
	model_name: str,
	projected_fact: int,
	month_target: int,
	monthly_context: dict[str, Any] | None,
	shift_context: dict[str, Any] | None,
) -> str:
	gap = round(target_oee - predicted_shift_oee, 2)
	plan_gap = month_target - projected_fact
	sections = [
		f'ДАТА АНАЛИЗА: {forecast_date}',
		(
			f'OEE СМЕНЫ (прогноз): {_fmt_num(predicted_shift_oee, 2)}% при цели {_fmt_num(target_oee)}% '
			f'(разрыв {_fmt_num(gap, 2)} п.п.)'
		),
	]
	if shift_context:
		sections.append('ПОКАЗАТЕЛИ СМЕНЫ:\n' + _format_shift(shift_context))
	sections.append('УЗКИЕ МЕСТА СМЕНЫ:\n' + _format_bottlenecks(bottlenecks))
	if monthly_context:
		sections.append('КОНТЕКСТ МЕСЯЦА:\n' + _format_month(monthly_context, forecast_date))
	sections.append(
		f'МЕСЯЧНЫЙ ПЛАН ПО МОДЕЛИ {model_name}: цель {month_target} шт., прогноз факта '
		f'{projected_fact} шт. (отставание {max(0, plan_gap)} шт.)'
	)
	sections.append(
		f'Выполни анализ по методике и дай ровно {RECOMMENDATIONS_COUNT} рекомендации в формате JSON.'
	)
	return '\n\n'.join(sections)
