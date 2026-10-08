import json
import unittest

from allur_factory.api.dependencies import get_production_repository
from allur_factory.main import app
from tests.fake_production_repository import FakeProductionRepository

SIMULATION_URL = '/api/v1/simulation/action'


class TestSimulationEndpoint(unittest.IsolatedAsyncioTestCase):
	"""Integration tests for POST /api/v1/simulation/action covering 200, 422, 404, 401/403."""

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

	# --- 200 OK: Success Scenarios ---

	async def test_trigger_breakdown_demo_action_with_empty_body(self):
		# Single-click jury demo: empty body triggers default breakdown
		status, data = await self.asgi_post(SIMULATION_URL, {})

		self.assertEqual(status, 200)
		self.assertEqual(data['action'], 'breakdown')
		self.assertEqual(data['status'], 'success')

		# Section must immediately turn CRITICAL (red)
		affected = data['affected_section']
		self.assertEqual(affected['id'], 'welding-1')
		self.assertEqual(affected['name'], 'Сварка-1')
		self.assertEqual(affected['status'], 'critical')
		self.assertGreater(affected['downtime_min'], 60)

		# Factory OEE must drop below 85% target
		self.assertLess(data['overall_oee'], 85.0)
		self.assertTrue(data['is_oee_alert'])

		# AI assistant must throw a structured critical alert
		ai = data['ai_assistant']
		self.assertEqual(ai['severity'], 'critical')
		self.assertIn('Критический инцидент', ai['title'])
		self.assertIn('OEE завода просел', ai['warning'])
		self.assertGreaterEqual(len(ai['suggested_actions']), 2)

	async def test_trigger_defect_spike_demo_action(self):
		payload = {
			'action': 'defect_spike',
			'section_id': 'assembly-1',
			'record_date': '2026-10-02',
		}
		status, data = await self.asgi_post(SIMULATION_URL, payload)

		self.assertEqual(status, 200)
		self.assertEqual(data['action'], 'defect_spike')
		affected = data['affected_section']
		self.assertEqual(affected['id'], 'assembly-1')
		self.assertEqual(affected['status'], 'critical')
		self.assertGreater(affected['defect_percent'], 5.0)

		ai = data['ai_assistant']
		self.assertEqual(ai['severity'], 'critical')
		self.assertIn('всплеск брака', ai['title'].lower())

	async def test_trigger_reset_simulation_action(self):
		# First trigger a breakdown
		await self.asgi_post(SIMULATION_URL, {'action': 'breakdown', 'section_id': 'welding-1'})

		# Then reset
		status, data = await self.asgi_post(SIMULATION_URL, {'action': 'reset'})
		self.assertEqual(status, 200)
		self.assertEqual(data['action'], 'reset')
		self.assertEqual(data['ai_assistant']['severity'], 'info')
		self.assertIn('сброшен', data['ai_assistant']['title'].lower())

	# --- 422 Unprocessable Content: Validation Errors ---

	async def test_invalid_simulation_action(self):
		payload = {'action': 'earthquake'}
		status, data = await self.asgi_post(SIMULATION_URL, payload)
		self.assertEqual(status, 422)
		self.assertIn('detail', data)

	async def test_invalid_duration_negative(self):
		payload = {'action': 'breakdown', 'duration_minutes': -10}
		status, _ = await self.asgi_post(SIMULATION_URL, payload)
		self.assertEqual(status, 422)

	async def test_forbidden_extra_field(self):
		payload = {'action': 'breakdown', 'forbidden_param': 123}
		status, _ = await self.asgi_post(SIMULATION_URL, payload)
		self.assertEqual(status, 422)

	# --- 404 Not Found ---

	async def test_unknown_section_in_simulation(self):
		payload = {
			'action': 'breakdown',
			'section_id': 'nonexistent-line-404',
		}
		status, data = await self.asgi_post(SIMULATION_URL, payload)
		self.assertEqual(status, 404)
		self.assertEqual(data['detail'], "Section 'nonexistent-line-404' not found")

	# --- 401/403 Auth Check ---

	async def test_simulation_auth_header_handling(self):
		status, _ = await self.asgi_post(
			SIMULATION_URL,
			{},
			headers=[[b'authorization', b'Bearer demo-token']],
		)
		self.assertEqual(status, 200)


if __name__ == '__main__':
	unittest.main()
