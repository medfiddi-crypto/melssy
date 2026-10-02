"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { useState } from "react";

import { CodOrderForm } from "@/components/cod-order-form";
import { catalog, formatPrice } from "@/content/catalog";
import { landing } from "@/content/landing.fr";
import { productColors, simpleProducts } from "@/content/simple-products";
import type { ProductColorId, SimpleProductSlug } from "@/content/simple-products";
import { optionalStorefront } from "@/content/storefront";

export function SimpleProductPage({ slug }: { slug: SimpleProductSlug }) {
  const product = simpleProducts[slug];
  const entry = catalog[product.id];
  const [color, setColor] = useState<ProductColorId>("champagne");
  const hasColors = product.imageByColor !== null;
  const image = product.imageByColor?.[color] ?? "/images/melssy-curlers.jpg";
  const selectedColor = productColors.find((option) => option.id === color)!;
  const orderProductId = hasColors ? `${product.id}-${color}` : product.id;
  const optionLabel = [hasColors ? `Couleur : ${selectedColor.label}` : null, product.size ? `Format : ${product.size}` : null]
    .filter(Boolean)
    .join(" · ");
  const confirmationWindow = optionalStorefront.confirmationWindow();

  return (
    <main className="min-h-screen">
      <header className="flex h-16 items-center justify-between border-b border-[var(--line)] bg-[var(--background)] px-5 md:px-16">
        <Link href="/collections/essentiels-de-nuit" className="text-sm underline underline-offset-4">
          Collection
        </Link>
        <Link href="/rituel" className="wordmark text-lg">MELSSY</Link>
        <span className="text-sm">{formatPrice(entry.price)}</span>
      </header>
      <section className="grid md:min-h-[calc(100vh-4rem)] md:grid-cols-[1.05fr_.95fr]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e1d6] md:sticky md:top-0 md:aspect-auto md:h-[calc(100vh-4rem)]">
          <Image
            src={image}
            alt={product.imageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 53vw"
            className="object-cover"
          />
        </div>
        <div className="px-5 py-8 sm:px-8 md:px-12 md:py-14 lg:px-16">
          <div className="mx-auto max-w-lg">
            <p className="eyebrow text-[var(--rose)]">{product.eyebrow}</p>
            <div className="mt-3 flex items-start justify-between gap-5">
              <h1 className="display text-4xl leading-none md:text-5xl">{entry.name}</h1>
              <p className="display shrink-0 text-2xl">{formatPrice(entry.price)}</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-black/70">{product.sentence}</p>
            <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-3">
              {product.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <Check size={15} className="mt-0.5 shrink-0 text-[var(--green)]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            {hasColors && (
              <fieldset className="mt-7 border-t border-[var(--line)] pt-5">
                <legend className="text-sm font-medium">Couleur : {selectedColor.label}</legend>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {productColors.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setColor(option.id)}
                      aria-label={option.label}
                      aria-pressed={color === option.id}
                      title={option.label}
                      className={`flex min-h-11 items-center gap-2 border px-3 py-2 text-sm ${color === option.id ? "border-[var(--green)]" : "border-[var(--line)]"}`}
                    >
                      <span aria-hidden="true" className="h-5 w-5 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: option.swatch }} />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
                {color !== "champagne" && <p className="mt-2 text-xs leading-5 text-black/60">Les photos montrent la couleur champagne.</p>}
              </fieldset>
            )}
            {!hasColors && (
              <p className="mt-7 border-t border-[var(--line)] pt-5 text-sm font-medium">Couleur : Champagne</p>
            )}
            <div className="mt-7">
              <CodOrderForm
                items={[{ product_id: orderProductId, quantity: 1 }]}
                total={entry.price}
                productLabel={entry.name}
                optionLabel={optionLabel || undefined}
                color={color}
              />
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-[var(--line)] bg-[#eadbd1]/40 px-6 py-4 text-center text-xs sm:text-sm">
        {confirmationWindow ? `${landing.trust.confirm} (${confirmationWindow})` : landing.trust.confirm}
      </section>
    </main>
  );
}