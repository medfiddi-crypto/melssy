# Implementation Decisions

Append each decision supplied in chat in the same pass as its implementation. Newest entries take precedence over earlier documentation where they conflict.

## 2026-09-11

- Valid order submission must visibly distinguish field validation from API failure. Local development requires a reachable `NEXT_PUBLIC_API_URL`; the post-order upsell is a separate route before the confirmation-only thank-you page.
- The fixed ritual CTA is available on desktop and mobile, uses the content-managed `Complétez votre rituel · [prix]` label, and shares the same header-offset scroll/focus helper as every form-directed CTA.
- Landing order-form CTAs use the content-managed label `Complétez votre rituel · [prix]`; every form-directed CTA scrolls to the nearest order form below the sticky header and focuses `Nom complet`.
- The post-upsell thank-you page has one purpose: COD confirmation and parcel acceptance. It loads the authoritative order recap by opaque order number, contains no offers or product-selling UI, and emits Purchase at most once per order refresh session.
- The thank-you page's primary action is a WhatsApp confirmation link. Its confirmation timeframe, delivery window, WhatsApp number, and social handles remain explicit owner-supplied placeholders in content configuration.
- The thank-you packaging visual uses the shared section-image layout token and is reassurance only: no price, CTA, or product link.
- Section images now share the hero's `3:2` landscape ratio through one CSS token, `--section-image-ratio`, in `frontend/src/app/globals.css`. The same shared layout applies equal background-colored vertical spacing above and below every section image, including after coloured content blocks.
- Temporary supplied photography is assigned through the central media registry: `satin-picture-2.webp` for the hero and satin section, `satin-picture.webp` for the coffret section, and `satin-pink.jpg` retained in the temporary asset registry for future preview use. These files remain deployment-blocked temporary assets.
- All section images use one shared 4:5 portrait layout contract: identical mobile gutters and vertical spacing, full column width, and `object-fit: cover`. Its ratio, width, and spacing are defined once so every section changes together; hero, ritual-step squares, and UGC cards remain separate categories.
- Hero imagery is full-bleed and full-width; section imagery fills its column below the mobile text with the normal gutter and is no taller than 4:5; ritual step and inline detail imagery uses 80-96px squares beside text. Never shrink a section image's width to solve a height constraint or float it against an edge.
- On desktop, section text and imagery use vertically centred two-column layouts that alternate sides between sections.
- The mobile sticky `Commander` CTA is fixed above the safe-area inset and visible whenever no order form is actually intersecting the viewport. It observes form elements themselves, scrolls to the nearest form, focuses `Nom complet`, and never covers final content.
- Paid-landing hero order is: coffret image, eyebrow, headline, subheadline, coffret label, contents, price, payment/delivery line, then order form.
- The paid-landing hero uses a priority-loaded full-width coffret image showing all five pieces; at 375px it and the first headline line must be above the fold, using a tighter crop before reducing headline size.
- The lifestyle portrait belongs in `Pourquoi le satin`, not the paid-landing hero.
- `/rituel` renders two order forms backed by one shared state.
- The UGC slider follows `Le rituel`; the collection slider is the final section before the footer and adds to the shared order state instead of the cart drawer.
- UGC and reviews with missing real data render nothing in production; a development-only environment flag may show clearly marked layout placeholders.
- Rating stars, scarcity, internal-process, pending-content, pre-launch, and placeholder-status copy do not render without real data.
- Only the hero may use a full-width image larger than 4:5; all other full-width imagery is 4:5 or smaller.
- All image paths come from one media config file; temporary assets live only in `frontend/public/images/temp/`, have documented replacements, and are blocked from production deployment.
- All paid-landing copy lives in `frontend/src/content/landing.fr.ts`.
- Order-form bumps are full price: extra pillowcase pair 180 DH and extra bonnet 100 DH, with no crossed-out prices.
- The only discounted funnel offer is the post-checkout satin scrunchies upsell at 60 DH from the 85 DH standalone price; a later funnel stage must never make an item cheaper than it was offered earlier.
- Hero coffret shipping is a real 35 DH fee waived and displayed struck through with `Offerte`; standalone orders below the owner-configured threshold are charged the real 35 DH fee.
- Shipping fee and free-shipping threshold are configuration, never component literals; the backend is the authoritative source for COD totals.
- Order bumps ship in the same parcel and do not increase shipping.
- An accepted upsell amends the same order and updates the existing Google Sheet row by order number; it never creates a second order or sheet row.
