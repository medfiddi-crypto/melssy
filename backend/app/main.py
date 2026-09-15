import asyncio
from contextlib import asynccontextmanager, suppress
from uuid import uuid4

import structlog
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.phone import MOROCCAN_MOBILE_ERROR, normalize_moroccan_phone
from app.db.session import SessionLocal, get_session
from app.models.orders import Order
from app.schemas.orders import OrderRequest, OrderResponse, UpsellRequest
from app.services.catalog import CATALOG, OFFER
from app.services.notifier import ManualOrderConfirmationNotifier
from app.services.orders import apply_upsell, order_payload
from app.services.orders import create_order as persist_order
from app.services.webhook import deliver_pending_sheet_webhooks

logger = structlog.get_logger()


async def dispatch_sheet_webhooks() -> None:
    try:
        async with SessionLocal() as session:
            await deliver_pending_sheet_webhooks(session)
    except Exception:
        logger.exception("sheet_webhook_dispatch_failed")


async def sheet_webhook_retry_loop() -> None:
    while True:
        await dispatch_sheet_webhooks()
        await asyncio.sleep(settings.order_webhook_retry_interval_seconds)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "backend_startup",
        database_backend=settings.database_backend,
        database_host=settings.database_host,
    )
    retry_task = asyncio.create_task(sheet_webhook_retry_loop())
    try:
        yield
    finally:
        retry_task.cancel()
        with suppress(asyncio.CancelledError):
            await retry_task


settings = get_settings()
app = FastAPI(title="MELSSY API", version="1.0.0", lifespan=lifespan)
cors_options: dict[str, object] = {
    "allow_origins": settings.allowed_origins,
    "allow_credentials": False,
    "allow_methods": ["GET", "POST"],
    "allow_headers": ["Content-Type", "Idempotency-Key"],
}
if settings.environment == "development":
    cors_options["allow_origin_regex"] = r"^https?://(?:localhost|127\.0\.0\.1|(?:\d{1,3}\.){3}\d{1,3})(?::\d+)?$"
app.add_middleware(CORSMiddleware, **cors_options)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Request-ID"] = request.headers.get("X-Request-ID", str(uuid4()))
    return response


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/v1/catalog")
async def catalog() -> dict[str, object]:
    return {
        "products": [{"id": item.id, "name": item.name, "price": str(item.price), "placement": item.placement} for item in CATALOG.values()],
        "offer": {**OFFER, "price": str(OFFER["price"])},
    }


@app.post("/v1/orders", response_model=OrderResponse)
async def create_order(
    payload: OrderRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
) -> OrderResponse:
    if payload.website:
        raise HTTPException(400, "Demande invalide.")
    phone = normalize_moroccan_phone(payload.phone)
    if not phone:
        raise HTTPException(422, MOROCCAN_MOBILE_ERROR)
    if any(line.product_id not in CATALOG for line in payload.items):
        raise HTTPException(422, "Un article de votre panier n'est plus disponible.")
    try:
        order = await persist_order(session, payload, phone)
    except Exception:
        logger.exception(
            "order_submission_failed",
            request_id=request.headers.get("X-Request-ID"),
            item_count=len(payload.items),
        )
        raise HTTPException(
            503,
            "Un problème technique est survenu. Écrivez-nous sur WhatsApp pour confirmer votre commande.",
        ) from None
    background_tasks.add_task(dispatch_sheet_webhooks)
    await ManualOrderConfirmationNotifier().notify(order.order_number)
    offer = {"product_id": OFFER["product_id"], "price": str(OFFER["price"])} if OFFER["enabled"] else None
    return OrderResponse(order_number=order.order_number, total=order.total, offer=offer)


@app.post("/v1/orders/{order_number}/upsell")
async def upsell(
    order_number: str,
    payload: UpsellRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
) -> JSONResponse:
    order = await apply_upsell(session, order_number, payload.decision)
    if not order:
        raise HTTPException(404, "Commande introuvable.")
    background_tasks.add_task(dispatch_sheet_webhooks)
    return JSONResponse({"order_number": order_number, "total": str(order.total), "status": order.upsell_decision})


@app.get("/v1/orders/{order_number}/confirmation")
async def confirmation(order_number: str, session: AsyncSession = Depends(get_session)) -> dict[str, object]:
    order = await session.scalar(select(Order).where(Order.order_number == order_number))
    if not order:
        raise HTTPException(404, "Commande introuvable.")
    await session.refresh(order, attribute_names=["items"])
    return {**order_payload(order), "status": "placed"}
