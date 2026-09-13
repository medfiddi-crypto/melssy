"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { catalog, formatPrice } from "@/content/catalog";
import { landing } from "@/content/landing.fr";
import { safeUUID } from "@/lib/analytics";

export default function OfferPage({
  params,
  searchParams,
}: PageProps<"/offre/[orderNumber]">) {
  const router = useRouter();
  const { orderNumber } = use(params);
  const { offre, "prix-offre": offerPrice } = use(searchParams);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const product = offre === "scrunchies-solo" ? catalog[offre] : null;
  const price = typeof offerPrice === "string" ? Number(offerPrice) : null;

  useEffect(() => {
    if (!product || price === null) router.replace(`/merci?order=${encodeURIComponent(orderNumber)}`);
  }, [orderNumber, price, product, router]);

  const respond = async (decision: "accept" | "decline") => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/v1/orders/${orderNumber}/upsell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, idempotency_key: safeUUID() }),
      });
      if (!response.ok) throw new Error("upsell_failed");
      router.replace(`/merci?order=${encodeURIComponent(orderNumber)}`);
    } catch {
      setError("Votre choix n'a pas pu être enregistré. Veuillez réessayer.");
      setSaving(false);
    }
  };

  if (!product || price === null) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#eadbd1] px-6 py-10 md:px-16">
      <header className="mx-auto flex max-w-xl justify-center"><Link href="/" className="wordmark text-xl">MELSSY</Link></header>
      <section className="mx-auto max-w-xl py-16 text-center">
        <p className="eyebrow text-[var(--rose)]">{landing.upsell.eyebrow}</p>
        <h1 className="display mt-4 text-5xl leading-none">{landing.upsell.title}</h1>
        <p className="mt-6 leading-7">{landing.upsell.body}</p>
        <p className="display mt-8 text-5xl">{formatPrice(price)}</p>
        <button disabled={saving} onClick={() => respond("accept")} className="mt-8 w-full bg-[var(--green)] px-6 py-4 text-white disabled:opacity-50">
          {saving ? "Enregistrement..." : landing.upsell.accept}
        </button>
        <button disabled={saving} onClick={() => respond("decline")} className="mt-5 text-sm underline underline-offset-4">
          {landing.upsell.decline}
        </button>
        {error && <p role="alert" className="mt-5 text-sm text-red-800">{error}</p>}
      </section>
    </main>
  );
}