from functools import lru_cache

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
	model_config = SettingsConfigDict(
		env_file='.env',
		env_file_encoding='utf-8',
		case_sensitive=True,
		extra='ignore',
	)

	PROJECT_NAME: str = 'Python FastAPI App'
	CORS_ALLOW_ORIGINS: list[str] = ['']
	DB_ECHO: bool = False

	user: str = Field(
		default='postgres', validation_alias=AliasChoices('user', 'POSTGRES_USER', 'DB_USER')
	)
	password: str = Field(
		default='', validation_alias=AliasChoices('password', 'POSTGRES_PASSWORD', 'DB_PASSWORD')
	)
	host: str = Field(
		default='localhost', validation_alias=AliasChoices('host', 'POSTGRES_HOST', 'DB_HOST')
	)
	port: int = Field(
		default=5432, validation_alias=AliasChoices('port', 'POSTGRES_PORT', 'DB_PORT')
	)
	dbname: str = Field(
		default='postgres', validation_alias=AliasChoices('dbname', 'POSTGRES_DB', 'DB_NAME')
	)
	ssl_mode: str = Field(
		default='require', validation_alias=AliasChoices('ssl_mode', 'SSL_MODE', 'db_ssl')
	)

	database_url_custom: str | None = Field(
		default=None,
		validation_alias=AliasChoices('DATABASE_URL', 'database_url'),
	)

	@property
	def database_url(self) -> str:
		if self.database_url_custom:
			return self.database_url_custom
		ssl = f'?ssl={self.ssl_mode}' if self.ssl_mode else ''
		return f'postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.dbname}{ssl}'

	@property
	def DATABASE_URL(self) -> str:
		return self.database_url


@lru_cache
def get_settings() -> Settings:
	return Settings()


settings = get_settings()
