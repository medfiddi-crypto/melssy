import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-[var(--background)] px-5 py-8 sm:px-6">
      <header className="mx-auto flex max-w-2xl flex-col items-center pb-8">
        <Link href="/rituel" className="wordmark text-2xl">MELSSY</Link>
        <span className="wordmark-descriptor mt-1 text-[9px] font-medium tracking-[0.18em]">BEAUTY SLEEP RITUAL</span>
      </header>

      <article className="mx-auto max-w-2xl space-y-6 pb-16 text-sm leading-7">
        <h1 className="display text-4xl">Conditions générales de vente</h1>

        <section>
          <h2 className="font-semibold">Tarification</h2>
          <p>
            Tous les prix sont affichés en dirhams marocains (DH). Les prix sont fermes et définitifs au moment de la commande.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Paiement</h2>
          <p>
            MELSSY n'accepte que le paiement à la livraison (paiement contre remboursement). Aucun paiement en ligne n'est accepté. Vous réglez votre commande en espèces au livreur lors de la réception de votre coffret.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Confirmation de commande</h2>
          <p>
            Après avoir placé votre commande en ligne, notre équipe vous appelera pour confirmer les détails de votre commande et organiser la livraison avant l'envoi de votre coffret. L'appel sera effectué dans un délai de 24 heures.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Livraison</h2>
          <p>
            Nous livrons partout au Maroc. La livraison est gratuite sur tous nos coffrets. Une date de livraison exacte vous sera confirmée par téléphone avant l'envoi de votre commande.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Acceptation des conditions</h2>
          <p>
            En plaçant une commande sur melssy.beauty, vous acceptez l'intégralité de ces conditions générales de vente.
          </p>
        </section>

        <section>
          <p className="text-black/65">
            Dernière mise à jour : 20 septembre 2026
          </p>
        </section>
      </article>
    </main>
  );
}
