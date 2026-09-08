# CLAUDE.md — MELSSY

Source of truth for this project. Read this before making any change to the theme.

If something in this file conflicts with an instruction given in chat, ask rather than guess.
If a piece of information is marked UNCONFIRMED, do not invent a value. Build it as an
editable theme setting, metafield, or clearly labelled placeholder.

---

## 1. Brand foundation

**Brand name:** MELSSY
**Signature:** The Beauty Night Ritual™
**Core idea:** Beauty continues while you sleep.

MELSSY is a premium Moroccan beauty and sleep brand. It makes nighttime part of the beauty
routine rather than treating sleep accessories as ordinary products.

The brand should feel: premium, feminine, elegant, intimate, modern, warm, international,
effortless.

It should not feel: cheap, generic, mass-market, flashy, aggressive, or like a dropshipping
store.

MELSSY does not shout. It should feel confident enough to sell without urgency tactics.

### Positioning

Modern Mediterranean quiet luxury, accessible premium beauty.

The store's central job is to justify a 449 DH price against generic satin products sold
through Moroccan social ads. That justification comes from design quality, clarity, honesty,
and the brand narrative — not from discounts or pressure.

### Emotional and functional balance

The brand idea carries the emotion. The functional benefit carries the sale.

Every page should let a visitor understand both:
- the ritual idea (emotional)
- what satin actually does for hair overnight — less friction, less frizz, preserved styling
  (functional)

A store that is only atmospheric will be admired and not bought from.

---

## 2. Target customer

French-speaking Moroccan women interested in haircare, beauty, self-care, nighttime routines,
curly / wavy / frizzy hair, preserving hairstyles and blowouts overnight, and premium
lifestyle products.

They are willing to pay more for a well-designed, trustworthy brand rather than a generic
product.

Moroccan identity comes through language, local delivery, COD, creators and understanding of
local beauty concerns — never through decorative stereotyping.

---

## 3. Hero product

**THE BEAUTY NIGHT RITUAL™**

Launch price: **449 DH**

Contents:
- 2 satin pillowcases — target 70 × 50 cm, zipper closure
- 1 satin bonnet — approx. 30 cm, elasticated opening
- 2 satin scrunchies
- 1 heatless curling rod (complimentary gift)

Rules:
- Never hardcode the price. It comes from Shopify product data.
- The curling rod is a genuine free gift. Do not present it as a discounted paid item.
- The gift must be removable or changeable later without rewriting the product page.
- Launch with a single colorway. Do not render a variant selector with only one option.
  Build the architecture so variants can be added through Shopify later.

### UNCONFIRMED — do not invent

- **Fabric composition.** Not finalised.
- **Final colorway**, and whether all items in the box match.
- **Delivery cost, timing, and courier.**
- **COD provider / app.**
- **Care and washing instructions.**
- **Packaging dimensions** (provisional: approx. 35 × 25 × 8 cm).
- **Legal and company information.**
- **Final logo.**
- **Domain.** melssy.com is available but not purchased. Never hardcode a domain.
- **Social media URLs.**

---

## 4. Material claims — hard restrictions

Satin is a weave, not a fibre. Until the supplier specification is confirmed:

**Never write** — silk, soie, 100% silk, mulberry silk, or any fibre claim.
**Use** — satin, tissu satiné, and keep the material field editable.

**Never claim** — cures hair damage, prevents hair loss, treats acne, guarantees wrinkle
prevention, repairs hair, prevents all breakage, guarantees hair growth.

**Defensible language only:**
- helps reduce friction / limite les frottements
- designed to be gentler on hair
- helps preserve styling overnight
- designed for a smoother morning

What is verifiable today and safe to state: smooth low-friction surface, zipper closure,
70 × 50 cm, elasticated bonnet.

All claims must remain editable.

---

## 5. Brand story — source of truth

Do not replace this with generic brand-story copy. Adapt its length for different placements,
but keep the narrative and voice.

> Votre routine beauté ne s'arrête pas quand vous fermez les yeux.
>
> Chaque soir, vous prenez soin de vous.
> Vous hydratez votre peau.
> Vous prenez soin de vos cheveux.
> Vous appliquez vos produits.
> Vous faites votre routine.
>
> Puis vous vous couchez.
>
> Et pendant les 7 ou 8 heures qui suivent, vos cheveux frottent contre votre oreiller, votre
> peau est en contact avec le tissu et votre brushing peut perdre sa forme pendant votre
> sommeil.
>
> C'est une chose à laquelle on ne pense presque jamais.
>
> Nous, on s'est posé une question simple :
> Et si notre routine beauté continuait pendant notre sommeil ?
>
> C'est de cette idée qu'est née MELSSY.
>
> Nous avons imaginé une nouvelle façon de prendre soin de soi : le Beauty Sleep.
> Des essentiels conçus pour accompagner votre routine nocturne et vous aider à préserver vos
> cheveux et votre confort pendant votre sommeil.
>
> Notre premier rituel associe :
>
> **Une taie d'oreiller satinée**
> Une surface douce et lisse conçue pour limiter les frottements avec les cheveux par rapport
> à des tissus plus rugueux.
>
> **Un bonnet satin**
> Pour garder les cheveux protégés pendant la nuit et aider à limiter les frottements et les
> frisottis.
>
> **Des chouchous satinés**
> Pour attacher vos cheveux avec douceur et éviter de sacrifier votre routine beauté au moment
> de dormir.
>
> Parce que prendre soin de ses cheveux ne devrait pas s'arrêter à 23h.
>
> Nous croyons que la beauté ne consiste pas seulement à ajouter toujours plus de produits à sa
> routine. Parfois, il suffit de changer une petite chose dans ce que vous faites déjà.
>
> Une meilleure façon de dormir.
> Une meilleure façon de protéger vos cheveux.
> Une meilleure façon de commencer votre matinée.
>
> Dormez. Réveillez-vous. Recommencez.
>
> Votre routine beauté continue pendant votre sommeil.
>
> **MELSSY — Beauty while you sleep.**

### Narrative arc

BEAUTY ROUTINE → BEDTIME → THE OVERLOOKED HOURS → THE QUESTION → MELSSY → THE BEAUTY NIGHT RITUAL™

### Placement

- Homepage: short emotional version + visual storytelling section
- About page: full story
- Product page: short excerpts
- Future campaign / UGC landing pages: selected lines

Never dump the whole story as one block on the homepage.
Do not invent a founder story or personal history.
Do not turn it into scientific claims.

---

## 6. Design system

### Colour tokens

| Token       | Hex       | Use |
|-------------|-----------|-----|
| `--ink`       | `#1A1A1A` | Body text, wordmark, primary buttons |
| `--ink-soft`  | `#4A4744` | Secondary text, captions |
| `--ivory`     | `#FAF8F5` | Page background |
| `--cream`     | `#F2ECE4` | Alternating section background |
| `--sand`      | `#E3D9CC` | Borders, dividers, subtle fills |
| `--blush`     | `#D8B9AC` | Single accent — use sparingly |
| `--night`     | `#14161C` | Footer and night-story section only |
| `--white`     | `#FFFFFF` | Cards, product surfaces |

One accent colour only. No gold. No gradients. No glow effects.

### Typography

- **Display:** Cormorant Garamond, weights 300–400. Headlines only. Generous letter-spacing
  at large sizes.
- **Body / UI:** Inter, weights 400 and 500. Nothing heavier.
- **Wordmark:** MELSSY in Inter, uppercase, wide letter-spacing. Simple, embroidery-friendly,
  replaceable without redesigning the theme.

Two typefaces total. No decorative fonts.

### Spacing scale

`4 / 8 / 16 / 24 / 40 / 64 / 96 / 144` px

Section vertical padding: 96px desktop, 64px mobile.
Generous whitespace is most of what makes the store read as premium.

### Other tokens

- **Radius:** 2px on buttons and inputs. 0 on images. Sharp reads editorial; rounded reads
  template.
- **Shadows:** almost none. One subtle shadow on the sticky mobile CTA only.
- **Transitions:** 200ms ease-out. Fades and gentle hovers only.
- **Motion:** no bouncing, flashing, or parallax. Respect `prefers-reduced-motion`.

### Layout principles

Whitespace, strong typography, editorial composition, large imagery, subtle borders, clear
hierarchy. Asymmetry where it helps.

Avoid turning every section into identical three-column cards. Each section needs a reason to
exist.

### Image ratios — fixed now, shot to later

| Placement | Ratio |
|-----------|-------|
| Hero desktop | 3:2 |
| Hero mobile | 4:5 |
| Product gallery | 1:1 |
| Lifestyle | 4:5 |
| UGC video | 9:16 |

Real photography does not exist yet. Use tasteful placeholders sized to these ratios so images
can be swapped without breaking layout.

### Photography direction (for later)

Warm, intimate, feminine, soft, nighttime-oriented, natural. Avoid obvious stock imagery,
AI-looking imagery, cluttered bedrooms, unrealistic luxury sets, or anything sexualised.

---

## 7. Homepage structure

Seven sections at launch. Fourteen sections with empty gaps converts worse than seven complete
ones.

1. **Hero** — image, headline, single CTA
2. **The overlooked hours** — short emotional hook from the brand story
3. **The product** — what it is, price, what's in the box, CTA
4. **Why satin** — three functional benefits
5. **The ritual** — four steps, night to morning
6. **FAQ** — delivery, COD, materials, care
7. **Footer**

Hero headline: *Votre routine beauté ne s'arrête pas quand vous fermez les yeux.*
Hero CTA: *Découvrir le Rituel*

UGC and reviews are built as complete hidden sections and slot in at positions 6 and 7 once
real content exists.

### Benefits (section 4)

Section heading: *Pensé pour vos cheveux*

- **MOINS DE FROTTEMENTS** — designed to reduce friction between hair and fabric during sleep
- **RÉVEILLEZ-VOUS PRÊTE** — helps preserve your hairstyle and makes mornings easier
- **VOTRE RITUEL DU SOIR** — turns the last moments of the day into a simple beauty ritual

### Ritual steps (section 5)

Section heading: *Le rituel, en quatre temps*

`01 — PRÉPARER` · `02 — PROTÉGER` · `03 — DORMIR` · `04 — RÉVÉLER`

### FAQ (section 6)

Section heading: *Questions fréquentes*

All copy editable.

---

## 8. Product page

**Above the fold:** gallery, title, price, short value proposition, variant selector (only when
more than one variant exists), quantity, CTA, gift messaging, delivery messaging, COD.

**Below:** What's Included · Why Satin · How To Use · Materials & Dimensions · Delivery ·
Returns · FAQ · Care. Accordions where appropriate.

Nothing hardcoded: price, colours, inventory, dimensions, descriptions, materials, delivery
estimates, care instructions, gift information. Use Shopify product data, variants, metafields,
dynamic sources, theme settings and blocks.

---

## 9. COD and cart

COD provider is UNCONFIRMED. A COD form app will be chosen later and will inject its own form.

Therefore: build the purchase area of the product page as a **self-contained block**. When a
provider is chosen, that one block is swapped and nothing else in the layout moves. This is the
realistic meaning of "modular" here — a layout cannot be neutral to every possible app.

Cart shows: product, variant, quantity, price, subtotal, complimentary gift, delivery
information, CTA.
Cart CTA: *Complétez votre rituel*

Order experience is mobile-first with minimal fields: full name, phone, city, address, optional
second address line, product/variant, quantity. Moroccan phone validation.

Delivery messaging: *Livraison partout au Maroc*. Do not advertise free delivery. Do not invent
courier names, prices or timings. All delivery text editable.

---

## 10. Pricing rules

449 DH is the current display price.

- No crossed-out "original" price.
- No artificial discount.
- No countdown timers, fake scarcity, fake urgency, or discount banners.

If a reference price is ever established, it will be a real one.

---

## 11. UGC and reviews

Build both architectures now. **Keep both hidden by default** until real content exists.

**Never fabricate:** customer names, ratings, testimonials, review counts, before/after
results, creator names, creator content, press logos, awards, customer counts, or any social
proof.

UGC section must later accept, without rebuilding: vertical videos, images, creator names,
handles, captions, optional links, thumbnails, multiple creators. Mobile-first, 9:16.

Review section must later accept: written reviews, star ratings, customer photos and videos,
verified-purchase indicators, dates.

Both must be activatable from the Theme Editor.

---

## 12. Language

**French only at launch.** Do not build the Arabic storefront now.

Build the language architecture cleanly using Shopify's native translation setup so Arabic and
RTL can be added later without retrofitting. Arabic requires a genuinely separate layout pass,
not a mechanical mirror — that is a later project, gated on customer demand.

---

## 13. Editability — critical requirement

**Shopify Theme Editor** = everyday content and design changes.
**Claude Code** = structural, design-system and functionality changes.

Through the Theme Editor the operator must be able to change: headings, body text, button
labels and links, images, videos, product selection, colours, section visibility, section
order, product information, gift messaging, FAQs, UGC content, review content, creator details,
social links.

Do not hardcode anything that might realistically change after launch.

Do not attempt to make every line of code editable. Give each section the controls that
actually make sense for it — not an identical settings schema copied across all of them.

Keep code modular. Avoid coupling between sections so future changes are safe and isolated.

---

## 14. Shopify implementation

Foundation: **Dawn**.

Use Shopify Liquid, sections, blocks, Theme Editor settings, product data, variants, and
metafields where appropriate. Clean CSS, minimal JavaScript, no unnecessary dependencies.

Do not build a complex custom application. Stay compatible with Shopify theme architecture.

Structure the theme so dedicated landing pages for specific Meta/TikTok UGC angles can be added
later without rebuilding the store.

Do not display empty collections.

Future collections to accommodate: Le Rituel, Taies d'oreiller, Bonnets, Accessoires cheveux,
Coiffure sans chaleur, Masques de nuit, Vêtements de nuit.

---

## 15. SEO

Semantic HTML, correct heading hierarchy, meta title and description, alt text, canonical URLs,
Open Graph, structured data where appropriate, clean URLs.

Relevant French terms: taie d'oreiller satin, bonnet satin, cheveux bouclés, cheveux frisés,
routine cheveux, routine beauté, satin Maroc.

Do not keyword stuff.

---

## 16. Accessibility

Semantic HTML, alt text, keyboard navigation, visible focus states, sufficient contrast,
accessible buttons and accordions, screen-reader labels, reduced-motion support.

Contrast note: `--blush` on `--ivory` fails contrast for text. Use it for fills and rules only,
never for body copy.

---

## 17. Performance

Mobile-first. Optimised and responsive images, lazy loading where appropriate, minimal
JavaScript, minimal dependencies, clean CSS, no unnecessary third-party scripts.

Most paid traffic will be mobile. Test small phones first, not desktop.

---

## 18. Analytics

Prepare architecture for Meta Pixel, Meta Conversions API, and Google Analytics. Events:
product view, add to cart, begin checkout, purchase, CTA click.

Do not add tracking scripts until accounts exist. Preserve UTM parameters.

---

## 19. What the store must not look like

Not: a dropshipping store, AliExpress, a cheap template, an over-designed luxury site, a
one-product landing page, a discount store, or a fake influencer brand.

Avoid: fake countdowns, fake urgency, fake scarcity, fake reviews, fake statistics, fake
badges, fake press, fake awards, excessive popups, excessive animation, gradients, gold,
rounded cards, and icon clutter.

---

## 20. Final rule

Given a choice between **more features** and **better typography, spacing, hierarchy, imagery
and brand perception** — choose the second.

Do not fabricate. Do not overbuild. Do not block on missing assets — build the architecture,
hide unfinished content, keep it editable.

The goal is not to launch a Shopify website. The goal is to launch MELSSY.
