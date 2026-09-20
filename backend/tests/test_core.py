import pytest

from app.core.config import Settings, normalize_database_url
from app.core.phone import normalize_moroccan_phone
from app.core.security import sha256_pii
from app.services.catalog import calculate_total


def test_normalizes_easypanel_postgres_url() -> None:
    assert normalize_database_url("postgres://u:p@host/melssybeauty?sslmode=disable") == "postgresql+asyncpg://u:p@host/melssybeauty"


def test_production_rejects_sqlite_database() -> None:
    with pytest.raises(ValueError, match="must point to PostgreSQL"):
        Settings(
            environment="production",
            database_url="sqlite+aiosqlite:///./wrong.db",
            cors_origins="https://melssy.beauty",
        )


def test_database_name_is_available_for_diagnostics() -> None:
    settings = Settings(database_url="postgresql://user:password@database:5432/melssybeauty")
    assert settings.database_name == "melssybeauty"


def test_accepts_moroccan_mobile_forms() -> None:
    for candidate in ("0612345678", "07 1234-5678", "+212612345678", "+212 6 1234 5678", "212612345678", "00212612345678"):
        assert normalize_moroccan_phone(candidate) in ("+212612345678", "+212712345678")


def test_rejects_landline_and_invalid_phone() -> None:
    assert normalize_moroccan_phone("0522123456") is None
    assert normalize_moroccan_phone("061234") is None


def test_server_calculates_catalog_total() -> None:
    assert calculate_total([("beauty-night-ritual", 1), ("extra-bonnet", 2)]) == 649


def test_hash_normalizes_text_before_sha256() -> None:
    assert sha256_pii("  TEST@example.COM ") == sha256_pii("test@example.com")
