"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ThankYouPage } from "@/components/thank-you-page";

function ThankYouQueryContent() {
  const orderNumber = useSearchParams().get("order") ?? "";
  return <ThankYouPage orderNumber={orderNumber} />;
}

export default function ThankYouQueryPage() {
  return <Suspense fallback={null}><ThankYouQueryContent /></Suspense>;
}