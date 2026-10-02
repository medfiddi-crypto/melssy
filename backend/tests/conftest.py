from pathlib import Path

import httpx
import pytest
from alembic.config import Config
from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from alembic import command
from app.core.config import get_settings


@pytest.fixture
def migrated_database(tmp_path, monkeypatch):
    backend = Path(__file__).resolve().parents[1]
    database = tmp_path / "orders.db"
    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.setenv("DATABASE_URL", f"sqlite+aiosqlite:///{database.as_posix()}")
    monkeypatch.setenv("ORDER_WEBHOOK_ENABLED", "false")
    monkeypatch.setenv("ORDER_WEBHOOK_URL", "")
    monkeypatch.setenv("ORDER_WEBHOOK_SECRET", "")
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "")
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "")
    get_settings.cache_clear()
    config = Config(str(backend / "alembic.ini"))
    config.set_main_option("script_location", str(backend / "alembic"))
    command.upgrade(config, "head")
    engine = create_engine(f"sqlite:///{database.as_posix()}")
    with engine.connect() as connection:
        columns = {column["name"]: column for column in inspect(connection).get_columns("orders")}
        for name in ("color", "city", "full_address", "upsell_token", "upsell_colors"):
            assert columns[name]["nullable"] is True
    engine.dispose()
    yield database
    get_settings.cache_clear()


@pytest.fixture
async def api(migrated_database, monkeypatch):
    """In-process API on a temporary migrated SQLite file; Sheet, Telegram and CAPI transports are stubbed."""
    from app import main

    engine = create_async_engine(f"sqlite+aiosqlite:///{migrated_database.as_posix()}")
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def local_session():
        async with sessions() as session:
            yield session

    async def no_external_call(*args, **kwargs):
        pass

    main.app.dependency_overrides[main.get_session] = local_session
    monkeypatch.setattr(main, "dispatch_sheet_webhooks", no_external_call)
    monkeypatch.setattr(main.TelegramOrderNotifier, "notify", no_external_call)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=main.app), base_url="http://local-test") as client:
        yield client, sessions
    main.app.dependency_overrides.clear()
    await engine.dispose()
