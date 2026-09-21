import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--green)] px-5 py-12 text-[#f7f3eb] sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Brand & Descriptor */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/rituel" className="wordmark text-lg text-[#f7f3eb]">
            MELSSY
          </Link>
          <span className="wordmark-descriptor mt-1 text-[9px] font-medium tracking-[0.18em] text-[#f7f3eb]">
            BEAUTY SLEEP RITUAL
          </span>
        </div>

        {/* Links Grid */}
        <div className="mb-8 grid grid-cols-2 gap-6 text-center text-xs sm:grid-cols-5 sm:gap-4">
          <Link href="/contact" className="text-[#f7f3eb] underline underline-offset-4 hover:opacity-80">
            Contact
          </Link>
          <Link href="/confidentialite" className="text-[#f7f3eb] underline underline-offset-4 hover:opacity-80">
            Politique de confidentialité
          </Link>
          <Link href="/conditions-generales" className="text-[#f7f3eb] underline underline-offset-4 hover:opacity-80">
            Conditions générales
          </Link>
          <Link href="/livraison-retours" className="text-[#f7f3eb] underline underline-offset-4 hover:opacity-80">
            Retours
          </Link>
          <Link href="/mentions-legales" className="text-[#f7f3eb] underline underline-offset-4 hover:opacity-80">
            Mentions légales
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center text-xs leading-6">
          <a
            href="https://wa.me/212666353909?text=Bonjour%2C%20j%27ai%20une%20question."
            target="_blank"
            rel="noreferrer"
            className="text-[#f7f3eb] underline underline-offset-2 hover:opacity-80"
          >
            WhatsApp +212 666 353 909
          </a>
          <a href="mailto:contact@melssy.beauty" className="text-[#f7f3eb] underline underline-offset-2 hover:opacity-80">
            contact@melssy.beauty
          </a>
        </div>

        {/* Reassurance */}
        <div className="mb-6 border-t border-[#f7f3eb]/20 py-4 text-center text-xs leading-6 text-[#f7f3eb]/80">
          Paiement à la livraison · Livraison offerte partout au Maroc
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-[#f7f3eb]/60">
          © 2026 MELSSY. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
