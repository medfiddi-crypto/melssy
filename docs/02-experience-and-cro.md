# Experience and CRO

## Navigation and Design

Header order is fixed: menu button left, centered `MELSSY` wordmark, cart icon right. Under the wordmark: `BEAUTY SLEEP RITUAL`. Use Cormorant Garamond, uppercase, wide letter spacing for the wordmark only. No logo icon or symbol. Menu: `La Beauty Night Ritual™`, `Notre histoire`, `Nous contacter`; never expose standalone products. Use a warm editorial luxury direction: ivory/light stone base, ink-black typography, muted rose and deep botanical green accents. Typography: Cormorant Garamond display and `DM Sans` UI/body. No fake badges, clutter, purple gradients, or rounded-card grid. Cards max 8px radius.

Accessibility: semantic landmarks, visible focus, 4.5:1 contrast, alt text, reduced motion, 44px touch targets. Performance: responsive AVIF/WebP, explicit dimensions, lazy-load below fold, prevent layout shift, defer third-party pixels.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Bundle-only brand funnel. |
| `/products/beauty-night-ritual` | Full bundle landing/product page. |
| `/collections/essentiels-de-nuit` | Footer-only low-key collection. |
| `/products/[slug]` | Light standalone product page. |
| `/a-propos` | Brand standards; no invented origin story. |
| `/contact` | Contact and factual support details. |
| `/rituel` | Paid-ad landing page with embedded COD order form. |
| `/merci/[orderNumber]` | COD confirmation with opaque order number. |

## Landing Page Sequence (`/rituel`)

1. Hero: full-bleed coffret image showing all five pieces, then eyebrow, headline, subheadline, `Le coffret complet`, contents, price, COD/delivery line, and embedded order form. The product image is priority-loaded; at 375px both it and the first headline line must be visible without scrolling. Crop the image tighter before reducing headline size.
2. `Les heures que l'on oublie`: a short emotional story beat.
3. Product reveal: exact contents and role of each item.
4. `Pourquoi le satin`: friction explanation in non-medical language.
5. `Le rituel`: evening sequence customers can picture themselves using.
6. Real UGC slider, when data exists, immediately after `Le rituel`; its placement is configured by the landing content section array. With no data it does not render at all.
7. FAQ: COD, delivery, contents, care, suitability, verified exchange/return policy.
8. Collection slider: last section before the footer; `Ajouter` updates the landing page's shared order state, never the cart drawer.
9. Footer: care/legal plus quiet `Les essentiels de nuit` link.

The order form appears twice and both instances use one shared state. For editorial split layouts, put text before the associated image in mobile DOM except for the paid-landing hero, whose product image must appear first. Hero imagery is full-bleed and full-width. Section images share the hero's `3:2` landscape ratio through one design token, sit below their mobile text at the normal page gutter, and have equal background-colored vertical spacing above and below; desktop uses vertically centred two-column layouts that alternate sides. Ritual step and inline detail images remain 80-96px squares beside text. Never float a section image against an edge or shrink its width to address height.

Mobile has a fixed, full-width deep-green `Commander · [prix]` CTA whenever no embedded order form is actually visible. It observes the form elements themselves, respects `env(safe-area-inset-bottom)`, scrolls to the nearest form and focuses `Nom complet`. It must not cover final content or appear above an open mobile nav drawer.

## Product, Cart, Checkout

Bundle PDP above fold: gallery, product name, editable price, authentic rating only if present, outcome, contents, COD reassurance, add CTA. Mobile sticky bar remains after native CTA: price + `Ajouter au panier`. Add action always opens the cart drawer. No bundle tiers, variants, subscriptions, or compare-at theatrics.

Cart drawer: items, total DH, COD note, quantity/remove, and cross-sells for extra pillowcase pair and bonnet. Adding a cross-sell keeps the drawer open. Cart CTA opens accessible checkout modal with summary, factual proof, COD explanation, and only name + mobile. Accept Moroccan formats with spaces/dashes and `0`, `+212`, or `00212`; normalize only `+2126XXXXXXXX`/`+2127XXXXXXXX`. Validate client and server.

The order form offers full-price bumps only: extra pillowcase pair at 180 DH and extra bonnet at 100 DH, both in the same parcel and without a crossed-out price. The hero coffret shows 35 DH struck through with `Offerte`; this is a real waived shipping fee. Standalone orders below the configured free-shipping threshold are charged the real 35 DH fee. Backend calculates the authoritative COD total.

After a committed order, show a 10-15s relevant post-order add-on discount, the only discount in the funnel: satin scrunchies at 60 DH from their 85 DH standalone price. The upsell price must not undercut a price offered earlier in the funnel. Server calculates it; acceptance amends the same order and updates its existing sheet row, then thank-you follows. No WhatsApp yet: create an isolated confirmation notifier that currently logs only.

## Acceptance Criteria

- Mobile hero reaches valid COD order without using the menu.
- Every product CTA opens cart drawer with cross-sells.
- Price originates from one catalog source.
- Invalid Moroccan numbers fail in UI and API.
- Standalone products have no homepage/main-menu promotion.
- No fabricated social proof, urgency, claims, or delivery promises.
