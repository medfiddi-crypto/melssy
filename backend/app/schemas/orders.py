from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator

from app.services.catalog import OFFER


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
    full_address: str | None = Field(default=None, min_length=8, max_length=500)
    city: str | None = Field(default=None, min_length=1, max_length=120)
    color: Literal["champagne", "ivory", "black", "rose"] | None = None
    idempotency_key: UUID
    attribution: Attribution = Field(default_factory=Attribution)
    website: str = ""

    @field_validator("full_address", "city", mode="before")
    @classmethod
    def trim_delivery_field(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @model_validator(mode="after")
    def validate_color_order(self) -> "OrderRequest":
        if self.color is not None and (not self.city or not self.full_address):
            raise ValueError("Veuillez renseigner votre ville et votre adresse.")
        if any(line.product_id == "heatless-curler-solo" for line in self.items) and self.color not in (None, "champagne"):
            raise ValueError("Le boucleur est disponible uniquement en champagne.")
        for line in self.items:
            if line.product_id.startswith(("bonnet-solo-", "pillowcase-solo-", "scrunchies-solo-")):
                variant_color = line.product_id.rsplit("-", 1)[1]
                if self.color is not None and variant_color != self.color:
                    raise ValueError("La couleur ne correspond pas à l'article choisi.")
        return self


class OrderResponse(BaseModel):
    order_number: str
    total: Decimal
    currency: Literal["MAD"] = "MAD"
    offer: dict[str, str | int] | None = None
    upsell_token: str | None = None


class UpsellRequest(BaseModel):
    decision: Literal["accept", "decline"]
    idempotency_key: UUID
    token: str = Field(min_length=16, max_length=64)
    colors: list[Literal["champagne", "ivory", "black", "rose"]] = Field(default_factory=list)

    @model_validator(mode="after")
    def require_one_color_per_pillowcase(self) -> "UpsellRequest":
        if self.decision == "accept" and len(self.colors) != OFFER["quantity"]:
            raise ValueError("Choisissez une couleur pour chaque taie.")
        return self
