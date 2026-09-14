import { ThankYouPage } from "@/components/thank-you-page";
import type { ConfirmedOrder } from "@/components/thank-you-page";

const apiTarget = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:8000";

export default async function LegacyThankYouPage({ params }: PageProps<"/merci/[orderNumber]">) {
  const { orderNumber } = await params;
  let initialOrder: ConfirmedOrder | null = null;

  try {
    const response = await fetch(
      new URL(`/v1/orders/${encodeURIComponent(orderNumber)}/confirmation`, apiTarget),
      { cache: "no-store", signal: AbortSignal.timeout(10_000) },
    );
    if (response.ok) initialOrder = await response.json();
  } catch (error) {
    console.error("MELSSY confirmation page load failed", { orderNumber, error });
  }

  return <ThankYouPage orderNumber={orderNumber} initialOrder={initialOrder} />;
}