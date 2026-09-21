import Link from "next/link";

export default function LegalNoticesPage() {
  return (
    <main className="min-h-dvh bg-[var(--background)] px-5 py-8 sm:px-6">
      <header className="mx-auto flex max-w-2xl flex-col items-center pb-8">
        <Link href="/rituel" className="wordmark text-2xl">MELSSY</Link>
        <span className="wordmark-descriptor mt-1 text-[9px] font-medium tracking-[0.18em]">BEAUTY SLEEP RITUAL</span>
      </header>

      <article className="mx-auto max-w-2xl space-y-6 pb-16 text-sm leading-7">
        <h1 className="display text-4xl">Mentions légales</h1>

        <section>
          <h2 className="font-semibold">Exploitant du site</h2>
          <p>
            Nom du site : MELSSY
          </p>
          <p>
            Adresse du site : melssy.beauty
          </p>
          <p>
            Email : <a href="mailto:contact@melssy.beauty" className="text-[var(--green)] underline underline-offset-2">contact@melssy.beauty</a>
          </p>
          <p>
            WhatsApp : <a href="https://wa.me/212666353909?text=Bonjour%2C%20j%27ai%20une%20question." target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-2">+212 666 353 909</a>
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Hébergement</h2>
          <p>
            Ce site est hébergé sur un serveur fourni par Hostinger.
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
