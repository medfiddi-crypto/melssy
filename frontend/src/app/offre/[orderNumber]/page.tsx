"use client";

import Link from "next/link";
import { use } from "react";
import { useSearchParams } from "next/navigation";

import { catalog, formatPrice } from "@/content/catalog";
import { landing } from "@/content/landing.fr";

export default function OfferPage({
  params,
}: Pick<PageProps<"/offre/[orderNumber]">, "params">) {
  const { orderNumber } = use(params);
  const searchParams = useSearchParams();
  const error = searchParams.get("offre") === "indisponible" ? "Votre choix n'a pas pu être enregistré. Veuillez réessayer." : "";
  const product = catalog["pillowcase-pair"];

  return (
    <main className="min-h-screen bg-[#eadbd1] px-6 py-10 md:px-16">
      <header className="mx-auto flex max-w-xl justify-center"><Link href="/" className="wordmark text-xl">MELSSY</Link></header>
      <section className="mx-auto max-w-xl py-16 text-center">
        <h1 className="display mt-4 text-5xl leading-none">{landing.upsell.title}</h1>
        <p className="mt-6 leading-7">{landing.upsell.body}</p>
        <p className="display mt-8 text-5xl">{formatPrice(product.price)}</p>
        <form action={`/offre/${encodeURIComponent(orderNumber)}/decision`} method="post">
          <button type="submit" name="decision" value="accept" className="mt-8 w-full bg-[var(--green)] px-6 py-4 text-white">
            {landing.upsell.accept}
          </button>
          <button type="submit" name="decision" value="decline" className="mt-5 text-sm underline underline-offset-4">
            {landing.upsell.decline}
          </button>
        </form>
        {error && <p role="alert" className="mt-5 text-sm text-red-800">{error}</p>}
      </section>
    </main>
  );
}