import hmac
import json
import secrets
from datetime import UTC, datetime, timedelta
from uuid import NAMESPACE_URL, uuid4, uuid5

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.models.orders import Order, OrderItem, SheetWebhookOutbox, TrackingOutbox
from app.schemas.orders import OrderRequest, UpsellRequest
from app.services.catalog import CATALOG, COFFRET_ID, COLOR_LABELS, OFFER, calculate_total

UPSELL_STATUS_LABELS = {"accept": "Acceptée", "decline": "Refusée"}


def upsell_colors(order: Order) -> list[str]:
    return order.upsell_colors.split(",") if order.upsell_colors else []


def upsell_event_id(order_number: str) -> str:
    # Stable per order so browser and server events deduplicate and retries never mint a new id.
    return str(uuid5(NAMESPACE_URL, f"melssy:upsell-purchase:{order_number}"))


def upsell_info(order: Order) -> dict[str, object] | None:
    if order.upsell_decision != "accept":
        return None
    colors = upsell_colors(order)
    return {
        "accepted": True,
        "value": str(OFFER["price"]),
        "event_id": upsell_event_id(order.order_number),
        "product_id": OFFER["item_id"],
        "content_ids": [f"{OFFER['product_id']}-{color}" for color in colors],
        "colors": colors,
    }


def upsell_item_name(colors: list[str]) -> str:
    labels = [COLOR_LABELS[color] for color in colors]
    detail = f"{labels[0]} x{len(labels)}" if len(set(labels)) == 1 else " + ".join(labels)
    return f"{OFFER['quantity']} taies satinées supplémentaires ({detail})"


def offer_available(order: Order, items: list[OrderItem]) -> bool:
    return bool(
        OFFER["enabled"]
        and order.upsell_token
        and order.upsell_decision is None
        and any(item.product_id == COFFRET_ID for item in items)
    )


def order_payload(order: Order, items: list[OrderItem] | None = None) -> dict[str, object]:
    order_items = items if items is not None else order.items
    return {
        "order_number": order.order_number,
        "customer_name": order.customer_name,
        "phone_e164": order.phone_e164,
        "full_address": order.full_address or "",
        "city": order.city or "",
        "color": order.color or "",
        "total": str(order.total),
        "shipping_total": str(order.total - sum((item.unit_price * item.quantity for item in order_items), start=order.total - order.total)),
        "upsell_decision": order.upsell_decision or "",
        "upsell": upsell_info(order),
        "items": [{"product_id": item.product_id, "product_name": item.product_name, "quantity": item.quantity, "unit_price": str(item.unit_price)} for item in order_items],
    }


def sheet_event(order: Order, event_type: str, items: list[OrderItem]) -> dict[str, object]:
    payload = order_payload(order, items)
    payload.update({
        "order_id": str(order.id),
        "timestamp": datetime.now(UTC).isoformat(),
        "quantity": sum(item.quantity for item in items),
        "payment_method": "cash_on_delivery",
        "fraud_flag": "possible_duplicate" if order.possible_duplicate else "",
        "call_status": "pending",
        "delivery_status": "pending",
        "Ville": order.city or "",
        "Adresse": order.full_address or "",
        "Couleur": COLOR_LABELS.get(order.color or "", ""),
        "Upsell": UPSELL_STATUS_LABELS.get(order.upsell_decision or "", ""),
        "Taie 1": COLOR_LABELS.get((upsell_colors(order) + ["", ""])[0], ""),
        "Taie 2": COLOR_LABELS.get((upsell_colors(order) + ["", ""])[1], ""),
        "Montant upsell": str(OFFER["price"]) if order.upsell_decision == "accept" else "",
    })
    return {
        "event": event_type,
        "event_id": f"{order.order_number}:{event_type}",
        "occurred_at": datetime.now(UTC).isoformat(),
        "order": payload,
    }


def calculate_shipping(items: list[tuple[str, int]], subtotal: object) -> object:
    settings = get_settings()
    if any(product_id == "beauty-night-ritual" for product_id, _ in items):
        return settings.standard_shipping_fee - settings.standard_shipping_fee
    if subtotal >= settings.free_shipping_threshold:
        return settings.standard_shipping_fee - settings.standard_shipping_fee
    return settings.standard_shipping_fee


async def create_order(
    session: AsyncSession, payload: OrderRequest, phone: str
) -> tuple[Order, list[OrderItem], bool]:
    existing = await session.scalar(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.idempotency_key == payload.idempotency_key)
    )
    if existing:
        return existing, existing.items, False
    since = datetime.now(UTC) - timedelta(hours=24)
    duplicate = await session.scalar(
        select(Order.id).where(Order.phone_e164 == phone, Order.created_at >= since).limit(1)
    )
    items = [(line.product_id, line.quantity) for line in payload.items]
    subtotal = calculate_total(items)
    shipping = calculate_shipping(items, subtotal)
    total = subtotal + shipping
    has_coffret = any(product_id == COFFRET_ID for product_id, _ in items)
    order = Order(
        order_number=f"MLS-{uuid4().hex[:10].upper()}", idempotency_key=payload.idempotency_key,
        customer_name=payload.name.strip(), phone_e164=phone,
        full_address=payload.full_address.strip() if payload.full_address else None,
        city=payload.city.strip() if payload.city else None, subtotal=subtotal, total=total,
        color=payload.color,
        upsell_token=secrets.token_urlsafe(24) if OFFER["enabled"] and has_coffret else None,
        possible_duplicate=duplicate is not None, utm_source=payload.attribution.utm_source,
        utm_campaign=payload.attribution.utm_campaign, fbclid=payload.attribution.fbclid,
        ttclid=payload.attribution.ttclid,
    )
    session.add(order)
    await session.flush()
    order_items = []
    for line in payload.items:
        product = CATALOG[line.product_id]
        order_item = OrderItem(order_id=order.id, product_id=product.id, product_name=product.name, quantity=line.quantity, unit_price=product.price)
        session.add(order_item)
        order_items.append(order_item)
    await session.flush()
    session.add(TrackingOutbox(event_type="order.created", payload=json.dumps(order_payload(order, order_items))))
    session.add(SheetWebhookOutbox(event_type="order.created", payload=json.dumps(sheet_event(order, "order.created", order_items))))
    await session.commit()
    await session.refresh(order)
    return order, order_items, True


async def load_offer_order(session: AsyncSession, order_number: str, token: str) -> Order | None:
    order = await session.scalar(
        select(Order).options(selectinload(Order.items)).where(Order.order_number == order_number)
    )
    if not order or not order.upsell_token:
        return None
    if not hmac.compare_digest(order.upsell_token.encode(), token.encode()):
        return None
    return order


async def apply_upsell(
    session: AsyncSession, order_number: str, payload: UpsellRequest
) -> tuple[Order, bool] | None:
    """Record the customer's decision once; returns (order, applied) or None for an unknown order or wrong token."""
    order = await load_offer_order(session, order_number, payload.token)
    if not order:
        return None
    if order.upsell_decision is not None:
        return order, False
    order_id = order.id
    # Single conditional UPDATE: concurrent or repeated requests lose the claim and change nothing.
    claim = await session.execute(
        update(Order)
        .where(Order.id == order_id, Order.upsell_decision.is_(None))
        .values(upsell_decision=payload.decision)
    )
    if claim.rowcount != 1:
        await session.rollback()
        decided = await session.scalar(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.id == order_id)
            .execution_options(populate_existing=True)
        )
        return decided, False
    order.upsell_decision = payload.decision
    if payload.decision == "accept":
        order.upsell_colors = ",".join(payload.colors)
        order.items.append(OrderItem(
            product_id=OFFER["item_id"], product_name=upsell_item_name(payload.colors),
            quantity=1, unit_price=OFFER["price"],
        ))
        order.subtotal += OFFER["price"]
        order.total += OFFER["price"]
    await session.flush()
    session.add(TrackingOutbox(event_type="order.updated", payload=json.dumps(order_payload(order))))
    if payload.decision == "accept":
        info = upsell_info(order)
        session.add(TrackingOutbox(event_type="order.upsell_purchase", payload=json.dumps({
            "event_id": info["event_id"], "event_name": "Purchase", "order_number": order.order_number,
            "value": info["value"], "currency": order.currency, "content_ids": info["content_ids"],
        })))
    session.add(SheetWebhookOutbox(event_type="order.updated", payload=json.dumps(sheet_event(order, "order.updated", order.items))))
    await session.commit()
    return order, True