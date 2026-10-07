from collections.abc import Sequence
from datetime import date

from allur_factory.models import Downtime, Equipment, MonthlyPlan, ProductionLine, ShiftMetric

OCT_01 = date(2026, 10, 1)
OCT_02 = date(2026, 10, 2)


def build_test_lines() -> list[ProductionLine]:
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


def build_test_metrics() -> dict[date, list[ShiftMetric]]:
	return {
		OCT_02: [
			ShiftMetric(
				id=1,
				record_date=OCT_02,
				line_id='welding-1',
				plan=120,
				fact=111,
				work_hours=7.2,
				load_percent=91.0,
				defects_count=3,
				defect_percent=2.7,
			),
			ShiftMetric(
				id=2,
				record_date=OCT_02,
				line_id='painting-1',
				plan=120,
				fact=116,
				work_hours=7.7,
				load_percent=96.0,
				defects_count=6,
				defect_percent=5.2,
			),
			ShiftMetric(
				id=3,
				record_date=OCT_02,
				line_id='assembly-1',
				plan=120,
				fact=119,
				work_hours=7.9,
				load_percent=99.0,
				defects_count=2,
				defect_percent=1.7,
			),
		],
	}


def build_test_downtimes() -> list[Downtime]:
	return [
		Downtime(
			id=1,
			record_date=OCT_02,
			section='Сборка-1',
			equipment='Конвейер-03',
			reason='Обрыв цепи',
			duration_minutes=55,
			line_id='assembly-1',
			equipment_id=4,
		),
		Downtime(
			id=2,
			record_date=OCT_02,
			section='Сварка-1',
			equipment='ABB-04',
			reason='Плановое ТО',
			duration_minutes=30,
			line_id='welding-1',
			equipment_id=2,
		),
	]


class FakeProductionRepository:
	"""In-memory stand-in for ProductionRepository covering all methods for unit and endpoint tests."""

	def __init__(self, latest: date | None = OCT_02) -> None:
		self.latest = latest
		self.lines = build_test_lines()
		self.metrics_by_date = build_test_metrics()
		self.downtimes: list[Downtime] = build_test_downtimes()
		self.next_dt_id = 100
		self.next_metric_id = 100

	async def get_lines(self) -> Sequence[ProductionLine]:
		return self.lines

	async def get_line_by_id(self, line_id: str) -> ProductionLine | None:
		for line in self.lines:
			if line.id == line_id:
				return line
		return None

	async def get_lines_with_equipment(self) -> Sequence[ProductionLine]:
		return self.lines

	async def get_equipment_by_id(self, equipment_id: int) -> Equipment | None:
		for line in self.lines:
			for eq in line.equipment:
				if eq.id == equipment_id:
					return eq
		return None

	async def get_equipment_by_line(self, line_id: str) -> Sequence[Equipment]:
		for line in self.lines:
			if line.id == line_id:
				return line.equipment
		return []

	async def get_shift_metrics_by_date(self, target_date: date) -> Sequence[ShiftMetric]:
		return self.metrics_by_date.get(target_date, [])

	async def get_shift_metric_for_line(
		self, line_id: str, target_date: date
	) -> ShiftMetric | None:
		metrics = self.metrics_by_date.get(target_date, [])
		for m in metrics:
			if m.line_id == line_id:
				return m
		return None

	async def add_or_update_shift_metric(self, metric: ShiftMetric) -> ShiftMetric:
		if metric.id is None:
			metric.id = self.next_metric_id
			self.next_metric_id += 1
		metrics = self.metrics_by_date.setdefault(metric.record_date, [])
		for idx, m in enumerate(metrics):
			if m.line_id == metric.line_id:
				metrics[idx] = metric
				return metric
		metrics.append(metric)
		return metric

	async def get_downtimes_by_date(self, target_date: date) -> Sequence[Downtime]:
		return [d for d in self.downtimes if d.record_date == target_date]

	async def add_downtime(self, downtime: Downtime) -> Downtime:
		if downtime.id is None:
			downtime.id = self.next_dt_id
			self.next_dt_id += 1
		self.downtimes.append(downtime)
		return downtime

	async def delete_simulation_downtimes(self, target_date: date | None = None) -> int:
		before = len(self.downtimes)
		self.downtimes = [
			d
			for d in self.downtimes
			if not (
				d.reason.startswith('[SIMULATION]')
				and (target_date is None or d.record_date == target_date)
			)
		]
		return before - len(self.downtimes)

	async def get_monthly_plans(self) -> Sequence[MonthlyPlan]:
		return [
			MonthlyPlan(id=1, model_name='Chevrolet Onix', target_monthly=2500, produced_fact=1120),
			MonthlyPlan(
				id=2, model_name='Chevrolet Cobalt', target_monthly=1800, produced_fact=940
			),
			MonthlyPlan(id=3, model_name='JAC J7', target_monthly=500, produced_fact=260),
		]

	async def get_latest_record_date(self) -> date | None:
		return self.latest

	async def commit(self) -> None:
		pass

	async def rollback(self) -> None:
		pass
