import Link from "next/link";

export default function ContactPage() {
  const whatsappNumber = "2166353909";
  const whatsappMessage = encodeURIComponent("Bonjour, j'ai une question.");

  return (
    <main className="min-h-dvh bg-[var(--background)] px-5 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6">
      <header className="mx-auto flex max-w-xl flex-col items-center">
        <Link href="/rituel" className="wordmark text-2xl">MELSSY</Link>
        <span className="wordmark-descriptor mt-1 text-[9px] font-medium tracking-[0.18em]">BEAUTY SLEEP RITUAL</span>
      </header>

      <section className="mx-auto max-w-xl pt-12">
        <p className="eyebrow text-[var(--rose)]">CONTACT</p>
        <h1 className="display mt-5 text-5xl leading-none">
          Nous sommes <em className="not-italic">là.</em>
        </h1>
        <p className="mt-6 text-sm leading-6">Une question sur votre commande ou sur le coffret ? Écrivez-nous, nous répondons rapidement.</p>

        <section className="mt-10 border border-[var(--line)] bg-white p-5">
          <h2 className="eyebrow text-[var(--rose)]">WhatsApp</h2>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 block text-sm leading-6 text-[var(--green)] underline underline-offset-4"
          >
            +212 666 35 39 09
          </a>
        </section>

        <section className="mt-8 border border-[var(--line)] bg-white p-5">
          <h2 className="eyebrow text-[var(--rose)]">Email</h2>
          <a href="mailto:contact@melssy.beauty" className="mt-4 block text-sm leading-6 text-[var(--green)] underline underline-offset-4">
            contact@melssy.beauty
          </a>
        </section>

        <section className="mt-8 border border-[var(--line)] bg-white p-5">
          <h2 className="eyebrow text-[var(--rose)]">Horaires</h2>
          <p className="mt-4 text-sm leading-6">Du lundi au samedi, de 9h à 19h.</p>
        </section>

        <section className="mt-10 border-t border-[var(--line)] pt-8">
          <p className="text-sm leading-6">Pour un échange ou un retour sous 7 jours, contactez-nous par WhatsApp ou par e-mail.</p>
        </section>

        <div className="py-9 text-center">
          <Link href="/rituel" className="text-sm underline underline-offset-4">Retour à l&apos;accueil</Link>
        </div>
      </section>
    </main>
  );
}
