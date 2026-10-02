from dataclasses import dataclass
from datetime import UTC
from decimal import Decimal
from typing import Protocol
from zoneinfo import ZoneInfo

import httpx
import structlog

from app.core.config import Settings, get_settings
from app.models.orders import Order, OrderItem
from app.services.catalog import COLOR_LABELS, OFFER

logger = structlog.get_logger()


class OrderConfirmationNotifier(Protocol):
    async def notify(self, order_number: str, order: Order | None = None) -> None: ...


class ManualOrderConfirmationNotifier:
    async def notify(self, order_number: str, order: Order | None = None) -> None:
        details = {"total": str(order.total), "upsell_decision": order.upsell_decision} if order else {}
        logger.info("order_confirmation_pending", order_number=order_number, **details)


def telegram_order_message(order: Order, items: list[OrderItem] | None = None) -> str:
    created_at = order.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=UTC)
    order_items = items if items is not None else order.items
    item_lines = [
        f"- {item.product_name} x{item.quantity} - {item.unit_price:.2f} {order.currency}"
        for item in order_items
    ]
    delivery_lines = [
        f"{label} : {value}"
        for label, value in (
            ("Ville", order.city),
            ("Adresse", order.full_address),
            ("Couleur", COLOR_LABELS.get(order.color or "", "")),
        )
        if value
    ]
    return "\n".join([
        "Nouvelle commande MELSSY",
        "",
        f"Commande : {order.order_number}",
        f"Client : {order.customer_name}",
        "Telephone :",
        order.phone_e164,
        *delivery_lines,
        "",
        "Articles :",
        *item_lines,
        "",
        f"Total : {order.total:.2f} {order.currency}",
        f"Heure : {created_at.astimezone(ZoneInfo('Africa/Casablanca')):%d/%m/%Y %H:%M}",
    ])


def _amount(value: Decimal) -> str:
    return f"{value:.0f}" if value == value.to_integral_value() else f"{value:.2f}"


def telegram_upsell_message(order: Order) -> str:
    colors = [COLOR_LABELS.get(color, color) for color in (order.upsell_colors or "").split(",") if color]
    delivery_lines = [
        f"{label} : {value}"
        for label, value in (("Ville", order.city), ("Adresse", order.full_address))
        if value
    ]
    return "\n".join([
        f"MISE À JOUR COMMANDE #{order.order_number}",
        "",
        f"Client : {order.customer_name}",
        "Telephone :",
        order.phone_e164,
        *delivery_lines,
        "",
        f"Ajout : {OFFER['quantity']} taies satinées ({', '.join(colors)}) · +{_amount(OFFER['price'])} DH",
        f"Nouveau total : {_amount(order.total)} DH",
    ])


def _telegram_error_description(response: httpx.Response) -> str:
    """Read Telegram's JSON error body; never read response.request, which embeds the bot token."""
    try:
        payload = response.json()
    except ValueError:
        return response.reason_phrase or "Erreur inconnue"
    description = payload.get("description") if isinstance(payload, dict) else None
    return description if isinstance(description, str) and description else (response.reason_phrase or "Erreur inconnue")


async def _post_telegram_message(settings: Settings, text: str) -> httpx.Response:
    async with httpx.AsyncClient(timeout=10) as client:
        return await client.post(
            f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
            json={"chat_id": settings.telegram_chat_id, "text": text},
        )


class TelegramOrderNotifier:
    async def notify(self, order_number: str, message: str) -> None:
        settings = get_settings()
        if not settings.telegram_bot_token or not settings.telegram_chat_id:
            logger.warning("telegram_notification_not_configured", order_number=order_number)
            return
        try:
            response = await _post_telegram_message(settings, message)
            response.raise_for_status()
        except httpx.HTTPStatusError as error:
            logger.warning(
                "telegram_notification_failed",
                order_number=order_number,
                error_type=type(error).__name__,
                status_code=error.response.status_code,
                description=_telegram_error_description(error.response),
            )
            return
        except Exception as error:
            logger.warning(
                "telegram_notification_failed",
                order_number=order_number,
                error_type=type(error).__name__,
            )
            return
        logger.info("telegram_notification_sent", order_number=order_number)


async def notify_upsell_accepted(order: Order) -> None:
    """Send the one-off upsell update message; any failure is logged and never reaches the caller."""
    try:
        message = telegram_upsell_message(order)
    except Exception as error:
        logger.warning("telegram_upsell_message_failed", order_number=order.order_number, error_type=type(error).__name__)
        return
    await TelegramOrderNotifier().notify(order.order_number, message)


@dataclass
class TelegramTestResult:
    ok: bool
    status_code: int | None
    description: str


async def send_telegram_test_message() -> TelegramTestResult:
    """Send one real Telegram message to verify TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID; used by scripts/send_test_telegram.py."""
    settings = get_settings()
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        return TelegramTestResult(
            ok=False, status_code=None,
            description="TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID n'est pas defini.",
        )
    try:
        response = await _post_telegram_message(settings, "MELSSY : message de test de la configuration Telegram.")
    except httpx.RequestError as error:
        return TelegramTestResult(ok=False, status_code=None, description=type(error).__name__)
    if response.is_success:
        return TelegramTestResult(ok=True, status_code=response.status_code, description="ok")
    return TelegramTestResult(ok=False, status_code=response.status_code, description=_telegram_error_description(response))
