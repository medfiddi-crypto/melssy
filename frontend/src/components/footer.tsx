import Link from "next/link";

// Global `button, a { min-height: 44px }` is unlayered, so `!` is needed to win.
const linkClass = "inline-flex min-h-8! items-center text-xs leading-4 text-[#f7f3eb] underline underline-offset-4 hover:opacity-80";

export function Footer() {
  return (
    <footer className="bg-[var(--green)] px-4 py-4 text-[#f7f3eb] sm:px-6 [main[data-sticky-cta]+&]:pb-[calc(var(--sticky-cta-height)+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 xl:flex-row xl:justify-between xl:gap-6">
        {/* Brand & Descriptor */}
        <div className="flex flex-col items-center text-center xl:items-start xl:text-left">
          <Link href="/rituel" className="wordmark inline-flex min-h-0! items-center text-lg leading-6 text-[#f7f3eb]">
            MELSSY
          </Link>
          <span className="wordmark-descriptor text-[9px] font-medium leading-3 tracking-[0.18em] text-[#f7f3eb]">
            BEAUTY SLEEP RITUAL
          </span>
        </div>

        {/* Legal links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-4">
          <Link href="/contact" className={linkClass}>
            Contact
          </Link>
          <Link href="/confidentialite" className={linkClass}>
            Politique de confidentialité
          </Link>
          <Link href="/conditions-generales" className={linkClass}>
            Conditions générales
          </Link>
          <Link href="/livraison-retours" className={linkClass}>
            Retours
          </Link>
          <Link href="/mentions-legales" className={linkClass}>
            Mentions légales
          </Link>
        </nav>

        {/* Contact Info */}
        <div className="flex flex-wrap items-center justify-center gap-x-4">
          <a
            href="https://wa.me/212666353909?text=Bonjour%2C%20j%27ai%20une%20question."
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            WhatsApp +212 666 353 909
          </a>
          <a href="mailto:contact@melssy.beauty" className={linkClass}>
            contact@melssy.beauty
          </a>
        </div>
      </div>

      <div className="mx-auto mt-2 max-w-6xl border-t border-[#f7f3eb]/20 pt-2 text-center text-[11px] leading-4">
        {/* Reassurance */}
        <div className="text-[#f7f3eb]/80">
          Paiement à la livraison · Livraison offerte partout au Maroc
        </div>

        {/* Copyright */}
        <div className="text-[#f7f3eb]/60">
          © 2026 MELSSY. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
