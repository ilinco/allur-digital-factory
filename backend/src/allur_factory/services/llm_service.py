import hashlib
import json
import logging
import re
import time
from typing import Any

import httpx

from allur_factory.core.config import settings
from allur_factory.services.llm_prompts import (
	RECOMMENDATIONS_COUNT,
	RESPONSE_FORMAT,
	SYSTEM_PROMPT,
	build_user_prompt,
)

logger = logging.getLogger(__name__)

DEFAULT_RECOMMENDATIONS = [
	'Провести диагностику натяжного механизма Конвейер-03 до начала 2-й смены.',
	'Снизить скорость подачи кузовов на окраску для стабилизации брака ниже порога 2%.',
]

MIN_RECOMMENDATION_LEN = 30
MAX_RECOMMENDATION_LEN = 400
MIN_VALID_RECOMMENDATIONS = 2
CACHE_MAX_ENTRIES = 128
# Statuses meaning "this provider cannot serve structured output" — retry the same model without schema.
SCHEMA_UNSUPPORTED_STATUSES = {400, 404, 422}

_PLACEHOLDER_RE = re.compile(
	r'^(rec|рекомендаци[яи]|recommendation)\s*\d*$|^\.\.\.$|^…$', re.IGNORECASE
)
_LIST_PREFIX_RE = re.compile(r'^\s*(?:[-*•]+|\d+[.)]|\(\d+\))\s*')
_JSON_FENCE_RE = re.compile(r'```(?:json)?\s*(.*?)```', re.DOTALL | re.IGNORECASE)

_cache: dict[str, tuple[float, list[str]]] = {}


def clear_recommendations_cache() -> None:
	"""Drop cached AI responses (used by tests and on configuration changes)."""
	_cache.clear()


def _cache_get(key: str) -> list[str] | None:
	entry = _cache.get(key)
	if entry is None:
		return None
	expires_at, value = entry
	if time.monotonic() > expires_at:
		_cache.pop(key, None)
		return None
	return list(value)


def _cache_put(key: str, value: list[str]) -> None:
	if settings.LLM_CACHE_TTL_S <= 0:
		return
	if len(_cache) >= CACHE_MAX_ENTRIES:
		oldest_key = min(_cache, key=lambda k: _cache[k][0])
		_cache.pop(oldest_key, None)
	_cache[key] = (time.monotonic() + settings.LLM_CACHE_TTL_S, list(value))


def _is_valid_recommendation(text: str) -> bool:
	cleaned = text.strip()
	if len(cleaned) < MIN_RECOMMENDATION_LEN or len(cleaned) > MAX_RECOMMENDATION_LEN:
		return False
	return _PLACEHOLDER_RE.match(cleaned) is None


def _clean_recommendation(text: str) -> str:
	cleaned = _LIST_PREFIX_RE.sub('', text.strip())
	cleaned = cleaned.replace('**', '').replace('__', '')
	cleaned = cleaned.strip(' "\'«»`')
	return re.sub(r'\s+', ' ', cleaned).strip()


def _message_text(data: dict[str, Any]) -> str:
	message = data['choices'][0]['message']
	content = message.get('content')
	if isinstance(content, list):
		content = ''.join(part.get('text', '') for part in content if isinstance(part, dict))
	return content or ''


def _extract_payload(content: str) -> Any:
	fenced = _JSON_FENCE_RE.search(content)
	candidate = fenced.group(1) if fenced else content
	try:
		return json.loads(candidate)
	except json.JSONDecodeError:
		pass
	match = re.search(r'\{.*\}', candidate, re.DOTALL)
	if match:
		return json.loads(match.group(0))
	match = re.search(r'\[.*\]', candidate, re.DOTALL)
	if match:
		return json.loads(match.group(0))
	raise ValueError('LLM response does not contain JSON payload')


def _parse_recommendations(content: str) -> list[str]:
	parsed = _extract_payload(content)
	recs_raw: list[Any] = []
	if isinstance(parsed, dict):
		val = parsed.get('ai_recommendations') or parsed.get('recommendations')
		if isinstance(val, list):
			recs_raw = val
		elif isinstance(val, dict):
			recs_raw = list(val.values())
		if parsed.get('analysis'):
			logger.debug('LLM analysis: %s', parsed['analysis'])
	elif isinstance(parsed, list):
		recs_raw = parsed

	result: list[str] = []
	seen: set[str] = set()
	for item in recs_raw:
		if not isinstance(item, str):
			continue
		cleaned = _clean_recommendation(item)
		key = cleaned.lower()
		if _is_valid_recommendation(cleaned) and key not in seen:
			seen.add(key)
			result.append(cleaned)
	return result


async def _request_model(
	client: httpx.AsyncClient,
	model: str,
	messages: list[dict[str, str]],
	timeout_s: float,
) -> list[str] | None:
	headers = {
		'Authorization': f'Bearer {settings.OPENROUTER_API_KEY}',
		'Content-Type': 'application/json',
		'X-Title': settings.PROJECT_NAME,
	}
	base_payload: dict[str, Any] = {
		'model': model,
		'messages': messages,
		'temperature': settings.OPENROUTER_TEMPERATURE,
		'max_tokens': settings.OPENROUTER_MAX_TOKENS,
	}
	for use_schema in (True, False):
		payload = (
			{**base_payload, 'response_format': RESPONSE_FORMAT} if use_schema else base_payload
		)
		resp = await client.post(
			f'{settings.OPENROUTER_BASE_URL}/chat/completions',
			headers=headers,
			json=payload,
			timeout=timeout_s,
		)
		if resp.status_code == 200:
			recs = _parse_recommendations(_message_text(resp.json()))
			if len(recs) >= MIN_VALID_RECOMMENDATIONS:
				return recs[:RECOMMENDATIONS_COUNT]
			logger.warning('Model %s returned %d valid recommendations', model, len(recs))
			return None
		if use_schema and resp.status_code in SCHEMA_UNSUPPORTED_STATUSES:
			logger.info(
				'Model %s rejected structured output (HTTP %s), retrying plain',
				model,
				resp.status_code,
			)
			continue
		logger.warning(
			'OpenRouter model %s returned HTTP %s: %s', model, resp.status_code, resp.text[:300]
		)
		return None
	return None


def _model_chain() -> list[str]:
	chain: list[str] = []
	for model in [settings.OPENROUTER_MODEL, *settings.OPENROUTER_FALLBACK_MODELS]:
		name = model.strip()
		if name and name not in chain:
			chain.append(name)
	return chain


async def generate_ai_recommendations(
	forecast_date: str,
	predicted_shift_oee: float,
	target_oee: float,
	bottlenecks: list[dict[str, Any]],
	model_name: str,
	projected_fact: int,
	month_target: int,
	monthly_context: dict[str, Any] | None = None,
	shift_context: dict[str, Any] | None = None,
) -> list[str]:
	"""Generate actionable engineering recommendations via OpenRouter LLM.

	Tries the primary model and configured fallbacks in order; falls back to deterministic
	engineering heuristics only if the API key is absent or every model fails.
	"""
	if not settings.OPENROUTER_API_KEY:
		logger.info('OpenRouter API key not configured, returning standard domain recommendations.')
		return _build_fallback_recommendations(
			bottlenecks, predicted_shift_oee, target_oee, monthly_context
		)

	user_prompt = build_user_prompt(
		forecast_date=forecast_date,
		predicted_shift_oee=predicted_shift_oee,
		target_oee=target_oee,
		bottlenecks=bottlenecks,
		model_name=model_name,
		projected_fact=projected_fact,
		month_target=month_target,
		monthly_context=monthly_context,
		shift_context=shift_context,
	)
	chain = _model_chain()
	cache_key = hashlib.sha256(f'{chain}|{SYSTEM_PROMPT}|{user_prompt}'.encode()).hexdigest()
	cached = _cache_get(cache_key)
	if cached is not None:
		return cached

	messages = [
		{'role': 'system', 'content': SYSTEM_PROMPT},
		{'role': 'user', 'content': user_prompt},
	]
	deadline = time.monotonic() + settings.OPENROUTER_TIMEOUT_S
	async with httpx.AsyncClient() as client:
		for model in chain:
			remaining = deadline - time.monotonic()
			if remaining <= 1:
				logger.warning('LLM time budget exhausted before model %s', model)
				break
			try:
				recs = await _request_model(client, model, messages, remaining)
			except Exception as err:  # noqa: BLE001 - LLM must never break the forecast endpoint
				logger.warning('OpenRouter model %s failed: %s', model, err)
				continue
			if recs:
				logger.info('AI recommendations generated by %s', model)
				_cache_put(cache_key, recs)
				return recs

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
				f'Провести углубленную ревизию узла {first_chronic} в межсменный интервал ввиду повторяющихся сбоев в текущем месяце.'
			)
		mtd_oee = monthly_context.get('mtd_oee', 100.0)
		if mtd_oee < target_oee and predicted_shift_oee < target_oee:
			recs.append(
				f'Инициировать межцеховой штаб по стабилизации такта выпуска: накопленный OEE месяца ниже целевых {target_oee:g}%.'
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

	for d in DEFAULT_RECOMMENDATIONS:
		if len(unique_recs) >= 2:
			break
		if d not in seen:
			seen.add(d)
			unique_recs.append(d)

	return unique_recs[:3]
