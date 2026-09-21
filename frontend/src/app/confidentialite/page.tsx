import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-[var(--background)] px-5 py-8 sm:px-6">
      <header className="mx-auto flex max-w-2xl flex-col items-center pb-8">
        <Link href="/rituel" className="wordmark text-2xl">MELSSY</Link>
        <span className="wordmark-descriptor mt-1 text-[9px] font-medium tracking-[0.18em]">BEAUTY SLEEP RITUAL</span>
      </header>

      <article className="mx-auto max-w-2xl space-y-6 pb-16 text-sm leading-7">
        <h1 className="display text-4xl">Politique de confidentialité</h1>

        <section>
          <h2 className="font-semibold">Données collectées</h2>
          <p>
            Nous collectons les données suivantes lors de votre commande :
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Nom complet</li>
            <li>Numéro de téléphone</li>
            <li>Adresse de livraison (optionnelle)</li>
            <li>Articles commandés</li>
          </ul>
          <p className="mt-3">
            Nous collectons également des données techniques via les pixels publicitaires Meta et TikTok pour mesurer l'efficacité de nos campagnes publicitaires.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Utilisation de vos données</h2>
          <p>
            Vos données sont utilisées pour :
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Traiter et confirmer votre commande</li>
            <li>Vous appeler pour confirmer votre commande et organiser la livraison</li>
            <li>Organiser la livraison de votre coffret</li>
            <li>Mesurer la performance de nos campagnes publicitaires</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold">Vente de données</h2>
          <p>
            Vos données personnelles ne sont jamais vendues, louées ou partagées avec des tiers à des fins commerciales.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Conservation des données</h2>
          <p>
            Vos données sont conservées aussi longtemps que nécessaire pour traiter votre commande, organiser votre livraison et gérer les éventuels retours ou échanges. Elles peuvent être conservées plus longtemps si la loi marocaine l'exige.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Vos droits</h2>
          <p>
            Conformément à la loi marocaine n°09-08 relative à la protection des données à caractère personnel, vous disposez des droits suivants :
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Droit d'accès à vos données</li>
            <li>Droit de demander la suppression de vos données</li>
            <li>Droit de demander une rectification de vos données</li>
          </ul>
          <p className="mt-3">
            Pour exercer ces droits, contactez-nous par email à <a href="mailto:contact@melssy.beauty" className="text-[var(--green)] underline underline-offset-2">contact@melssy.beauty</a> ou par WhatsApp au <a href="https://wa.me/212666353909?text=Bonjour%2C%20j%27ai%20une%20question." target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-2">+212 666 353 909</a>.
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
