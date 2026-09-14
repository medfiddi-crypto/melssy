import json
from datetime import UTC, datetime

import httpx
import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import sign_webhook
from app.models.orders import SheetWebhookOutbox

logger = structlog.get_logger()


async def deliver_order_webhook(url: str, secret: str, payload: dict[str, object], timeout: float) -> bool:
    if not url or not secret:
        return False
    body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    signature = sign_webhook(body, secret)
    headers = {"Content-Type": "application/json", "X-MELSSY-Signature": signature}
    separator = "&" if "?" in url else "?"
    signed_url = f"{url}{separator}signature={signature}"
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(signed_url, content=body, headers=headers)
        return response.is_success


async def deliver_pending_sheet_webhooks(session: AsyncSession, limit: int = 25) -> int:
    settings = get_settings()
    if not settings.order_webhook_enabled or not settings.order_webhook_url or not settings.order_webhook_secret:
        return 0
    pending = await session.scalars(
        select(SheetWebhookOutbox)
        .where(SheetWebhookOutbox.delivered_at.is_(None))
        .where(SheetWebhookOutbox.attempts < settings.order_webhook_max_attempts)
        .order_by(SheetWebhookOutbox.created_at)
        .limit(limit)
    )
    delivered = 0
    for event in pending:
        event.attempts += 1
        try:
            succeeded = await deliver_order_webhook(
                settings.order_webhook_url,
                settings.order_webhook_secret,
                json.loads(event.payload),
                settings.order_webhook_timeout_seconds,
            )
        except httpx.HTTPError:
            succeeded = False
        if succeeded:
            event.delivered_at = datetime.now(UTC)
            delivered += 1
        else:
            logger.warning("sheet_webhook_delivery_failed", event_id=str(event.id), attempt=event.attempts)
    await session.commit()
    return delivered


def order_event(order: dict[str, object]) -> dict[str, object]:
    return {"event": "order.created", "event_id": str(order["order_number"]), "occurred_at": datetime.now(UTC).isoformat(), "order": order}
