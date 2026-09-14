"use client";

import Link from "next/link";
import { use, useState } from "react";

import { catalog, formatPrice } from "@/content/catalog";
import { landing } from "@/content/landing.fr";
import { safeUUID } from "@/lib/analytics";

export default function OfferPage({
  params,
}: Pick<PageProps<"/offre/[orderNumber]">, "params">) {
  const { orderNumber } = use(params);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const product = catalog["pillowcase-pair"];

  const respond = async (decision: "accept" | "decline") => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/v1/orders/${encodeURIComponent(orderNumber)}/upsell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, idempotency_key: safeUUID() }),
      });
      if (!response.ok) throw new Error("upsell_failed");
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      location.href = `/merci/${encodeURIComponent(orderNumber)}`;
    } catch {
      setError("Votre choix n'a pas pu être enregistré. Veuillez réessayer.");
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#eadbd1] px-6 py-10 md:px-16">
      <header className="mx-auto flex max-w-xl justify-center"><Link href="/" className="wordmark text-xl">MELSSY</Link></header>
      <section className="mx-auto max-w-xl py-16 text-center">
        <h1 className="display mt-4 text-5xl leading-none">{landing.upsell.title}</h1>
        <p className="mt-6 leading-7">{landing.upsell.body}</p>
        <p className="display mt-8 text-5xl">{formatPrice(product.price)}</p>
        <form action={`/offre/${encodeURIComponent(orderNumber)}/decision`} method="post" onSubmit={(event) => {
          event.preventDefault();
          const decision = new FormData(event.currentTarget).get("decision");
          if (decision === "accept" || decision === "decline") void respond(decision);
        }}>
          <button name="decision" value="accept" disabled={saving} className="mt-8 w-full bg-[var(--green)] px-6 py-4 text-white disabled:opacity-50">
            {saving ? "Enregistrement..." : landing.upsell.accept}
          </button>
          <button name="decision" value="decline" disabled={saving} className="mt-5 text-sm underline underline-offset-4">
            {landing.upsell.decline}
          </button>
        </form>
        {error && <p role="alert" className="mt-5 text-sm text-red-800">{error}</p>}
      </section>
    </main>
  );
}