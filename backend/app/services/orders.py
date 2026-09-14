import json
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.models.orders import Order, OrderItem, SheetWebhookOutbox, TrackingOutbox
from app.schemas.orders import OrderRequest
from app.services.catalog import CATALOG, OFFER, calculate_total


def order_payload(order: Order, items: list[OrderItem] | None = None) -> dict[str, object]:
    order_items = items if items is not None else order.items
    return {
        "order_number": order.order_number,
        "customer_name": order.customer_name,
        "phone_e164": order.phone_e164,
        "full_address": order.full_address or "",
        "city": order.city or "",
        "total": str(order.total),
        "shipping_total": str(order.total - sum((item.unit_price * item.quantity for item in order_items), start=order.total - order.total)),
        "upsell_decision": order.upsell_decision or "",
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


async def create_order(session: AsyncSession, payload: OrderRequest, phone: str) -> Order:
    existing = await session.scalar(select(Order).where(Order.idempotency_key == payload.idempotency_key))
    if existing:
        return existing
    since = datetime.now(UTC) - timedelta(hours=24)
    duplicate = await session.scalar(
        select(Order.id).where(Order.phone_e164 == phone, Order.created_at >= since).limit(1)
    )
    items = [(line.product_id, line.quantity) for line in payload.items]
    subtotal = calculate_total(items)
    shipping = calculate_shipping(items, subtotal)
    total = subtotal + shipping
    order = Order(
        order_number=f"MLS-{uuid4().hex[:10].upper()}", idempotency_key=payload.idempotency_key,
        customer_name=payload.name.strip(), phone_e164=phone,
        full_address=payload.full_address.strip() if payload.full_address else None,
        city=payload.city.strip() if payload.city else None, subtotal=subtotal, total=total,
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
    return order


async def apply_upsell(session: AsyncSession, order_number: str, decision: str) -> Order | None:
    order = await session.scalar(select(Order).options(selectinload(Order.items)).where(Order.order_number == order_number))
    if not order:
        return None
    if order.upsell_decision is not None:
        return order
    order.upsell_decision = decision
    if decision == "accept" and OFFER["enabled"]:
        product = CATALOG[OFFER["product_id"]]
        session.add(OrderItem(order_id=order.id, product_id=product.id, product_name=product.name, quantity=1, unit_price=OFFER["price"]))
        order.subtotal += OFFER["price"]
        order.total += OFFER["price"]
    await session.flush()
    session.add(TrackingOutbox(event_type="order.updated", payload=json.dumps(order_payload(order))))
    session.add(SheetWebhookOutbox(event_type="order.updated", payload=json.dumps(sheet_event(order, "order.updated", order.items))))
    await session.commit()
    await session.refresh(order)
    return order