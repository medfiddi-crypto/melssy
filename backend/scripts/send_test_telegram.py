"""Send a Telegram test message to verify TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID.

Run in the Easypanel backend terminal:
    python scripts/send_test_telegram.py
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.notifier import send_telegram_test_message  # noqa: E402


async def main() -> int:
    result = await send_telegram_test_message()
    if result.ok:
        print(f"OK - Telegram a repondu avec le statut {result.status_code}.")
        return 0
    print(f"ECHEC - status_code={result.status_code} description={result.description!r}")
    return 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
