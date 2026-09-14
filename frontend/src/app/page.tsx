"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { media } from "@/content/media";
import { emitCommerceEvent, safeUUID } from "@/lib/analytics";

const catalog = {
  "beauty-night-ritual": { name: "La Beauty Night Ritual™", price: 449 },
  "pillowcase-pair": { name: "Paire de taies d'oreiller satinées", price: 150 },
  "extra-bonnet": { name: "Bonnet satiné", price: 100 },
} as const;

type ItemId = keyof typeof catalog;
const price = (value: number) => `${value.toLocaleString("fr-MA")} DH`;
const validPhone = (value: string) => {
  let phone = value.replace(/[\s-]/g, "");
  if (phone.startsWith("00212")) phone = `+212${phone.slice(5)}`;
  else if (phone.startsWith("212")) phone = `+${phone}`;
  else if (phone.startsWith("0")) phone = `+212${phone.slice(1)}`;
  return /^\+212[67]\d{8}$/.test(phone) ? phone : null;
};

export default function Home() {
  const router = useRouter();
  const [cart, setCart] = useState<ItemId[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [order] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(12);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  const total = cart.reduce((sum, item) => sum + catalog[item].price, 0);
  const ready = name.trim().length > 1 && Boolean(validPhone(phone));
  useEffect(() => {
    if (!order || seconds === 0) return;
    const timer = window.setTimeout(() => setSeconds((time) => time - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [order, seconds]);
  useEffect(() => {
    if (!menu) return;
    const menuTrigger = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuCloseRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      menuTrigger?.focus();
    };
  }, [menu]);
  const add = (item: ItemId) => { emitCommerceEvent("AddToCart", [item], catalog[item].price); setCart((items) => [...items, item]); setDrawer(true); };
  const placeOrder = async () => {
    if (!ready) return;
    const quantities = cart.reduce<Record<string, number>>((items, item) => ({ ...items, [item]: (items[item] ?? 0) + 1 }), {});
    const response = await fetch("/api/v1/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, idempotency_key: safeUUID(), items: Object.entries(quantities).map(([product_id, quantity]) => ({ product_id, quantity })) }) });
    if (!response.ok) return;
    const result: { order_number: string; offer: { duration_seconds: number } | null } = await response.json();
    emitCommerceEvent("Purchase", cart, total);
    setCheckout(false);
    router.push(`/merci/${encodeURIComponent(result.order_number)}`);
  };
  if (order && seconds === 0) return <main className="grid min-h-screen place-items-center px-6 text-center"><div><p className="text-sm text-[var(--green)]">Paiement à la livraison</p><h1 className="display mt-3 text-5xl">Merci, {name.split(" ")[0]}.<br />Votre rituel est réservé.</h1><p className="mt-5">Votre numéro de commande est {order}. Notre équipe vous confirmera les prochaines étapes.</p></div></main>;
  return <main>
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line)] bg-[var(--background)]/95 px-5 py-3 backdrop-blur"><button ref={menuButtonRef} aria-label="Ouvrir le menu" aria-expanded={menu} aria-controls="site-menu" onClick={() => setMenu(true)}>Menu</button><a href="#rituel" className="text-center"><span className="wordmark text-2xl">MELSSY</span><span className="wordmark-descriptor block text-[8px] tracking-[.18em]">BEAUTY SLEEP RITUAL</span></a><button aria-label="Ouvrir le panier" onClick={() => setDrawer(true)}>Sac ({cart.length})</button></header>
    {menu && <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMenu(false)}><aside id="site-menu" role="dialog" aria-modal="true" aria-label="Menu" className="h-full w-[min(88vw,420px)] bg-[var(--green)] px-6 py-5 text-[#f7f3eb] shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><span className="wordmark text-xl">MELSSY</span><button ref={menuCloseRef} onClick={() => setMenu(false)} className="text-sm underline underline-offset-4">Fermer</button></div><nav className="mt-16 grid gap-3" aria-label="Navigation principale"><a onClick={() => setMenu(false)} href="/rituel" className="display py-2 text-4xl">La Beauty Night Ritual™</a><a onClick={() => setMenu(false)} href="/collections/essentiels-de-nuit" className="display py-2 text-4xl">Collections</a><a onClick={() => setMenu(false)} href="/a-propos" className="display py-2 text-4xl">Notre histoire</a><a onClick={() => setMenu(false)} href="/contact" className="display py-2 text-4xl">Nous contacter</a><button onClick={() => { setMenu(false); setDrawer(true); }} className="mt-6 border border-[#f7f3eb] px-5 py-3 text-left text-sm">Voir mon sac ({cart.length})</button></nav><p className="absolute bottom-8 text-sm text-[#f7f3eb]/70">Votre beauté mérite aussi la nuit.</p></aside></div>}
    <section className="grid md:grid-cols-2"><div className="order-2 px-6 py-14 md:order-1 md:px-16 md:py-28"><p className="eyebrow text-[var(--rose)]">Le rituel qui commence quand votre journée s&apos;arrête.</p><h1 className="display mt-5 text-5xl leading-[.95] md:text-7xl">Réveillez-vous avec des cheveux qui vous ressemblent encore.</h1><p className="mt-6 max-w-lg leading-7">La Beauty Night Ritual™ réunit les essentiels satinés pour protéger vos longueurs, préserver votre coiffure et transformer vos soirées en un vrai moment pour vous.</p><Link href="/rituel" className="mt-8 inline-block w-full bg-[var(--green)] px-6 py-4 text-center text-white md:w-auto">Complétez votre rituel</Link><p className="mt-5 text-sm">Paiement à la livraison partout au Maroc</p></div><div className="relative order-1 aspect-[4/5] md:order-2 md:aspect-[3/2]"><Image src={media.heroRitual.src} alt={media.heroRitual.alt} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div></section>
    <section className="px-6 py-20 md:px-16"><p className="text-sm text-[var(--rose)]">Les heures que l&apos;on oublie</p><h2 className="display mt-4 max-w-2xl text-4xl md:text-6xl">Chaque nuit mérite un dernier geste de douceur.</h2><p className="mt-6 max-w-xl leading-7">Chaque nuit, vos cheveux frottent, se froissent, se réveillent parfois avant vous. MELSSY rend ces heures invisibles plus douces.</p></section>
    <section id="rituel" className="border-y border-black/10 px-6 py-16 md:px-16"><p className="text-sm text-[var(--green)]">La Beauty Night Ritual™</p><h2 className="display mt-3 text-4xl">Votre dernier geste beauté de la journée.</h2><div className="mt-8 grid gap-3 sm:grid-cols-2"><p>Deux taies satinées</p><p>Un bonnet satiné</p><p>Deux chouchous satinés</p><p>Boucleur sans chaleur offert</p></div><button onClick={() => add("beauty-night-ritual")} className="mt-8 border border-[var(--foreground)] px-6 py-3">Ajouter la Beauty Night Ritual™</button></section>
    <section className="grid md:grid-cols-2"><div className="px-6 py-16 md:px-16"><p className="text-sm text-[var(--rose)]">Pourquoi le satin</p><h2 className="display mt-3 text-4xl">Moins de friction. Plus de douceur au réveil.</h2><p className="mt-5 leading-7">Une surface douce accompagne vos longueurs et votre peau pendant la nuit, pour une routine du soir plus attentionnée.</p></div><div className="relative aspect-[4/5]"><Image src={media.satinBenefit.src} alt={media.satinBenefit.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div></section>
    <section className="border-y border-[var(--line)] px-6 py-16 md:px-16 md:py-24"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow text-[var(--green)]">La collection</p><h2 className="display mt-4 max-w-xl text-5xl leading-none">Un geste, ou le rituel complet.</h2></div><a href="/collections/essentiels-de-nuit" className="text-sm underline underline-offset-4">Découvrir les essentiels</a></div><div className="mt-10 grid border-t border-[var(--line)] sm:grid-cols-2 lg:grid-cols-4"><a href="/collections/essentiels-de-nuit" className="border-b border-r border-[var(--line)] px-5 py-8"><span className="eyebrow text-[var(--rose)]">01</span><p className="mt-8 text-lg">Bonnet satiné</p></a><a href="/collections/essentiels-de-nuit" className="border-b border-r border-[var(--line)] px-5 py-8"><span className="eyebrow text-[var(--rose)]">02</span><p className="mt-8 text-lg">Taie d&apos;oreiller satinée</p></a><a href="/collections/essentiels-de-nuit" className="border-b border-r border-[var(--line)] px-5 py-8"><span className="eyebrow text-[var(--rose)]">03</span><p className="mt-8 text-lg">Boucleur sans chaleur</p></a><a href="/collections/essentiels-de-nuit" className="border-b border-r border-[var(--line)] px-5 py-8"><span className="eyebrow text-[var(--rose)]">04</span><p className="mt-8 text-lg">Chouchous satinés</p></a></div></section>
    <section className="px-6 py-16 md:px-16 md:py-24"><p className="eyebrow text-[var(--rose)]">Vos soirées, bientôt ici</p><h2 className="display mt-4 max-w-2xl text-5xl leading-none">Le rituel raconté par celles qui le vivent.</h2><div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-3" aria-label="Emplacements pour contenus UGC">{[1, 2, 3].map((slot) => <div key={slot} className="media-placeholder aspect-[9/16] w-52 shrink-0 snap-start" aria-label={`Emplacement vidéo UGC ${slot}`} />)}</div><p className="mt-5 max-w-xl text-sm leading-6 text-black/65">Cet espace accueillera vos vidéos et avis authentiques dès que vos contenus seront prêts.</p></section>
    <section className="grid gap-8 bg-[#eadbd1] px-6 py-14 md:grid-cols-3 md:px-16"><div><p className="eyebrow text-[var(--rose)]">01</p><h2 className="display mt-3 text-3xl">Vous choisissez</h2><p className="mt-3 text-sm leading-6">Le rituel complet ou l&apos;essentiel qui vous accompagne ce soir.</p></div><div><p className="eyebrow text-[var(--rose)]">02</p><h2 className="display mt-3 text-3xl">Nous confirmons</h2><p className="mt-3 text-sm leading-6">Notre équipe valide avec vous les détails de votre commande.</p></div><div><p className="eyebrow text-[var(--rose)]">03</p><h2 className="display mt-3 text-3xl">Vous réglez à la livraison</h2><p className="mt-3 text-sm leading-6">Un paiement simple, au moment de recevoir votre commande au Maroc.</p></div></section>
    <footer className="bg-[var(--foreground)] px-6 py-12 text-[#f7f3eb]"><span className="wordmark text-lg">MELSSY</span><nav className="mt-8 grid gap-3 text-sm"><a href="/collections/essentiels-de-nuit">Les essentiels de nuit</a><a href="/a-propos">Notre histoire</a><a href="/contact">Nous contacter</a><a href="/livraison-retours">Livraison & retours</a><a href="/conditions-generales">Conditions générales de vente</a><a href="/confidentialite">Politique de confidentialité</a></nav></footer>
    <Link href="/rituel#commande" className="fixed bottom-0 left-0 right-0 z-10 bg-[var(--green)] px-6 py-4 text-center text-white md:hidden">Complétez votre rituel · {price(catalog["beauty-night-ritual"].price)}</Link>
    {drawer && <div role="dialog" aria-modal="true" aria-label="Votre panier" className="fixed inset-0 z-30 bg-black/30"><aside className="ml-auto flex h-full w-full max-w-md flex-col bg-[var(--background)] p-6"><div className="flex justify-between"><h2 className="display text-3xl">Votre rituel</h2><button onClick={() => setDrawer(false)}>Fermer</button></div><div className="mt-8 flex-1">{cart.length ? cart.map((id, index) => <div key={`${id}-${index}`} className="mb-4 flex justify-between border-b border-black/10 pb-4"><span>{catalog[id].name}</span><span>{price(catalog[id].price)}</span></div>) : <p>Votre panier est vide.</p>}<p className="mt-8 font-semibold">Total · {price(total)}</p><p className="mt-2 text-sm">Paiement à la livraison.</p><div className="mt-8 border-t border-black/10 pt-6">{(["pillowcase-pair", "extra-bonnet"] as ItemId[]).map((id) => <button key={id} onClick={() => add(id)} className="mt-3 block text-left underline">+ {catalog[id].name} · {price(catalog[id].price)}</button>)}</div></div><button disabled={!cart.length} onClick={() => { emitCommerceEvent("InitiateCheckout", cart, total); setDrawer(false); setCheckout(true); }} className="w-full bg-[var(--green)] px-6 py-4 text-white disabled:opacity-40">Commander en paiement à la livraison</button></aside></div>}
    {checkout && <div role="dialog" aria-modal="true" aria-label="Commander" className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4"><div className="w-full max-w-md bg-[var(--background)] p-6"><div className="flex justify-between"><h2 className="display text-3xl">Votre rituel vous attend.</h2><button onClick={() => setCheckout(false)}>Fermer</button></div><p className="mt-4">Total · {price(total)} · Paiement à la livraison</p><label className="mt-6 block text-sm">Nom complet<input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full border border-black/20 bg-transparent p-3" /></label><label className="mt-4 block text-sm">Téléphone mobile<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 w-full border border-black/20 bg-transparent p-3" inputMode="tel" placeholder="06 00 00 00 00" /></label>{phone && !validPhone(phone) && <p className="mt-2 text-sm text-red-800">Veuillez saisir un numéro mobile marocain valide (06 ou 07).</p>}<button disabled={!ready} onClick={placeOrder} className="mt-6 w-full bg-[var(--green)] px-6 py-4 text-white disabled:opacity-40">Réserver mon rituel</button></div></div>}
    {order && seconds > 0 && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"><div className="w-full max-w-md bg-[var(--background)] p-6 text-center"><p className="text-sm text-[var(--rose)]">Une dernière attention pour votre nuit</p><h2 className="display mt-3 text-4xl">Paire de taies satinées à 120 DH</h2><p className="mt-4">Cette offre se termine dans {seconds} secondes.</p><button onClick={() => setSeconds(0)} className="mt-6 w-full bg-[var(--green)] px-6 py-4 text-white">Ajouter à ma commande</button><button onClick={() => setSeconds(0)} className="mt-3 underline">Non merci</button></div></div>}
  </main>;
}
