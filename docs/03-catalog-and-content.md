# Catalog and Content

## Source of Truth

Keep editable catalog data in `frontend/src/content/catalog.ts` or a typed CMS adapter. Components consume product IDs, prices, descriptions, image keys, and relationships from this source only. Format prices with `Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' })`; API payloads use decimal strings and `MAD`.

| ID | Name | Price DH | Placement |
| --- | --- | ---: | --- |
| `beauty-night-ritual` | La Beauty Night Ritual™ | 449 | Homepage, nav, PDP |
| `pillowcase-pair` | Paire de taies d'oreiller satinées | 180 | Bundle add-on only |
| `extra-bonnet` | Bonnet satiné | 100 | Bundle add-on only |
| `bonnet-solo` | Bonnet satiné | 130 | Footer collection only |
| `pillowcase-solo` | Taie d'oreiller satinée | 90 | Footer collection only |
| `heatless-curler-solo` | Boucleur sans chaleur | 160 | Footer collection only |
| `scrunchies-solo` | Chouchous satinés | 85 | Footer collection only |

The bundle has two pillowcases, one bonnet, two scrunchies, and one heatless curling rod presented as a complimentary gift. Do not infer bundle inventory from solo entries. Order-form bumps are full price. The sole discounted funnel offer is the post-checkout `scrunchies-solo` offer at 60 DH, from its 85 DH standalone price. Maintain the price ladder: a product is never cheaper at a later funnel stage than it was offered earlier.

## Media Registry

Centralize paths and alt text by key in `frontend/src/content/media.ts`; components never hardcode image paths. Temporary assets live only in `frontend/public/images/temp/`, are documented with their intended replacement, and must be rejected by the production deployment check. They must never render to live shoppers.

| Key | Ratio | Use |
| --- | --- | --- |
| `hero-ritual` | 4:5 full-width, tighter crop allowed at mobile | Hero coffret: all five pieces laid out together |
| `story-night` | 4:5 | Emotional story |
| `ritual-detail` | 3:2 | Coffret components/detail |
| `satin-benefit` | 4:5 | Why satin |
| `ritual-steps` | 1:1 | Compact ritual step images |
| `pdp-gallery-*` | 4:5 | Bundle gallery, 5 slots minimum |
| `solo-*` | 1:1 | Solo pages, 2 slots each |
| `ugc-*` | 9:16 | Vertical UGC video cards |

The lifestyle portrait belongs in `Pourquoi le satin`, not the hero. Section images fill their mobile guttered column, share the hero's `3:2` ratio through the design token, and have matching background-colored vertical spacing; only ritual step/detail images are deliberately compact squares. Once photography exists, replace media files through the documented directory/CMS fields while retaining keys and ratios. The registry is the only mapping layer, so later CMS adoption replaces the adapter rather than components. Do not finalize media database models until admin-panel vs CMS is selected. All paid-landing copy belongs in `frontend/src/content/landing.fr.ts`.

Content operations: supplier must approve material/care/measurement facts; review entries require consent and source reference; delivery/returns/legal content needs operations approval. Keep offer config (`enabled`, product, discounted price, duration) server-controlled. Editable catalog rows: [products-template.csv](products-template.csv).
