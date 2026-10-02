import { Check } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { UpsellOfferForm } from "@/components/upsell-offer-form";
import { formatPrice } from "@/content/catalog";
import { landing } from "@/content/landing.fr";
import { media } from "@/content/media";
import { productColors } from "@/content/simple-products";
import type { ProductColorId } from "@/content/simple-products";
import { getApiTarget } from "@/lib/api-target";

export const metadata: Metadata = {
  title: "Votre commande · MELSSY",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type OfferPayload = {
  total: string;
  color: string | null;
  decided: boolean;
  offer: { quantity: number; price: string; compare_at_price: string; saving: string } | null;
};

const tokenPattern = /^[A-Za-z0-9_-]{16,64}$/;

async function loadOffer(orderNumber: string, token: string): Promise<OfferPayload | "missing" | "unavailable"> {
  try {
    const response = await fetch(new URL(`/v1/orders/${encodeURIComponent(orderNumber)}/offer`, getApiTarget()), {
      headers: { "x-upsell-token": token },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 404) return "missing";
    return response.ok ? await response.json() : "unavailable";
  } catch (error) {
    console.error("MELSSY offer page load failed", { orderNumber, error });
    return "unavailable";
  }
}

export default async function OfferPage({ params, searchParams }: PageProps<"/offre/[orderNumber]">) {
  const { orderNumber } = await params;
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";
  if (!tokenPattern.test(token)) notFound();

  const result = await loadOffer(orderNumber, token);
  if (result === "missing") notFound();
  const thankYouUrl = `/merci/${encodeURIComponent(orderNumber)}`;
  if (result === "unavailable" || result.decided || !result.offer) redirect(thankYouUrl);

  const { offer } = result;
  const defaultColor = (productColors.find((option) => option.id === result.color)?.id ?? "champagne") as ProductColorId;
  const price = formatPrice(Number(offer.price));

  return (
    <main className="min-h-dvh bg-[#eadbd1] px-5 pb-8 pt-4">
      <div className="mx-auto max-w-md">
        <p className="wordmark text-center text-lg">MELSSY</p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--green)]/25 bg-white px-3 py-1.5 text-xs font-medium text-[var(--green)]">
          <Check size={14} strokeWidth={2.5} />
          {landing.upsell.saved}
        </p>
        <div className="mt-2 flex items-baseline justify-between gap-3 text-sm">
          <span>{landing.order.productLabel}</span>
          <span className="font-medium">{formatPrice(Number(result.total))}</span>
        </div>
        <section className="mt-3 border border-[var(--line)] bg-white p-3">
          <div className="flex gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-[#e8e1d6]">
              <Image src={media.collectionPillowcase.src} alt={media.collectionPillowcase.alt} fill priority sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="eyebrow text-[var(--rose)]">{landing.upsell.eyebrow}</p>
              <h1 className="display mt-1 text-2xl leading-none">{landing.upsell.title}</h1>
              <p className="mt-1.5 flex items-baseline gap-2">
                <span className="display text-3xl leading-none">{price}</span>
                <s className="text-sm text-black/50">{formatPrice(Number(offer.compare_at_price))}</s>
              </p>
              <p className="mt-1 text-xs text-[var(--green)]">Vous économisez {formatPrice(Number(offer.saving))}</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-black/70">{landing.upsell.body} {landing.upsell.payment}</p>
          <UpsellOfferForm
            orderNumber={orderNumber}
            token={token}
            defaultColor={defaultColor}
            priceLabel={price}
            hasError={query.offre === "indisponible"}
          />
        </section>
      </div>
    </main>
  );
}