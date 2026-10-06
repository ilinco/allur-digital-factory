class AppException(Exception):
	"""Base application exception."""

	def __init__(self, message: str, status_code: int = 500) -> None:
		self.message = message
		self.status_code = status_code
		super().__init__(message)


class NotFoundException(AppException):
	"""Resource not found exception."""

	def __init__(self, message: str = 'Resource not found') -> None:
		super().__init__(message=message, status_code=404)


class BadRequestException(AppException):
	"""Bad request exception."""

	def __init__(self, message: str = 'Bad request') -> None:
		super().__init__(message=message, status_code=400)


class UnauthorizedException(AppException):
	"""Unauthorized access exception."""

	def __init__(self, message: str = 'Unauthorized') -> None:
		super().__init__(message=message, status_code=401)


class ForbiddenException(AppException):
	"""Forbidden access exception."""

	def __init__(self, message: str = 'Forbidden') -> None:
		super().__init__(message=message, status_code=403)
