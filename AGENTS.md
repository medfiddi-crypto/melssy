# MELSSY application instructions

## Architecture

- This repository is a standalone application, not a Shopify theme.
- The Next.js frontend is in `frontend/`; the FastAPI backend is in `backend/`.
- Do not add, edit, or restore Liquid, Shopify theme-editor, sections, snippets, templates, or Shopify CLI files.
- The frontend calls relative `/api/...` paths. The Next.js proxy owns the backend target; never hardcode API hosts in UI code.

## Product constraints

- The storefront is French-only for the Moroccan market and supports cash on delivery only.
- Preserve server-side price and order-total calculation. Do not hardcode prices outside the typed catalog/configuration layer.
- Do not invent product, material, delivery, legal, or customer-review claims.

## Quality and testing

- Build mobile-first and verify visual changes at a 375px viewport.
- A desktop-browser preview cannot reproduce iOS Safari touch behavior; test physical iOS behavior separately when touch interactions change.
- Run the narrowest relevant checks, then `npm run lint` and `npm run build` for frontend changes when practical.
- Never commit local database files, Python caches, Node dependencies, environment files, or other generated output.

## Boundaries

- Keep the checkout, offer decision, and thank-you flow unchanged unless the user explicitly requests their modification.
- `backend/app/services/webhook.py`, `backend/app/services/capi.py`, and `sheet/` are planned integrations; retain them unless explicitly told otherwise.
