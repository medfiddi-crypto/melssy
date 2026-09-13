"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Headphones, MapPin, MessageCircle, PackageCheck, Phone, ShieldCheck, Truck } from "lucide-react";

import { formatPrice } from "@/content/catalog";
import { storefront } from "@/content/storefront";
import { emitCommerceEvent } from "@/lib/analytics";

type ConfirmedOrder = {
  order_number: string;
  customer_name: string;
  total: string;
  shipping_total: string;
  upsell_decision: string;
  items: { product_id: string; product_name: string; quantity: number; unit_price: string }[];
};

export function ThankYouPage({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [loaded, setLoaded] = useState(!orderNumber);
  const missingOrderNumber = !orderNumber;

  useEffect(() => {
    if (!orderNumber) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/v1/orders/${orderNumber}/confirmation`)
      .then((response) => (response.ok ? response.json() : null))
      .then((confirmedOrder: ConfirmedOrder | null) => {
        setOrder(confirmedOrder);
        setLoaded(true);
        if (!confirmedOrder || sessionStorage.getItem(`purchase:${orderNumber}`)) return;
        emitCommerceEvent("Purchase", confirmedOrder.items.map((item) => item.product_id), Number(confirmedOrder.total));
        sessionStorage.setItem(`purchase:${orderNumber}`, "sent");
      })
      .catch(() => setLoaded(true));
  }, [orderNumber]);

  if (!loaded) return <main className="min-h-dvh bg-[var(--background)] px-6 py-14"><Header /></main>;
  if (!order) return <main className="min-h-dvh bg-[var(--background)] px-6 py-14"><Header /><section className="mx-auto max-w-md py-20 text-center"><h1 className="display text-4xl">{missingOrderNumber ? "Référence de commande manquante" : "Commande introuvable"}</h1><p className="mt-4 text-sm leading-6">{missingOrderNumber ? "Nous ne pouvons pas afficher cette confirmation sans sa référence. Votre commande n'est pas perdue : contactez-nous avec le numéro reçu après votre commande." : "Cette confirmation n'est pas disponible. Votre commande peut avoir été enregistrée : contactez-nous avec votre référence avant de commander à nouveau."}</p><Link href="/rituel" className="mt-7 inline-block text-sm underline underline-offset-4">Découvrir le rituel</Link></section></main>;

  const firstName = order.customer_name.trim().split(/\s+/)[0];
  const total = formatPrice(Number(order.total));
  const reference = order.order_number;
  const whatsappNumber = storefront.whatsappNumber();
  const confirmationPhone = storefront.confirmationPhone();
  const confirmationWindow = storefront.confirmationWindow();
  const dispatchWindow = storefront.dispatchWindow();
  const deliveryWindow = storefront.deliveryWindow();
  const shippingFee = formatPrice(storefront.shippingFee());
  const whatsappMessage = encodeURIComponent(`Bonjour MELSSY, je confirme ma commande #${reference}`);

  return <main className="min-h-dvh bg-[var(--background)] px-5 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6">
    <Header />
    <section className="mx-auto max-w-xl pt-12">
      <p className="inline-flex items-center gap-2 rounded-full border border-[var(--green)]/25 bg-white px-3 py-1.5 text-xs font-medium text-[var(--green)]"><Check size={14} strokeWidth={2.5} />Commande enregistrée</p>
      <h1 className="display mt-5 text-5xl leading-none">Merci, {firstName}.</h1>
      <p className="mt-3 text-sm text-black/65">Référence #{reference}</p>

      <section className="mt-8 border border-[var(--line)] bg-white p-5 shadow-[0_8px_24px_rgb(31_37_32_/_0.06)]">
        <h2 className="display text-3xl">Confirmez en 10 secondes</h2>
        <p className="mt-2 text-sm leading-6">Les commandes confirmées sur WhatsApp partent en préparation le jour même.</p>
        <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 bg-[var(--green)] px-5 py-3 text-sm font-medium text-white"><MessageCircle size={18} />Confirmer ma commande</a>
      </section>

      <section className="mt-10"><p className="eyebrow text-[var(--rose)]">La suite</p><div className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]"><Step icon={Phone}>Nous appelons depuis {confirmationPhone} sous {confirmationWindow}. Enregistrez ce numéro.</Step><Step icon={Truck}>Expédiée sous {dispatchWindow}, livrée sous {deliveryWindow} partout au Maroc.</Step><Step icon={PackageCheck}>Vous payez {total} en espèces au livreur, rien avant.</Step></div></section>

      <section className="mt-10 border border-[var(--line)] bg-white p-5"><p className="eyebrow text-[var(--rose)]">Votre commande</p><div className="mt-5 space-y-3 text-sm">{order.items.map((item) => <div key={`${item.product_id}-${item.unit_price}`} className="flex items-start justify-between gap-4"><span>{item.quantity} × {item.product_name}</span><span className="shrink-0">{formatPrice(Number(item.unit_price) * item.quantity)}</span></div>)}<div className="flex items-start justify-between gap-4"><span>{storefront.freeGiftName()}</span><span className="shrink-0 text-[var(--green)]">Offert</span></div><div className="flex items-start justify-between gap-4"><span>Livraison</span><span className="shrink-0"><s className="text-black/50">{shippingFee}</s><span className="ml-2 text-[var(--green)]">Offerte</span></span></div></div><div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--line)] pt-5"><span className="text-sm font-medium">À payer à la livraison</span><strong className="display text-3xl font-medium">{total}</strong></div></section>

      <section className="mt-10 grid grid-cols-3 gap-3 border-y border-[var(--line)] py-6"><Trust icon={MapPin} title="Partout au Maroc" detail="Livraison à domicile" /><Trust icon={ShieldCheck} title="Échange sous 7 jours" detail="Selon conditions" /><Trust icon={Headphones} title="Service marocain" detail="À votre écoute" /></section>
      <div className="py-9 text-center"><Link href="/rituel" className="text-sm underline underline-offset-4">Découvrir le rituel</Link></div>
    </section>
  </main>;
}

function Header() { return <header className="mx-auto flex max-w-xl flex-col items-center"><Link href="/" className="wordmark text-2xl">MELSSY</Link><span className="mt-1 text-[9px] font-medium tracking-[0.18em]">BEAUTY SLEEP RITUAL</span></header>; }
function Step({ icon: Icon, children }: { icon: typeof Phone; children: React.ReactNode }) { return <div className="flex gap-3 py-4 text-sm leading-6"><Icon className="mt-0.5 shrink-0 text-[var(--rose)]" size={18} /> <p>{children}</p></div>; }
function Trust({ icon: Icon, title, detail }: { icon: typeof MapPin; title: string; detail: string }) { return <div className="text-center"><Icon className="mx-auto text-[var(--green)]" size={18} /><p className="mt-2 text-xs font-medium leading-4">{title}</p><p className="mt-1 text-[10px] leading-4 text-black/60">{detail}</p></div>; }