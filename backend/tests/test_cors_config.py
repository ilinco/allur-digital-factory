import pytest
from allur_factory.core.config import Settings


def test_cors_origins_default():
	s = Settings(_env_file=None)
	assert s.CORS_ALLOW_ORIGINS == ['http://localhost:5173']


def test_cors_origins_comma_separated(monkeypatch):
	monkeypatch.setenv('CORS_ALLOW_ORIGINS', 'https://example.com, https://app.example.com')
	s = Settings(_env_file=None)
	assert isinstance(s.CORS_ALLOW_ORIGINS, list)
	assert s.CORS_ALLOW_ORIGINS == ['https://example.com', 'https://app.example.com']


def test_cors_origins_json_list(monkeypatch):
	monkeypatch.setenv('CORS_ORIGINS', '["https://example.com", "http://localhost:3000"]')
	s = Settings(_env_file=None)
	assert isinstance(s.CORS_ALLOW_ORIGINS, list)
	assert s.CORS_ALLOW_ORIGINS == ['https://example.com', 'http://localhost:3000']


def test_cors_origins_empty(monkeypatch):
	monkeypatch.setenv('CORS_ALLOW_ORIGINS', '')
	s = Settings(_env_file=None)
	assert isinstance(s.CORS_ALLOW_ORIGINS, list)
	assert s.CORS_ALLOW_ORIGINS == []
