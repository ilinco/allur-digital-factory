"""add_equipment_registry_and_layout

Revision ID: 7c1e2f9a4b3d
Revises: 58baa4fc4dae
Create Date: 2026-10-07 10:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '7c1e2f9a4b3d'
down_revision: str | Sequence[str] | None = '58baa4fc4dae'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# Reference data is inlined on purpose: migrations must not depend on application code.
LAYOUT_LINES: list[dict[str, object]] = [
	{'id': 'warehouse-in', 'name': 'Склад комплектующих', 'step_order': 1, 'type': 'warehouse'},
	{'id': 'welding-1', 'name': 'Сварка-1', 'step_order': 2, 'type': 'process'},
	{'id': 'painting-1', 'name': 'Окраска-1', 'step_order': 3, 'type': 'process'},
	{'id': 'assembly-1', 'name': 'Сборка-1', 'step_order': 4, 'type': 'process'},
	{'id': 'qc-1', 'name': 'Контроль качества', 'step_order': 5, 'type': 'process'},
	{
		'id': 'warehouse-out',
		'name': 'Склад готовой продукции',
		'step_order': 6,
		'type': 'warehouse',
	},
]

LEGACY_STEP_ORDER: dict[str, int] = {
	'welding-1': 1,
	'painting-1': 2,
	'assembly-1': 3,
	'qc-1': 4,
}

EQUIPMENT: list[dict[str, str]] = [
	# 1. Склад комплектующих
	{'name': 'Ричтрак Jungheinrich ETV-216', 'line_id': 'warehouse-in', 'type': 'reach_truck'},
	{'name': 'Транспортировщик AGV-01', 'line_id': 'warehouse-in', 'type': 'agv_tugger'},
	{'name': 'Конвейер приемки паллет', 'line_id': 'warehouse-in', 'type': 'pallet_conveyor'},
	{'name': 'RFID-портал учета деталей', 'line_id': 'warehouse-in', 'type': 'rfid_scanner'},
	# 2. Сварка
	{'name': 'ABB-01', 'line_id': 'welding-1', 'type': 'welding_robot'},
	{'name': 'ABB-04', 'line_id': 'welding-1', 'type': 'welding_robot'},
	{'name': 'KUKA Quantec KR-210', 'line_id': 'welding-1', 'type': 'welding_robot'},
	{'name': 'Сварочный кондуктор Geo-Jig', 'line_id': 'welding-1', 'type': 'welding_jig'},
	# 3. Окраска
	{'name': 'Камера-02', 'line_id': 'painting-1', 'type': 'paint_booth'},
	{'name': 'Робот окраски Dürr EcoRP', 'line_id': 'painting-1', 'type': 'painting_robot'},
	{'name': 'Сушильная камера печи', 'line_id': 'painting-1', 'type': 'drying_oven'},
	{'name': 'Ванна катафореза KTL', 'line_id': 'painting-1', 'type': 'cataphoretic_bath'},
	# 4. Сборка
	{'name': 'Конвейер-03', 'line_id': 'assembly-1', 'type': 'conveyor'},
	{'name': 'Станция стыковки «Свадьба»', 'line_id': 'assembly-1', 'type': 'marriage_station'},
	{
		'name': 'Манипулятор остекления Dalmec',
		'line_id': 'assembly-1',
		'type': 'assembly_manipulator',
	},
	{
		'name': 'Винтовертный комплекс Atlas Copco',
		'line_id': 'assembly-1',
		'type': 'torquing_system',
	},
	# 5. Контроль качества
	{'name': 'Световой тоннель аудита ЛКП', 'line_id': 'qc-1', 'type': 'inspection_light_tunnel'},
	{'name': 'КИМ Hexagon Global CMM', 'line_id': 'qc-1', 'type': 'cmm_scanner'},
	{'name': 'Тормозной стенд Maha IW4', 'line_id': 'qc-1', 'type': 'brake_test_bench'},
	{'name': 'Камера дождевания Shower Test', 'line_id': 'qc-1', 'type': 'water_leak_test_booth'},
	{'name': 'Стенд регулировки фар и ADAS', 'line_id': 'qc-1', 'type': 'adas_calibration_bench'},
	# 6. Склад готовой продукции
	{'name': 'Пост финишного контроля PDI', 'line_id': 'warehouse-out', 'type': 'pdi_station'},
	{'name': 'Скан-портал VIN-кодов', 'line_id': 'warehouse-out', 'type': 'vin_dispatch_gate'},
	{'name': 'Электротягач перемещения авто', 'line_id': 'warehouse-out', 'type': 'vehicle_mover'},
	{'name': 'Рампа погрузки на автовозы', 'line_id': 'warehouse-out', 'type': 'loading_dock'},
]

SECTION_TO_LINE: dict[str, str] = {
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
	'склад комплектующих': 'warehouse-in',
	'склад готовой продукции': 'warehouse-out',
}


def upgrade() -> None:
	"""Upgrade schema."""
	op.add_column(
		'production_lines',
		sa.Column('section_type', sa.String(length=20), server_default='process', nullable=False),
	)

	op.create_table(
		'equipment',
		sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
		sa.Column('name', sa.String(length=100), nullable=False),
		sa.Column('line_id', sa.String(length=50), nullable=False),
		sa.Column('equipment_type', sa.String(length=50), nullable=False),
		sa.ForeignKeyConstraint(
			['line_id'],
			['production_lines.id'],
			name=op.f('fk_equipment_line_id_production_lines'),
		),
		sa.PrimaryKeyConstraint('id', name=op.f('pk_equipment')),
		sa.UniqueConstraint('name', name=op.f('uq_equipment_name')),
	)
	op.create_index(op.f('ix_equipment_line_id'), 'equipment', ['line_id'], unique=False)

	op.add_column('downtimes', sa.Column('line_id', sa.String(length=50), nullable=True))
	op.add_column('downtimes', sa.Column('equipment_id', sa.Integer(), nullable=True))
	op.create_index(op.f('ix_downtimes_line_id'), 'downtimes', ['line_id'], unique=False)
	op.create_index(op.f('ix_downtimes_equipment_id'), 'downtimes', ['equipment_id'], unique=False)
	op.create_foreign_key(
		op.f('fk_downtimes_line_id_production_lines'),
		'downtimes',
		'production_lines',
		['line_id'],
		['id'],
	)
	op.create_foreign_key(
		op.f('fk_downtimes_equipment_id_equipment'),
		'downtimes',
		'equipment',
		['equipment_id'],
		['id'],
	)

	conn = op.get_bind()

	# Upsert layout sections; existing line names are preserved.
	for line in LAYOUT_LINES:
		conn.execute(
			sa.text(
				'INSERT INTO production_lines (id, name, step_order, section_type) '
				'VALUES (:id, :name, :step_order, :type) '
				'ON CONFLICT (id) DO UPDATE '
				'SET step_order = EXCLUDED.step_order, section_type = EXCLUDED.section_type'
			),
			line,
		)

	for item in EQUIPMENT:
		conn.execute(
			sa.text(
				'INSERT INTO equipment (name, line_id, equipment_type) '
				'VALUES (:name, :line_id, :type) ON CONFLICT (name) DO NOTHING'
			),
			item,
		)

	# Backfill FK links for already loaded downtimes.
	for section, line_id in SECTION_TO_LINE.items():
		conn.execute(
			sa.text(
				'UPDATE downtimes SET line_id = :line_id '
				'WHERE line_id IS NULL AND lower(trim(section)) = :section'
			),
			{'line_id': line_id, 'section': section},
		)
	conn.execute(
		sa.text(
			'UPDATE downtimes AS d SET equipment_id = e.id '
			'FROM equipment AS e WHERE d.equipment_id IS NULL AND trim(d.equipment) = e.name'
		)
	)


def downgrade() -> None:
	"""Downgrade schema."""
	op.drop_constraint(op.f('fk_downtimes_equipment_id_equipment'), 'downtimes', type_='foreignkey')
	op.drop_constraint(
		op.f('fk_downtimes_line_id_production_lines'), 'downtimes', type_='foreignkey'
	)
	op.drop_index(op.f('ix_downtimes_equipment_id'), table_name='downtimes')
	op.drop_index(op.f('ix_downtimes_line_id'), table_name='downtimes')
	op.drop_column('downtimes', 'equipment_id')
	op.drop_column('downtimes', 'line_id')

	op.drop_index(op.f('ix_equipment_line_id'), table_name='equipment')
	op.drop_table('equipment')

	conn = op.get_bind()
	conn.execute(
		sa.text(
			"DELETE FROM production_lines WHERE id IN ('warehouse-in', 'warehouse-out') "
			'AND NOT EXISTS (SELECT 1 FROM shift_metrics s WHERE s.line_id = production_lines.id)'
		)
	)
	for line_id, step_order in LEGACY_STEP_ORDER.items():
		conn.execute(
			sa.text('UPDATE production_lines SET step_order = :step_order WHERE id = :id'),
			{'id': line_id, 'step_order': step_order},
		)

	op.drop_column('production_lines', 'section_type')
