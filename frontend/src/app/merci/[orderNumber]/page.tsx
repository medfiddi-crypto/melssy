"use client";

import { use } from "react";

import { ThankYouPage } from "@/components/thank-you-page";

export default function LegacyThankYouPage({ params }: PageProps<"/merci/[orderNumber]">) {
  const { orderNumber } = use(params);
  return <ThankYouPage orderNumber={orderNumber} />;
}