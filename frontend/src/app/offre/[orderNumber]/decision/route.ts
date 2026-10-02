export const dynamic = "force-dynamic";

import { productColors } from "@/content/simple-products";
import { getApiTarget } from "@/lib/api-target";

type RouteContext = {
  params: Promise<{ orderNumber: string }>;
};

const colorIds = new Set<string>(productColors.map((option) => option.id));
const tokenPattern = /^[A-Za-z0-9_-]{16,64}$/;

function redirect(path: string) {
  return new Response(null, { status: 303, headers: { location: path } });
}

export async function POST(request: Request, context: RouteContext) {
  const { orderNumber } = await context.params;
  const formData = await request.formData();
  const decision = String(formData.get("decision") ?? "");
  const token = String(formData.get("token") ?? "");
  const thankYouUrl = `/merci/${encodeURIComponent(orderNumber)}`;
  const offerUrl = `/offre/${encodeURIComponent(orderNumber)}?token=${encodeURIComponent(token)}`;

  if (!tokenPattern.test(token) || (decision !== "accept" && decision !== "decline")) {
    return redirect(thankYouUrl);
  }

  const colors = [String(formData.get("color_1") ?? ""), String(formData.get("color_2") ?? "")];
  if (decision === "accept" && !colors.every((color) => colorIds.has(color))) {
    return redirect(`${offerUrl}&offre=indisponible`);
  }

  try {
    const response = await fetch(
      new URL(`/v1/orders/${encodeURIComponent(orderNumber)}/upsell`, getApiTarget()),
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          decision,
          idempotency_key: crypto.randomUUID(),
          token,
          colors: decision === "accept" ? colors : [],
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) throw new Error(`upsell_failed_status_${response.status}`);
    return redirect(thankYouUrl);
  } catch (error) {
    console.error("MELSSY offer decision failed", { orderNumber, decision, error });
    // Declining changes nothing on the order, so the customer still reaches the confirmation.
    return redirect(decision === "decline" ? thankYouUrl : `${offerUrl}&offre=indisponible`);
  }
}