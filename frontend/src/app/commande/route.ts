export const dynamic = "force-dynamic";

import { getApiTarget } from "@/lib/api-target";
import { productColors, standaloneOrderIds } from "@/content/simple-products";

function normalizeMoroccanMobile(value: string) {
  let phone = value.replace(/[\s-]/g, "");
  if (phone.startsWith("00212")) phone = `+212${phone.slice(5)}`;
  else if (phone.startsWith("212")) phone = `+${phone}`;
  else if (phone.startsWith("0")) phone = `+212${phone.slice(1)}`;
  return /^\+212[67]\d{8}$/.test(phone) ? phone : null;
}

function redirect(path: string) {
  return new Response(null, { status: 303, headers: { location: path } });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("full_name") ?? "").trim();
  const phone = normalizeMoroccanMobile(String(formData.get("phone") ?? ""));
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("full_address") ?? "").trim();
  const color = String(formData.get("color") ?? "champagne");
  const requestedProductId = String(formData.get("product_id") ?? "beauty-night-ritual");
  const productId = requestedProductId === "beauty-night-ritual" || standaloneOrderIds.has(requestedProductId)
    ? requestedProductId
    : null;

  if (name.length < 2 || name.length > 120 || !phone || !productId || !city || city.length > 120 || address.length < 8 || address.length > 500 || !productColors.some((option) => option.id === color)) {
    return redirect("/rituel?commande=invalide#commander");
  }

  const items = [{ product_id: productId, quantity: 1 }];

  try {
    const response = await fetch(new URL("/v1/orders", getApiTarget()), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        city,
        full_address: address,
        color,
        idempotency_key: crypto.randomUUID(),
        items,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error(
        `order_failed_status_${response.status}_request_${response.headers.get("x-request-id") ?? "unknown"}`,
      );
    }

    const order = (await response.json()) as { order_number?: unknown };
    if (typeof order.order_number !== "string" || !/^MLS-[A-F0-9]{10}$/.test(order.order_number)) {
      throw new Error("order_response_missing_number");
    }
    const confirmation = await fetch(
      new URL(`/v1/orders/${encodeURIComponent(order.order_number)}/confirmation`, getApiTarget()),
      { cache: "no-store", signal: AbortSignal.timeout(10_000) },
    );
    if (!confirmation.ok) {
      throw new Error(
        `order_confirmation_failed_status_${confirmation.status}_request_${confirmation.headers.get("x-request-id") ?? "unknown"}`,
      );
    }
    const confirmedOrder = (await confirmation.json()) as { order_number?: unknown };
    if (confirmedOrder.order_number !== order.order_number) {
      throw new Error("order_confirmation_mismatch");
    }
    return redirect(`/merci/${encodeURIComponent(order.order_number)}`);
  } catch (error) {
    console.error("MELSSY form checkout failed", { error });
    return redirect("/rituel?commande=indisponible#commander");
  }
}
