# Analytics and CAPI

## Tracking Architecture

Defer Meta and TikTok web pixels until consent requirements allow them. Components emit typed internal commerce events to provider adapters; never directly call vendor SDKs across UI. API owns all CAPI tokens.

Use one action-bound UUID `event_id` for browser and server event, retaining it through retry. Never generate a separate server ID. Meta browser events: `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`; product events include `content_type: "product"`, `content_ids`, `contents` (`id`, `quantity`), `value`, `currency: "MAD"`. Purchase fires only after DB commit. Meta’s current Pixel reference recommends `eventID` with Conversions API for deduplication.

Map the equivalent internal events to TikTok-supported standard events, normally `ViewContent`, `AddToCart`, `InitiateCheckout`, `CompletePayment`. Before writing final transport, verify current official TikTok Events API endpoint, auth, exact event name, deduplication field, and payload schema: these can be account/version dependent.

## CAPI Data Handling

Server only: trim + lowercase textual PII, SHA-256 hash UTF-8, use lowercase hex. Normalize phone to E.164 `+2126...`/`+2127...`, including `+`, before hashing. Do not expose CAPI token/client payload or raw PII. No events with customer PII before it is provided. Store consent decision. Pass provider-supported `_fbp`, `_fbc`, TikTok click/cookie values, server-observed IP, UA, event source URL/time; validate and minimize. Logs redact all raw PII, cookies, payloads, and tokens.

```ts
type CommerceEvent = {
  eventId: string;
  name: 'view_content' | 'add_to_cart' | 'initiate_checkout' | 'purchase';
  occurredAt: string;
  products: Array<{ id: string; quantity: number }>;
  value: string;
  currency: 'MAD';
  orderNumber?: string;
};
```

Purchase API accepts order number/event ID then obtains items/value from persistent state. Validate in Meta Events Manager and TikTok test tooling: paired browser/server event appears once; totals/items exact; retries create no duplicate conversion; consent-off sends no optional marketing events.
