"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { formatPrice } from "@/content/catalog";
import { landing } from "@/content/landing.fr";
import { moroccanCities, productColors } from "@/content/simple-products";
import type { ProductColorId } from "@/content/simple-products";
import { emitCommerceEvent, safeUUID } from "@/lib/analytics";

export type OrderLine = {
  product_id: string;
  quantity: number;
};

type CodOrderFormProps = {
  items: OrderLine[];
  total: number;
  productLabel: string;
  optionLabel?: string;
  color?: ProductColorId;
  showColorSelector?: boolean;
  formRef?: (form: HTMLFormElement | null) => void;
  showSummary?: boolean;
  children?: ReactNode;
};

const normalizeMoroccanMobile = (value: string) => {
  let phone = value.replace(/[\s-]/g, "");
  if (phone.startsWith("00212")) phone = `+212${phone.slice(5)}`;
  else if (phone.startsWith("212")) phone = `+${phone}`;
  else if (phone.startsWith("0")) phone = `+212${phone.slice(1)}`;
  return /^\+212[67]\d{8}$/.test(phone) ? phone : null;
};

const orderErrorMessage = async (response: Response) => {
  try {
    const payload = await response.json() as { detail?: unknown };
    if (typeof payload.detail === "string") return payload.detail;
  } catch {
    // Use the status-based message when the server did not return JSON.
  }
  return response.status === 422 ? landing.order.validationError : landing.order.error;
};

const readConfirmedOrderNumber = async (response: Response) => {
  const payload = await response.json() as { order_number?: unknown };
  return typeof payload.order_number === "string" && /^MLS-[A-F0-9]{10}$/.test(payload.order_number)
    ? payload.order_number
    : null;
};

const readOrderResponse = async (response: Response) => {
  const payload = await response.json() as { order_number?: unknown; upsell_token?: unknown };
  const orderNumber = typeof payload.order_number === "string" && /^MLS-[A-F0-9]{10}$/.test(payload.order_number)
    ? payload.order_number
    : null;
  const upsellToken = typeof payload.upsell_token === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(payload.upsell_token)
    ? payload.upsell_token
    : null;
  return { orderNumber, upsellToken };
};

export function CodOrderForm({
  items,
  total,
  productLabel,
  optionLabel,
  color,
  showColorSelector = false,
  formRef,
  showSummary = true,
  children,
}: CodOrderFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [selectedColor, setSelectedColor] = useState<ProductColorId>("champagne");
  const orderColor = color ?? selectedColor;
  const [idempotencyKey] = useState(safeUUID);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ name: false, phone: false, city: false, address: false });

  useEffect(() => {
    const checkoutStatus = new URLSearchParams(window.location.search).get("commande");
    const message = checkoutStatus === "invalide"
      ? landing.order.validationError
      : checkoutStatus === "indisponible"
        ? landing.order.error
        : "";
    if (!message) return;
    const timeout = window.setTimeout(() => setError(message), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const order = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ name: true, phone: true, city: true, address: true });
    const normalizedPhone = normalizeMoroccanMobile(phone);
    if (name.trim().length < 2 || !normalizedPhone || !city.trim() || address.trim().length < 8 || submitting) return;
    setSubmitting(true);
    setError("");
    let timeout: number | undefined;
    try {
      const orderUrl = "/api/v1/orders";
      const attribution = new URLSearchParams(window.location.search);
      const controller = new AbortController();
      timeout = window.setTimeout(() => controller.abort(), 10_000);
      const response = await fetch(orderUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name: name.trim(),
          phone: normalizedPhone,
          city: city.trim(),
          full_address: address.trim(),
          color: orderColor,
          idempotency_key: idempotencyKey,
          items,
          attribution: {
            utm_source: attribution.get("utm_source"),
            utm_campaign: attribution.get("utm_campaign"),
            fbclid: attribution.get("fbclid"),
            ttclid: attribution.get("ttclid"),
          },
        }),
      });
      if (!response.ok) {
        console.error("MELSSY order rejected", {
          status: response.status,
          requestId: response.headers.get("x-request-id"),
        });
        setError(await orderErrorMessage(response));
        setSubmitting(false);
        return;
      }
      const { orderNumber, upsellToken } = await readOrderResponse(response);
      if (!orderNumber) {
        setError(landing.order.confirmationError);
        setSubmitting(false);
        return;
      }
      const confirmationResponse = await fetch(
        `/api/v1/orders/${encodeURIComponent(orderNumber)}/confirmation`,
        { cache: "no-store", signal: controller.signal },
      );
      const confirmedOrderNumber = confirmationResponse.ok
        ? await readConfirmedOrderNumber(confirmationResponse)
        : null;
      if (confirmedOrderNumber !== orderNumber) {
        console.error("MELSSY order confirmation failed", {
          orderNumber,
          status: confirmationResponse.status,
          requestId: confirmationResponse.headers.get("x-request-id"),
        });
        setError(landing.order.confirmationError);
        setSubmitting(false);
        return;
      }
      console.info("MELSSY order saved", { orderUrl, orderNumber });
      void emitCommerceEvent("Purchase", items.map((item) => item.product_id), total);
      if (upsellToken) {
        // replace() drops the filled form from history so Back cannot resubmit it.
        location.replace(`/offre/${encodeURIComponent(orderNumber)}?token=${encodeURIComponent(upsellToken)}`);
        return;
      }
      const destination = `/merci/${encodeURIComponent(orderNumber)}`;
      console.info("MELSSY navigating after order", { destination });
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      location.href = destination;
    } catch (caughtError) {
      console.error("MELSSY order submission failed", { url: "/api/v1/orders", error: caughtError });
      setError(
        caughtError instanceof DOMException && caughtError.name === "AbortError"
          ? landing.order.timeoutError
          : landing.order.networkError,
      );
      setSubmitting(false);
    } finally {
      if (timeout !== undefined) window.clearTimeout(timeout);
    }
  };

  return (
    <form
      ref={formRef}
      data-order-form
      action="/commande"
      method="post"
      noValidate
      onSubmit={order}
      className="grid gap-4 text-left"
    >
      {items.map((item) => (
        <input key={item.product_id} type="hidden" name="product_id" value={item.product_id} />
      ))}
      {!showColorSelector && <input type="hidden" name="color" value={orderColor} />}
      {showSummary && (
        <div className="border-y border-[var(--line)] py-4 text-sm">
          <div className="flex items-start justify-between gap-4">
            <span>{productLabel}</span>
            <span className="shrink-0 font-medium">{formatPrice(total)}</span>
          </div>
          {optionLabel && <p className="mt-1 text-xs text-black/55">{optionLabel}</p>}
        </div>
      )}
      {showColorSelector && (
        <fieldset className="min-w-0 text-left">
          <legend className="text-sm font-medium">Couleur</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {productColors.map((option) => (
              <label key={option.id} className={`flex min-h-11 cursor-pointer items-center gap-2 border px-3 py-2 text-sm ${orderColor === option.id ? "border-[var(--green)] bg-white" : "border-[var(--line)]"}`}>
                <input type="radio" name="color" value={option.id} checked={orderColor === option.id} onChange={() => setSelectedColor(option.id)} className="peer sr-only" />
                <span aria-hidden="true" className="h-5 w-5 shrink-0 rounded-full border border-black/15 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--green)] peer-focus-visible:ring-offset-2" style={{ backgroundColor: option.swatch }} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-black/60">Même couleur pour les 2 taies, le bonnet et les 2 chouchous.</p>
          <p className="text-xs leading-5 text-black/60">Boucleur offert : champagne.</p>
          {orderColor !== "champagne" && <p className="mt-1 text-xs leading-5 text-black/60">Les photos montrent la couleur champagne.</p>}
        </fieldset>
      )}
      <label className="text-sm font-medium">
        {landing.order.nameLabel}
        <input
          name="full_name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onFocus={() => setTouched((fields) => ({ ...fields, name: true }))}
          onBlur={() => setTouched((fields) => ({ ...fields, name: true }))}
          autoComplete="name"
          maxLength={120}
          aria-invalid={touched.name && name.trim().length < 2}
          className="mt-2 w-full border border-[#b9a497] bg-[#faf8f5] px-4 py-3 outline-none focus:border-[var(--rose)] focus:ring-1 focus:ring-[var(--rose)]"
          required
        />
        {touched.name && name.trim().length < 2 && (
          <span className="mt-2 block text-sm text-red-800">{landing.order.nameError}</span>
        )}
      </label>
      <label className="text-sm font-medium">
        {landing.order.phoneLabel}
        <input
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
          className="mt-2 w-full border border-[#b9a497] bg-[#faf8f5] px-4 py-3 outline-none focus:border-[var(--rose)] focus:ring-1 focus:ring-[var(--rose)]"
          required
        />
        {touched.phone && !normalizeMoroccanMobile(phone) && (
          <span className="mt-2 block text-sm text-red-800">{landing.order.phoneError}</span>
        )}
      </label>
      <label className="text-sm font-medium">
        {landing.order.cityLabel}
        <input
          name="city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          onBlur={() => setTouched((fields) => ({ ...fields, city: true }))}
          autoComplete="address-level2"
          list="moroccan-cities"
          maxLength={120}
          aria-invalid={touched.city && !city.trim()}
          className="mt-2 w-full border border-[#b9a497] bg-[#faf8f5] px-4 py-3 outline-none focus:border-[var(--rose)] focus:ring-1 focus:ring-[var(--rose)]"
          required
        />
        <datalist id="moroccan-cities">{moroccanCities.map((suggestion) => <option key={suggestion} value={suggestion} />)}</datalist>
        {touched.city && !city.trim() && <span className="mt-2 block text-sm text-red-800">{landing.order.cityError}</span>}
      </label>
      <label className="text-sm font-medium">
        {landing.order.addressLabel}
        <input
          name="full_address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          onBlur={() => setTouched((fields) => ({ ...fields, address: true }))}
          autoComplete="street-address"
          placeholder={landing.order.addressPlaceholder}
          minLength={8}
          maxLength={500}
          aria-invalid={touched.address && address.trim().length < 8}
          className="mt-2 w-full border border-[#b9a497] bg-[#faf8f5] px-4 py-3 outline-none focus:border-[var(--rose)] focus:ring-1 focus:ring-[var(--rose)]"
          required
        />
        {touched.address && address.trim().length < 8 && <span className="mt-2 block text-sm text-red-800">{landing.order.addressError}</span>}
      </label>
      {error && (
        <p role="alert" aria-live="assertive" className="border border-red-800/25 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      )}
      {children}
      <p className="text-center text-sm leading-6 text-black/65">{landing.order.reassurance}</p>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[var(--green)] px-6 py-4 text-white disabled:bg-[#9aa79f] disabled:opacity-100"
      >
        {submitting ? landing.order.submitting : `Confirmer ma commande · ${formatPrice(total)}`}
      </button>
    </form>
  );
}