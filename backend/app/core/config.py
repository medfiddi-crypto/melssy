from decimal import Decimal
from functools import lru_cache
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic_settings import BaseSettings, SettingsConfigDict


def normalize_database_url(value: str) -> str:
    """Normalize EasyPanel PostgreSQL URLs for SQLAlchemy asyncpg."""
    if value.startswith("postgres://"):
        value = "postgresql+asyncpg://" + value.removeprefix("postgres://")
    elif value.startswith("postgresql://"):
        value = "postgresql+asyncpg://" + value.removeprefix("postgresql://")
    else:
        return value
    parts = urlsplit(value)
    query = [(key, item) for key, item in parse_qsl(parts.query) if key != "sslmode"]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    database_url: str = "sqlite+aiosqlite:///./melssy-dev.db"
    cors_origins: str = "http://localhost:3000,http://192.168.100.30:3000"
    order_webhook_url: str = ""
    order_webhook_secret: str = ""
    order_webhook_enabled: bool = False
    order_webhook_timeout_seconds: float = 10
    order_webhook_max_attempts: int = 5
    order_webhook_retry_interval_seconds: int = 60
    meta_pixel_id: str = ""
    meta_capi_access_token: str = ""
    tiktok_pixel_id: str = ""
    tiktok_events_api_access_token: str = ""
    tracking_test_event_code: str = ""
    standard_shipping_fee: Decimal = Decimal("35.00")
    free_shipping_threshold: Decimal = Decimal("0.00")

    @property
    def async_database_url(self) -> str:
        return normalize_database_url(self.database_url)

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
