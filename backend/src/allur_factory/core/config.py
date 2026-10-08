from functools import lru_cache

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
	model_config = SettingsConfigDict(
		env_file=('.env', '../.env'),
		env_file_encoding='utf-8',
		case_sensitive=False,
		extra='ignore',
	)

	PROJECT_NAME: str = 'Allur Digital Factory'
	CORS_ALLOW_ORIGINS: list[str] = ['http://localhost:5173']
	DB_ECHO: bool = False

	OPENROUTER_API_KEY: str | None = Field(
		default=None,
		validation_alias=AliasChoices('openrouter_api', 'OPENROUTER_API', 'OPENROUTER_API_KEY'),
	)
	OPENROUTER_MODEL: str = 'nvidia/nemotron-3-ultra-550b-a55b:free'
	OPENROUTER_BASE_URL: str = 'https://openrouter.ai/api/v1'

	user: str = Field(
		default='postgres',
		validation_alias=AliasChoices('POSTGRES_USER', 'DB_USER', 'user', 'USER'),
	)
	password: str = Field(
		default='',
		validation_alias=AliasChoices('POSTGRES_PASSWORD', 'DB_PASSWORD', 'password', 'PASSWORD'),
	)
	host: str = Field(
		default='localhost',
		validation_alias=AliasChoices('POSTGRES_HOST', 'DB_HOST', 'host', 'HOST'),
	)
	port: int = Field(
		default=5432,
		validation_alias=AliasChoices('POSTGRES_PORT', 'DB_PORT', 'port', 'PORT'),
	)
	dbname: str = Field(
		default='postgres',
		validation_alias=AliasChoices('POSTGRES_DB', 'DB_NAME', 'dbname', 'DBNAME'),
	)
	ssl_mode: str = Field(
		default='require',
		validation_alias=AliasChoices('ssl_mode', 'SSL_MODE', 'db_ssl'),
	)

	database_url_custom: str | None = Field(
		default=None,
		validation_alias=AliasChoices('DATABASE_URL', 'database_url'),
	)

	@classmethod
	def settings_customise_sources(
		cls,
		settings_cls,
		init_settings,
		env_settings,
		dotenv_settings,
		file_secret_settings,
	):
		return (init_settings, dotenv_settings, env_settings, file_secret_settings)

	@property
	def database_url(self) -> str:
		if self.database_url_custom:
			return self.database_url_custom
		if self.ssl_mode and self.ssl_mode.lower() not in ('disable', 'off', 'false', 'none'):
			ssl = f'?ssl={self.ssl_mode}'
		else:
			ssl = ''
		return f'postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.dbname}{ssl}'

	@property
	def DATABASE_URL(self) -> str:
		return self.database_url


@lru_cache
def get_settings() -> Settings:
	return Settings()


settings = get_settings()
