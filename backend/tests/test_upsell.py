import asyncio
import json
from uuid import uuid4

import pytest
from sqlalchemy import select

from app import main
from app.models.orders import Order, OrderItem, SheetWebhookOutbox, TrackingOutbox
from app.services.catalog import CATALOG, OFFER, offer_summary


def order_body(**overrides):
    return {
        "name": "Client test", "phone": "0612345678", "city": "Rabat",
        "full_address": "Quartier test, rue 12", "color": "champagne",
        "items": [{"product_id": "beauty-night-ritual", "quantity": 1}],
        "idempotency_key": str(uuid4()), **overrides,
    }


async def place(client, **overrides):
    response = await client.post("/v1/orders", json=order_body(**overrides))
    assert response.status_code == 200, response.text
    return response.json()


def decision(token, kind="accept", colors=("rose", "black")):
    return {"decision": kind, "idempotency_key": str(uuid4()), "token": token, "colors": list(colors)}


def test_offer_prices_come_from_config():
    summary = offer_summary()
    assert OFFER["price"] == 199
    assert summary["price"] == "199.00"
    assert summary["compare_at_price"] == str(CATALOG["pillowcase-solo"].price * 2) == "300.00"
    assert summary["saving"] == "101.00"


async def test_accept_updates_same_order_with_two_colors(api, monkeypatch):
    client, sessions = api
    hook_calls = []

    async def capture_hook(self, order_number, order=None):
        if order is not None:
            hook_calls.append((order_number, str(order.total), order.upsell_decision))

    monkeypatch.setattr(main.ManualOrderConfirmationNotifier, "notify", capture_hook)
    placed = await place(client)
    assert placed["offer"]["compare_at_price"] == "300.00" and placed["offer"]["saving"] == "101.00"
    number, token = placed["order_number"], placed["upsell_token"]
    shown = await client.get(f"/v1/orders/{number}/offer", headers={"X-Upsell-Token": token})
    assert shown.status_code == 200
    assert shown.json() | {"offer": None} == {"order_number": number, "total": "449.00", "color": "champagne", "decided": False, "offer": None}

    accepted = await client.post(f"/v1/orders/{number}/upsell", json=decision(token))
    assert accepted.status_code == 200
    assert accepted.json()["total"] == "648.00" and accepted.json()["applied"] is True

    confirmation = (await client.get(f"/v1/orders/{number}/confirmation")).json()
    assert confirmation["total"] == "648.00"
    assert confirmation["shipping_total"] == "0.00"
    assert [(item["product_id"], item["unit_price"]) for item in confirmation["items"]] == [
        ("beauty-night-ritual", "449.00"), ("pillowcase-upsell-pair", "199.00")]
    assert confirmation["items"][1]["product_name"] == "2 taies satinées supplémentaires (Rose + Noir)"
    assert confirmation["upsell"]["value"] == "199.00"
    assert confirmation["upsell"]["content_ids"] == ["pillowcase-solo-rose", "pillowcase-solo-black"]
    assert "upsell_token" not in confirmation and token not in json.dumps(confirmation)
    assert hook_calls == [(number, "648.00", "accept")]

    async with sessions() as session:
        orders = list((await session.scalars(select(Order))).all())
        assert len(orders) == 1 and orders[0].upsell_colors == "rose,black"
        assert len(list((await session.scalars(select(OrderItem))).all())) == 2
        sheet = [json.loads(row.payload) for row in await session.scalars(select(SheetWebhookOutbox).order_by(SheetWebhookOutbox.created_at))]
        assert [event["event"] for event in sheet] == ["order.created", "order.updated"]
        assert {event["order"]["order_number"] for event in sheet} == {number}
        updated = sheet[1]["order"]
        assert (updated["Upsell"], updated["Taie 1"], updated["Taie 2"], updated["Montant upsell"]) == ("Acceptée", "Rose", "Noir", "199.00")
        assert updated["total"] == "648.00" and updated["quantity"] == 2
        assert (sheet[0]["order"]["Upsell"], sheet[0]["order"]["Taie 1"]) == ("", "")
        tracking = [row for row in await session.scalars(select(TrackingOutbox)) if row.event_type == "order.upsell_purchase"]
        assert len(tracking) == 1
        purchase = json.loads(tracking[0].payload)
        assert purchase["value"] == "199.00" and purchase["event_id"] == confirmation["upsell"]["event_id"]
        assert not {"phone_e164", "full_address", "city", "customer_name"} & purchase.keys()


async def test_same_colors_are_labelled_clearly(api):
    client, _ = api
    placed = await place(client)
    await client.post(f"/v1/orders/{placed['order_number']}/upsell", json=decision(placed["upsell_token"], colors=("ivory", "ivory")))
    items = (await client.get(f"/v1/orders/{placed['order_number']}/confirmation")).json()["items"]
    assert items[1]["product_name"] == "2 taies satinées supplémentaires (Ivoire x2)"


async def test_decline_keeps_449_and_blocks_later_accept(api):
    client, sessions = api
    placed = await place(client)
    number, token = placed["order_number"], placed["upsell_token"]
    declined = await client.post(f"/v1/orders/{number}/upsell", json=decision(token, "decline", colors=()))
    assert declined.status_code == 200 and declined.json()["total"] == "449.00"
    later = await client.post(f"/v1/orders/{number}/upsell", json=decision(token))
    assert later.json()["total"] == "449.00" and later.json()["applied"] is False
    confirmation = (await client.get(f"/v1/orders/{number}/confirmation")).json()
    assert confirmation["total"] == "449.00" and confirmation["upsell"] is None and len(confirmation["items"]) == 1
    shown = await client.get(f"/v1/orders/{number}/offer", headers={"X-Upsell-Token": token})
    assert shown.json()["decided"] is True and shown.json()["offer"] is None
    async with sessions() as session:
        events = [json.loads(row.payload)["order"] for row in await session.scalars(select(SheetWebhookOutbox).order_by(SheetWebhookOutbox.created_at))]
        assert events[-1]["Upsell"] == "Refusée" and events[-1]["Montant upsell"] == ""


async def test_repeated_and_concurrent_accepts_add_the_upsell_once(api):
    client, sessions = api
    placed = await place(client)
    number, token = placed["order_number"], placed["upsell_token"]
    responses = await asyncio.gather(*(client.post(f"/v1/orders/{number}/upsell", json=decision(token)) for _ in range(4)))
    assert all(response.status_code == 200 for response in responses)
    assert sorted(response.json()["applied"] for response in responses) == [False, False, False, True]
    assert {response.json()["total"] for response in responses} == {"648.00"}
    refreshed = await client.post(f"/v1/orders/{number}/upsell", json=decision(token, colors=("black", "black")))
    assert refreshed.json()["total"] == "648.00" and refreshed.json()["applied"] is False
    async with sessions() as session:
        order = await session.scalar(select(Order))
        assert str(order.total) == "648.00" and str(order.subtotal) == "648.00" and order.upsell_colors == "rose,black"
        assert len(list((await session.scalars(select(OrderItem))).all())) == 2
        rows = list((await session.scalars(select(SheetWebhookOutbox))).all())
        assert sorted(row.event_type for row in rows) == ["order.created", "order.updated"]
        assert len([row for row in await session.scalars(select(TrackingOutbox)) if row.event_type == "order.upsell_purchase"]) == 1


async def test_wrong_or_missing_token_is_blocked(api):
    client, sessions = api
    mine, other = await place(client), await place(client)
    number = mine["order_number"]
    for headers in ({"X-Upsell-Token": "x" * 32}, {"X-Upsell-Token": other["upsell_token"]}, {"X-Upsell-Token": "é".encode("latin-1") * 20}, {}):
        assert (await client.get(f"/v1/orders/{number}/offer", headers=headers)).status_code == 404
    for token in ("x" * 32, other["upsell_token"]):
        assert (await client.post(f"/v1/orders/{number}/upsell", json=decision(token))).status_code == 404
    assert (await client.get("/v1/orders/MLS-0000000000/offer", headers={"X-Upsell-Token": mine["upsell_token"]})).status_code == 404
    async with sessions() as session:
        order = await session.scalar(select(Order).where(Order.order_number == number))
        assert order.upsell_decision is None and str(order.total) == "449.00"
        assert not list((await session.scalars(select(SheetWebhookOutbox).where(SheetWebhookOutbox.event_type == "order.updated"))).all())


async def test_offer_only_for_coffret_orders(api):
    client, sessions = api
    single = await place(client, items=[{"product_id": "pillowcase-solo-rose", "quantity": 1}], color="rose")
    assert single["offer"] is None and single["upsell_token"] is None
    async with sessions() as session:
        order = await session.scalar(select(Order))
        assert order.upsell_token is None
    assert (await client.get(f"/v1/orders/{single['order_number']}/offer", headers={"X-Upsell-Token": "x" * 32})).status_code == 404


@pytest.mark.parametrize("colors", [[], ["rose"], ["rose", "black", "ivory"], ["rose", "purple"]])
async def test_accept_requires_one_valid_color_per_pillowcase(api, colors):
    client, _ = api
    placed = await place(client)
    response = await client.post(f"/v1/orders/{placed['order_number']}/upsell", json=decision(placed["upsell_token"], colors=colors))
    assert response.status_code == 422
    still = await client.get(f"/v1/orders/{placed['order_number']}/offer", headers={"X-Upsell-Token": placed["upsell_token"]})
    assert still.json()["decided"] is False
