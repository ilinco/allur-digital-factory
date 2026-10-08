import json
import unittest
from datetime import date

from allur_factory.api.dependencies import get_production_repository
from allur_factory.main import app
from allur_factory.models import Downtime, Equipment, ProductionLine, ShiftMetric

LAYOUT_URL = '/api/v1/factory/layout'
OCT_01 = date(2026, 10, 1)
OCT_02 = date(2026, 10, 2)


def _build_lines() -> list[ProductionLine]:
	spec = [
		(
			'warehouse-in',
			'Склад комплектующих',
			'warehouse',
			[
				(101, 'Ричтрак Jungheinrich ETV-216', 'reach_truck'),
				(102, 'Транспортировщик AGV-01', 'agv_tugger'),
			],
		),
		(
			'welding-1',
			'Сварка-1',
			'process',
			[(1, 'ABB-01', 'welding_robot'), (2, 'ABB-04', 'welding_robot')],
		),
		('painting-1', 'Окраска-1', 'process', [(3, 'Камера-02', 'paint_booth')]),
		('assembly-1', 'Сборка-1', 'process', [(4, 'Конвейер-03', 'conveyor')]),
		(
			'qc-1',
			'Контроль качества',
			'process',
			[
				(201, 'Световой тоннель аудита ЛКП', 'inspection_light_tunnel'),
				(202, 'Тормозной стенд Maha IW4', 'brake_test_bench'),
			],
		),
		(
			'warehouse-out',
			'Склад готовой продукции',
			'warehouse',
			[(301, 'Пост финишного контроля PDI', 'pdi_station')],
		),
	]
	lines = []
	for order, (line_id, name, kind, eqs) in enumerate(spec, start=1):
		line = ProductionLine(id=line_id, name=name, step_order=order, section_type=kind)
		line.equipment = [
			Equipment(id=eq_id, name=eq_name, line_id=line_id, equipment_type=eq_type)
			for eq_id, eq_name, eq_type in eqs
		]
		lines.append(line)
	return lines


def _metric(day: date, line_id: str, fact: int, load: float, defects: int, pct: float):
	return ShiftMetric(
		record_date=day,
		line_id=line_id,
		plan=120,
		fact=fact,
		work_hours=7.5,
		load_percent=load,
		defects_count=defects,
		defect_percent=pct,
	)


METRICS = {
	OCT_02: [
		_metric(OCT_02, 'welding-1', 111, 91.0, 3, 2.7),
		_metric(OCT_02, 'painting-1', 116, 96.0, 6, 5.2),
		_metric(OCT_02, 'assembly-1', 119, 99.0, 2, 1.7),
	],
}

DOWNTIMES = {
	OCT_02: [
		Downtime(
			record_date=OCT_02,
			section='Сборка',
			equipment='Конвейер-03',
			reason='Обрыв цепи',
			duration_minutes=55,
			line_id='assembly-1',
			equipment_id=4,
		),
		# Legacy row without FK links: must be resolved by raw section/equipment names
		Downtime(
			record_date=OCT_02,
			section='Сварка',
			equipment='ABB-04',
			reason='Плановое ТО',
			duration_minutes=30,
			line_id=None,
			equipment_id=None,
		),
	],
}


class FakeProductionRepository:
	"""In-memory stand-in for ProductionRepository used by the layout endpoint."""

	def __init__(self, latest: date | None = OCT_02) -> None:
		self.latest = latest

	async def get_latest_record_date(self) -> date | None:
		return self.latest

	async def get_shift_metrics_by_date(self, target_date: date) -> list[ShiftMetric]:
		return METRICS.get(target_date, [])

	async def get_downtimes_by_date(self, target_date: date) -> list[Downtime]:
		return DOWNTIMES.get(target_date, [])

	async def get_lines_with_equipment(self) -> list[ProductionLine]:
		return _build_lines()

	async def get_available_dates(self) -> list[date]:
		return sorted(METRICS.keys())


class TestFactoryLayoutEndpoint(unittest.IsolatedAsyncioTestCase):
	"""HTTP-level tests for GET /api/v1/factory/layout."""

	def use_repo(self, repo: FakeProductionRepository) -> None:
		app.dependency_overrides[get_production_repository] = lambda: repo

	def tearDown(self) -> None:
		app.dependency_overrides.clear()

	async def asgi_get(self, path: str, headers: list | None = None):
		raw_path, _, query = path.partition('?')
		scope = {
			'type': 'http',
			'http_version': '1.1',
			'method': 'GET',
			'scheme': 'http',
			'path': raw_path,
			'raw_path': raw_path.encode(),
			'query_string': query.encode(),
			'headers': [[b'host', b'localhost'], *(headers or [])],
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

	# --- 200 OK ---

	async def test_layout_returns_sections_in_conveyor_order(self):
		self.use_repo(FakeProductionRepository())
		status, data = await self.asgi_get(f'{LAYOUT_URL}?date=2026-10-02')
		self.assertEqual(status, 200)
		self.assertEqual(data['record_date'], '2026-10-02')
		self.assertEqual(
			[s['id'] for s in data['sections']],
			['warehouse-in', 'welding-1', 'painting-1', 'assembly-1', 'qc-1', 'warehouse-out'],
		)
		self.assertEqual(data['sections'][0]['section_type'], 'warehouse')
		self.assertEqual(data['sections'][-1]['section_type'], 'warehouse')

	async def test_layout_section_and_equipment_statuses(self):
		self.use_repo(FakeProductionRepository())
		_, data = await self.asgi_get(f'{LAYOUT_URL}?date=2026-10-02')
		sections = {s['id']: s for s in data['sections']}

		welding = sections['welding-1']
		self.assertEqual(welding['status'], 'warning')  # defect 2.7%
		self.assertEqual(welding['downtime_min'], 30)
		self.assertEqual(welding['metrics']['defect_percent'], 2.7)
		eqs = {e['name']: e for e in welding['equipment']}
		# Equipment without downtimes still appears on the layout
		self.assertEqual(eqs['ABB-01']['status'], 'normal')
		self.assertEqual(eqs['ABB-01']['downtime_min'], 0)
		self.assertEqual(eqs['ABB-01']['downtimes'], [])
		# Legacy downtime row matched by raw equipment name
		self.assertEqual(eqs['ABB-04']['downtime_min'], 30)
		self.assertEqual(eqs['ABB-04']['downtimes'][0]['reason'], 'Плановое ТО')

		self.assertEqual(sections['painting-1']['status'], 'critical')  # defect 5.2%
		self.assertEqual(sections['painting-1']['equipment'][0]['status'], 'normal')

		assembly = sections['assembly-1']
		self.assertEqual(assembly['status'], 'warning')  # downtime 55 min
		self.assertEqual(assembly['equipment'][0]['status'], 'warning')
		self.assertEqual(assembly['equipment'][0]['downtime_min'], 55)

		for section_id in ('warehouse-in', 'qc-1', 'warehouse-out'):
			self.assertEqual(sections[section_id]['status'], 'normal')
			self.assertIsNone(sections[section_id]['metrics'])
			self.assertGreater(len(sections[section_id]['equipment']), 0)

	async def test_layout_defaults_to_latest_date(self):
		self.use_repo(FakeProductionRepository(latest=OCT_02))
		status, data = await self.asgi_get(LAYOUT_URL)
		self.assertEqual(status, 200)
		self.assertEqual(data['record_date'], '2026-10-02')

	# --- 422 validation ---

	async def test_layout_invalid_date_format(self):
		self.use_repo(FakeProductionRepository())
		for bad in ('02.10.2026', 'not-a-date', '2026-13-01', '2026-02-30'):
			with self.subTest(date=bad):
				status, data = await self.asgi_get(f'{LAYOUT_URL}?date={bad}')
				self.assertEqual(status, 422)
				self.assertEqual(data['detail'][0]['loc'], ['query', 'date'])

	# --- 401/403: the API has no authentication layer yet; endpoint is public ---

	async def test_layout_is_public_and_ignores_auth_header(self):
		self.use_repo(FakeProductionRepository())
		status, _ = await self.asgi_get(
			f'{LAYOUT_URL}?date=2026-10-02',
			headers=[[b'authorization', b'Bearer invalid']],
		)
		self.assertEqual(status, 200)

	# --- 404 ---

	async def test_layout_date_without_data(self):
		self.use_repo(FakeProductionRepository())
		status, data = await self.asgi_get(f'{LAYOUT_URL}?date=2030-01-01')
		self.assertEqual(status, 404)
		self.assertEqual(data['detail'], 'No production data for 2030-01-01')

	async def test_layout_empty_database(self):
		self.use_repo(FakeProductionRepository(latest=None))
		status, data = await self.asgi_get(LAYOUT_URL)
		self.assertEqual(status, 404)
		self.assertEqual(data['detail'], 'No production data available')

	# --- GET /api/v1/factory/dates ---

	async def test_available_dates_returns_list(self):
		self.use_repo(FakeProductionRepository())
		status, data = await self.asgi_get('/api/v1/factory/dates')
		self.assertEqual(status, 200)
		self.assertIn('dates', data)
		self.assertIn('latest_date', data)
		self.assertIsInstance(data['dates'], list)
		self.assertTrue(len(data['dates']) >= 1)


if __name__ == '__main__':
	unittest.main()
