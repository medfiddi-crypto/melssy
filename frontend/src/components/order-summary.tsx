import { catalog, formatPrice, type ProductId } from "@/content/catalog";

type OrderSummaryProps = {
  items: ProductId[];
  onToggle: (id: ProductId, checked: boolean) => void;
};

const shipping = { standardFee: 35, freeThreshold: 0 } as const;

export function OrderSummary({ items, onToggle }: OrderSummaryProps) {
  const total = items.reduce((sum, id) => sum + catalog[id].price, 0);
  const hasBundle = items.includes("beauty-night-ritual");
  const shippingFee = hasBundle || total >= shipping.freeThreshold ? 0 : shipping.standardFee;
  const productItems = items.filter((id) => id !== "beauty-night-ritual" && id !== "pillowcase-pair" && id !== "extra-bonnet");

  return <div className="border-y border-[var(--line)] py-4 text-sm"><div><p className="font-medium">{catalog["beauty-night-ritual"].name}</p><p className="mt-1 text-xs text-black/65">{catalog["beauty-night-ritual"].contents}</p><p className="mt-1">{formatPrice(catalog["beauty-night-ritual"].price)}</p></div><label className="mt-4 flex items-start gap-3"><input type="checkbox" checked={items.includes("pillowcase-pair")} onChange={(event) => onToggle("pillowcase-pair", event.target.checked)} /><span>Paire de taies d&apos;oreiller supplémentaire · {formatPrice(catalog["pillowcase-pair"].price)}</span></label><label className="mt-3 flex items-start gap-3"><input type="checkbox" checked={items.includes("extra-bonnet")} onChange={(event) => onToggle("extra-bonnet", event.target.checked)} /><span>Bonnet supplémentaire · {formatPrice(catalog["extra-bonnet"].price)}</span></label>{(items.includes("pillowcase-pair") || items.includes("extra-bonnet")) && <p className="mt-3 text-xs text-black/60">Ajouté au même colis — livraison toujours offerte.</p>}{productItems.map((id) => <p key={id} className="mt-2">Ajouté: {catalog[id].name} · {formatPrice(catalog[id].price)}</p>)}<div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4"><span>Livraison</span>{shippingFee === 0 ? <span><s className="mr-2 text-black/45">{formatPrice(shipping.standardFee)}</s><strong className="text-[var(--rose)]">Offerte</strong></span> : <span>{formatPrice(shippingFee)}</span>}</div><p className="mt-4 border-t border-[var(--line)] pt-4 font-semibold">Total à payer à la livraison · {formatPrice(total + shippingFee)}</p></div>;
}
