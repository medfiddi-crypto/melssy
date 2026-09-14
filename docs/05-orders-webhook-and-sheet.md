# Orders, Webhook, and Sheet

## Order Lifecycle

1. Client submits product IDs, quantities, name, phone candidate, attribution, and idempotency UUID.
2. API validates catalog/offer/phone, calculates price, creates order transactionally.
3. API invokes manual notifier which logs only; it sends no WhatsApp/SMS/email.
4. API writes a Sheets webhook outbox record and returns success even if Sheets is unavailable.
5. A background worker sends signed events to Apps Script, retries undelivered records up to `ORDER_WEBHOOK_MAX_ATTEMPTS`, and never rolls back an order.
6. Accepted post-order upsell amends the same order, emits `order.updated`, and upserts the existing Google Sheet row by `order_number`; it never creates a second order or a second row.

PostgreSQL is authoritative; the spreadsheet is an operations mirror.

## Apps Script Contract

Create `sheet/Code.gs`: `doPost(e)` parses JSON, verifies `X-MELSSY-Signature` HMAC-SHA-256 of exact raw body with `ORDER_WEBHOOK_SECRET`, obtains `LockService`, then upserts by `order_number` and responds JSON. Read `ORDER_WEBHOOK_SECRET` and `SPREADSHEET_ID` only from `PropertiesService`. Never hardcode secrets. Protect the spreadsheet and restrict access to fulfilment personnel.

Headers are in [orders-sheet-template.csv](orders-sheet-template.csv). One row per order; `items` carries JSON line items. Staff maintain `call_status`, `delivery_status`, and `notes` only in Sheets; backend upserts preserve those values and never read them back. Raw/normalized phone is sensitive. Dates are ISO 8601 UTC and money is decimal MAD, never formatted display text. Repeated `event_id` must be idempotent; newest `occurred_at` wins.

```json
{"event":"order.created","event_id":"uuid","occurred_at":"2026-09-11T12:00:00Z","order":{"order_number":"MLS-...","status":"placed","customer_name":"...","phone_e164":"+2126...","currency":"MAD","subtotal":"449.00","discount_total":"0.00","total":"449.00","items":[],"source":"web","utm_source":null,"utm_campaign":null,"meta_fbp":null,"meta_fbc":null,"tiktok_click_id":null}}
```
