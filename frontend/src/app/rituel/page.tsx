"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { catalog, formatPrice, type ProductId } from "@/content/catalog";
import { landing } from "@/content/landing.fr";
import { media } from "@/content/media";
import { emitCommerceEvent, safeUUID } from "@/lib/analytics";
import { Carousel } from "@/components/carousel";
import { OrderSummary } from "@/components/order-summary";
import { SectionImage } from "@/components/section-image";
import { UgcCarousel } from "@/components/ugc-carousel";

const ritual = catalog["beauty-night-ritual"];
const collectionProducts = [
  ["bonnet-solo", media.collectionBonnet],
  ["pillowcase-solo", media.collectionPillowcase],
  ["heatless-curler-solo", media.collectionCurler],
  ["scrunchies-solo", media.collectionScrunchies],
] as const;
const previewEmpty =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_PREVIEW_EMPTY === "true";
const showUgc = previewEmpty && landing.sectionOrder.includes("ugc");
const showReviews = previewEmpty && landing.sectionOrder.includes("reviews");
const normalizeMoroccanMobile = (value: string) => {
  let phone = value.replace(/[\s-]/g, "");
  if (phone.startsWith("00212")) phone = `+212${phone.slice(5)}`;
  else if (phone.startsWith("212")) phone = `+${phone}`;
  else if (phone.startsWith("0")) phone = `+212${phone.slice(1)}`;
  return /^\+212[67]\d{8}$/.test(phone) ? phone : null;
};

export default function RitualLandingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<ProductId[]>([]);
  const [addedProduct, setAddedProduct] = useState<ProductId | null>(null);
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [showStickyCta, setShowStickyCta] = useState(true);
  const checkoutSectionRef = useRef<HTMLElement>(null);
  const orderItems: ProductId[] = ["beauty-night-ritual", ...selectedProducts];
  const total = orderItems.reduce((sum, item) => sum + catalog[item].price, 0);
  const openCheckout = () => {
    setShowStickyCta(false);
    document.getElementById("commande")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  useEffect(() => {
    const checkoutSection = checkoutSectionRef.current;
    if (!checkoutSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(checkoutSection);
    return () => observer.disconnect();
  }, []);
  const scrollToForm = () => {
    const formField = document.getElementById("name-primary") as HTMLInputElement | null;
    if (!formField) return;
    const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
    const targetTop = window.scrollY + formField.getBoundingClientRect().top - headerHeight - 24;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    window.setTimeout(() => formField.focus({ preventScroll: true }), 500);
  };
  const addCollectionItem = (productId: ProductId) => {
    setSelectedProducts((items) =>
      items.includes(productId) ? items : [...items, productId],
    );
    setAddedProduct(productId);
  };
  const toggleProduct = (productId: ProductId, checked: boolean) =>
    setSelectedProducts((items) =>
      checked
        ? [...items.filter((item) => item !== productId), productId]
        : items.filter((item) => item !== productId),
    );
  const order = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ name: true, phone: true });
    const normalizedPhone = normalizeMoroccanMobile(phone);
    if (!name.trim() || !normalizedPhone || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const attribution = new URLSearchParams(window.location.search);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10_000);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/v1/orders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            name: name.trim(),
            phone: normalizedPhone,
            idempotency_key: safeUUID(),
            items: orderItems.map((product_id) => ({
              product_id,
              quantity: 1,
            })),
            attribution: {
              utm_source: attribution.get("utm_source"),
              utm_campaign: attribution.get("utm_campaign"),
              fbclid: attribution.get("fbclid"),
              ttclid: attribution.get("ttclid"),
            },
          }),
        },
      );
      window.clearTimeout(timeout);
      if (!response.ok) throw new Error("order_failed");
      const result: {
        order_number: string;
        offer: { product_id: string; price: string } | null;
      } = await response.json();
      router.push(`/merci/${encodeURIComponent(result.order_number)}`);
      void emitCommerceEvent("Purchase", [...orderItems], total);
    } catch {
      setError("Votre commande n'a pas pu être enregistrée. Veuillez réessayer.");
      setSubmitting(false);
    }
  };
  const form = (suffix: string) => (
    <form data-order-form noValidate onSubmit={order} className="mt-6 grid gap-4">
      <OrderSummary items={orderItems} onToggle={toggleProduct} />
      <label htmlFor={`name-${suffix}`} className="text-sm font-medium">
        Nom complet
        <input
          id={`name-${suffix}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          onFocus={() => setTouched((fields) => ({ ...fields, name: true }))}
          onBlur={() => setTouched((fields) => ({ ...fields, name: true }))}
          autoComplete="name"
          aria-invalid={touched.name && name.trim().length < 2}
          aria-describedby={`name-error-${suffix}`}
          className="mt-2 w-full border border-[var(--line)] bg-white/50 px-4 py-3"
          required
        />
        {touched.name && name.trim().length < 2 && <span id={`name-error-${suffix}`} className="mt-2 block text-sm text-red-800">Saisissez votre nom complet.</span>}
      </label>
      <label htmlFor={`phone-${suffix}`} className="text-sm font-medium">
        Téléphone
        <input
          id={`phone-${suffix}`}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          onFocus={() => setTouched((fields) => ({ ...fields, phone: true }))}
          onBlur={() => setTouched((fields) => ({ ...fields, phone: true }))}
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="06 00 00 00 00"
          aria-invalid={touched.phone && !normalizeMoroccanMobile(phone)}
          aria-describedby={`phone-error-${suffix}`}
          className="mt-2 w-full border border-[var(--line)] bg-white/50 px-4 py-3"
          required
        />
        {touched.phone && !normalizeMoroccanMobile(phone) && (
          <span id={`phone-error-${suffix}`} className="mt-2 block text-sm text-red-800">
            Saisissez un numéro mobile marocain valide commençant par 06 ou 07.
          </span>
        )}
      </label>
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
      <button
        disabled={submitting}
        className="relative z-40 w-full bg-[var(--green)] px-6 py-4 text-white disabled:bg-[#9aa79f] disabled:text-white disabled:opacity-100"
      >
        {submitting ? "Enregistrement..." : `${landing.ctas.completeRitual} · ${formatPrice(total)}`}
      </button>
      <p className="-mt-2 text-center text-xs text-black/65">Paiement à la livraison</p>
      <div className="grid grid-cols-3 gap-3 text-center text-xs leading-5 text-black/65">
        <p>Vous payez à la réception.</p>
        <p>Livraison partout au Maroc.</p>
        <p>Nous vous appelons pour confirmer.</p>
      </div>
    </form>
  );
  return (
    <main className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line)] bg-[var(--background)]/95 px-5 py-3 backdrop-blur">
        <Link href="/" className="text-sm underline underline-offset-4">
          Accueil
        </Link>
        <Link href="/" className="wordmark text-xl">
          MELSSY
        </Link>
        <Link href="/a-propos" className="text-sm underline underline-offset-4">
          Notre histoire
        </Link>
      </header>
      <section className="grid md:grid-cols-2">
        <div className="relative aspect-[3/2] md:order-2 md:aspect-[4/5]">
          <Image
            src={media.heroRitual.src}
            alt={media.heroRitual.alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="px-6 py-8 md:order-1 md:px-16 md:py-24">
          <p className="eyebrow text-[var(--rose)]">{landing.hero.eyebrow}</p>
          <h1 className="display mt-4 text-5xl leading-[.94] md:text-7xl">
            {landing.hero.headline}
          </h1>
          <p className="mt-6 max-w-lg leading-7">{landing.hero.body}</p>
          <div className="mt-7 border-t border-[var(--line)] pt-4">
            <p className="text-sm font-medium">Le coffret complet</p>
            <p className="mt-2 text-[10px] uppercase tracking-[.1em] text-[var(--rose)]">
              {ritual.contents}
            </p>
            <p className="display mt-4 text-5xl leading-none">{ritual.price}<span className="ml-1 align-middle text-3xl font-normal">&thinsp;DH</span></p>
            <p className="mt-2 text-sm">
              Paiement à la livraison · Livraison partout au Maroc
            </p>
          </div>
        </div>
      </section>
      <section
        id="commande"
        ref={checkoutSectionRef}
        className="scroll-mt-20 bg-[#eadbd1] px-6 py-12 md:px-16"
      >
        <div className="mx-auto max-w-xl">
          <p className="eyebrow text-[var(--rose)]">Réservez votre rituel</p>
          <h2 className="display mt-3 text-4xl">Votre soirée commence ici.</h2>
          <p className="mt-3 text-sm leading-6">
            Un rituel complet, un paiement à la livraison, une confirmation avec
            notre équipe.
          </p>
          {form("primary")}
        </div>
      </section>
      <section id="commande-final" className="px-6 py-16 md:px-16 md:py-24">
        <p className="eyebrow text-[var(--rose)]">Le problème</p>
        <h2 className="display mt-4 max-w-3xl text-5xl leading-none">
          {landing.problem.title}
        </h2>
        <p className="mt-6 max-w-xl leading-7">{landing.problem.body}</p>
      </section>
      <section className="grid border-y border-[var(--line)] md:grid-cols-[.9fr_1.1fr]">
        <div className="bg-[var(--green)] px-6 py-16 text-[#f7f3eb] md:px-16">
          <p className="eyebrow text-[#dfaaa1]">Dans la boîte</p>
          <h2 className="display mt-4 text-4xl leading-none">
            Le rituel complet, prêt pour ce soir.
          </h2>
          <p className="mt-6 text-sm leading-6 text-[#f7f3eb]/80">
            Deux taies satinées, un bonnet satiné, deux chouchous satinés et un
            boucleur sans chaleur offert.
          </p>
        </div>
        <SectionImage src={media.ritualDetail.src} alt={media.ritualDetail.alt} sizes="(max-width: 768px) calc(100vw - 48px), 45vw" />
      </section>
      <section className="grid md:grid-cols-2">
        <div className="px-6 py-16 md:order-2 md:px-16 md:py-24">
          <p className="eyebrow text-[var(--green)]">Pourquoi le satin</p>
          <h2 className="display mt-4 text-5xl leading-none">
            {landing.satin.title}
          </h2>
          <p className="mt-6 max-w-lg leading-7">{landing.satin.body}</p>
        </div>
        <div className="md:order-1">
          <SectionImage src={media.satinBenefit.src} alt={media.satinBenefit.alt} sizes="(max-width: 768px) calc(100vw - 48px), 40vw" />
        </div>
      </section>
      <section className="px-6 py-16 md:px-16">
        <p className="eyebrow text-[var(--rose)]">Le rituel</p>
        <h2 className="display mt-4 text-5xl leading-none">
          Un geste qui suit votre soirée.
        </h2>
        <div className="mt-10 divide-y border-y border-[var(--line)]">
          {[
            { step: "Attachez avec douceur", image: media.stepScrunchie },
            { step: "Préparez vos boucles", image: media.stepCurler },
            { step: "Enveloppez vos longueurs", image: media.stepBonnet },
            { step: "Posez-vous, simplement", image: media.stepPillowcase },
          ].map(({ step, image }, index) => (
            <div key={step} className="flex items-center gap-5 py-5">
              <div className="relative aspect-square w-20 shrink-0 overflow-hidden md:w-[96px]"><Image src={image.src} alt={image.alt} fill sizes="96px" className="object-cover" /></div>
              <div><p className="eyebrow text-[var(--rose)]">0{index + 1}</p><p className="mt-2 text-lg">{step}</p></div>
            </div>
          ))}
        </div>
      </section>
      {showUgc && <section className="border-y border-[var(--line)] px-6 py-16 md:px-16">
        <p className="eyebrow text-[var(--rose)]">{landing.preview.eyebrow}</p>
        <h2 className="display mt-4 text-4xl leading-none">{landing.preview.ugcTitle}</h2>
        <UgcCarousel cards={landing.preview.ugcCards.map((card, index) => ({ ...card, poster: media.ugc[index].src, alt: media.ugc[index].alt }))} onOrder={scrollToForm} ctaLabel={landing.ctas.completeRitual} />
      </section>}
      {showReviews && <section className="bg-[#eadbd1] px-6 py-16 text-center md:px-16">
        <p className="eyebrow text-[var(--rose)]">{landing.preview.eyebrow}</p>
        <h2 className="display mt-4 text-4xl leading-none">{landing.preview.reviewsTitle}</h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-6">{landing.preview.reviewsBody}</p>
      </section>}
      <section className="px-6 py-16 md:px-16">
        <p className="eyebrow text-[var(--green)]">MELSSY et le reste</p>
        <h2 className="display mt-4 max-w-2xl text-5xl leading-none">
          {landing.comparison.title}
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="border border-[var(--green)] bg-[var(--green)] p-6 text-[#f7f3eb]">
            <p className="eyebrow text-[#dfaaa1]">MELSSY</p>
            <p className="mt-5 leading-7">{landing.comparison.melssy}</p>
          </div>
          <div className="border border-[var(--line)] p-6">
            <p className="eyebrow text-[var(--rose)]">Générique</p>
            <p className="mt-5 leading-7">{landing.comparison.generic}</p>
          </div>
        </div>
      </section>
      <section className="bg-[#eadbd1] px-6 py-16 md:px-16">
        <p className="eyebrow text-[var(--rose)]">Questions fréquentes</p>
        <h2 className="display mt-4 text-5xl leading-none">
          Avant de commander.
        </h2>
        <div className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {landing.faq.map(([question, answer]) => (
            <details key={question} className="py-5">
              <summary className="cursor-pointer pr-5 font-medium">
                {question}
              </summary>
              <p className="mt-3 max-w-xl text-sm leading-6">{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow text-[var(--rose)]">La Beauty Night Ritual™</p>
          <h2 className="display mt-4 text-5xl leading-none">
            Le dernier geste de votre journée.
          </h2>
          <p className="display mt-6 text-3xl">{formatPrice(ritual.price)}</p>
          {form("final")}
        </div>
      </section>
      <section className="border-t border-[var(--line)] px-6 py-16 md:px-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-[var(--green)]">La collection</p>
            <h2 className="display mt-3 text-4xl">Les essentiels de nuit.</h2>
          </div>
          <Link
            href="/collections/essentiels-de-nuit"
            className="text-sm underline underline-offset-4"
          >
            Voir la collection
          </Link>
        </div>
        <div className="mt-8">
          <Carousel label="Les essentiels de nuit">
            {collectionProducts.map(([id, image]) => <article key={id} className="w-[74vw] shrink-0 snap-start sm:w-64"><div className="relative aspect-square overflow-hidden bg-[#e8e1d6]"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 640px) 74vw, 256px" className="object-cover" /></div><div className="mt-4 flex items-start justify-between gap-3"><h3 className="text-sm font-medium">{catalog[id].name}</h3><span className="shrink-0 text-sm">{formatPrice(catalog[id].price)}</span></div><button onClick={() => addCollectionItem(id)} className="mt-4 w-full border border-[var(--green)] px-4 py-3 text-sm">Ajouter</button></article>)}
          </Carousel>
          {addedProduct && <p className="mt-4 text-sm">{catalog[addedProduct].name} a été ajouté à votre commande. <button onClick={scrollToForm} className="underline underline-offset-4">{landing.ctas.viewOrderForm}</button></p>}
        </div>
      </section>
      <footer className="bg-[var(--foreground)] px-6 py-12 text-[#f7f3eb] md:px-16">
        <span className="wordmark text-2xl">MELSSY</span>
        <nav className="mt-7 grid gap-3 text-sm sm:grid-cols-3">
          <Link href="/a-propos">Notre histoire</Link>
          <Link href="/collections/essentiels-de-nuit">Collections</Link>
          <Link href="/contact">Nous contacter</Link>
        </nav>
      </footer>
      {showStickyCta && (
        <button
          type="button"
          onClick={openCheckout}
          className="fixed bottom-0 left-0 right-0 z-30 whitespace-nowrap bg-[var(--green)] px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 text-sm text-white sm:text-base"
        >
          {landing.ctas.completeRitual} · {formatPrice(ritual.price)}
        </button>
      )}
    </main>
  );
}
