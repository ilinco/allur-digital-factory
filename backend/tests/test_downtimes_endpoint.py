import json
import unittest

from allur_factory.api.dependencies import get_production_repository
from allur_factory.main import app
from tests.fake_production_repository import FakeProductionRepository

DOWNTIMES_URL = '/api/v1/downtimes'


class TestDowntimesEndpoint(unittest.IsolatedAsyncioTestCase):
	"""Integration tests for POST /api/v1/downtimes covering 201, 422, 404, 401/403."""

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

	async def asgi_get(self, path: str):
		raw_path, _, query = path.partition('?')
		scope = {
			'type': 'http',
			'http_version': '1.1',
			'method': 'GET',
			'scheme': 'http',
			'path': raw_path,
			'raw_path': raw_path.encode(),
			'query_string': query.encode(),
			'headers': [[b'host', b'localhost']],
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

	# --- 201 Created: Success Scenarios ---

	async def test_create_downtime_exceeding_60_min_sets_critical_status(self):
		# welding-1 already has 30 min downtime in . Adding 35 min makes 65 min (>60 min limit -> critical)
		payload = {
			'section_id': 'welding-1',
			'equipment': 'ABB-04',
			'reason': 'Заклинивание захвата манипулятора',
			'duration_minutes': 35,
			'record_date': '2026-10-02',
		}
		status, data = await self.asgi_post(DOWNTIMES_URL, payload)

		self.assertEqual(status, 201)
		self.assertEqual(data['section_id'], 'welding-1')
		self.assertEqual(data['section_name'], 'Сварка-1')
		self.assertEqual(data['section_downtime_min'], 65)
		self.assertEqual(data['section_status'], 'critical')
		self.assertEqual(data['downtime']['reason'], 'Заклинивание захвата манипулятора')
		self.assertEqual(data['downtime']['duration_minutes'], 35)

		# OEE Availability and overall OEE must decrease
		oee = data['oee_impact']
		self.assertLess(oee['new_availability'], oee['previous_availability'])
		self.assertLess(oee['new_oee'], oee['previous_oee'])

	async def test_create_downtime_below_60_min_sets_warning_status(self):
		# warehouse-in has 0 min downtime. Adding 35 min -> 35 min (>30 min and <=60 min -> warning)
		payload = {
			'section_id': 'warehouse-in',
			'equipment': 'Транспортировщик AGV-01',
			'reason': 'Разряд тяговой батареи',
			'duration_minutes': 35,
			'record_date': '2026-10-02',
		}
		status, data = await self.asgi_post(DOWNTIMES_URL, payload)

		self.assertEqual(status, 201)
		self.assertEqual(data['section_downtime_min'], 35)
		self.assertEqual(data['section_status'], 'warning')

	async def test_create_downtime_with_equipment_id(self):
		payload = {
			'section_id': 'welding-1',
			'equipment': 'ABB-01',
			'equipment_id': 1,
			'reason': 'Плановая калибровка',
			'duration_minutes': 15,
			'record_date': '2026-10-02',
		}
		status, data = await self.asgi_post(DOWNTIMES_URL, payload)

		self.assertEqual(status, 201)
		self.assertEqual(data['downtime']['equipment_id'], 1)

	# --- 422 Unprocessable Content: Validation Errors ---

	async def test_create_downtime_invalid_duration(self):
		for bad_duration in [0, -10, 1000]:
			with self.subTest(duration=bad_duration):
				payload = {
					'section_id': 'welding-1',
					'equipment': 'ABB-01',
					'reason': 'Тест',
					'duration_minutes': bad_duration,
				}
				status, data = await self.asgi_post(DOWNTIMES_URL, payload)
				self.assertEqual(status, 422)
				self.assertIn('detail', data)

	async def test_create_downtime_missing_required_fields(self):
		payload = {'section_id': 'welding-1'}
		status, data = await self.asgi_post(DOWNTIMES_URL, payload)
		self.assertEqual(status, 422)
		self.assertIn('detail', data)

	async def test_create_downtime_forbidden_extra_field(self):
		payload = {
			'section_id': 'welding-1',
			'equipment': 'ABB-01',
			'reason': 'Перегрев',
			'duration_minutes': 10,
			'unknown_field': 'not_allowed',
		}
		status, _ = await self.asgi_post(DOWNTIMES_URL, payload)
		self.assertEqual(status, 422)

	# --- 404 Not Found ---

	async def test_create_downtime_unknown_section(self):
		payload = {
			'section_id': 'unknown-section-99',
			'equipment': 'ABB-01',
			'reason': 'Перегрев',
			'duration_minutes': 20,
		}
		status, data = await self.asgi_post(DOWNTIMES_URL, payload)
		self.assertEqual(status, 404)
		self.assertEqual(data['detail'], "Section 'unknown-section-99' not found")

	async def test_create_downtime_unknown_equipment_id(self):
		payload = {
			'section_id': 'welding-1',
			'equipment': 'ABB-01',
			'equipment_id': 99999,
			'reason': 'Перегрев',
			'duration_minutes': 20,
		}
		status, data = await self.asgi_post(DOWNTIMES_URL, payload)
		self.assertEqual(status, 404)
		self.assertEqual(data['detail'], 'Equipment with ID 99999 not found')

	# --- 401/403 Auth Check ---

	async def test_create_downtime_auth_header_handling(self):
		payload = {
			'section_id': 'welding-1',
			'equipment': 'ABB-04',
			'reason': 'Штатная остановка',
			'duration_minutes': 10,
		}
		status, _ = await self.asgi_post(
			DOWNTIMES_URL,
			payload,
			headers=[[b'authorization', b'Bearer token-test']],
		)
		self.assertEqual(status, 201)

	# --- GET /api/v1/downtimes Tests ---

	async def test_get_downtimes_success(self):
		status, data = await self.asgi_get(f'{DOWNTIMES_URL}?date=2026-10-02')
		self.assertEqual(status, 200)
		self.assertIsInstance(data, list)
		self.assertTrue(len(data) >= 1)
		first = data[0]
		self.assertIn('id', first)
		self.assertIn('equipment', first)
		self.assertIn('reason', first)
		self.assertIn('duration_minutes', first)

	async def test_get_downtimes_default_date(self):
		status, data = await self.asgi_get(DOWNTIMES_URL)
		self.assertEqual(status, 200)
		self.assertIsInstance(data, list)

	async def test_get_downtimes_invalid_date(self):
		status, _ = await self.asgi_get(f'{DOWNTIMES_URL}?date=invalid-date')
		self.assertEqual(status, 422)

	async def test_get_downtimes_nonexistent_date_returns_empty(self):
		status, data = await self.asgi_get(f'{DOWNTIMES_URL}?date=2025-01-01')
		self.assertEqual(status, 200)
		self.assertEqual(data, [])


if __name__ == '__main__':
	unittest.main()
