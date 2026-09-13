from dataclasses import dataclass
from datetime import UTC, datetime

from app.core.security import sha256_pii


@dataclass(frozen=True)
class ConversionEvent:
    event_id: str
    name: str
    products: list[dict[str, int | str]]
    value: str
    source_url: str
    phone_e164: str | None = None
    email: str | None = None


def meta_payload(event: ConversionEvent, pixel_id: str, client_ip: str, user_agent: str) -> dict[str, object]:
    user_data = {"client_ip_address": client_ip, "client_user_agent": user_agent}
    if event.phone_e164:
        user_data["ph"] = [sha256_pii(event.phone_e164)]
    if event.email:
        user_data["em"] = [sha256_pii(event.email)]
    return {"data": [{"event_name": event.name, "event_time": int(datetime.now(UTC).timestamp()), "event_id": event.event_id, "action_source": "website", "event_source_url": event.source_url, "user_data": user_data, "custom_data": {"currency": "MAD", "value": event.value, "content_type": "product", "contents": event.products}}], "pixel_id": pixel_id}

# NEEDS VERIFICATION: TikTok Events API transport is account/version dependent.
def tiktok_payload(event: ConversionEvent) -> dict[str, object]:
    return {"event_id": event.event_id, "event": event.name, "timestamp": datetime.now(UTC).isoformat(), "properties": {"currency": "MAD", "value": event.value, "contents": event.products}}
