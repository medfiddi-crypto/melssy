from datetime import UTC, datetime
from decimal import Decimal
from uuid import uuid4

import httpx
import pytest

from app.core.config import get_settings
from app.core.security import sign_webhook
from app.models.orders import Order, OrderItem
from app.services import notifier
from app.services.capi import ConversionEvent, meta_payload
from app.services.notifier import (
    TelegramOrderNotifier,
    send_telegram_test_message,
    telegram_order_message,
)
from app.services.orders import sheet_event


def test_webhook_signature_is_deterministic() -> None:
    assert sign_webhook(b'{"order":1}', "secret") == sign_webhook(b'{"order":1}', "secret")
    assert sign_webhook(b'{"order":1}', "secret") != sign_webhook(b'{"order":2}', "secret")


def test_meta_phone_is_hashed_not_exposed() -> None:
    event = ConversionEvent("event-1", "Purchase", [{"id": "beauty-night-ritual", "quantity": 1}], "449.00", "https://melssy.beauty", "+212612345678")
    payload = meta_payload(event, "pixel-placeholder", "127.0.0.1", "test")
    user_data = payload["data"][0]["user_data"]
    assert user_data["ph"][0] != "+212612345678"
    assert len(user_data["ph"][0]) == 64


def test_sheet_event_contains_cod_fulfillment_fields() -> None:
    order = Order(
        id=uuid4(), order_number="MLS-TEST", idempotency_key=uuid4(), customer_name="Test Customer",
        phone_e164="+212612345678", full_address="1 Test Street", city="Test City",
        subtotal=Decimal("449.00"), total=Decimal("449.00"), possible_duplicate=True,
    )
    item = OrderItem(product_id="beauty-night-ritual", product_name="Ritual", quantity=2, unit_price=Decimal("449.00"))
    event = sheet_event(order, "order.created", [item])
    payload = event["order"]
    assert event["event_id"] == "MLS-TEST:order.created"
    assert payload["payment_method"] == "cash_on_delivery"
    assert payload["fraud_flag"] == "possible_duplicate"
    assert payload["quantity"] == 2
    assert payload["call_status"] == "pending"


def telegram_test_order() -> Order:
    order = Order(
        id=uuid4(), order_number="MLS-TEST", idempotency_key=uuid4(), customer_name="Test Customer",
        phone_e164="+212612345678", subtotal=Decimal("549.00"), total=Decimal("549.00"),
        currency="MAD", created_at=datetime(2026, 9, 20, 14, 30, tzinfo=UTC),
    )
    order.items = [
        OrderItem(product_id="beauty-night-ritual", product_name="Ritual", quantity=1, unit_price=Decimal("449.00")),
        OrderItem(product_id="extra-bonnet", product_name="Bonnet", quantity=1, unit_price=Decimal("100.00")),
    ]
    return order


def test_telegram_order_message_is_phone_friendly() -> None:
    message = telegram_order_message(telegram_test_order())

    assert "Commande : MLS-TEST" in message
    assert "Telephone :\n+212612345678\n" in message
    assert "- Ritual x1 - 449.00 MAD" in message
    assert "- Bonnet x1 - 100.00 MAD" in message
    assert "Total : 549.00 MAD" in message
    assert "Heure : 20/09/2026 14:30 UTC" in message


@pytest.mark.asyncio
async def test_telegram_failure_does_not_escape(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "test-token")
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "123456")
    get_settings.cache_clear()

    async def fail_post(*args: object, **kwargs: object) -> None:
        raise httpx.ConnectError("Telegram unavailable")

    monkeypatch.setattr(httpx.AsyncClient, "post", fail_post)
    try:
        order = telegram_test_order()
        await TelegramOrderNotifier().notify(order.order_number, telegram_order_message(order))
    finally:
        get_settings.cache_clear()


@pytest.mark.asyncio
async def test_telegram_http_status_error_logs_status_and_description(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "test-token")
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "123456")
    get_settings.cache_clear()

    async def unauthorized_post(*args: object, **kwargs: object) -> httpx.Response:
        request = httpx.Request("POST", "https://api.telegram.org/bottest-token/sendMessage")
        return httpx.Response(401, json={"ok": False, "error_code": 401, "description": "Unauthorized"}, request=request)

    monkeypatch.setattr(httpx.AsyncClient, "post", unauthorized_post)
    captured: list[tuple[str, dict[str, object]]] = []
    monkeypatch.setattr(notifier.logger, "warning", lambda event, **fields: captured.append((event, fields)))

    try:
        order = telegram_test_order()
        await TelegramOrderNotifier().notify(order.order_number, telegram_order_message(order))
    finally:
        get_settings.cache_clear()

    event, fields = captured[-1]
    assert event == "telegram_notification_failed"
    assert fields["status_code"] == 401
    assert fields["description"] == "Unauthorized"
    assert "test-token" not in repr(fields)


@pytest.mark.asyncio
async def test_send_test_message_without_configuration(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("TELEGRAM_BOT_TOKEN", raising=False)
    monkeypatch.delenv("TELEGRAM_CHAT_ID", raising=False)
    get_settings.cache_clear()

    try:
        result = await send_telegram_test_message()
    finally:
        get_settings.cache_clear()

    assert result.ok is False
    assert result.status_code is None
    assert "TELEGRAM_BOT_TOKEN" in result.description
    assert "TELEGRAM_CHAT_ID" in result.description


@pytest.mark.asyncio
async def test_send_test_message_success(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "test-token")
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "123456")
    get_settings.cache_clear()

    async def ok_post(*args: object, **kwargs: object) -> httpx.Response:
        return httpx.Response(200, json={"ok": True, "result": {}})

    monkeypatch.setattr(httpx.AsyncClient, "post", ok_post)
    try:
        result = await send_telegram_test_message()
    finally:
        get_settings.cache_clear()

    assert result.ok is True
    assert result.status_code == 200


@pytest.mark.asyncio
async def test_send_test_message_falls_back_to_reason_phrase(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "test-token")
    monkeypatch.setenv("TELEGRAM_CHAT_ID", "wrong-chat")
    get_settings.cache_clear()

    async def bad_request_post(*args: object, **kwargs: object) -> httpx.Response:
        return httpx.Response(400, json={"ok": False})

    monkeypatch.setattr(httpx.AsyncClient, "post", bad_request_post)
    try:
        result = await send_telegram_test_message()
    finally:
        get_settings.cache_clear()

    assert result.ok is False
    assert result.status_code == 400
    assert result.description == "Bad Request"
