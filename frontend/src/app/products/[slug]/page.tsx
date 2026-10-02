import { notFound } from "next/navigation";

import { SimpleProductPage } from "@/components/simple-product-page";
import { simpleProducts } from "@/content/simple-products";
import type { SimpleProductSlug } from "@/content/simple-products";

export function generateStaticParams() {
  return Object.keys(simpleProducts).map((slug) => ({ slug }));
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  if (!(slug in simpleProducts)) notFound();
  return <SimpleProductPage slug={slug as SimpleProductSlug} />;
}
