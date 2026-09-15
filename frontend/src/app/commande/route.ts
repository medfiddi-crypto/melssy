export const dynamic = "force-dynamic";

import { getApiTarget } from "@/lib/api-target";

const apiTarget = getApiTarget();

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

  if (name.length < 2 || !phone) {
    return redirect("/rituel?commande=invalide");
  }

  try {
    const response = await fetch(new URL("/v1/orders", apiTarget), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        idempotency_key: crypto.randomUUID(),
        items: [{ product_id: "beauty-night-ritual", quantity: 1 }],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`order_failed_status_${response.status}`);

    const order = (await response.json()) as { order_number: string; offer: unknown };
    const destination = order.offer ? "/offre/" : "/merci/";
    return redirect(`${destination}${encodeURIComponent(order.order_number)}`);
  } catch (error) {
    console.error("MELSSY form checkout failed", { error });
    return redirect("/rituel?commande=indisponible");
  }
}