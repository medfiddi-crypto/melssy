"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Check, X } from "lucide-react";

import { catalog, formatPrice } from "@/content/catalog";
import { landing } from "@/content/landing.fr";
import { media } from "@/content/media";
import { optionalStorefront } from "@/content/storefront";
import { emitCommerceEvent, safeUUID } from "@/lib/analytics";
import { Carousel } from "@/components/carousel";
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
const separateValue = landing.valueStack.items.reduce(
  (sum, item) => sum + catalog[item.productId].price,
  0,
);
const deliveryTime = landing.trust.deliveryTime;
const confirmationWindow = optionalStorefront.confirmationWindow();
const normalizeMoroccanMobile = (value: string) => {
  let phone = value.replace(/[\s-]/g, "");
  if (phone.startsWith("00212")) phone = `+212${phone.slice(5)}`;
  else if (phone.startsWith("212")) phone = `+${phone}`;
  else if (phone.startsWith("0")) phone = `+212${phone.slice(1)}`;
  return /^\+212[67]\d{8}$/.test(phone) ? phone : null;
};

export default function RitualLandingPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [heroSection, setHeroSection] = useState<HTMLElement | null>(null);
  const [primaryForm, setPrimaryForm] = useState<HTMLFormElement | null>(null);
  const [heroInView, setHeroInView] = useState(true);
  const [checkoutInView, setCheckoutInView] = useState(false);
  const [stickyCtaMounted, setStickyCtaMounted] = useState(false);
  const [stickyCtaVisible, setStickyCtaVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [tapTarget, setTapTarget] = useState("");
  const toggleAddon = (id: string) =>
    setSelectedAddons((current) => ({ ...current, [id]: !current[id] }));
  const selectedAddonIds = landing.addons.items.filter((id) => selectedAddons[id]);
  const addonsTotal = selectedAddonIds.reduce((sum, id) => sum + catalog[id].price, 0);
  const total = ritual.price + addonsTotal;
  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.visualViewport?.height ?? window.innerHeight);
    };
    updateViewportHeight();
    window.visualViewport?.addEventListener("resize", updateViewportHeight);
    return () => window.visualViewport?.removeEventListener("resize", updateViewportHeight);
  }, []);
  useEffect(() => {
    if (!heroSection || !primaryForm || !viewportHeight) return;

    const syncHeroVisibility = () => {
      setHeroInView(heroSection.getBoundingClientRect().bottom > 0);
    };
    const heroObserver = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      { threshold: 0 },
    );
    const checkoutObserver = new IntersectionObserver(
      ([entry]) => setCheckoutInView(entry.isIntersecting),
      { rootMargin: `0px 0px -${Math.round(viewportHeight * 0.7)}px 0px`, threshold: 0 },
    );
    heroObserver.observe(heroSection);
    checkoutObserver.observe(primaryForm);
    window.addEventListener("scroll", syncHeroVisibility, { passive: true });
    syncHeroVisibility();
    return () => {
      heroObserver.disconnect();
      checkoutObserver.disconnect();
      window.removeEventListener("scroll", syncHeroVisibility);
    };
  }, [heroSection, primaryForm, viewportHeight]);
  const showStickyCta = !heroInView && !checkoutInView;
  const compactMasthead = !heroInView;
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    const inspectTap = (event: PointerEvent) => {
      const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      if (!target) return setTapTarget("Tap: no element");
      const className = typeof target.className === "string" ? target.className : "";
      setTapTarget(`Tap: ${target.tagName.toLowerCase()}${target.id ? `#${target.id}` : ""}${className ? `.${className.split(/\s+/).join(".")}` : ""}`);
    };
    document.addEventListener("pointerdown", inspectTap, true);
    return () => document.removeEventListener("pointerdown", inspectTap, true);
  }, []);
  useEffect(() => {
    if (showStickyCta) {
      setStickyCtaMounted(true);
      const frame = window.requestAnimationFrame(() => setStickyCtaVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    setStickyCtaVisible(false);
    const timeout = window.setTimeout(() => setStickyCtaMounted(false), 200);
    return () => window.clearTimeout(timeout);
  }, [showStickyCta]);
  const scrollToForm = () => {
    document.getElementById("commande-fields")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handleHeroCta = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToForm();
  };
  const order = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ name: true, phone: true });
    const normalizedPhone = normalizeMoroccanMobile(phone);
    if (!name.trim() || !normalizedPhone || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const orderUrl = "/api/v1/orders";
      const attribution = new URLSearchParams(window.location.search);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10_000);
      const items = [
        { product_id: "beauty-night-ritual", quantity: 1 },
        ...selectedAddonIds.map((id) => ({ product_id: id, quantity: 1 })),
      ];
      const response = await fetch(
        orderUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            name: name.trim(),
            phone: normalizedPhone,
            idempotency_key: safeUUID(),
            items,
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
      if (!response.ok) throw new Error(`order_failed_status_${response.status}`);
      const result: { order_number: string } = await response.json();
      console.info("MELSSY order saved", { orderUrl, orderNumber: result.order_number });
      void emitCommerceEvent("Purchase", ["beauty-night-ritual", ...selectedAddonIds], total);
      const destination = `/merci/${encodeURIComponent(result.order_number)}`;
      console.info("MELSSY navigating after order", { destination });
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      location.href = destination;
    } catch (error) {
      console.error("MELSSY order submission failed", { url: "/api/v1/orders", error });
      setError(landing.order.error);
      setSubmitting(false);
    }
  };
  const form = (suffix: string) => (
    <form
      ref={suffix === "primary" ? setPrimaryForm : undefined}
      data-order-form
      action="/commande"
      method="post"
      noValidate
      onSubmit={order}
      className="grid gap-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0"
    >
      <div
        id={suffix === "primary" ? "commande-fields" : undefined}
        className="scroll-mt-20 grid gap-4"
      >
      <label htmlFor={`name-${suffix}`} className="text-sm font-medium">
        {landing.order.nameLabel}
        <input
          id={`name-${suffix}`}
          name="full_name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onFocus={() => setTouched((fields) => ({ ...fields, name: true }))}
          onBlur={() => setTouched((fields) => ({ ...fields, name: true }))}
          autoComplete="name"
          aria-invalid={touched.name && name.trim().length < 2}
          aria-describedby={`name-error-${suffix}`}
          className="mt-2 w-full border border-[#b9a497] bg-[#faf8f5] px-4 py-3 outline-none focus:border-[var(--rose)] focus:ring-1 focus:ring-[var(--rose)]"
          required
        />
        {touched.name && name.trim().length < 2 && <span id={`name-error-${suffix}`} className="mt-2 block text-sm text-red-800">{landing.order.nameError}</span>}
      </label>
      <label htmlFor={`phone-${suffix}`} className="text-sm font-medium">
        {landing.order.phoneLabel}
        <input
          id={`phone-${suffix}`}
          name="phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          onFocus={() => setTouched((fields) => ({ ...fields, phone: true }))}
          onBlur={() => setTouched((fields) => ({ ...fields, phone: true }))}
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          placeholder={landing.order.phonePlaceholder}
          aria-invalid={touched.phone && !normalizeMoroccanMobile(phone)}
          aria-describedby={`phone-error-${suffix}`}
          className="mt-2 w-full border border-[#b9a497] bg-[#faf8f5] px-4 py-3 outline-none focus:border-[var(--rose)] focus:ring-1 focus:ring-[var(--rose)]"
          required
        />
        {touched.phone && !normalizeMoroccanMobile(phone) && (
          <span id={`phone-error-${suffix}`} className="mt-2 block text-sm text-red-800">
            {landing.order.phoneError}
          </span>
        )}
      </label>
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
      {landing.addons.items.length > 0 && (
        <fieldset className="grid gap-3 border-t border-[var(--line)] pt-4">
          <legend className="text-sm font-medium">{landing.addons.title}</legend>
          <p className="text-xs text-black/55">{landing.addons.hint}</p>
          {landing.addons.items.map((id) => (
            <label key={`${id}-${suffix}`} className="flex items-start gap-3 border border-[var(--line)] bg-[#faf8f5] px-4 py-3">
              <input
                type="checkbox"
                name="addons"
                value={id}
                checked={Boolean(selectedAddons[id])}
                onChange={() => toggleAddon(id)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--green)]"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium">{catalog[id].name}</span>
                <span className="block text-xs text-black/60">{catalog[id].description}</span>
              </span>
              <span className="shrink-0 text-sm">{landing.addons.pricePrefix} {formatPrice(catalog[id].price)}</span>
            </label>
          ))}
        </fieldset>
      )}
      <p className="text-center text-xs leading-5 text-[var(--green)]">
        {formatPrice(ritual.price)} · {landing.trust.freeDelivery} · {landing.trust.cod}
      </p>
      <p className="text-center text-sm leading-6 text-black/65">
        {landing.order.reassurance}
      </p>
      <button
        type="submit"
        disabled={submitting}
        className="relative z-40 w-full bg-[var(--green)] px-6 py-4 text-white disabled:bg-[#9aa79f] disabled:text-white disabled:opacity-100"
      >
        {submitting ? landing.order.submitting : `${landing.ctas.completeRitual} · ${formatPrice(total)}`}
      </button>
      </div>
    </form>
  );
  return (
    <main
      style={{
        "--sticky-cta-height": "52px",
      } as CSSProperties}
      className={`pb-[calc(var(--sticky-cta-height)+env(safe-area-inset-bottom))] transition-[padding] duration-200 ease-out motion-reduce:transition-none ${compactMasthead ? "pt-14" : "pt-14 md:pt-[86px]"}`}
    >
      <header
        className={`fixed inset-x-0 top-0 z-20 flex justify-center border-b border-[#b9a497]/45 px-5 transition-[height,background-color,box-shadow] duration-200 ease-out motion-reduce:transition-none ${compactMasthead ? "h-14 bg-[var(--background)]/90 shadow-[0_2px_8px_rgba(31,37,32,0.06)] backdrop-blur" : "h-14 md:h-[86px] bg-[var(--background)]"}`}
      >
        <Link href="/rituel" className="block translate-x-[0.02em] self-center text-center">
          <span className={`wordmark block font-medium transition-[font-size] duration-200 ease-out motion-reduce:transition-none ${compactMasthead ? "text-lg" : "text-xl"}`} style={{ letterSpacing: ".08em" }}>{landing.masthead.brand}</span>
          <span className={`wordmark-descriptor block overflow-hidden text-[9px] uppercase tracking-[.16em] transition-[max-height,opacity] duration-200 ease-out motion-reduce:transition-none ${compactMasthead ? "max-h-0 opacity-0" : "max-h-4 opacity-100"}`}>{landing.footer.descriptor}</span>
        </Link>
      </header>
      <section ref={setHeroSection} className="grid md:grid-cols-2">
        <div className="relative h-[56vh] max-h-[56vh] w-full md:order-2 md:h-auto md:max-h-none md:aspect-[300/301]">
          <Image
            src={media.landingHero.src}
            alt={media.landingHero.alt}
            width={1200}
            height={1500}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="h-full w-full object-cover object-[center_70%] md:object-center"
          />
        </div>
        <div className="px-6 py-4 md:order-1 md:px-16 md:py-24">
          <p className="eyebrow text-[var(--rose)]">{landing.hero.eyebrow}</p>
          <h1 className="display mt-3 text-4xl leading-[.98] md:text-7xl">
            Vos cheveux, protégés <span className="headline-accent">toute la nuit.</span>
          </h1>
          <p className="mt-3 max-w-lg leading-6">{landing.hero.body}</p>
          <p className="mt-4 text-sm font-medium">
            {formatPrice(ritual.price)} · Livraison offerte · Paiement à la livraison
          </p>
          <a
            href="#commande-fields"
            onClick={handleHeroCta}
            className="mt-6 inline-block w-full bg-[var(--green)] px-6 py-4 text-center text-white sm:w-auto"
          >
            {landing.hero.cta}
          </a>
        </div>
      </section>
      <section className="border-b border-[var(--line)] bg-[#eadbd1]/40 px-6 py-4 md:px-16">
        <ul className="mx-auto max-w-3xl text-center text-xs sm:text-sm">
          <li>{confirmationWindow ? `${landing.trust.confirm} (${confirmationWindow})` : landing.trust.confirm}</li>
        </ul>
      </section>
      <section className="px-6 py-16 md:px-16 md:py-24">
        <div className="grid md:grid-cols-[1fr_1.2fr] md:gap-8 md:items-center">
          <div>
            <p className="eyebrow text-[var(--rose)]">{landing.problem.eyebrow}</p>
            <h2 className="display mt-4 max-w-lg text-[30px] leading-[1.15] md:max-w-3xl md:text-5xl md:leading-none">
              Chaque nuit, vos cheveux s&apos;abîment <span className="headline-accent">en silence.</span>
            </h2>
            <div className="md:hidden mt-6">
              <Image src={media.problemSection.src} alt={media.problemSection.alt} width={400} height={300} className="w-full rounded-2xl object-cover" sizes="calc(100vw - 48px)" />
            </div>
            <div className="mt-6 max-w-xl space-y-4">
              <p className="leading-7">
                Chaque matin, vous le voyez : frisottis, pointes sèches, boucles écrasées. Alors vous brossez — et chaque coup de brosse casse un peu plus.
              </p>
              <p className="font-serif italic leading-7 text-lg">
                Une nuit, ça ne se voit pas. 365 nuits, si.
              </p>
            </div>
          </div>
          <div className="hidden md:block mt-6 md:mt-0">
            <Image src={media.problemSection.src} alt={media.problemSection.alt} width={400} height={300} className="w-full rounded-2xl object-cover" sizes="40vw" />
          </div>
        </div>
      </section>
      <section className="border-y border-[var(--line)] md:grid md:grid-cols-[1.1fr_.9fr]">
        <div className="bg-[var(--green)] px-6 py-16 text-[#f7f3eb] md:px-16">
          <p className="eyebrow text-[#dfaaa1]">{landing.valueStack.eyebrow}</p>
          <h2 className="display mt-4 text-4xl leading-none">
            Six pièces pensées pour <span className="headline-accent">une nuit entière.</span>
          </h2>
          <div className="md:hidden mt-6">
            <Image src={media.coffretBox.src} alt={landing.valueStack.imageAlt} width={400} height={400} className="w-full rounded-2xl object-cover" sizes="calc(100vw - 48px)" />
          </div>
          <p className="mt-4 text-sm leading-6 text-[#f7f3eb]/80">
            {landing.valueStack.body}
          </p>
          <ul className="mt-8 divide-y divide-[#f7f3eb]/20 border-y border-[#f7f3eb]/20">
            {landing.valueStack.items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span>{item.label}</span>
                <span className="flex items-center gap-2">
                  {Boolean((item as { gift?: boolean }).gift) && (
                    <span className="text-[10px] uppercase tracking-[.1em] text-[#dfaaa1]">{landing.valueStack.giftBadge}</span>
                  )}
                  <span>{formatPrice(catalog[item.productId].price)}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-1 text-sm">
            <div className="flex justify-between text-[#f7f3eb]/70">
              <span>{landing.valueStack.separateLabel}</span>
              <span>{formatPrice(separateValue)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-lg">{landing.valueStack.coffretLabel}</span>
              <span className="display text-[28px] md:text-[32px] leading-none">{formatPrice(ritual.price)}</span>
            </div>
            <div className="flex justify-between text-[#dfaaa1]">
              <span>{landing.valueStack.savingsLabel}</span>
              <span>{formatPrice(separateValue - ritual.price)}</span>
            </div>
          </div>
          <a
            href="#commande"
            onClick={handleHeroCta}
            className="mt-8 mx-auto block w-full bg-[var(--background)] px-6 py-[13px] text-center font-semibold text-[var(--green)] rounded-[8px] md:max-w-[400px] text-base transition-colors hover:bg-[#ede7dd] active:bg-[#e8e0d4]"
          >
            Je commande mon coffret
          </a>
          <p className="mt-3 text-center text-[13px] text-[#f7f3eb]/70">
            Paiement à la livraison · Livraison offerte
          </p>
        </div>
        <div className="hidden md:block">
          <SectionImage src={media.coffretBox.src} alt={landing.valueStack.imageAlt} sizes="45vw" ratio="1 / 1" />
        </div>
      </section>
      <section className="grid md:grid-cols-2 md:gap-8">
        <div className="px-6 py-16 md:order-2 md:px-16 md:py-24">
          <p className="eyebrow text-[var(--green)]">{landing.satinComparison.eyebrow}</p>
          <h2 className="display mt-4 text-[30px] leading-[1.15] md:text-5xl md:leading-none">
            Le coton accroche. <span className="headline-accent">Le satin glisse.</span>
          </h2>
          <p className="mt-6 max-w-lg leading-7">Toute la nuit, vos cheveux frottent contre votre taie. Tout dépend de ce qu&apos;ils touchent.</p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base mx-auto md:max-w-[640px]">
              <thead>
                <tr>
                  <th className="text-left p-3 md:p-4"></th>
                  <th className="text-left p-3 md:p-4 text-black/50 font-normal">Coton</th>
                  <th className="text-left p-3 md:p-4 bg-[var(--green)] text-[#f7f3eb] font-normal">Satin MELSSY</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--line)]">
                  <td className="p-3 md:p-4 text-[var(--rose)] text-xs font-semibold uppercase tracking-wide">Vos cheveux</td>
                  <td className="p-3 md:p-4 text-black/50"><div className="flex items-start gap-2"><X size={16} strokeWidth={1.5} className="shrink-0 mt-0.5" /><span>S&apos;accrochent à chaque mouvement</span></div></td>
                  <td className="p-3 md:p-4 bg-[var(--green)] text-[#f7f3eb]"><div className="flex items-start gap-2"><Check size={16} strokeWidth={1.5} className="shrink-0 mt-0.5" /><span className="font-medium">Glissent sans frottement</span></div></td>
                </tr>
                <tr className="border-t border-[var(--line)]">
                  <td className="p-3 md:p-4 text-[var(--rose)] text-xs font-semibold uppercase tracking-wide">Votre soin du soir</td>
                  <td className="p-3 md:p-4 text-black/50"><div className="flex items-start gap-2"><X size={16} strokeWidth={1.5} className="shrink-0 mt-0.5" /><span>Absorbé par le tissu</span></div></td>
                  <td className="p-3 md:p-4 bg-[var(--green)] text-[#f7f3eb]"><div className="flex items-start gap-2"><Check size={16} strokeWidth={1.5} className="shrink-0 mt-0.5" /><span className="font-medium">Reste dans vos cheveux</span></div></td>
                </tr>
                <tr className="border-t border-[var(--line)]">
                  <td className="p-3 md:p-4 text-[var(--rose)] text-xs font-semibold uppercase tracking-wide">Au réveil</td>
                  <td className="p-3 md:p-4 text-black/50"><div className="flex items-start gap-2"><X size={16} strokeWidth={1.5} className="shrink-0 mt-0.5" /><span>Frisottis, boucles écrasées</span></div></td>
                  <td className="p-3 md:p-4 bg-[var(--green)] text-[#f7f3eb]"><div className="flex items-start gap-2"><Check size={16} strokeWidth={1.5} className="shrink-0 mt-0.5" /><span className="font-medium">Moins de frisottis, boucles préservées</span></div></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-xs text-black/50">Satin 100 % polyester, pas de la soie. Nous préférons vous le dire.</p>
        </div>
      </section>
      <section className="px-6 py-16 md:px-16">
        <p className="eyebrow text-[var(--rose)]">{landing.ritual.eyebrow}</p>
        <h2 className="display mt-4 text-5xl leading-none">
          Trois gestes, <span className="headline-accent">puis dormez.</span>
        </h2>
        <div className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {landing.ritual.steps.map((step, index) => (
            <div key={landing.ritual.steps[index].label} className="flex items-center gap-5 py-5">
              <div className="ritual-step-number w-20 shrink-0 text-[40px] leading-none text-[var(--rose)] md:w-[96px] md:text-5xl">0{index + 1}</div>
              <div><p className="eyebrow text-[var(--rose)]">{step.label}</p><p className="mt-2 text-lg">{step.text}</p></div>
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
        <p className="eyebrow text-[var(--green)]">{landing.comparison.eyebrow}</p>
        <h2 className="display mt-4 text-4xl leading-none">{landing.preview.reviewsTitle}</h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-6">{landing.preview.reviewsBody}</p>
      </section>}
      <section className="px-6 py-16 md:px-16">
        <p className="eyebrow text-[var(--green)]">{landing.comparison.eyebrow}</p>
        <h2 className="display mt-4 max-w-2xl text-5xl leading-none">
          Un rituel pensé, pas un essentiel <span className="headline-accent">choisi au hasard.</span>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="border border-[var(--green)] bg-[var(--green)] p-6 text-[#f7f3eb]">
            <p className="eyebrow text-[#dfaaa1]">{landing.comparison.melssyLabel}</p>
            <p className="mt-5 leading-7">{landing.comparison.melssy}</p>
          </div>
          <div className="border border-[var(--line)] p-6">
            <p className="eyebrow text-[var(--rose)]">{landing.comparison.genericLabel}</p>
            <p className="mt-5 leading-7">{landing.comparison.generic}</p>
          </div>
        </div>
      </section>
      <section
        id="commande"
        className="scroll-mt-20 px-6 py-6 md:px-16 md:py-12"
      >
        <div className="mx-auto max-w-xl">
          <div className="border border-[var(--line)] bg-white/50 p-5 md:p-6">
            <p className="text-sm font-medium" id="commande-fields">{landing.order.productLabel}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[.1em] text-[var(--rose)]">
              {ritual.contents}
            </p>
            <p className="display mt-4 text-5xl leading-none">
              {ritual.price}<span className="ml-1 align-middle text-3xl font-normal">&thinsp;DH</span>
            </p>
            <div className="mt-6 border-t border-[var(--line)] pt-5">
              {form("primary")}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#eadbd1] px-6 py-16 md:px-16">
        <p className="eyebrow text-[var(--rose)]">{landing.faqSection.eyebrow}</p>
        <h2 className="display mt-4 text-5xl leading-none">
          Avant de <span className="headline-accent">commander.</span>
        </h2>
        <div className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {landing.faq.map(([question, answer]) => (
            <details key={question} className="py-5">
              <summary className="cursor-pointer pr-5 font-medium">
                {question}
              </summary>
              <p className="mt-3 max-w-xl text-sm leading-6">{answer.replace("{{deliveryTime}}", deliveryTime)}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow text-[var(--rose)]">{landing.finalOrder.eyebrow}</p>
          <h2 className="display mt-4 text-5xl leading-none">
            Le dernier geste <span className="headline-accent">de votre journée.</span>
          </h2>
          <p className="display mt-6 text-3xl">{formatPrice(ritual.price)}</p>
          {form("final")}
        </div>
      </section>
      <section className="border-t border-[var(--line)] px-6 py-16 md:px-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-[var(--green)]">{landing.collection.eyebrow}</p>
            <h2 className="display mt-3 text-4xl">Les essentiels <span className="headline-accent">de nuit.</span></h2>
          </div>
          <Link
            href="/collections/essentiels-de-nuit"
            className="text-sm underline underline-offset-4"
          >
            {landing.collection.view}
          </Link>
        </div>
        <div className="mt-8">
          <Carousel label={landing.collection.title}>
            {collectionProducts.map(([id, image]) => <article key={id} className="w-[74vw] shrink-0 snap-start sm:w-64"><div className="relative aspect-square overflow-hidden bg-[#e8e1d6]"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 640px) 74vw, 256px" className="object-cover" /></div><div className="mt-4 flex items-start justify-between gap-3"><h3 className="text-sm font-medium">{catalog[id].name}</h3><span className="shrink-0 text-sm">{formatPrice(catalog[id].price)}</span></div><Link href={`/products/${id}`} className="mt-4 block border border-[var(--green)] px-4 py-3 text-center text-sm">{landing.collection.discover}</Link></article>)}
          </Carousel>
        </div>
      </section>
      <footer className="bg-[var(--foreground)] px-6 py-12 text-[#f7f3eb] md:px-16">
        <div className="text-center">
          <span className="wordmark block translate-x-[0.02em] text-[var(--green)] text-base font-medium" style={{ letterSpacing: ".08em" }}>{landing.masthead.brand}</span>
          <p className="wordmark-descriptor text-[9px] uppercase tracking-[.16em]">{landing.footer.descriptor}</p>
        </div>
        <nav className="mt-7 grid gap-3 text-sm sm:grid-cols-3">
          <Link href="/a-propos">Notre histoire</Link>
          <Link href="/collections/essentiels-de-nuit">Collections</Link>
          <Link href="/contact">Nous contacter</Link>
        </nav>
      </footer>
      {stickyCtaMounted && (
        <a
          href="#commande-fields"
          aria-hidden={!stickyCtaVisible}
          className={`fixed bottom-0 left-0 right-0 z-30 box-border flex h-[calc(var(--sticky-cta-height)+env(safe-area-inset-bottom))] items-center justify-center whitespace-nowrap bg-[var(--green)] px-6 pb-[env(safe-area-inset-bottom)] text-center text-sm text-white transition-opacity duration-200 ease-out ${stickyCtaVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        >
          {landing.ctas.completeRitual} · {formatPrice(ritual.price)}
        </a>
      )}
      {tapTarget && process.env.NODE_ENV !== "production" && (
        <output className="pointer-events-none fixed left-2 top-2 z-50 max-w-[calc(100vw-1rem)] break-words bg-black/80 px-2 py-1 text-[10px] text-white">
          {tapTarget}
        </output>
      )}
    </main>
  );
}
