import Image from "next/image";
import Link from "next/link";

import { catalog, formatPrice } from "@/content/catalog";
import { media } from "@/content/media";

const products = [
  { id: "bonnet-solo", image: media.collectionBonnet },
  { id: "pillowcase-solo", image: media.collectionPillowcase },
  { id: "heatless-curler-solo", image: media.collectionCurler },
  { id: "scrunchies-solo", image: media.collectionScrunchies },
] as const;

export default function EssentialsPage() {
  return <main className="min-h-screen"><header className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4 md:px-16"><Link href="/" className="wordmark text-lg">MELSSY</Link><Link href="/products/beauty-night-ritual" className="text-sm underline underline-offset-4">Le rituel complet</Link></header><section className="px-6 pb-16 pt-20 md:px-16"><p className="eyebrow text-[var(--rose)]">La collection</p><h1 className="display mt-4 max-w-2xl text-5xl leading-none md:text-7xl">Les essentiels qui accompagnent vos nuits.</h1><p className="mt-6 max-w-xl leading-7">Pour les soirs où vous souhaitez choisir un seul geste. Retrouvez les pièces qui composent l&apos;univers MELSSY, chacune à son rythme.</p></section><section className="border-t border-[var(--line)] px-6 py-10 md:px-16"><div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">{products.map(({ id, image }) => <article key={id} className="group"><Link href={`/products/${id}`} className="relative block aspect-square overflow-hidden bg-[#e8e1d6]"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /></Link><div className="mt-4 flex items-start justify-between gap-4"><div><h2 className="text-base font-medium">{catalog[id].name}</h2><p className="mt-1 text-sm leading-5 text-black/65">{catalog[id].description}</p></div><p className="shrink-0 text-sm">{formatPrice(catalog[id].price)}</p></div><Link href={`/products/${id}`} className="mt-4 inline-block text-sm underline underline-offset-4">Découvrir</Link></article>)}</div></section><section className="bg-[var(--green)] px-6 py-16 text-[#f7f3eb] md:px-16"><p className="eyebrow text-[#dfaaa1]">Le rituel MELSSY</p><h2 className="display mt-4 max-w-xl text-4xl md:text-5xl">Pour celles qui veulent se réveiller un peu plus elles-mêmes.</h2><Link href="/products/beauty-night-ritual" className="mt-8 inline-block border border-[#f7f3eb] px-6 py-3 text-sm">Découvrir le rituel complet</Link></section></main>;
}
