import { redirect } from "next/navigation";

export default async function OfferPage({
  params,
}: Pick<PageProps<"/offre/[orderNumber]">, "params">) {
  const { orderNumber } = await params;
  redirect(`/merci/${encodeURIComponent(orderNumber)}`);
}