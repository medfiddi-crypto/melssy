import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-white px-5 py-12 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Brand & Descriptor */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/rituel" className="wordmark text-lg">
            MELSSY
          </Link>
          <span className="wordmark-descriptor mt-1 text-[9px] font-medium tracking-[0.18em]">
            BEAUTY SLEEP RITUAL
          </span>
        </div>

        {/* Links Grid */}
        <div className="mb-8 grid grid-cols-2 gap-6 text-center text-xs sm:grid-cols-5 sm:gap-4">
          <Link href="/contact" className="underline underline-offset-4 hover:text-[var(--rose)]">
            Contact
          </Link>
          <Link href="/confidentialite" className="underline underline-offset-4 hover:text-[var(--rose)]">
            Politique de confidentialité
          </Link>
          <Link href="/conditions-generales" className="underline underline-offset-4 hover:text-[var(--rose)]">
            Conditions générales
          </Link>
          <Link href="/livraison-retours" className="underline underline-offset-4 hover:text-[var(--rose)]">
            Retours
          </Link>
          <Link href="/mentions-legales" className="underline underline-offset-4 hover:text-[var(--rose)]">
            Mentions légales
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center text-xs leading-6">
          <a
            href="https://wa.me/212666353909?text=Bonjour%2C%20j%27ai%20une%20question."
            target="_blank"
            rel="noreferrer"
            className="text-[var(--green)] underline underline-offset-2"
          >
            WhatsApp +212 666 353 909
          </a>
          <a href="mailto:contact@melssy.beauty" className="text-[var(--green)] underline underline-offset-2">
            contact@melssy.beauty
          </a>
        </div>

        {/* Reassurance */}
        <div className="mb-6 border-t border-b border-[var(--line)] py-4 text-center text-xs leading-6 text-black/65">
          Paiement à la livraison · Livraison offerte partout au Maroc
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-black/50">
          © 2026 MELSSY. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
