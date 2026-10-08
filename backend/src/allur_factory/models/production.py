from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from allur_factory.models.base import Base
from allur_factory.schemas.factory import SectionType

SECTION_TYPE_PROCESS: SectionType = 'process'
SECTION_TYPE_WAREHOUSE: SectionType = 'warehouse'


class ProductionLine(Base):
	"""Справочник участков: Склад комплектующих, Сварка, Окраска, Сборка, QC, Склад ГП"""

	__tablename__ = 'production_lines'

	id: Mapped[str] = mapped_column(String(50), primary_key=True)
	name: Mapped[str] = mapped_column(String(100), nullable=False)
	step_order: Mapped[int] = mapped_column(Integer, nullable=False)
	section_type: Mapped[str] = mapped_column(
		String(20),
		nullable=False,
		default=SECTION_TYPE_PROCESS,
		server_default=SECTION_TYPE_PROCESS,
	)

	shift_metrics: Mapped[list['ShiftMetric']] = relationship('ShiftMetric', back_populates='line')
	equipment: Mapped[list['Equipment']] = relationship(
		'Equipment', back_populates='line', order_by='Equipment.name'
	)


class Equipment(Base):
	"""Справочник оборудования, привязанного к участку"""

	__tablename__ = 'equipment'

	id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
	name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
	line_id: Mapped[str] = mapped_column(
		String(50), ForeignKey('production_lines.id'), nullable=False, index=True
	)
	equipment_type: Mapped[str] = mapped_column(String(50), nullable=False)

	line: Mapped['ProductionLine'] = relationship('ProductionLine', back_populates='equipment')


class ShiftMetric(Base):
	"""Суточные/сменные метрики выпуска и брака"""

	__tablename__ = 'shift_metrics'

	id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
	record_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
	line_id: Mapped[str] = mapped_column(
		String(50), ForeignKey('production_lines.id'), nullable=False
	)

	plan: Mapped[int | None] = mapped_column(Integer, default=120, nullable=True)
	fact: Mapped[int] = mapped_column(Integer, nullable=False)
	work_hours: Mapped[float] = mapped_column(Float, nullable=False)
	load_percent: Mapped[float] = mapped_column(Float, nullable=False)
	defects_count: Mapped[int | None] = mapped_column(Integer, default=0, nullable=True)
	defect_percent: Mapped[float | None] = mapped_column(Float, default=0.0, nullable=True)

	line: Mapped['ProductionLine'] = relationship('ProductionLine', back_populates='shift_metrics')


class Downtime(Base):
	"""Журнал простоев оборудования"""

	__tablename__ = 'downtimes'

	id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
	record_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
	section: Mapped[str] = mapped_column(String(100), nullable=False)
	equipment: Mapped[str] = mapped_column(String(100), nullable=False)
	reason: Mapped[str] = mapped_column(String(255), nullable=False)
	duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
	line_id: Mapped[str | None] = mapped_column(
		String(50), ForeignKey('production_lines.id'), nullable=True, index=True
	)
	equipment_id: Mapped[int | None] = mapped_column(
		Integer, ForeignKey('equipment.id'), nullable=True, index=True
	)


class MonthlyPlan(Base):
	"""План/факт выпуска по моделям авто"""

	__tablename__ = 'monthly_plans'

	id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
	model_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
	target_monthly: Mapped[int] = mapped_column(Integer, nullable=False)
	produced_fact: Mapped[int | None] = mapped_column(Integer, default=0, nullable=True)
