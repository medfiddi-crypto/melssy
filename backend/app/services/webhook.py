import json
from datetime import UTC, datetime

import httpx

from app.core.security import sign_webhook


async def deliver_order_webhook(url: str, secret: str, payload: dict[str, object]) -> bool:
    if not url or not secret:
        return False
    body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    headers = {"Content-Type": "application/json", "X-MELSSY-Signature": sign_webhook(body, secret)}
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(url, content=body, headers=headers)
        return response.is_success


def order_event(order: dict[str, object]) -> dict[str, object]:
    return {"event": "order.created", "event_id": str(order["order_number"]), "occurred_at": datetime.now(UTC).isoformat(), "order": order}
