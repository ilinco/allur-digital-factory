import json
import logging
import re
from typing import Any

import httpx

from allur_factory.core.config import settings

logger = logging.getLogger(__name__)

DEFAULT_RECOMMENDATIONS = [
	'Провести диагностику натяжного механизма Конвейер-03 до начала 2-й смены.',
	'Снизить скорость подачи кузовов на окраску для стабилизации брака ниже порога 2%.',
]


async def generate_ai_recommendations(
	forecast_date: str,
	predicted_shift_oee: float,
	target_oee: float,
	bottlenecks: list[dict[str, Any]],
	model_name: str,
	projected_fact: int,
	month_target: int,
	monthly_context: dict[str, Any] | None = None,
) -> list[str]:
	"""Generate actionable engineering recommendations via OpenRouter LLM (Nvidia Nemotron).

	Falls back safely to robust engineering heuristics if API key is absent or request fails.
	"""
	api_key = settings.OPENROUTER_API_KEY
	if not api_key:
		logger.info('OpenRouter API key not configured, returning standard domain recommendations.')
		return _build_fallback_recommendations(
			bottlenecks, predicted_shift_oee, target_oee, monthly_context
		)

	system_prompt = (
		'Ты ведущий ИИ-эксперт цифрового двойника автозавода Allur. '
		'Твоя задача — предложить ровно 2 практические, технически конкретные рекомендации '
		'для начальника смены и главного инженера по устранению выявленных узких мест с учетом месячной динамики. '
		'Отвечай ИСКЛЮЧИТЕЛЬНО в формате JSON: {"ai_recommendations": ["рекомендация 1", "рекомендация 2"]}. '
		'Каждая рекомендация должна быть одним четким предложением на русском языке без вводных фраз.'
	)

	bottlenecks_summary = (
		'; '.join(
			f'{b.get("equipment")} ({b.get("section_id")}, риск {b.get("risk_level")}, причина: {b.get("reason")}, потери: {b.get("impact_lost_units")} шт)'
			for b in bottlenecks
		)
		or 'Критических узких мест не обнаружено'
	)

	month_str = ''
	if monthly_context:
		days = monthly_context.get('days_count', 1)
		m_oee = monthly_context.get('mtd_oee', predicted_shift_oee)
		m_fact = monthly_context.get('mtd_fact', 0)
		m_plan = monthly_context.get('mtd_plan', 0)
		chronic = monthly_context.get('chronic_bottlenecks', [])
		chronic_text = '; '.join(chronic) if chronic else 'Отсутствуют'
		day_part = forecast_date.split('-')[-1] if '-' in forecast_date else forecast_date
		month_str = (
			f'Контекст за октябрь (с 1 по {day_part} число, {days} смен):\n'
			f'- Средний накопленный OEE: {m_oee:.1f}%\n'
			f'- Накопленный выпуск: {m_fact} из {m_plan} ед.\n'
			f'- Повторяющиеся отказы за декаду: {chronic_text}\n'
		)

	user_prompt = (
		f'Дата анализа: {forecast_date}.\n'
		f'{month_str}'
		f'Прогнозируемый OEE смены: {predicted_shift_oee}% (целевой: {target_oee}%).\n'
		f'Узкие места и риски смены: {bottlenecks_summary}.\n'
		f'Целевая модель: {model_name} (месячный план: {month_target}, прогноз факта: {projected_fact}).\n'
		'Сгенерируй ровно 2 инженерные рекомендации.'
	)

	headers = {
		'Authorization': f'Bearer {api_key}',
		'Content-Type': 'application/json',
	}
	payload = {
		'model': settings.OPENROUTER_MODEL,
		'messages': [
			{'role': 'system', 'content': system_prompt},
			{'role': 'user', 'content': user_prompt},
		],
		'temperature': 0.1,
		'max_tokens': 600,
	}

	try:
		async with httpx.AsyncClient(timeout=15.0) as client:
			resp = await client.post(
				f'{settings.OPENROUTER_BASE_URL}/chat/completions',
				headers=headers,
				json=payload,
			)
			if resp.status_code == 200:
				data = resp.json()
				content = data['choices'][0]['message']['content']
				match = re.search(r'\{.*\}', content, re.DOTALL)
				if match:
					parsed = json.loads(match.group(0))
					recs = parsed.get('ai_recommendations') or parsed.get('recommendations')
					if isinstance(recs, list) and len(recs) >= 2:
						return [str(r).strip() for r in recs[:3] if str(r).strip()]
	except (
		httpx.HTTPError,
		json.JSONDecodeError,
		KeyError,
		TypeError,
		ValueError,
		Exception,  # noqa: BLE001
	) as err:
		logger.warning('Failed to generate recommendations via OpenRouter: %s', err)

	return _build_fallback_recommendations(
		bottlenecks, predicted_shift_oee, target_oee, monthly_context
	)


def _build_fallback_recommendations(
	bottlenecks: list[dict[str, Any]],
	predicted_shift_oee: float,
	target_oee: float,
	monthly_context: dict[str, Any] | None = None,
) -> list[str]:
	"""Deterministic domain recommendations based on plant bottleneck analysis and monthly trends."""
	recs: list[str] = []

	if monthly_context:
		chronic = monthly_context.get('chronic_bottlenecks', [])
		if chronic:
			first_chronic = chronic[0].split('(')[0].strip()
			recs.append(
				f'Провести углубленную ревизию узла {first_chronic} в межсменный интервал ввиду повторяющихся сбоев в октябре.'
			)
		mtd_oee = monthly_context.get('mtd_oee', 100.0)
		if mtd_oee < target_oee and predicted_shift_oee < target_oee:
			recs.append(
				'Инициировать межцеховой штаб по стабилизации такта выпуска: накопленный OEE месяца ниже целевых 85%.'
			)

	for b in bottlenecks:
		eq = b.get('equipment', 'оборудования')
		sec = b.get('section_id', '')
		if 'конвейер' in eq.lower():
			recs.append(f'Провести диагностику натяжного механизма {eq} до начала 2-й смены.')
		elif 'окраск' in sec.lower() or 'камер' in eq.lower():
			recs.append(
				'Снизить скорость подачи кузовов на окраску для стабилизации брака ниже порога 2%.'
			)
		elif 'abb' in eq.lower() or 'сварк' in sec.lower():
			recs.append(f'Выполнить внеплановую калибровку сварочных клещей манипулятора {eq}.')

	if len(recs) < 2 and predicted_shift_oee < target_oee:
		recs.append(
			'Перераспределить загрузку постов сборки для компенсации накопленного отставания такта.'
		)

	if not recs:
		recs = list(DEFAULT_RECOMMENDATIONS)

	# Ensure unique and at least 2 items
	seen: set[str] = set()
	unique_recs: list[str] = []
	for r in recs:
		if r not in seen:
			seen.add(r)
			unique_recs.append(r)

	while len(unique_recs) < 2:
		for d in DEFAULT_RECOMMENDATIONS:
			if d not in seen:
				seen.add(d)
				unique_recs.append(d)
				if len(unique_recs) >= 2:
					break

	return unique_recs[:3]
