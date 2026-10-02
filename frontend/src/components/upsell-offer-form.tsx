"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { landing } from "@/content/landing.fr";
import { productColors } from "@/content/simple-products";
import type { ProductColorId } from "@/content/simple-products";

type UpsellOfferFormProps = {
  orderNumber: string;
  token: string;
  defaultColor: ProductColorId;
  priceLabel: string;
  hasError: boolean;
};

export function UpsellOfferForm({ orderNumber, token, defaultColor, priceLabel, hasError }: UpsellOfferFormProps) {
  const submitted = useRef(false);
  const [pending, setPending] = useState("");

  useEffect(() => {
    const restore = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      submitted.current = false;
      setPending("");
    };
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    if (submitted.current) {
      event.preventDefault();
      return;
    }
    submitted.current = true;
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    setPending(submitter?.getAttribute("value") ?? "accept");
  };

  return (
    <form method="post" action={`/offre/${encodeURIComponent(orderNumber)}/decision`} onSubmit={submit}>
      <input type="hidden" name="token" value={token} />
      {[1, 2].map((position) => (
        <fieldset key={position} className="mt-3 min-w-0">
          <legend className="text-sm font-medium">{landing.upsell.pillowcase} {position}</legend>
          <div className="mt-1.5 grid grid-cols-4 gap-1.5">
            {productColors.map((option) => (
              <label key={option.id} className="block cursor-pointer">
                <input
                  type="radio"
                  name={`color_${position}`}
                  value={option.id}
                  defaultChecked={option.id === defaultColor}
                  className="peer sr-only"
                />
                <span className="flex min-h-11 flex-col items-center justify-center gap-1 border border-[var(--line)] bg-[#faf8f5] px-0.5 py-1.5 text-[10.5px] leading-none tracking-tight peer-checked:border-[var(--green)] peer-checked:bg-white peer-checked:ring-1 peer-checked:ring-[var(--green)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--green)]">
                  <span aria-hidden="true" className="h-4 w-4 rounded-full border border-black/15" style={{ backgroundColor: option.swatch }} />
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {hasError && (
        <p role="alert" className="mt-3 border border-red-800/25 bg-red-50 px-3 py-2 text-sm text-red-900">
          {landing.upsell.unavailable}
        </p>
      )}
      <button
        type="submit"
        name="decision"
        value="accept"
        aria-disabled={pending !== ""}
        className="mt-4 w-full whitespace-nowrap bg-[var(--green)] px-3 py-4 text-[15px] text-white aria-disabled:opacity-70"
      >
        {pending === "accept" ? landing.upsell.adding : `${landing.upsell.accept} · ${priceLabel}`}
      </button>
      <button
        type="submit"
        name="decision"
        value="decline"
        aria-disabled={pending !== ""}
        className="mt-1 flex min-h-11 w-full items-center justify-center text-sm underline underline-offset-4 aria-disabled:opacity-70"
      >
        {landing.upsell.decline}
      </button>
    </form>
  );
}
