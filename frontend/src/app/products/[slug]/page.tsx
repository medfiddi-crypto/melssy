import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { catalog, formatPrice } from "@/content/catalog";
import { media } from "@/content/media";

const products = {
  "bonnet-solo": {
    image: media.collectionBonnet,
    eyebrow: "L'essentiel de protection",
  },
  "pillowcase-solo": {
    image: media.collectionPillowcase,
    eyebrow: "L'essentiel de douceur",
  },
  "heatless-curler-solo": {
    image: media.collectionCurler,
    eyebrow: "L'essentiel de style",
  },
  "scrunchies-solo": {
    image: media.collectionScrunchies,
    eyebrow: "L'essentiel d'attache",
  },
} as const;

export function generateStaticParams() {
  return Object.keys(products).map((slug) => ({ slug }));
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  if (!(slug in products)) notFound();

  const product = products[slug as keyof typeof products];
  const entry = catalog[slug as keyof typeof catalog];
  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4 md:px-16">
        <Link
          href="/collections/essentiels-de-nuit"
          className="text-sm underline underline-offset-4"
        >
          Collection
        </Link>
        <Link href="/rituel" className="wordmark text-lg">
          MELSSY
        </Link>
        <span className="text-sm">{formatPrice(entry.price)}</span>
      </header>
      <section className="grid md:grid-cols-2">
        <div className="order-2 px-6 py-14 md:order-1 md:px-16 md:py-24">
          <p className="eyebrow text-[var(--rose)]">{product.eyebrow}</p>
          <h1 className="display mt-4 text-5xl leading-none md:text-6xl">
            {entry.name}
          </h1>
          <p className="mt-6 max-w-md leading-7">
            {entry.description} Un détail de votre soirée qui garde la même
            intention: vous faire sentir plus prête pour demain.
          </p>
          <p className="display mt-8 text-3xl">{formatPrice(entry.price)}</p>
          <Link
            href="/products/beauty-night-ritual"
            className="mt-8 inline-block bg-[var(--green)] px-6 py-4 text-white"
          >
            Complétez votre rituel
          </Link>
          <p className="mt-5 text-sm">
            Paiement à la livraison partout au Maroc
          </p>
        </div>
        <div className="relative order-1 aspect-square bg-[#e8e1d6] md:order-2 md:aspect-auto">
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>
    </main>
  );
}
