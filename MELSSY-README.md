# MELSSY application

Standalone frontend, API, and sheet webhook for the MELSSY COD storefront. The pre-existing Shopify theme remains untouched.

Run frontend: `cd frontend; npm run dev`.

Run backend: `cd backend; python -m uvicorn app.main:app --reload`.

See [README requirements](README.md) only if explicitly authorized to replace the existing theme README.

## Open items

- Configure all EasyPanel values from the placeholder env examples.
- Decide between an admin panel and headless CMS for media.
- Add approved legal, delivery, return, support, supplier, and authentic-review content.
- Verify TikTok's account-specific current Events API transport before activation.
