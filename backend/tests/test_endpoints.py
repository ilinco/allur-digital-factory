import json
import unittest

from allur_factory.core.database import engine
from allur_factory.main import app
from allur_factory.services.factory_service import (
	determine_station_status,
)
from allur_factory.services.oee_engine import calculate_oee


class TestOeeAndSlaLogic(unittest.TestCase):
	"""Test unit calculations for OEE and SLA statuses."""

	def test_sla_status_critical(self):
		# Downtime > 60 min -> critical
		self.assertEqual(determine_station_status(61, 1.0), 'critical')
		# Defect > 5.0% -> critical
		self.assertEqual(determine_station_status(10, 5.2), 'critical')

	def test_sla_status_warning(self):
		# Defect > 2.0% -> warning
		self.assertEqual(determine_station_status(15, 2.7), 'warning')
		# Downtime > 30 min -> warning
		self.assertEqual(determine_station_status(55, 1.5), 'warning')

	def test_sla_status_normal(self):
		# Within limits
		self.assertEqual(determine_station_status(25, 1.7), 'normal')
		self.assertEqual(determine_station_status(0, 0.8), 'normal')

	def test_calculate_oee(self):
		res = calculate_oee(
			downtime_minutes=85,
			fact_units=346,
			plan_units=360,
			defects_count=11,
		)
		self.assertAlmostEqual(res['oee'], 84.82, places=1)
		self.assertTrue(res['is_alert'])


class TestApiEndpoints(unittest.IsolatedAsyncioTestCase):
	"""Integration tests querying Supabase database and ASGI endpoints."""

	async def asyncTearDown(self):
		await engine.dispose()

	async def asgi_get(self, path: str):
		scope = {
			'type': 'http',
			'http_version': '1.1',
			'method': 'GET',
			'scheme': 'http',
			'path': path.split('?')[0],
			'raw_path': path.split('?')[0].encode(),
			'query_string': path.split('?')[1].encode() if '?' in path else b'',
			'headers': [[b'host', b'localhost']],
		}
		status_code = None
		body = []

		async def receive():
			return {'type': 'http.request', 'body': b'', 'more_body': False}

		async def send(message):
			nonlocal status_code
			if message['type'] == 'http.response.start':
				status_code = message['status']
			elif message['type'] == 'http.response.body':
				body.append(message.get('body', b''))

		await app(scope, receive, send)
		return status_code, json.loads(b''.join(body).decode())

	async def test_factory_pipeline_oct02(self):
		status, data = await self.asgi_get('/api/v1/factory/pipeline?date=2026-10-02')
		self.assertEqual(status, 200)
		self.assertEqual(data['record_date'], '2026-10-02')
		stations = {s['id']: s for s in data['stations']}

		# Welding-1: defect 2.7% -> warning
		self.assertIn('welding-1', stations)
		self.assertEqual(stations['welding-1']['status'], 'warning')
		self.assertEqual(stations['welding-1']['downtime_min'], 30)

		# Painting-1: defect 5.2% -> critical
		self.assertIn('painting-1', stations)
		self.assertEqual(stations['painting-1']['status'], 'critical')

		# Assembly-1: downtime 55 min -> warning
		self.assertIn('assembly-1', stations)
		self.assertEqual(stations['assembly-1']['status'], 'warning')
		self.assertEqual(stations['assembly-1']['downtime_min'], 55)

	async def test_analytics_kpi_oct02(self):
		status, data = await self.asgi_get('/api/v1/analytics/kpi?date=2026-10-02')
		self.assertEqual(status, 200)
		self.assertEqual(data['record_date'], '2026-10-02')
		self.assertAlmostEqual(data['overall_oee'], 84.82, places=1)
		self.assertEqual(data['target_oee'], 85.0)
		self.assertEqual(data['total_fact'], 346)
		self.assertEqual(data['total_plan'], 360)
		self.assertEqual(data['total_downtime_min'], 85)

		# Models progress
		models = {m['model_name']: m for m in data['models_progress']}
		self.assertIn('Chevrolet Onix', models)
		self.assertIn('Chevrolet Cobalt', models)
		self.assertIn('JAC J7', models)
		self.assertEqual(models['Chevrolet Onix']['target_monthly'], 2500)
		self.assertEqual(models['Chevrolet Cobalt']['target_monthly'], 1800)
		self.assertEqual(models['JAC J7']['target_monthly'], 500)

	async def test_factory_pipeline_oct01(self):
		status, data = await self.asgi_get('/api/v1/factory/pipeline?date=2026-10-01')
		self.assertEqual(status, 200)
		stations = {s['id']: s for s in data['stations']}
		self.assertEqual(stations['welding-1']['status'], 'normal')
		self.assertEqual(stations['painting-1']['status'], 'warning')
		self.assertEqual(stations['assembly-1']['status'], 'normal')

	async def test_analytics_kpi_oct01(self):
		status, data = await self.asgi_get('/api/v1/analytics/kpi?date=2026-10-01')
		self.assertEqual(status, 200)
		self.assertAlmostEqual(data['overall_oee'], 89.86, places=1)
		self.assertEqual(data['total_fact'], 354)
		self.assertEqual(data['total_plan'], 360)
		self.assertEqual(data['total_downtime_min'], 65)


if __name__ == '__main__':
	unittest.main()
