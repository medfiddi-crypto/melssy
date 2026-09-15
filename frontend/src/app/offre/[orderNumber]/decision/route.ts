export const dynamic = "force-dynamic";

import { getApiTarget } from "@/lib/api-target";

type RouteContext = {
  params: Promise<{ orderNumber: string }>;
};

function redirect(path: string) {
  return new Response(null, { status: 303, headers: { location: path } });
}

export async function POST(request: Request, context: RouteContext) {
  const { orderNumber } = await context.params;
  const formData = await request.formData();
  const decision = String(formData.get("decision") ?? "");
  const thankYouUrl = `/merci/${encodeURIComponent(orderNumber)}`;

  if (decision === "decline") {
    return redirect(thankYouUrl);
  }

  if (decision !== "accept") {
    return redirect(thankYouUrl);
  }

  try {
    const response = await fetch(
      new URL(`/v1/orders/${encodeURIComponent(orderNumber)}/upsell`, getApiTarget()),
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision, idempotency_key: crypto.randomUUID() }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) throw new Error(`upsell_failed_status_${response.status}`);
    return redirect(thankYouUrl);
  } catch (error) {
    console.error("MELSSY offer decision failed", { orderNumber, decision, error });
    return redirect(`/offre/${encodeURIComponent(orderNumber)}?offre=indisponible`);
  }
}