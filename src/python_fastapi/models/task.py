from sqlalchemy.orm import Mapped, mapped_column

from python_fastapi.models.base import Base


class TaskModel(Base):
	__tablename__ = 'tasks'

	title: Mapped[str]
	completed: Mapped[bool] = mapped_column(default=False)
