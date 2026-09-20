from decimal import Decimal
from functools import lru_cache
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_DATABASE_URL = "sqlite+aiosqlite:///./melssy-dev.db"
DEFAULT_CORS_ORIGINS = "http://localhost:3000,http://192.168.100.30:3000"


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
    database_url: str = DEFAULT_DATABASE_URL
    cors_origins: str = DEFAULT_CORS_ORIGINS
    order_webhook_url: str = ""
    order_webhook_secret: str = ""
    order_webhook_enabled: bool = False
    order_webhook_timeout_seconds: float = 10
    order_webhook_max_attempts: int = 5
    order_webhook_retry_interval_seconds: int = 60
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    meta_pixel_id: str = ""
    meta_capi_access_token: str = ""
    tiktok_pixel_id: str = ""
    tiktok_events_api_access_token: str = ""
    tracking_test_event_code: str = ""
    standard_shipping_fee: Decimal = Decimal("35.00")
    free_shipping_threshold: Decimal = Decimal("0.00")

    @model_validator(mode="after")
    def require_production_database_settings(self) -> "Settings":
        if self.environment != "production":
            return self
        required_fields = {
            "database_url": ("DATABASE_URL", DEFAULT_DATABASE_URL),
            "cors_origins": ("CORS_ORIGINS", DEFAULT_CORS_ORIGINS),
        }
        missing = [name for field, (name, default) in required_fields.items() if not getattr(self, field).strip() or getattr(self, field) == default]
        if missing:
            raise ValueError(f"Missing required environment variable(s) in production: {', '.join(missing)}")
        return self

    @property
    def async_database_url(self) -> str:
        return normalize_database_url(self.database_url)

    @property
    def database_backend(self) -> str:
        return urlsplit(self.async_database_url).scheme.split("+", 1)[0]

    @property
    def database_host(self) -> str:
        parts = urlsplit(self.async_database_url)
        return parts.hostname or "local"

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
