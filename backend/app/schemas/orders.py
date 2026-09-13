from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class CartLine(BaseModel):
    product_id: str
    quantity: int = Field(ge=1, le=10)


class Attribution(BaseModel):
    utm_source: str | None = None
    utm_campaign: str | None = None
    fbclid: str | None = None
    ttclid: str | None = None
    fbp: str | None = None
    ttp: str | None = None


class OrderRequest(BaseModel):
    items: list[CartLine] = Field(min_length=1)
    name: str = Field(min_length=2, max_length=120)
    phone: str
    idempotency_key: UUID
    attribution: Attribution = Field(default_factory=Attribution)
    website: str = ""


class OrderResponse(BaseModel):
    order_number: str
    total: Decimal
    currency: Literal["MAD"] = "MAD"
    offer: dict[str, str | int] | None = None


class UpsellRequest(BaseModel):
    decision: Literal["accept", "decline"]
    idempotency_key: UUID
