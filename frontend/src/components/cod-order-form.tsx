"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { formatPrice } from "@/content/catalog";
import { landing } from "@/content/landing.fr";
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

export function CodOrderForm({
  items,
  total,
  productLabel,
  optionLabel,
  formRef,
  showSummary = true,
  children,
}: CodOrderFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [idempotencyKey] = useState(safeUUID);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ name: false, phone: false });

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
    setTouched({ name: true, phone: true });
    const normalizedPhone = normalizeMoroccanMobile(phone);
    if (name.trim().length < 2 || !normalizedPhone || submitting) return;
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
      const orderNumber = await readConfirmedOrderNumber(response);
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
      className="grid gap-4"
    >
      {items.map((item) => (
        <input key={item.product_id} type="hidden" name="product_id" value={item.product_id} />
      ))}
      {showSummary && (
        <div className="border-y border-[var(--line)] py-4 text-sm">
          <div className="flex items-start justify-between gap-4">
            <span>{productLabel}</span>
            <span className="shrink-0 font-medium">{formatPrice(total)}</span>
          </div>
          {optionLabel && <p className="mt-1 text-xs text-black/55">{optionLabel}</p>}
        </div>
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