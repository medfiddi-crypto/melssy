"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Headphones, MapPin, PackageCheck, Phone, ShieldCheck, Truck } from "lucide-react";

import { formatPrice } from "@/content/catalog";
import { optionalStorefront } from "@/content/storefront";
import { emitCommerceEvent } from "@/lib/analytics";

export type ConfirmedOrder = {
  order_number: string;
  customer_name: string;
  total: string;
  shipping_total: string;
  upsell_decision: string;
  items: { product_id: string; product_name: string; quantity: number; unit_price: string }[];
};

export function ThankYouPage({ orderNumber, initialOrder = null }: { orderNumber: string; initialOrder?: ConfirmedOrder | null }) {
  const [order, setOrder] = useState<ConfirmedOrder | null>(initialOrder);
  const [loaded, setLoaded] = useState(Boolean(initialOrder) || !orderNumber);
  const missingOrderNumber = !orderNumber;

  useEffect(() => {
    if (!orderNumber) return;
    if (initialOrder) {
      if (sessionStorage.getItem(`purchase:${orderNumber}`)) return;
      emitCommerceEvent("Purchase", initialOrder.items.map((item) => item.product_id), Number(initialOrder.total));
      sessionStorage.setItem(`purchase:${orderNumber}`, "sent");
      return;
    }
    fetch(`/api/v1/orders/${encodeURIComponent(orderNumber)}/confirmation`)
      .then((response) => (response.ok ? response.json() : null))
      .then((confirmedOrder: ConfirmedOrder | null) => {
        setOrder(confirmedOrder);
        setLoaded(true);
        if (!confirmedOrder || sessionStorage.getItem(`purchase:${orderNumber}`)) return;
        emitCommerceEvent("Purchase", confirmedOrder.items.map((item) => item.product_id), Number(confirmedOrder.total));
        sessionStorage.setItem(`purchase:${orderNumber}`, "sent");
      })
      .catch(() => setLoaded(true));
  }, [initialOrder, orderNumber]);

  if (!loaded) return <main className="min-h-dvh bg-[var(--background)] px-6 py-14"><Header /></main>;
  if (!order) return <main className="min-h-dvh bg-[var(--background)] px-6 py-14"><Header /><section className="mx-auto max-w-md py-20 text-center"><h1 className="display text-4xl">{missingOrderNumber ? "Référence de commande manquante" : "Confirmation indisponible"}</h1><p className="mt-4 text-sm leading-6">{missingOrderNumber ? "Nous ne pouvons pas vérifier cette commande sans sa référence." : `Nous ne pouvons pas confirmer l'enregistrement de la commande n° ${orderNumber}. Revenez au formulaire et réessayez.`}</p><Link href="/rituel#commander" className="mt-7 inline-block text-sm underline underline-offset-4">Retour au formulaire</Link></section></main>;

  const total = formatPrice(Number(order.total));
  const reference = order.order_number;
  const confirmationPhone = optionalStorefront.confirmationPhone();
  const confirmationWindow = optionalStorefront.confirmationWindow();
  const dispatchWindow = optionalStorefront.dispatchWindow();
  const deliveryWindow = optionalStorefront.deliveryWindow();
  const shippingFee = optionalStorefront.shippingFee();
  const freeGiftName = optionalStorefront.freeGiftName();

  const firstName = order.customer_name.trim().split(/\s+/)[0] || "";
  const greeting = firstName ? `Merci, ${firstName} !` : "Merci !";

  return <main className="min-h-dvh bg-[var(--background)] px-5 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6">
    <Header />
    <section className="mx-auto max-w-xl pt-12">
      <p className="inline-flex items-center gap-2 rounded-full border border-[var(--green)]/25 bg-white px-3 py-1.5 text-xs font-medium text-[var(--green)]"><Check size={14} strokeWidth={2.5} />Votre commande est enregistrée.</p>
      <h1 className="display mt-5 text-5xl leading-none">{greeting}</h1>
      <p className="mt-4 text-sm leading-6">Nous vous appelons très bientôt pour confirmer votre commande et la date de livraison. Vous payez à la réception.</p>
      <p className="mt-6 text-sm text-black/65">Commande n° {reference}</p>

      <section className="mt-10"><p className="eyebrow text-[var(--rose)]">PROCHAINES ÉTAPES</p><div className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">{confirmationPhone && confirmationWindow && <Step icon={Phone}>Nous vous appellerons depuis le {confirmationPhone} sous {confirmationWindow}. Enregistrez ce numéro dans vos contacts.</Step>}{dispatchWindow && deliveryWindow && <Step icon={Truck}>Votre coffret est expédié sous {dispatchWindow}, puis livré en {deliveryWindow}, partout au Maroc.</Step>}<Step icon={PackageCheck}>Vous réglez {total} en espèces au livreur. Vous ne payez rien à l&apos;avance.</Step></div></section>

      <section className="mt-10 border border-[var(--line)] bg-white p-5"><p className="eyebrow text-[var(--rose)]">Votre commande</p><div className="mt-5 space-y-3 text-sm">{order.items.map((item) => <div key={`${item.product_id}-${item.unit_price}`} className="flex items-start justify-between gap-4"><span>{item.product_id === "beauty-night-ritual" ? "Coffret Beauty Night Ritual" : item.product_name}</span><span className="shrink-0">{formatPrice(Number(item.unit_price) * item.quantity)}</span></div>)}{freeGiftName && <div className="flex items-start justify-between gap-4"><span>{freeGiftName}</span><span className="shrink-0 text-[var(--green)]">Offert</span></div>}{shippingFee !== null && <div className="flex items-start justify-between gap-4"><span>Livraison</span><span className="shrink-0"><s className="text-black/50">{formatPrice(shippingFee)}</s><span className="ml-2 text-[var(--green)]">Offerte</span></span></div>}</div><div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--line)] pt-5"><span className="text-sm font-medium">À régler à la livraison</span><strong className="display text-3xl font-medium">{total}</strong></div></section>

      <figure className="mx-auto mt-8 w-3/5">
        <Image src="/images/coffret-placeholder.webp" alt="" width={600} height={750} className="max-h-[180px] w-full rounded-[12px] object-cover object-center" />
        <figcaption className="mt-2 text-center text-xs text-black/60">Votre coffret, prêt à être expédié.</figcaption>
      </figure>

      <section className="mt-10 grid grid-cols-3 gap-3 border-y border-[var(--line)] py-6"><Trust icon={MapPin} title="Livraison" detail="partout au Maroc" /><Trust icon={ShieldCheck} title="Échange" detail="sous 7 jours" /><Trust icon={Headphones} title="Équipe" detail="basée au Maroc" /></section>
      <div className="py-9 text-center"><Link href="/rituel" className="text-sm underline underline-offset-4">Retour à l&apos;accueil</Link></div>
    </section>
  </main>;
}

function Header() { return <header className="mx-auto flex max-w-xl flex-col items-center"><Link href="/rituel" className="wordmark text-2xl">MELSSY</Link><span className="wordmark-descriptor mt-1 text-[9px] font-medium tracking-[0.18em]">BEAUTY SLEEP RITUAL</span></header>; }
function Step({ icon: Icon, children }: { icon: typeof Phone; children: React.ReactNode }) { return <div className="flex gap-3 py-4 text-sm leading-6"><Icon className="mt-0.5 shrink-0 text-[var(--rose)]" size={18} /> <p>{children}</p></div>; }
function Trust({ icon: Icon, title, detail }: { icon: typeof MapPin; title: string; detail: string }) { return <div className="text-center"><Icon className="mx-auto text-[var(--green)]" size={18} /><p className="mt-2 text-xs font-medium leading-4">{title}</p><p className="mt-1 text-[10px] leading-4 text-black/60">{detail}</p></div>; }