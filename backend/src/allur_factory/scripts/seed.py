import argparse
import asyncio
import logging
import unicodedata
import xml.etree.ElementTree as ET
import zipfile
from datetime import date
from pathlib import Path
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from allur_factory.core.database import AsyncSessionLocal
from allur_factory.models import Downtime, MonthlyPlan, ProductionLine, ShiftMetric

logging.basicConfig(
	level=logging.INFO,
	format='[%(asctime)s] %(levelname)s - %(message)s',
	datefmt='%Y-%m-%d %H:%M:%S',
)
logger = logging.getLogger('seed')

LINE_NAME_TO_ID: dict[str, str] = {
	'сварка': 'welding-1',
	'сварка-1': 'welding-1',
	'окраска': 'painting-1',
	'окраска-1': 'painting-1',
	'сборка': 'assembly-1',
	'сборка-1': 'assembly-1',
	'контроль качества': 'qc-1',
	'контроль качества-1': 'qc-1',
	'qc': 'qc-1',
	'qc-1': 'qc-1',
}

DEFAULT_PRODUCTION_LINES: list[dict[str, Any]] = [
	{'id': 'welding-1', 'name': 'Сварка-1', 'step_order': 1},
	{'id': 'painting-1', 'name': 'Окраска-1', 'step_order': 2},
	{'id': 'assembly-1', 'name': 'Сборка-1', 'step_order': 3},
	{'id': 'qc-1', 'name': 'Контроль качества', 'step_order': 4},
]

# Fallback dataset from 케йс_Цифровой_двойник_Тестовые_данные.docx
FALLBACK_SHIFT_METRICS: list[dict[str, Any]] = [
	{
		'record_date': date(2026, 10, 1),
		'line_id': 'welding-1',
		'plan': 120,
		'fact': 118,
		'work_hours': 7.8,
		'load_percent': 98.0,
		'defects_count': 2,
		'defect_percent': 1.7,
	},
	{
		'record_date': date(2026, 10, 1),
		'line_id': 'painting-1',
		'plan': 120,
		'fact': 115,
		'work_hours': 7.5,
		'load_percent': 94.0,
		'defects_count': 4,
		'defect_percent': 3.5,
	},
	{
		'record_date': date(2026, 10, 1),
		'line_id': 'assembly-1',
		'plan': 120,
		'fact': 121,
		'work_hours': 8.0,
		'load_percent': 100.0,
		'defects_count': 1,
		'defect_percent': 0.8,
	},
	{
		'record_date': date(2026, 10, 2),
		'line_id': 'welding-1',
		'plan': 120,
		'fact': 111,
		'work_hours': 7.2,
		'load_percent': 91.0,
		'defects_count': 3,
		'defect_percent': 2.7,
	},
	{
		'record_date': date(2026, 10, 2),
		'line_id': 'painting-1',
		'plan': 120,
		'fact': 116,
		'work_hours': 7.7,
		'load_percent': 96.0,
		'defects_count': 6,
		'defect_percent': 5.2,
	},
	{
		'record_date': date(2026, 10, 2),
		'line_id': 'assembly-1',
		'plan': 120,
		'fact': 119,
		'work_hours': 7.9,
		'load_percent': 99.0,
		'defects_count': 2,
		'defect_percent': 1.7,
	},
]

FALLBACK_DOWNTIMES: list[dict[str, Any]] = [
	{
		'record_date': date(2026, 10, 1),
		'section': 'Сварка',
		'equipment': 'ABB-01',
		'reason': 'Ошибка датчика',
		'duration_minutes': 25,
	},
	{
		'record_date': date(2026, 10, 1),
		'section': 'Окраска',
		'equipment': 'Камера-02',
		'reason': 'Замена фильтра',
		'duration_minutes': 40,
	},
	{
		'record_date': date(2026, 10, 2),
		'section': 'Сборка',
		'equipment': 'Конвейер-03',
		'reason': 'Обрыв цепи',
		'duration_minutes': 55,
	},
	{
		'record_date': date(2026, 10, 2),
		'section': 'Сварка',
		'equipment': 'ABB-04',
		'reason': 'Плановое ТО',
		'duration_minutes': 30,
	},
]

FALLBACK_MONTHLY_PLANS: list[dict[str, Any]] = [
	{'model_name': 'Chevrolet Onix', 'target_monthly': 2500, 'produced_fact': 0},
	{'model_name': 'Chevrolet Cobalt', 'target_monthly': 1800, 'produced_fact': 0},
	{'model_name': 'JAC J7', 'target_monthly': 500, 'produced_fact': 0},
]


def parse_float_ru(val: str) -> float:
	"""Convert number string with comma or dot to float."""
	return float(val.replace(',', '.').strip())


def parse_date_ru(val: str) -> date:
	"""Convert string DD.MM.YYYY to date object."""
	day, month, year = (int(x) for x in val.strip().split('.'))
	return date(year, month, day)


def find_docx_file(custom_path: str | None = None) -> Path | None:
	"""Search for test data docx file across candidate paths."""
	candidates: list[Path] = []
	if custom_path:
		candidates.append(Path(custom_path))

	current_file = Path(__file__).resolve()
	project_root = current_file.parents[3]  # /allur-digital-factory

	# Add project data candidates
	candidates.extend(
		[
			project_root / 'backend' / 'data' / 'Кейс_Цифровой_двойник_Тестовые_данные.docx',
			project_root / 'backend' / 'data' / 'Кейс_Цифровой_двойник_Тестовые_данные.docx',
			project_root / 'data' / 'Кейс_Цифровой_двойник_Тестовые_данные.docx',
			Path('/home/nick/Downloads/Кейс_Цифровой_двойник_Тестовые_данные.docx'),
			Path('/home/nick/Downloads/Кейс_Цифровой_двойник_Тестовые_данные.docx'),
		]
	)

	for cand in candidates:
		if cand.is_file():
			return cand

	# Search in Downloads with unicode normalization
	downloads_dir = Path.home() / 'Downloads'
	if downloads_dir.is_dir():
		for entry in downloads_dir.iterdir():
			if not entry.name.startswith('.~') and entry.suffix.lower() == '.docx':
				norm_name = unicodedata.normalize('NFC', entry.name)
				if 'Цифровой_двойник' in norm_name or 'Тестовые_данные' in norm_name:
					return entry

	return None


def extract_data_from_docx(docx_path: Path) -> dict[str, list[dict[str, Any]]]:
	"""Extract tables from the docx file using standard library zipfile and XML parser."""
	logger.info(f'Reading test data from docx file: {docx_path}')
	with zipfile.ZipFile(docx_path) as z:
		xml_content = z.read('word/document.xml')
		root = ET.fromstring(xml_content)

	ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
	tables = root.findall('.//w:tbl', ns)

	if len(tables) < 4:
		raise ValueError(f'Expected at least 4 tables in docx, found {len(tables)}')

	# Table 1: Lines (Дата, Линия, План, Факт, Время работы, ч, Загрузка, %)
	t1_rows: list[list[str]] = []
	for r in tables[0].findall('.//w:tr', ns):
		cells = [
			''.join([elem.text or '' for elem in c.findall('.//w:t', ns)]).strip()
			for c in r.findall('.//w:tc', ns)
		]
		t1_rows.append(cells)

	# Table 2: Downtimes (Дата, Участок, Оборудование, Причина, Длительность, мин)
	t2_rows: list[list[str]] = []
	for r in tables[1].findall('.//w:tr', ns):
		cells = [
			''.join([elem.text or '' for elem in c.findall('.//w:t', ns)]).strip()
			for c in r.findall('.//w:tc', ns)
		]
		t2_rows.append(cells)

	# Table 3: Monthly plans (Модель, План на месяц)
	t3_rows: list[list[str]] = []
	for r in tables[2].findall('.//w:tr', ns):
		cells = [
			''.join([elem.text or '' for elem in c.findall('.//w:t', ns)]).strip()
			for c in r.findall('.//w:tc', ns)
		]
		t3_rows.append(cells)

	# Table 4: Defects / Quality (Дата, Участок, Выпущено, Брак, % брака)
	t4_rows: list[list[str]] = []
	for r in tables[3].findall('.//w:tr', ns):
		cells = [
			''.join([elem.text or '' for elem in c.findall('.//w:t', ns)]).strip()
			for c in r.findall('.//w:tc', ns)
		]
		t4_rows.append(cells)

	# Map quality metrics by (date, normalized line_id)
	defects_map: dict[tuple[date, str], tuple[int, float]] = {}
	for row in t4_rows[1:]:
		if len(row) < 5 or not row[0]:
			continue
		row_date = parse_date_ru(row[0])
		section_raw = row[1].strip().lower()
		line_id = LINE_NAME_TO_ID.get(section_raw, section_raw)
		defects_count = int(row[3].strip())
		defect_percent = parse_float_ru(row[4])
		defects_map[(row_date, line_id)] = (defects_count, defect_percent)

	shift_metrics: list[dict[str, Any]] = []
	for row in t1_rows[1:]:
		if len(row) < 6 or not row[0]:
			continue
		row_date = parse_date_ru(row[0])
		line_raw = row[1].strip().lower()
		line_id = LINE_NAME_TO_ID.get(line_raw, line_raw)
		plan = int(row[2].strip())
		fact = int(row[3].strip())
		work_hours = parse_float_ru(row[4])
		load_percent = parse_float_ru(row[5])

		def_count, def_pct = defects_map.get((row_date, line_id), (0, 0.0))
		shift_metrics.append(
			{
				'record_date': row_date,
				'line_id': line_id,
				'plan': plan,
				'fact': fact,
				'work_hours': work_hours,
				'load_percent': load_percent,
				'defects_count': def_count,
				'defect_percent': def_pct,
			}
		)

	downtimes: list[dict[str, Any]] = []
	for row in t2_rows[1:]:
		if len(row) < 5 or not row[0]:
			continue
		row_date = parse_date_ru(row[0])
		downtimes.append(
			{
				'record_date': row_date,
				'section': row[1].strip(),
				'equipment': row[2].strip(),
				'reason': row[3].strip(),
				'duration_minutes': int(row[4].strip()),
			}
		)

	monthly_plans: list[dict[str, Any]] = []
	for row in t3_rows[1:]:
		if len(row) < 2 or not row[0]:
			continue
		monthly_plans.append(
			{
				'model_name': row[0].strip(),
				'target_monthly': int(row[1].strip()),
				'produced_fact': 0,
			}
		)

	return {
		'shift_metrics': shift_metrics,
		'downtimes': downtimes,
		'monthly_plans': monthly_plans,
	}


async def seed_database(
	session: AsyncSession,
	clean: bool = True,
	docx_file: str | None = None,
) -> None:
	"""Seed production tables with test dataset."""
	docx_path = find_docx_file(docx_file)
	if docx_path and docx_path.is_file():
		data = extract_data_from_docx(docx_path)
		shift_metrics_data = data['shift_metrics']
		downtimes_data = data['downtimes']
		monthly_plans_data = data['monthly_plans']
		logger.info(
			f'Parsed {len(shift_metrics_data)} shift metrics, '
			f'{len(downtimes_data)} downtimes, '
			f'{len(monthly_plans_data)} monthly plans from docx'
		)
	else:
		logger.warning('Docx file not found, using built-in verified fallback dataset')
		shift_metrics_data = FALLBACK_SHIFT_METRICS
		downtimes_data = FALLBACK_DOWNTIMES
		monthly_plans_data = FALLBACK_MONTHLY_PLANS

	if clean:
		logger.info('Cleaning existing table data...')
		# Delete in reverse foreign-key order
		await session.execute(delete(ShiftMetric))
		await session.execute(delete(Downtime))
		await session.execute(delete(MonthlyPlan))
		await session.execute(delete(ProductionLine))
		await session.flush()

	# 1. Insert Production Lines
	logger.info('Seeding production lines...')
	for line in DEFAULT_PRODUCTION_LINES:
		existing = await session.get(ProductionLine, line['id'])
		if not existing:
			session.add(ProductionLine(**line))
	await session.flush()

	# 2. Insert Shift Metrics
	logger.info('Seeding shift metrics...')
	for metric in shift_metrics_data:
		session.add(ShiftMetric(**metric))
	await session.flush()

	# 3. Insert Downtimes
	logger.info('Seeding downtimes...')
	for dt in downtimes_data:
		session.add(Downtime(**dt))
	await session.flush()

	# 4. Insert Monthly Plans
	logger.info('Seeding monthly plans...')
	for plan in monthly_plans_data:
		session.add(MonthlyPlan(**plan))
	await session.flush()

	await session.commit()
	logger.info('Database commit successful!')

	# Summary
	pl_count = len((await session.execute(select(ProductionLine))).scalars().all())
	sm_count = len((await session.execute(select(ShiftMetric))).scalars().all())
	dt_count = len((await session.execute(select(Downtime))).scalars().all())
	mp_count = len((await session.execute(select(MonthlyPlan))).scalars().all())

	logger.info('=== Seeding Summary ===')
	logger.info(f'Production lines: {pl_count}')
	logger.info(f'Shift metrics:    {sm_count}')
	logger.info(f'Downtimes:        {dt_count}')
	logger.info(f'Monthly plans:    {mp_count}')
	logger.info('========================')


async def run_seed(clean: bool = True, docx_file: str | None = None) -> None:
	async with AsyncSessionLocal() as session:
		await seed_database(session, clean=clean, docx_file=docx_file)


def cli() -> None:
	parser = argparse.ArgumentParser(
		description='Seed Allur Digital Factory database with test data.'
	)
	parser.add_argument(
		'--docx',
		'--file',
		dest='docx_file',
		default=None,
		help='Path to the test data docx file',
	)
	parser.add_argument(
		'--no-clean',
		dest='clean',
		action='store_false',
		default=True,
		help='Do not clear existing table rows before inserting',
	)

	args = parser.parse_args()
	asyncio.run(run_seed(clean=args.clean, docx_file=args.docx_file))


if __name__ == '__main__':
	cli()
