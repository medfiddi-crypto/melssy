# MELSSY storefront

MELSSY is a French-language, mobile-first cash-on-delivery storefront for the Moroccan market. The Next.js frontend provides the storefront and same-origin API proxy; the FastAPI backend creates and manages COD orders.

## Structure

- `frontend/`: Next.js storefront and same-origin API proxy.
- `backend/`: FastAPI ordering service and Alembic migrations.
- `sheet/`: planned Google Sheets order integration.
- `docs/`: product, content, architecture, and operating documentation.

## Local development

Install dependencies:

Run the frontend:

```sh
cd frontend
npm install
npm run dev
```

Run the backend:

```sh
cd backend
pip install -e ".[dev]"
python -m uvicorn app.main:app --reload
```

Or start the local application stack with Docker Compose:

```sh
docker compose up --build
```

## Environment variables

Copy `.env.example` to `.env` and provide values for `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`, and `CORS_ORIGINS` before using Docker Compose. `DATABASE_URL` must point to the Compose `database` service, for example `postgresql://USER:PASSWORD@database:5432/DATABASE`.

Backend configuration is documented in `backend/.env.example`: production requires `DATABASE_URL`, `CORS_ORIGINS`, and any enabled webhook or analytics credentials. Frontend configuration is documented in `frontend/.env.example`; the contact, delivery, shipping, and public analytics variables used by the storefront must be set for a production build. Keep all `.env` files private.

The frontend uses relative `/api/...` requests; its Next.js route proxy resolves the backend target. Do not hardcode backend hosts in frontend components. Local databases, environment files, caches, and build output must not be committed.
