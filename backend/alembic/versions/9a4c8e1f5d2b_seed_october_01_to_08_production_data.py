"""seed_october_01_to_08_production_data

Revision ID: 9a4c8e1f5d2b
Revises: 7c1e2f9a4b3d
Create Date: 2026-10-08 11:00:00.000000

"""

from collections.abc import Sequence
from datetime import date

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '9a4c8e1f5d2b'
down_revision: str | Sequence[str] | None = '7c1e2f9a4b3d'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# Production data from 2026-10-01 to 2026-10-08
SHIFT_METRICS_DATA = [
	# 2026-10-01
	{'record_date': date(2026, 10, 1), 'line_id': 'welding-1', 'plan': 120, 'fact': 118, 'work_hours': 7.8, 'load_percent': 98.0, 'defects_count': 2, 'defect_percent': 1.7},
	{'record_date': date(2026, 10, 1), 'line_id': 'painting-1', 'plan': 120, 'fact': 115, 'work_hours': 7.5, 'load_percent': 94.0, 'defects_count': 4, 'defect_percent': 3.5},
	{'record_date': date(2026, 10, 1), 'line_id': 'assembly-1', 'plan': 120, 'fact': 121, 'work_hours': 8.0, 'load_percent': 100.0, 'defects_count': 1, 'defect_percent': 0.8},

	# 2026-10-02
	{'record_date': date(2026, 10, 2), 'line_id': 'welding-1', 'plan': 120, 'fact': 111, 'work_hours': 7.2, 'load_percent': 91.0, 'defects_count': 3, 'defect_percent': 2.7},
	{'record_date': date(2026, 10, 2), 'line_id': 'painting-1', 'plan': 120, 'fact': 116, 'work_hours': 7.7, 'load_percent': 96.0, 'defects_count': 6, 'defect_percent': 5.2},
	{'record_date': date(2026, 10, 2), 'line_id': 'assembly-1', 'plan': 120, 'fact': 119, 'work_hours': 7.9, 'load_percent': 99.0, 'defects_count': 2, 'defect_percent': 1.7},

	# 2026-10-03
	{'record_date': date(2026, 10, 3), 'line_id': 'welding-1', 'plan': 120, 'fact': 115, 'work_hours': 7.6, 'load_percent': 95.0, 'defects_count': 2, 'defect_percent': 1.7},
	{'record_date': date(2026, 10, 3), 'line_id': 'painting-1', 'plan': 120, 'fact': 108, 'work_hours': 7.0, 'load_percent': 89.0, 'defects_count': 7, 'defect_percent': 6.5},
	{'record_date': date(2026, 10, 3), 'line_id': 'assembly-1', 'plan': 120, 'fact': 112, 'work_hours': 7.4, 'load_percent': 93.0, 'defects_count': 3, 'defect_percent': 2.7},

	# 2026-10-04
	{'record_date': date(2026, 10, 4), 'line_id': 'welding-1', 'plan': 120, 'fact': 120, 'work_hours': 8.0, 'load_percent': 100.0, 'defects_count': 1, 'defect_percent': 0.8},
	{'record_date': date(2026, 10, 4), 'line_id': 'painting-1', 'plan': 120, 'fact': 119, 'work_hours': 7.9, 'load_percent': 99.0, 'defects_count': 2, 'defect_percent': 1.7},
	{'record_date': date(2026, 10, 4), 'line_id': 'assembly-1', 'plan': 120, 'fact': 120, 'work_hours': 8.0, 'load_percent': 100.0, 'defects_count': 1, 'defect_percent': 0.8},

	# 2026-10-05
	{'record_date': date(2026, 10, 5), 'line_id': 'welding-1', 'plan': 120, 'fact': 117, 'work_hours': 7.7, 'load_percent': 97.0, 'defects_count': 2, 'defect_percent': 1.7},
	{'record_date': date(2026, 10, 5), 'line_id': 'painting-1', 'plan': 120, 'fact': 116, 'work_hours': 7.7, 'load_percent': 96.0, 'defects_count': 3, 'defect_percent': 2.6},
	{'record_date': date(2026, 10, 5), 'line_id': 'assembly-1', 'plan': 120, 'fact': 118, 'work_hours': 7.8, 'load_percent': 98.0, 'defects_count': 2, 'defect_percent': 1.7},

	# 2026-10-06
	{'record_date': date(2026, 10, 6), 'line_id': 'welding-1', 'plan': 120, 'fact': 114, 'work_hours': 7.5, 'load_percent': 94.0, 'defects_count': 3, 'defect_percent': 2.6},
	{'record_date': date(2026, 10, 6), 'line_id': 'painting-1', 'plan': 120, 'fact': 117, 'work_hours': 7.8, 'load_percent': 97.0, 'defects_count': 2, 'defect_percent': 1.7},
	{'record_date': date(2026, 10, 6), 'line_id': 'assembly-1', 'plan': 120, 'fact': 113, 'work_hours': 7.4, 'load_percent': 93.0, 'defects_count': 2, 'defect_percent': 1.8},

	# 2026-10-07
	{'record_date': date(2026, 10, 7), 'line_id': 'welding-1', 'plan': 120, 'fact': 119, 'work_hours': 7.9, 'load_percent': 99.0, 'defects_count': 1, 'defect_percent': 0.8},
	{'record_date': date(2026, 10, 7), 'line_id': 'painting-1', 'plan': 120, 'fact': 118, 'work_hours': 7.8, 'load_percent': 98.0, 'defects_count': 2, 'defect_percent': 1.7},
	{'record_date': date(2026, 10, 7), 'line_id': 'assembly-1', 'plan': 120, 'fact': 119, 'work_hours': 7.9, 'load_percent': 99.0, 'defects_count': 1, 'defect_percent': 0.8},

	# 2026-10-08 (Сегодня)
	{'record_date': date(2026, 10, 8), 'line_id': 'welding-1', 'plan': 120, 'fact': 116, 'work_hours': 7.7, 'load_percent': 96.0, 'defects_count': 2, 'defect_percent': 1.7},
	{'record_date': date(2026, 10, 8), 'line_id': 'painting-1', 'plan': 120, 'fact': 114, 'work_hours': 7.5, 'load_percent': 94.0, 'defects_count': 4, 'defect_percent': 3.5},
	{'record_date': date(2026, 10, 8), 'line_id': 'assembly-1', 'plan': 120, 'fact': 115, 'work_hours': 7.6, 'load_percent': 95.0, 'defects_count': 2, 'defect_percent': 1.7},
]

DOWNTIMES_DATA = [
	# 2026-10-01
	{'record_date': date(2026, 10, 1), 'section': 'Сварка-1', 'line_id': 'welding-1', 'equipment': 'ABB-01', 'reason': 'Ошибка датчика', 'duration_minutes': 25},
	{'record_date': date(2026, 10, 1), 'section': 'Окраска-1', 'line_id': 'painting-1', 'equipment': 'Камера-02', 'reason': 'Замена фильтра', 'duration_minutes': 40},

	# 2026-10-02
	{'record_date': date(2026, 10, 2), 'section': 'Сборка-1', 'line_id': 'assembly-1', 'equipment': 'Конвейер-03', 'reason': 'Обрыв цепи', 'duration_minutes': 55},
	{'record_date': date(2026, 10, 2), 'section': 'Сварка-1', 'line_id': 'welding-1', 'equipment': 'ABB-04', 'reason': 'Плановое ТО', 'duration_minutes': 30},

	# 2026-10-03
	{'record_date': date(2026, 10, 3), 'section': 'Окраска-1', 'line_id': 'painting-1', 'equipment': 'Ванна катафореза KTL', 'reason': 'Коррекция pH электролита', 'duration_minutes': 45},
	{'record_date': date(2026, 10, 3), 'section': 'Окраска-1', 'line_id': 'painting-1', 'equipment': 'Робот окраски Dürr EcoRP', 'reason': 'Засорение сопла распылителя', 'duration_minutes': 25},

	# 2026-10-04
	{'record_date': date(2026, 10, 4), 'section': 'Сборка-1', 'line_id': 'assembly-1', 'equipment': 'Винтовертный комплекс Atlas Copco', 'reason': 'Калибровка тензодатчика', 'duration_minutes': 15},

	# 2026-10-05
	{'record_date': date(2026, 10, 5), 'section': 'Сварка-1', 'line_id': 'welding-1', 'equipment': 'KUKA Quantec KR-210', 'reason': 'Смена электродов контактной сварки', 'duration_minutes': 20},
	{'record_date': date(2026, 10, 5), 'section': 'Сборка-1', 'line_id': 'assembly-1', 'equipment': 'Манипулятор остекления Dalmec', 'reason': 'Замена вакуумного захвата', 'duration_minutes': 25},

	# 2026-10-06
	{'record_date': date(2026, 10, 6), 'section': 'Сборка-1', 'line_id': 'assembly-1', 'equipment': 'Станция стыковки «Свадьба»', 'reason': 'Сбой позиционирования шасси', 'duration_minutes': 50},
	{'record_date': date(2026, 10, 6), 'section': 'Сварка-1', 'line_id': 'welding-1', 'equipment': 'Сварочный кондуктор Geo-Jig', 'reason': 'Регулировка пневмоприжима', 'duration_minutes': 20},

	# 2026-10-07
	{'record_date': date(2026, 10, 7), 'section': 'Окраска-1', 'line_id': 'painting-1', 'equipment': 'Сушильная камера печи', 'reason': 'Контроль температурного профиля', 'duration_minutes': 20},

	# 2026-10-08
	{'record_date': date(2026, 10, 8), 'section': 'Сборка-1', 'line_id': 'assembly-1', 'equipment': 'Конвейер-03', 'reason': 'Предупредительная смазка редуктора', 'duration_minutes': 25},
	{'record_date': date(2026, 10, 8), 'section': 'Окраска-1', 'line_id': 'painting-1', 'equipment': 'Камера-02', 'reason': 'Очистка сопел распыла грунта', 'duration_minutes': 30},
]

MONTHLY_PLANS_DATA = [
	{'model_name': 'Chevrolet Onix', 'target_monthly': 2500, 'produced_fact': 648},
	{'model_name': 'Chevrolet Cobalt', 'target_monthly': 1800, 'produced_fact': 468},
	{'model_name': 'JAC J7', 'target_monthly': 500, 'produced_fact': 132},
]


def upgrade() -> None:
	conn = op.get_bind()

	# Clean up any manual test / rogue downtimes on 2026-10-01
	conn.execute(
		sa.text("DELETE FROM downtimes WHERE record_date = '2026-10-01' AND reason LIKE '%Поломка камеры%'")
	)

	# Delete existing metrics in the target range to avoid duplicates, then insert cleanly
	conn.execute(
		sa.text("DELETE FROM shift_metrics WHERE record_date >= '2026-10-01' AND record_date <= '2026-10-08'")
	)
	for m in SHIFT_METRICS_DATA:
		conn.execute(
			sa.text(
				"INSERT INTO shift_metrics (record_date, line_id, plan, fact, work_hours, load_percent, defects_count, defect_percent) "
				"VALUES (:record_date, :line_id, :plan, :fact, :work_hours, :load_percent, :defects_count, :defect_percent)"
			),
			m,
		)

	# Delete existing downtimes in range 2026-10-01 to 2026-10-08, then re-seed
	conn.execute(
		sa.text("DELETE FROM downtimes WHERE record_date >= '2026-10-01' AND record_date <= '2026-10-08'")
	)

	# Equipment ID lookup map
	eq_rows = conn.execute(sa.text("SELECT id, name FROM equipment")).fetchall()
	eq_map = {row[1]: row[0] for row in eq_rows}

	for dt in DOWNTIMES_DATA:
		dt_row = dict(dt)
		dt_row['equipment_id'] = eq_map.get(dt['equipment'])
		conn.execute(
			sa.text(
				"INSERT INTO downtimes (record_date, section, line_id, equipment, equipment_id, reason, duration_minutes) "
				"VALUES (:record_date, :section, :line_id, :equipment, :equipment_id, :reason, :duration_minutes)"
			),
			dt_row,
		)

	# Update monthly plans
	for mp in MONTHLY_PLANS_DATA:
		conn.execute(
			sa.text(
				"UPDATE monthly_plans SET target_monthly = :target_monthly, produced_fact = :produced_fact "
				"WHERE model_name = :model_name"
			),
			mp,
		)


def downgrade() -> None:
	conn = op.get_bind()
	conn.execute(
		sa.text("DELETE FROM shift_metrics WHERE record_date > '2026-10-02' AND record_date <= '2026-10-08'")
	)
	conn.execute(
		sa.text("DELETE FROM downtimes WHERE record_date > '2026-10-02' AND record_date <= '2026-10-08'")
	)
	for mp in MONTHLY_PLANS_DATA:
		conn.execute(
			sa.text("UPDATE monthly_plans SET produced_fact = 0 WHERE model_name = :model_name"),
			mp,
		)
