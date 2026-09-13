from app.core.security import sign_webhook
from app.services.capi import ConversionEvent, meta_payload


def test_webhook_signature_is_deterministic() -> None:
    assert sign_webhook(b'{"order":1}', "secret") == sign_webhook(b'{"order":1}', "secret")
    assert sign_webhook(b'{"order":1}', "secret") != sign_webhook(b'{"order":2}', "secret")


def test_meta_phone_is_hashed_not_exposed() -> None:
    event = ConversionEvent("event-1", "Purchase", [{"id": "beauty-night-ritual", "quantity": 1}], "449.00", "https://melssy.beauty", "+212612345678")
    payload = meta_payload(event, "pixel-placeholder", "127.0.0.1", "test")
    user_data = payload["data"][0]["user_data"]
    assert user_data["ph"][0] != "+212612345678"
    assert len(user_data["ph"][0]) == 64
