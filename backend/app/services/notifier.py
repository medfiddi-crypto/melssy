from datetime import UTC
from typing import Protocol

import httpx
import structlog

from app.core.config import get_settings
from app.models.orders import Order, OrderItem

logger = structlog.get_logger()


class OrderConfirmationNotifier(Protocol):
    async def notify(self, order_number: str) -> None: ...


class ManualOrderConfirmationNotifier:
    async def notify(self, order_number: str) -> None:
        logger.info("order_confirmation_pending", order_number=order_number)


def telegram_order_message(order: Order, items: list[OrderItem] | None = None) -> str:
    created_at = order.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=UTC)
    order_items = items if items is not None else order.items
    item_lines = [
        f"- {item.product_name} x{item.quantity} - {item.unit_price:.2f} {order.currency}"
        for item in order_items
    ]
    return "\n".join([
        "Nouvelle commande MELSSY",
        "",
        f"Commande : {order.order_number}",
        f"Client : {order.customer_name}",
        "Telephone :",
        order.phone_e164,
        "",
        "Articles :",
        *item_lines,
        "",
        f"Total : {order.total:.2f} {order.currency}",
        f"Heure : {created_at.astimezone(UTC):%d/%m/%Y %H:%M} UTC",
    ])


class TelegramOrderNotifier:
    async def notify(self, order_number: str, message: str) -> None:
        settings = get_settings()
        if not settings.telegram_bot_token or not settings.telegram_chat_id:
            logger.warning("telegram_notification_not_configured", order_number=order_number)
            return
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.post(
                    f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
                    json={
                        "chat_id": settings.telegram_chat_id,
                        "text": message,
                    },
                )
                response.raise_for_status()
        except Exception as error:
            logger.warning(
                "telegram_notification_failed",
                order_number=order_number,
                error_type=type(error).__name__,
            )
