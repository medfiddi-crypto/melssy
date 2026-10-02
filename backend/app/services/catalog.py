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
    "pillowcase-pair": Product("pillowcase-pair", "Paire de taies d'oreiller satinées", Decimal("180.00"), "addon"),
    "extra-bonnet": Product("extra-bonnet", "Bonnet satiné", Decimal("100.00"), "addon"),
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

OFFER = {"enabled": True, "product_id": "pillowcase-pair", "price": Decimal("180.00")}


def calculate_total(items: list[tuple[str, int]]) -> Decimal:
    return sum((CATALOG[product_id].price * quantity for product_id, quantity in items), Decimal("0.00"))
