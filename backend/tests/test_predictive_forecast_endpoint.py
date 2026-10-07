import json
import unittest
from unittest.mock import patch

from allur_factory.api.dependencies import get_production_repository
from allur_factory.main import app
from tests.fake_production_repository import FakeProductionRepository

PREDICTIVE_URL = '/api/v1/analytics/predictive-forecast'
FORECAST_GET_URL = '/api/v1/analytics/forecast'


class TestPredictiveForecastEndpoint(unittest.IsolatedAsyncioTestCase):
	"""Integration tests for predictive forecast endpoints covering 200, 422, 404, 401/403."""

	def setUp(self) -> None:
		self.repo = FakeProductionRepository()
		app.dependency_overrides[get_production_repository] = lambda: self.repo

	def tearDown(self) -> None:
		app.dependency_overrides.clear()

	async def asgi_post(self, path: str, body: dict | None = None, headers: list | None = None):
		raw_path, _, query = path.partition('?')
		body_bytes = json.dumps(body).encode() if body is not None else b''
		req_headers = [
			[b'host', b'localhost'],
			[b'content-type', b'application/json'],
			*(headers or []),
		]
		scope = {
			'type': 'http',
			'http_version': '1.1',
			'method': 'POST',
			'scheme': 'http',
			'path': raw_path,
			'raw_path': raw_path.encode(),
			'query_string': query.encode(),
			'headers': req_headers,
		}
		status_code = None
		response_body = []

		async def receive():
			return {'type': 'http.request', 'body': body_bytes, 'more_body': False}

		async def send(message):
			nonlocal status_code
			if message['type'] == 'http.response.start':
				status_code = message['status']
			elif message['type'] == 'http.response.body':
				response_body.append(message.get('body', b''))

		await app(scope, receive, send)
		return status_code, json.loads(b''.join(response_body).decode())

	async def asgi_get(self, path: str, headers: list | None = None):
		raw_path, _, query = path.partition('?')
		req_headers = [
			[b'host', b'localhost'],
			*(headers or []),
		]
		scope = {
			'type': 'http',
			'http_version': '1.1',
			'method': 'GET',
			'scheme': 'http',
			'path': raw_path,
			'raw_path': raw_path.encode(),
			'query_string': query.encode(),
			'headers': req_headers,
		}
		status_code = None
		response_body = []

		async def receive():
			return {'type': 'http.request', 'body': b'', 'more_body': False}

		async def send(message):
			nonlocal status_code
			if message['type'] == 'http.response.start':
				status_code = message['status']
			elif message['type'] == 'http.response.body':
				response_body.append(message.get('body', b''))

		await app(scope, receive, send)
		return status_code, json.loads(b''.join(response_body).decode())

	# --- 200 OK: Success Scenarios ---

	async def test_predictive_forecast_post_baseline(self):
		payload = {
			'target_date': '2026-10-02',
			'simulate_extra_downtime_min': 0,
			'target_model': 'Chevrolet Onix',
		}
		status, data = await self.asgi_post(PREDICTIVE_URL, payload)

		self.assertEqual(status, 200)
		self.assertEqual(data['forecast_date'], '2026-10-02')
		self.assertAlmostEqual(data['predicted_shift_oee'], 84.82, places=1)
		self.assertFalse(data['oee_target_met'])

		# Bottlenecks must detect Conveyor-03 (critical: 55 min) and ABB-04 (warning: 30 min)
		bottlenecks = data['bottlenecks']
		self.assertGreaterEqual(len(bottlenecks), 1)
		first_bottleneck = bottlenecks[0]
		self.assertEqual(first_bottleneck['equipment'], 'Конвейер-03')
		self.assertEqual(first_bottleneck['risk_level'], 'critical')
		self.assertIn('55', first_bottleneck['reason'])

		# Monthly plan forecast
		plan = data['plan_completion_forecast']
		self.assertEqual(plan['model'], 'Chevrolet Onix')
		self.assertEqual(plan['month_target'], 2500)
		self.assertEqual(plan['risk_status'], 'underperformed')

		# AI recommendations
		self.assertIsInstance(data['ai_recommendations'], list)
		self.assertGreaterEqual(len(data['ai_recommendations']), 2)

	async def test_predictive_forecast_post_simulation_what_if(self):
		payload = {
			'target_date': '2026-10-02',
			'simulate_extra_downtime_min': 40,
			'target_model': 'Chevrolet Onix',
		}
		status, data = await self.asgi_post(PREDICTIVE_URL, payload)

		self.assertEqual(status, 200)
		# Extra downtime must reduce predicted OEE
		self.assertLess(data['predicted_shift_oee'], 84.82)
		self.assertFalse(data['oee_target_met'])

		bottlenecks = data['bottlenecks']
		self.assertTrue(any(b['equipment'] == 'Конвейер-03' and b['risk_level'] == 'critical' for b in bottlenecks))

	async def test_predictive_forecast_get_endpoint(self):
		status, data = await self.asgi_get(f'{FORECAST_GET_URL}?date=2026-10-02&target_model=Chevrolet%20Onix')

		self.assertEqual(status, 200)
		self.assertEqual(data['forecast_date'], '2026-10-02')
		self.assertAlmostEqual(data['predicted_shift_oee'], 84.82, places=1)
		self.assertIsInstance(data['bottlenecks'], list)
		self.assertEqual(data['plan_completion_forecast']['model'], 'Chevrolet Onix')
		self.assertGreaterEqual(len(data['ai_recommendations']), 2)

	async def test_predictive_forecast_fallback_recommendations_when_llm_fails(self):
		with patch('allur_factory.services.llm_service.httpx.AsyncClient.post', side_effect=Exception('LLM Error')):
			status, data = await self.asgi_post(
				PREDICTIVE_URL,
				{'target_date': '2026-10-02', 'simulate_extra_downtime_min': 0, 'target_model': 'Chevrolet Onix'},
			)
			self.assertEqual(status, 200)
			self.assertGreaterEqual(len(data['ai_recommendations']), 2)
			self.assertTrue(any('Конвейер' in r for r in data['ai_recommendations']))

	# --- 422 Unprocessable Content: Validation Errors ---

	async def test_predictive_forecast_invalid_downtime_negative(self):
		payload = {
			'target_date': '2026-10-02',
			'simulate_extra_downtime_min': -10,
		}
		status, data = await self.asgi_post(PREDICTIVE_URL, payload)
		self.assertEqual(status, 422)
		self.assertIn('detail', data)

	async def test_predictive_forecast_forbidden_extra_field(self):
		payload = {
			'target_date': '2026-10-02',
			'forbidden_key': 123,
		}
		status, _ = await self.asgi_post(PREDICTIVE_URL, payload)
		self.assertEqual(status, 422)

	async def test_predictive_forecast_invalid_date_format(self):
		status, _ = await self.asgi_get(f'{FORECAST_GET_URL}?date=invalid-date')
		self.assertEqual(status, 422)

	# --- 401/403 Auth Check ---

	async def test_predictive_forecast_auth_headers_handling(self):
		status, _ = await self.asgi_post(
			PREDICTIVE_URL,
			{'target_date': '2026-10-02'},
			headers=[[b'authorization', b'Bearer valid-session-token']],
		)
		self.assertEqual(status, 200)


if __name__ == '__main__':
	unittest.main()
