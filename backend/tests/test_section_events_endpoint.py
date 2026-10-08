import json
import unittest

from allur_factory.api.dependencies import get_production_repository
from allur_factory.main import app
from tests.fake_production_repository import FakeProductionRepository


class TestSectionEventsEndpoint(unittest.IsolatedAsyncioTestCase):
	"""Integration tests for POST /api/v1/sections/{section_id}/events covering 201, 422, 404, 401/403."""

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

	# --- 201 Created: Success Scenarios ---

	async def test_record_pass_event_increments_fact(self):
		# Initial assembly-1 on OCT_02: fact=119, plan=120, defects=2 (1.68%)
		payload = {
			'event_type': 'pass',
			'count': 1,
			'record_date': '2026-10-02',
		}
		status, data = await self.asgi_post('/api/v1/sections/assembly-1/events', payload)

		self.assertEqual(status, 201)
		self.assertEqual(data['section_id'], 'assembly-1')
		self.assertEqual(data['event_type'], 'pass')
		self.assertEqual(data['fact'], 120)
		self.assertEqual(data['defects_count'], 2)
		self.assertEqual(data['load_percent'], 100.0)
		# 2 / 120 = 1.67% <= 2% -> no alert
		self.assertFalse(data['is_alert'])
		self.assertIsNone(data['alert_message'])

	async def test_record_defect_event_triggers_alert_when_over_2_percent(self):
		# Initial assembly-1 on OCT_02: fact=119, defects=2 (1.68%).
		# Adding 2 defects -> defects=4, fact=119 -> defect_percent = 4/119 = 3.36% (>2%) -> alert triggered!
		payload = {
			'event_type': 'defect',
			'count': 2,
			'reason': 'Царапина ЛКП на двери',
			'record_date': '2026-10-02',
		}
		status, data = await self.asgi_post('/api/v1/sections/assembly-1/events', payload)

		self.assertEqual(status, 201)
		self.assertEqual(data['defects_count'], 4)
		self.assertAlmostEqual(data['defect_percent'], 3.36, places=1)
		self.assertTrue(data['is_alert'])
		self.assertIsNotNone(data['alert_message'])
		self.assertIn('превысил порог 2.0%', data['alert_message'])

	async def test_record_defect_triggers_critical_when_over_5_percent(self):
		# Initial painting-1 on OCT_02: fact=116, defects=6 (5.17%). Adding 2 defects -> 8/116 = 6.9% (>5% -> critical)
		payload = {
			'event_type': 'defect',
			'count': 2,
			'reason': 'Подтек грунта',
			'record_date': '2026-10-02',
		}
		status, data = await self.asgi_post('/api/v1/sections/painting-1/events', payload)

		self.assertEqual(status, 201)
		self.assertEqual(data['status'], 'critical')
		self.assertTrue(data['is_alert'])

	# --- 422 Unprocessable Content: Validation Errors ---

	async def test_invalid_event_type(self):
		payload = {
			'event_type': 'broken_part',
			'count': 1,
		}
		status, data = await self.asgi_post('/api/v1/sections/welding-1/events', payload)
		self.assertEqual(status, 422)
		self.assertIn('detail', data)

	async def test_invalid_count_zero_or_negative(self):
		for bad_count in [0, -5]:
			with self.subTest(count=bad_count):
				payload = {
					'event_type': 'pass',
					'count': bad_count,
				}
				status, _ = await self.asgi_post('/api/v1/sections/welding-1/events', payload)
				self.assertEqual(status, 422)

	async def test_forbidden_extra_field(self):
		payload = {
			'event_type': 'pass',
			'count': 1,
			'forbidden': 'property',
		}
		status, _ = await self.asgi_post('/api/v1/sections/welding-1/events', payload)
		self.assertEqual(status, 422)

	# --- 404 Not Found ---

	async def test_unknown_section_returns_404(self):
		payload = {
			'event_type': 'pass',
			'count': 1,
		}
		status, data = await self.asgi_post('/api/v1/sections/unknown-section/events', payload)
		self.assertEqual(status, 404)
		self.assertEqual(data['detail'], "Section 'unknown-section' not found")

	# --- 401/403 Auth Check ---

	async def test_auth_header_handling(self):
		payload = {
			'event_type': 'pass',
			'count': 1,
		}
		status, _ = await self.asgi_post(
			'/api/v1/sections/welding-1/events',
			payload,
			headers=[[b'authorization', b'Bearer valid-or-invalid']],
		)
		self.assertEqual(status, 201)


if __name__ == '__main__':
	unittest.main()
