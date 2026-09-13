import hashlib
import hmac
import re


def sha256_pii(value: str) -> str:
    return hashlib.sha256(value.strip().lower().encode("utf-8")).hexdigest()


def redact_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    return f"***{digits[-2:]}" if digits else "***"


def sign_webhook(body: bytes, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
