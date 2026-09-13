from typing import Protocol

import structlog

logger = structlog.get_logger()


class OrderConfirmationNotifier(Protocol):
    async def notify(self, order_number: str) -> None: ...


class ManualOrderConfirmationNotifier:
    async def notify(self, order_number: str) -> None:
        logger.info("order_confirmation_pending", order_number=order_number)
