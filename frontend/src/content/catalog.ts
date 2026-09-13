export const catalog = {
  "beauty-night-ritual": { name: "La Beauty Night Ritual™", price: 449, description: "Le rituel complet pour préserver vos longueurs pendant la nuit.", contents: "2 taies satinées · 1 bonnet satiné · 2 chouchous · boucleur sans chaleur offert" },
  "bonnet-solo": { name: "Bonnet satiné", price: 130, description: "Pour envelopper vos cheveux avec douceur." },
  "pillowcase-solo": { name: "Taie d'oreiller satinée", price: 90, description: "Une surface plus douce pour vos nuits." },
  "heatless-curler-solo": { name: "Boucleur sans chaleur", price: 160, description: "Des boucles souples sans chaleur excessive." },
  "scrunchies-solo": { name: "Chouchous satinés", price: 85, description: "Attacher vos cheveux sans les brusquer." },
  "pillowcase-pair": { name: "Paire de taies d'oreiller satinées", price: 180, description: "Une paire supplémentaire pour votre rituel." },
  "extra-bonnet": { name: "Bonnet satiné", price: 100, description: "Un second bonnet pour alterner." },
} as const;

export type ProductId = keyof typeof catalog;

export const formatPrice = (value: number) => `${value.toLocaleString("fr-MA")} DH`;