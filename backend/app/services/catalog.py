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
    "bonnet-solo": Product("bonnet-solo", "Bonnet satiné", Decimal("130.00"), "footer"),
    "pillowcase-solo": Product("pillowcase-solo", "Taie d'oreiller satinée", Decimal("90.00"), "footer"),
    "heatless-curler-solo": Product("heatless-curler-solo", "Boucleur sans chaleur", Decimal("160.00"), "footer"),
    "scrunchies-solo": Product("scrunchies-solo", "Chouchous satinés", Decimal("85.00"), "footer"),
}

OFFER = {"enabled": True, "product_id": "scrunchies-solo", "price": Decimal("60.00"), "duration_seconds": 12}


def calculate_total(items: list[tuple[str, int]]) -> Decimal:
    return sum((CATALOG[product_id].price * quantity for product_id, quantity in items), Decimal("0.00"))
