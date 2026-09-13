# MELSSY Build Documentation

This directory is the build contract for MELSSY, a French-language, mobile-first, cash-on-delivery beauty-sleep brand for Morocco. It describes a new standalone application; do not extend the Shopify skeleton theme in this repository.

## Read Order

1. [01-positioning-and-copy.md](01-positioning-and-copy.md): audience, positioning, approved French copy, and trust rules.
2. [02-experience-and-cro.md](02-experience-and-cro.md): information architecture, page requirements, checkout, upsell, and responsive behavior.
3. [03-catalog-and-content.md](03-catalog-and-content.md): catalog source of truth, placeholder media, content editing approach, and the supplied CSV.
4. [04-technical-architecture.md](04-technical-architecture.md): frontend, backend, database, Docker, environment, and deployment contracts.
5. [05-orders-webhook-and-sheet.md](05-orders-webhook-and-sheet.md): order lifecycle, Google Sheets Apps Script webhook, and sheet schema.
6. [06-analytics-and-capi.md](06-analytics-and-capi.md): Meta and TikTok pixel/CAPI implementation and test plan.
7. [07-ai-coder-brief.md](07-ai-coder-brief.md): the implementation prompt to give the AI coder.
8. [decisions.md](decisions.md): append-only, dated decisions supplied during implementation; newest entries take precedence where they conflict with earlier docs.

## Required Deliverables

The completed repository must contain:

```text
frontend/       Next.js customer storefront
backend/        FastAPI order, tracking, and webhook service
sheet/          Google Apps Script webhook file
docs/           This build documentation and CSV templates
```

Use `melssy.beauty` for the storefront and `api.melssy.beauty` for the API. The PostgreSQL database is `melssybeauty`. Production secrets belong only in EasyPanel environment variables. Never commit a real database URL, token, Pixel ID, access token, webhook secret, or customer data.

## Non-Negotiables

- French is the storefront language. Copy must feel native to French-speaking Moroccan women, not translated ad copy.
- The hero product is the only product in the main navigation and homepage funnel. The standalone collection is reachable only through the footer.
- Payment is exclusively cash on delivery. Do not show card or online-payment controls.
- Prices are editable catalog data, never hardcoded in components, copy, tracking, or tests.
- MELSSY is wordmark-only: no brand icon, monogram, or logo mark.
- Build mobile first. Editorial split layouts put text before image in mobile DOM, except the paid-landing hero, which begins with the coffret image.
- Real imagery must be swappable in one central content registry without code changes to each page. Temporary assets may only live under `frontend/public/images/temp/` and must be blocked from production deployment. Do not finalize database media models until the owner chooses an admin panel or headless CMS.