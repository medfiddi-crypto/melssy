from decimal import Decimal
from pathlib import Path
from uuid import uuid4

import httpx
import pytest
from alembic.config import Config
from pydantic import ValidationError
from sqlalchemy import create_engine, select, text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from alembic import command
from app.models.orders import Order, OrderItem, SheetWebhookOutbox, TrackingOutbox
from app.schemas.orders import OrderRequest
from app.services.capi import ConversionEvent, meta_payload, tiktok_payload
from app.services.orders import sheet_event


def request_data(**overrides):
    return {
        "name": "Client test", "phone": "0612345678",
        "items": [{"product_id": "beauty-night-ritual", "quantity": 1}],
        "idempotency_key": str(uuid4()), **overrides,
    }


def test_legacy_request_remains_valid():
    payload = OrderRequest(**request_data())
    assert payload.city is None
    assert payload.full_address is None
    assert payload.color is None


@pytest.mark.parametrize("color", ["champagne", "ivory", "black", "rose"])
def test_delivery_fields_and_colors(color):
    payload = OrderRequest(**request_data(city=" Casablanca ", full_address=" Rue test 12 ", color=color))
    assert payload.city == "Casablanca"
    assert payload.full_address == "Rue test 12"
    assert payload.color == color


@pytest.mark.parametrize("fields", [{"city": " "}, {"full_address": ""}, {"full_address": "Rue 1"}, {"color": "invalid"}, {"color": "champagne", "full_address": "Rue test 12"}, {"color": "rose", "city": "Rabat"}])
def test_invalid_delivery_fields(fields):
    with pytest.raises(ValidationError):
        OrderRequest(**request_data(**fields))


def test_sheet_delivery_headers():
    order = Order(id=uuid4(), order_number="MLS-TEST", customer_name="Client test",
                  phone_e164="+212612345678", city="Rabat", full_address="Rue test 12",
                  color="rose", subtotal=Decimal("449"), total=Decimal("449"))
    item = OrderItem(product_id="beauty-night-ritual", product_name="Ritual", quantity=1, unit_price=Decimal("449"))
    payload = sheet_event(order, "order.created", [item])["order"]
    assert (payload["Ville"], payload["Adresse"], payload["Couleur"]) == ("Rabat", "Rue test 12", "Rose")
    assert payload["total"] == "449"


@pytest.mark.asyncio
async def test_local_api_persists_orders_and_blocks_invalid_delivery(migrated_database, monkeypatch):
    from app import main

    engine = create_async_engine(f"sqlite+aiosqlite:///{migrated_database.as_posix()}")
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def local_session():
        async with sessions() as session:
            yield session

    async def no_external_dispatch(*args, **kwargs):
        pass

    main.app.dependency_overrides[main.get_session] = local_session
    monkeypatch.setattr(main, "dispatch_sheet_webhooks", no_external_dispatch)
    monkeypatch.setattr(main.TelegramOrderNotifier, "notify", no_external_dispatch)
    try:
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=main.app), base_url="http://local-test") as client:
            for color in ("champagne", "rose"):
                body = request_data(city="Casablanca", full_address="Quartier test, rue 12", color=color)
                response = await client.post("/v1/orders", json=body)
                assert response.status_code == 200, response.text
                assert response.json()["total"] == "449.00"
                assert response.json()["offer"]["price"] == "199.00"
                assert response.json()["upsell_token"]
                number = response.json()["order_number"]
                confirmation = await client.get(f"/v1/orders/{number}/confirmation")
                assert confirmation.json()["color"] == color
                assert confirmation.json()["phone_e164"] == "+212612345678"
                assert "upsell_token" not in confirmation.json()
                retry = await client.post("/v1/orders", json=body)
                assert retry.json()["order_number"] == number
                assert retry.json()["upsell_token"] == response.json()["upsell_token"]
                no_token = await client.post(f"/v1/orders/{number}/upsell", json={"decision": "accept", "idempotency_key": str(uuid4()), "colors": ["rose", "rose"]})
                assert no_token.status_code == 422

            for missing in ("city", "full_address"):
                body = request_data(city="Rabat", full_address="Quartier test, rue 12", color="champagne")
                body.pop(missing)
                assert (await client.post("/v1/orders", json=body)).status_code == 422
                body[missing] = ""
                assert (await client.post("/v1/orders", json=body)).status_code == 422

            for product_id, color, price in (("bonnet-solo-black", "black", "120.00"), ("pillowcase-solo-ivory", "ivory", "150.00"), ("scrunchies-solo-rose", "rose", "60.00"), ("heatless-curler-solo", "champagne", "160.00")):
                body = request_data(items=[{"product_id": product_id, "quantity": 1}], city="Ville libre", full_address="Quartier test, rue 12", color=color)
                response = await client.post("/v1/orders", json=body)
                assert response.status_code == 200, response.text
                assert response.json()["total"] == price
                assert response.json()["offer"] is None
                assert response.json()["upsell_token"] is None

            body = request_data(items=[{"product_id": "heatless-curler-solo", "quantity": 1}], city="Rabat", full_address="Quartier test, rue 12", color="rose")
            assert (await client.post("/v1/orders", json=body)).status_code == 422

        async with sessions() as session:
            orders = list((await session.scalars(select(Order))).all())
            assert len(orders) == 6
            assert [order.color for order in orders[:2]] == ["champagne", "rose"]
            assert all(order.city and order.full_address for order in orders)
            outbox = list((await session.scalars(select(SheetWebhookOutbox))).all())
            assert len(outbox) == 6
            assert all(row.delivered_at is None for row in outbox)
            tracking = list((await session.scalars(select(TrackingOutbox).where(TrackingOutbox.event_type == "order.created"))).all())
            assert len(tracking) == 6
    finally:
        main.app.dependency_overrides.clear()
        await engine.dispose()


def test_tracking_payloads_do_not_include_delivery_fields():
    event = ConversionEvent("test-event", "Purchase", [{"id": "beauty-night-ritual", "quantity": 1}], "449.00", "http://localhost/rituel", "+212612345678")
    for payload in (meta_payload(event, "local-pixel", "127.0.0.1", "test"), tiktok_payload(event)):
        serialized = str(payload)
        assert "449.00" in serialized
        assert "MAD" in serialized
        for forbidden in ("full_address", "city", "Adresse", "Ville", "+212612345678"):
            assert forbidden not in serialized


def test_additive_migration_preserves_existing_order(migrated_database):
    backend = Path(__file__).resolve().parents[1]
    config = Config(str(backend / "alembic.ini"))
    config.set_main_option("script_location", str(backend / "alembic"))
    command.downgrade(config, "0003_add_missing_indexes")
    engine = create_engine(f"sqlite:///{migrated_database.as_posix()}")
    with engine.begin() as connection:
        connection.execute(text("INSERT INTO orders (id, order_number, idempotency_key, customer_name, phone_e164, currency, subtotal, discount_total, total, possible_duplicate, city, full_address) VALUES (:id, 'MLS-LEGACY', :key, 'Client ancien', '+212612345678', 'MAD', 449, 0, 449, 0, 'Rabat', 'Rue ancienne 12')"), {"id": uuid4().hex, "key": uuid4().hex})
        before = connection.execute(text("SELECT order_number, city, full_address, total FROM orders")).one()
    command.upgrade(config, "head")
    with engine.connect() as connection:
        after = connection.execute(text("SELECT order_number, city, full_address, total FROM orders")).one()
        assert after == before
        assert connection.execute(text("SELECT color FROM orders")).scalar_one() is None
    engine.dispose()