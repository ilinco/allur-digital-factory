from sqlalchemy import Column, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from allur_factory.models import Base


class ProductionLine(Base):
	"""Справочник участков конвейера: Сварка, Окраска, Сборка, QC"""

	__tablename__ = 'production_lines'

	id = Column(String(50), primary_key=True)  # 'welding-1', 'painting-1', 'assembly-1', 'qc-1'
	name = Column(String(100), nullable=False)  # 'Сварка-1', 'Окраска-1'
	step_order = Column(Integer, nullable=False)  # Порядок на конвейере: 1, 2, 3...

	shift_metrics = relationship('ShiftMetric', back_populates='line')


class ShiftMetric(Base):
	"""Суточные/сменные метрики выпуска и брака"""

	__tablename__ = 'shift_metrics'

	id = Column(Integer, primary_key=True, autoincrement=True)
	record_date = Column(Date, nullable=False, index=True)
	line_id = Column(String(50), ForeignKey('production_lines.id'), nullable=False)

	plan = Column(Integer, default=120)  # План смены
	fact = Column(Integer, nullable=False)  # Факт выпуска
	work_hours = Column(Float, nullable=False)  # Отработано часов
	load_percent = Column(Float, nullable=False)  # Загрузка оборудования, %
	defects_count = Column(Integer, default=0)  # Количество брака
	defect_percent = Column(Float, default=0.0)  # % брака (лимит <= 2.0%)

	line = relationship('ProductionLine', back_populates='shift_metrics')


class Downtime(Base):
	"""Журнал простоев оборудования"""

	__tablename__ = 'downtimes'

	id = Column(Integer, primary_key=True, autoincrement=True)
	record_date = Column(Date, nullable=False, index=True)
	section = Column(String(100), nullable=False)  # 'Сварка', 'Окраска', 'Сборка'
	equipment = Column(String(100), nullable=False)  # 'ABB-01', 'Камера-02', 'Конвейер-03'
	reason = Column(String(255), nullable=False)  # 'Ошибка датчика', 'Обрыв цепи'
	duration_minutes = Column(Integer, nullable=False)  # Лимит <= 60 мин/сутки


class MonthlyPlan(Base):
	"""План/факт выпуска по моделям авто"""

	__tablename__ = 'monthly_plans'

	id = Column(Integer, primary_key=True, autoincrement=True)
	model_name = Column(
		String(100), unique=True, nullable=False
	)  # 'Chevrolet Onix', 'Cobalt', 'JAC J7'
	target_monthly = Column(Integer, nullable=False)  # Месячный таргет (сумма >= 5500)
	produced_fact = Column(Integer, default=0)  # Текущий факт
