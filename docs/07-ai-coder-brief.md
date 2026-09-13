# AI Coder Brief

Copy/paste the following prompt:

```text
Build MELSSY as a production-ready, mobile-first French DTC COD storefront for Morocco. Read every Markdown file in /docs first; they are the source of truth. This repository contains a Shopify skeleton theme, but your deliverable is a separate application, not a Shopify-theme modification.

Create frontend/, backend/, sheet/, root Docker Compose and root README. Follow docs/04-technical-architecture.md exactly: Next.js App Router + TypeScript + Tailwind, FastAPI + async SQLAlchemy + Alembic, Docker, EasyPanel env variables, migrations at startup, DB name melssybeauty, and PostgreSQL URL normalization (`postgres`/`postgresql` to `postgresql+asyncpg`, remove `sslmode=disable`). Never commit any real connection string, secret, access token, Pixel ID, customer data, or production environment file. Include complete placeholder-only .env.example files.

Implement all routes/interactions in docs/02-experience-and-cro.md with the French brand system in docs/01-positioning-and-copy.md. It must be premium and intentional, not dropshipping. MELSSY uses wordmark only: menu left, Cormorant Garamond centered MELSSY + small BEAUTY SLEEP RITUAL, cart right. Only La Beauty Night Ritual™ appears in home/main nav. Standalone products are footer-only. Catalog/copy/prices/media must come from centralized editable content data. Use the documented media registry so future photography changes do not require page edits; components never hardcode image paths, and temporary assets never reach production.

Implement COD-only: cart drawer -> checkout modal with name and Morocco phone only; client and API normalization to `+2126XXXXXXXX`/`+2127XXXXXXXX`; no card payment controls. CTA adds product then opens drawer. Order-form bumps are the full-price 180 DH extra pillowcase pair and 100 DH extra bonnet; they add no shipping. Backend owns shipping/total calculation, using configured fee and threshold. Commit order before the sole 10-15s discounted post-order offer, 60 DH satin scrunchies from their 85 DH standalone price; acceptance updates the same order and its existing sheet row, then thank-you. Add notifier interface that only logs currently so WhatsApp can later plug in without checkout changes.

Implement FastAPI transactions, idempotency, outbox retry, and signed Google Apps Script webhook per docs/05-orders-webhook-and-sheet.md. Add Code.gs and sheet headers. Build deferred Meta/TikTok browser pixels and CAPI adapters per docs/06-analytics-and-capi.md: shared browser/server event ID, server-only normalized SHA-256 PII, `+` in E.164 before hashing, no frontend token, redacted logs. Verify current official TikTok payload requirements before final transport; do not guess.

Build mobile first. Editorial split layouts must have text before image in DOM except the paid-landing hero, which begins with a priority-loaded coffret image showing all five pieces. At 375px that hero image and the first headline line must be visible above the fold; crop tighter before shrinking type. Bundle PDP needs sticky mobile Add to Cart. Implement loading/error/empty states and accessibility. Do not render fake reviews, rating stars, scarcity, claims, delivery policy, legal details, internal process, pending-content, pre-launch, or placeholder-status copy. With missing review/UGC data, render nothing outside an explicitly development-only preview mode.

Add frontend unit tests/Playwright mobile path and backend tests for URL normalization, phone validation, idempotency, totals, webhook signing/outbox, CAPI hashing. Run lint/type/build/test commands and report exact results. Leave documented verified-content/CMS decision points configurable; do not block on them.
```
