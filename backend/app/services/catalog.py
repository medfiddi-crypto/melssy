from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class Product:
    id: str
    name: str
    price: Decimal
    placement: str


CATALOG = {
    "beauty-night-ritual": Product("beauty-night-ritual", "La Beauty Night Ritual", Decimal("449.00"), "main"),
    "bonnet-solo": Product("bonnet-solo", "Bonnet satiné", Decimal("120.00"), "footer"),
    "pillowcase-solo": Product("pillowcase-solo", "Taie d'oreiller satinée 70 x 50 cm", Decimal("150.00"), "footer"),
    "heatless-curler-solo": Product("heatless-curler-solo", "Boucleur sans chaleur", Decimal("160.00"), "footer"),
    "scrunchies-solo": Product("scrunchies-solo", "Chouchous satinés", Decimal("60.00"), "footer"),
}

for product_id, name, price in (
    ("bonnet-solo", "Bonnet satiné", Decimal("120.00")),
    ("pillowcase-solo", "Taie d'oreiller satinée 70 x 50 cm", Decimal("150.00")),
    ("scrunchies-solo", "Chouchous satinés", Decimal("60.00")),
):
    for color_id, color_name in (
        ("champagne", "Champagne"),
        ("ivory", "Ivoire"),
        ("black", "Noir"),
        ("rose", "Rose"),
    ):
        variant_id = f"{product_id}-{color_id}"
        CATALOG[variant_id] = Product(variant_id, f"{name} - {color_name}", price, "footer")

COFFRET_ID = "beauty-night-ritual"

# Post-checkout upsell: `quantity` pillowcases sold together for `price`; compare-at and saving derive from the catalog.
OFFER = {
    "enabled": True,
    "product_id": "pillowcase-solo",
    "item_id": "pillowcase-upsell-pair",
    "quantity": 2,
    "price": Decimal("199.00"),
}

COLOR_LABELS = {"champagne": "Champagne", "ivory": "Ivoire", "black": "Noir", "rose": "Rose"}


def offer_summary() -> dict[str, str | int]:
    compare_at = CATALOG[OFFER["product_id"]].price * OFFER["quantity"]
    return {
        "product_id": OFFER["product_id"],
        "quantity": OFFER["quantity"],
        "price": str(OFFER["price"]),
        "compare_at_price": str(compare_at),
        "saving": str(compare_at - OFFER["price"]),
    }


def calculate_total(items: list[tuple[str, int]]) -> Decimal:
    return sum((CATALOG[product_id].price * quantity for product_id, quantity in items), Decimal("0.00"))
