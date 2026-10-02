export const catalog = {
  "beauty-night-ritual": { name: "La Beauty Night Ritual™", price: 449, description: "Le rituel complet pour préserver vos longueurs pendant la nuit.", contents: "2 taies satinées · 1 bonnet satiné · 2 chouchous · boucleur sans chaleur offert" },
  "bonnet-solo": { name: "Bonnet satiné", price: 120, description: "Pour envelopper vos cheveux avec douceur." },
  "pillowcase-solo": { name: "Taie d'oreiller satinée", price: 150, description: "Une surface plus douce pour vos nuits." },
  "heatless-curler-solo": { name: "Boucleur sans chaleur", price: 160, description: "Des boucles souples sans chaleur excessive." },
  "scrunchies-solo": { name: "Chouchous satinés", price: 60, description: "Attacher vos cheveux sans les brusquer." },
} as const;

export type ProductId = keyof typeof catalog;

export const formatPrice = (value: number) => `${value.toLocaleString("fr-MA")} DH`;