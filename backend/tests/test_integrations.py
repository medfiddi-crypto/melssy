from decimal import Decimal
from uuid import uuid4

from app.core.security import sign_webhook
from app.models.orders import Order, OrderItem
from app.services.capi import ConversionEvent, meta_payload
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
