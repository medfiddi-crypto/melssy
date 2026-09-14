# Repository inventory

Audit date: 2026-09-14. This is a read-only classification of the current worktree. "No reference found" means no reference was found in `frontend/src`, `backend`, Docker configuration, or the current application documentation. It cannot rule out an external Shopify CLI configuration or a deployment system outside this repository.

## SECTION 1 — DEAD SHOPIFY THEME FILES (56 files)

These are Shopify-theme runtime files or Shopify-only theme instructions. None is referenced by `frontend/src`, `backend`, `docker-compose.yml`, or the Next.js/FastAPI Dockerfiles. Deleting this whole section will not break the checked-in Next.js build, FastAPI service, Docker Compose configuration, or the two container builds. It would only remove the obsolete Shopify theme and its local Shopify CLI/theme-check configuration.

- `assets/` (5 files): `critical.css`, `icon-account.svg`, `icon-cart.svg`, `icon-menu.svg`, `shoppy-x-ray.svg`. No application reference; `shoppy-x-ray.svg` is referenced only by the old root Shopify README.
- `blocks/` (12 files): `benefit-item.liquid`, `box-item.liquid`, `collapsible-tab.liquid`, `faq-item.liquid`, `group.liquid`, `purchase-box.liquid`, `review-item.liquid`, `ritual-step.liquid`, `social-link.liquid`, `story-moment.liquid`, `text.liquid`, `ugc-item.liquid`. No application reference.
- `config/` (2 files): `settings_data.json`, `settings_schema.json`. No application reference.
- `layout/` (2 files): `password.liquid`, `theme.liquid`. No application reference.
- `locales/` (1 file): `fr.json`. No application reference.
- `sections/` (22 files): `404.liquid`, `article.liquid`, `blog.liquid`, `cart.liquid`, `collection.liquid`, `collections.liquid`, `custom-section.liquid`, `faq.liquid`, `footer.liquid`, `header.liquid`, `hello-world.liquid`, `hero.liquid`, `overlooked-hours.liquid`, `page.liquid`, `password.liquid`, `product.liquid`, `reviews.liquid`, `search.liquid`, `the-product.liquid`, `the-ritual.liquid`, `ugc.liquid`, `why-satin.liquid`. No application reference. The modified files are `sections/footer.liquid`, `snippets/css-variables.liquid`, and `snippets/wordmark.liquid`; they are still dead theme files.
- `snippets/` (4 files): `css-variables.liquid`, `image.liquid`, `meta-tags.liquid`, `wordmark.liquid`. No application reference.
- `templates/` (3 files): `gift_card.liquid`, `index.json`, `product.json`. No application reference.
- `.shopifyignore` and `.theme-check.yml` (2 files): Shopify CLI and Theme Check configuration. No application reference.
- `AGENTS.md` and `CLAUDE.md` (2 files): Shopify-theme-specific instructions and obsolete theme source-of-truth material. No application reference; they conflict with the migrated application architecture.
- `README.md` (1 file): Skeleton Shopify theme README. No application reference; it embeds `assets/shoppy-x-ray.svg` and documents JSON templates, sections, and blocks.

Folders in this section are also dead: `assets/`, `blocks/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, and `templates/`.

## SECTION 2 — LIVE FILES (67 files)

These are part of the running storefront/API, their build/test configuration, or the active implementation documentation. Empty Python `__init__.py` files are included because they define the package structure.

### Storefront runtime

- `frontend/src/app/layout.tsx`, `globals.css`, and `favicon.ico`: root document, shared styles, and site icon.
- `frontend/src/app/page.tsx`: homepage and its legacy in-page cart/checkout implementation.
- `frontend/src/app/rituel/page.tsx`: paid-traffic ritual landing page and client order form.
- `frontend/src/app/commande/route.ts`: non-JavaScript order-form POST bridge to the FastAPI order endpoint.
- `frontend/src/app/api/v1/[...path]/route.ts`: same-origin proxy for FastAPI `/v1` requests.
- `frontend/src/app/offre/[orderNumber]/page.tsx` and `offre/[orderNumber]/decision/route.ts`: post-order offer and its server-side decision fallback.
- `frontend/src/app/merci/page.tsx` and `merci/[orderNumber]/page.tsx`: query-string and server-rendered thank-you routes.
- `frontend/src/app/products/beauty-night-ritual/page.tsx`, `products/[slug]/page.tsx`, and `collections/essentiels-de-nuit/page.tsx`: bundle, standalone-product, and collection pages.
- `frontend/src/app/a-propos/page.tsx`, `contact/page.tsx`, `conditions-generales/page.tsx`, `confidentialite/page.tsx`, and `livraison-retours/page.tsx`: informational storefront routes.
- `frontend/src/app/ritual/page.tsx`: compatibility redirect from `/ritual` to `/rituel`.
- `frontend/src/app/robots.ts` and `sitemap.ts`: generated SEO endpoints.
- `frontend/src/components/carousel.tsx`, `section-image.tsx`, `ugc-carousel.tsx`, and `thank-you-page.tsx`: reusable landing-page and confirmation UI.
- `frontend/src/content/catalog.ts`, `landing.fr.ts`, `media.ts`, and `storefront.ts`: typed catalog, landing copy, media registry, and required runtime contact/delivery configuration.
- `frontend/src/lib/analytics.ts`: browser commerce-event and UUID helpers.
- `frontend/public/images/coffret-placeholder.webp` and `images/hero-pictures.webp`: currently referenced public images.

### Frontend build and configuration

- `frontend/package.json` and `package-lock.json`: Node dependencies and reproducible install lockfile.
- `frontend/next.config.ts`, `tsconfig.json`, `next-env.d.ts`, `postcss.config.mjs`, and `eslint.config.mjs`: Next.js, TypeScript, PostCSS, and lint configuration.
- `frontend/Dockerfile`: production frontend container build.
- `frontend/.env.example`: non-secret example environment contract.
- `frontend/.gitignore`: ignores frontend dependencies, build output, local environment files, and generated TypeScript state.
- `frontend/scripts/check-temp-assets.mjs`: deploy-time guard against shipping temporary media.

### Backend runtime, migrations, and tests

- `backend/app/main.py`: FastAPI application, CORS/security middleware, catalog, order, offer, and confirmation endpoints.
- `backend/app/core/__init__.py`, `config.py`, `phone.py`, and `security.py`: package marker, settings/database URL normalization, Moroccan phone validation, and hashing/signing helpers.
- `backend/app/db/__init__.py` and `session.py`: package marker plus async SQLAlchemy engine/session dependency.
- `backend/app/models/__init__.py` and `orders.py`: package marker plus order, order-item, and tracking-outbox ORM models.
- `backend/app/schemas/__init__.py` and `orders.py`: package marker plus Pydantic request/response schemas.
- `backend/app/services/__init__.py`, `catalog.py`, `notifier.py`, and `orders.py`: package marker, server-side catalog, confirmation-notifier interface, and transactional order/upsell service.
- `backend/app/__init__.py` and `api/__init__.py`: Python package markers.
- `backend/alembic.ini`, `alembic/env.py`, `alembic/script.py.mako`, and `alembic/versions/0001_orders.py`: Alembic configuration and the order-schema migration invoked at container startup.
- `backend/pyproject.toml`, `start.sh`, `Dockerfile`, and `.env.example`: Python dependencies, migration-plus-Uvicorn entrypoint, container build, and non-secret example environment contract.
- `backend/tests/test_core.py` and `test_integrations.py`: unit coverage for configuration, phone handling, totals, signing, and PII hashing.

### Integration and operating documentation

- `docker-compose.yml`: local PostgreSQL, frontend, and backend stack.
- `sheet/Code.gs` and `sheet/orders-template.csv`: intended Google Sheets webhook receiver and its order-row schema; see Section 3 for its current wiring uncertainty.
- `docs/README.md`, `01-positioning-and-copy.md`, `02-experience-and-cro.md`, `03-catalog-and-content.md`, `04-technical-architecture.md`, `05-orders-webhook-and-sheet.md`, `06-analytics-and-capi.md`, `07-ai-coder-brief.md`, `decisions.md`, `orders-sheet-template.csv`, and `products-template.csv`: active product, architecture, operational, and content specifications.
- `.gitignore`: repository-wide ignore rules, including the local database/cache rules used by this application.

## SECTION 3 — UNCERTAIN (8 files)

These files are not confidently dead, but they are not confirmed as active runtime dependencies either.

- `frontend/.env.local`: ignored local runtime configuration. It may be required on this developer machine; it is intentionally not inspected or suitable for git.
- `backend/app/services/webhook.py`: signed webhook helper, but no live service calls `deliver_order_webhook`; retain until the outbox worker/integration status is decided.
- `backend/app/services/capi.py`: Meta/TikTok payload builders, but no endpoint or worker invokes them; retain if CAPI work is imminent, otherwise it is unintegrated code.
- `sheet/Code.gs` and `sheet/orders-template.csv`: documented integration source, but the backend currently does not dispatch the webhook and no deployment link is stored in the repository.
- `MELSSY-README.md`: current-application README, but it says the obsolete Shopify theme remains intact and points to the old root README; it needs replacement or correction rather than blind deletion.
- `frontend/AGENTS.md` and `frontend/CLAUDE.md`: not inspected in this audit; they may contain application-specific instructions or stale copies. Review before retaining or deleting.

## SECTION 4 — OTHER CLUTTER (14 files, plus generated directories)

- `melssy-dev.db` (40 KB) and `backend/melssy-dev.db` (68 KB): ignored local SQLite databases. Neither is tracked, but both can contain development order data and should remain out of git. Remove locally only when their data is no longer needed.
- `backend/**/__pycache__/*.pyc` (24 files currently): ignored Python bytecode cache. Safe to regenerate; never commit.
- `backend/melssy_api.egg-info/` (ignored directory): local package-install metadata. Safe to regenerate; never commit.
- `frontend/node_modules/` and `frontend/.next/` (ignored directories): installed dependencies and Next.js output. Safe to regenerate; never commit.
- `frontend/public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, and `window.svg`: unused create-next-app starter assets; no source reference.
- `frontend/public/images/temp/coffret-complet.svg` and `satin-detail.svg`: unused temporary assets; no registry or source reference.
- `frontend/public/images/temp/satin-pink.jpg`: present in the media registry but not used by a rendered page; temporary media should not ship.
- `frontend/src/content/thank-you.fr.ts`: orphaned copy registry; no source import. `thank-you-page.tsx` contains its own visible copy instead.
- `frontend/src/components/order-summary.tsx`: shown as deleted in the worktree but still tracked at `HEAD`; do not restore or remove it until the current uncommitted change is reviewed.
- `docs/copy-audit.md`: untracked 35 KB audit document. It may be useful working material, but it is not referenced by the app or documentation index; decide whether to retain it as project documentation.
- `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `LICENSE.md`, and `.gitattributes`: generic repository/governance files. They do not run the app; retain only if this repository will be shared or open-sourced.

## Deletion and rename decision

Deleting all 56 files in Section 1 is safe for the checked-in Next.js/FastAPI build and Docker deployment surfaces: there are no import, filesystem, Docker `COPY`, Compose, or application-document references to them. It would prevent using this repository as a Shopify theme and remove Shopify CLI/Theme Check support. Review external CI/CD, Shopify GitHub integration, and any deployment dashboard before executing deletion because those systems are outside this audit.

The repository should be renamed from `melssy-theme` to something application-oriented, such as `melssy-storefront` or `melssy`. A local folder rename does not alter imports, Docker Compose paths, or the application build because they are relative. It can affect the Git remote repository name/URL, clone URLs, CI checkout paths, deployment working-directory settings, documentation links, shell scripts outside this repository, and any external Shopify or hosting integration. Rename the remote and update those external settings only after the Shopify tree has been removed and the deployment configuration has been checked.
