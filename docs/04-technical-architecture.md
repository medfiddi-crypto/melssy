# Technical Architecture

## Stack and Structure

- Frontend: current stable Next.js App Router, React, TypeScript, Tailwind CSS, `next/font`, `lucide-react`, Zod, React Hook Form, Vitest/Testing Library, Playwright. Use TanStack Query only for API server-state.
- Backend: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2 async, asyncpg, Alembic, httpx, structlog, pytest.
- Database: existing EasyPanel PostgreSQL `melssybeauty`.
- Infrastructure: separate Docker images and local-only Docker Compose.

```text
frontend/  src/app/ src/components/ src/content/ src/lib/ src/hooks/ public/
backend/   app/api/ app/core/ app/db/ app/models/ app/schemas/ app/services/ alembic/ tests/
sheet/     Code.gs README.md
docs/
docker-compose.yml README.md
```

Strict TypeScript; no `any` in commerce/tracking. Server components by default. Zod/Pydantic at boundaries. Cart uses versioned local storage; server recalculates product/price/total from IDs and quantities.

## API and Model

| Endpoint | Role |
| --- | --- |
| `GET /health` | Liveness and DB readiness. |
| `GET /v1/catalog` | Public verified catalog/active offer. |
| `POST /v1/orders` | Validate and calculate, persist order/items/outbox, return order + offer. |
| `POST /v1/orders/{order_number}/upsell` | Atomically record valid offer accept/decline. |
| `GET /v1/orders/{order_number}/confirmation` | Minimal public thank-you data, rate limited. |
| `POST /v1/tracking/events` | Validate/queue CAPI event; no trusted client price. |

Tables: `products`, `orders`, `order_items`, `post_purchase_offers`, `order_events`, `tracking_outbox`. Transaction includes order/items/audit/outbox. `orders` carries opaque order number, restricted raw/normalized phone, calculated MAD totals, source/UTM/click IDs, statuses and timestamps. Frontend sends idempotency UUID; unique database constraint prevents duplicate orders. Outbox retries must never block a COD order.

Define `OrderConfirmationNotifier` protocol. `ManualOrderConfirmationNotifier` structured-logs only. `OrderService` invokes it after commit; later WhatsApp replaces only the implementation.

## Database URL and Migrations

Only EasyPanel provides `DATABASE_URL`. Before creating async engine: replace leading `postgres://`/`postgresql://` with `postgresql+asyncpg://`; parse query and remove `sslmode=disable`; never log either URL. Entry point runs `alembic upgrade head` before Uvicorn. Migration failure stops deploy; use a release job if scaling backend replicas.

## Environment Contracts

`frontend/.env.example`:

```dotenv
NEXT_PUBLIC_SITE_URL=https://melssy.beauty
NEXT_PUBLIC_API_URL=https://api.melssy.beauty
NEXT_PUBLIC_META_PIXEL_ID=REPLACE_WITH_META_PIXEL_ID
NEXT_PUBLIC_TIKTOK_PIXEL_ID=REPLACE_WITH_TIKTOK_PIXEL_ID
NEXT_PUBLIC_PREVIEW_EMPTY=false
```

`backend/.env.example`:

```dotenv
ENVIRONMENT=production
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/melssybeauty?sslmode=disable
CORS_ORIGINS=https://melssy.beauty
ORDER_WEBHOOK_URL=https://script.google.com/macros/s/REPLACE/exec
ORDER_WEBHOOK_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET
META_PIXEL_ID=REPLACE_WITH_META_PIXEL_ID
META_CAPI_ACCESS_TOKEN=REPLACE_WITH_META_CAPI_ACCESS_TOKEN
TIKTOK_PIXEL_ID=REPLACE_WITH_TIKTOK_PIXEL_ID
TIKTOK_EVENTS_API_ACCESS_TOKEN=REPLACE_WITH_TIKTOK_EVENTS_API_ACCESS_TOKEN
TRACKING_TEST_EVENT_CODE=
STANDARD_SHIPPING_FEE=35.00
FREE_SHIPPING_THRESHOLD=SET_BY_OWNER
```

`STANDARD_SHIPPING_FEE` and `FREE_SHIPPING_THRESHOLD` are backend configuration. The API alone calculates and persists COD shipping and totals; frontend prices are display estimates only. `NEXT_PUBLIC_PREVIEW_EMPTY` is development-only and must remain false in production. It may render explicitly marked review/UGC layout placeholders solely for review; absent real data with preview off, these sections render nothing.

This database URL is nonfunctional placeholder text only. Deploy storefront to `melssy.beauty`, API to `api.melssy.beauty`, HTTPS enabled; CORS only permits storefront. Add security headers, rate limits, request IDs, structured/redacted logs, and observability configuration. CI runs frontend lint/build/tests and backend lint/pytest/Alembic smoke test. The production pipeline must run the temporary-asset check before deploy. Playwright mobile checks homepage, PDP, cart, invalid/valid checkout mock, upsell, thank-you, footer-only collection.
