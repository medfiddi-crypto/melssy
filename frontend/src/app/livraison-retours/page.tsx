import Link from "next/link";

export default function ReturnsPage() {
  return (
    <main className="min-h-dvh bg-[var(--background)] px-5 py-8 sm:px-6">
      <header className="mx-auto flex max-w-2xl flex-col items-center pb-8">
        <Link href="/rituel" className="wordmark text-2xl">MELSSY</Link>
        <span className="wordmark-descriptor mt-1 text-[9px] font-medium tracking-[0.18em]">BEAUTY SLEEP RITUAL</span>
      </header>

      <article className="mx-auto max-w-2xl space-y-6 pb-16 text-sm leading-7">
        <h1 className="display text-4xl">Retours et remboursements</h1>

        <section>
          <h2 className="font-semibold">Droit d'échange et de retour</h2>
          <p>
            Vous disposez d'un délai de 7 jours à compter de la réception de votre coffret pour demander un échange ou un retour.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Conditions</h2>
          <p>
            Pour que votre demande d'échange ou de retour soit acceptée, les pièces doivent :
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Être non utilisées</li>
            <li>Être dans leur emballage d'origine</li>
          </ul>
          <p className="mt-3">
            Ces conditions s'appliquent pour des raisons d'hygiène et de qualité.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Demander un échange ou un retour</h2>
          <p>
            Pour demander un échange ou un retour, contactez-nous par WhatsApp au <a href="https://wa.me/212666353909?text=Bonjour%2C%20j%27ai%20une%20demande%20d%27%C3%A9change%20ou%20de%20retour." target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-2">+212 666 353 909</a> ou par email à <a href="mailto:contact@melssy.beauty" className="text-[var(--green)] underline underline-offset-2">contact@melssy.beauty</a>.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Suite de votre demande</h2>
          <p>
            Notre équipe vous confirmera votre demande et vous indiquera les modalités de retour de votre coffret. Une fois reçu et vérifié, votre coffret sera échangé ou remboursé selon votre souhait.
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
