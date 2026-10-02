import type { ProductId } from "@/content/catalog";

export const productColors = [
  { id: "champagne", label: "Champagne", swatch: "#cab5a2" },
  { id: "ivory", label: "Ivoire", swatch: "#eee9dc" },
  { id: "black", label: "Noir", swatch: "#191919" },
  { id: "rose", label: "Rose", swatch: "#d8a6a3" },
] as const;

export type ProductColorId = typeof productColors[number]["id"];

export const moroccanCities = [
  "Casablanca", "Rabat", "Salé", "Témara", "Marrakech", "Fès", "Meknès",
  "Tanger", "Tétouan", "Agadir", "Oujda", "Kénitra", "Mohammédia", "El Jadida",
  "Safi", "Béni Mellal", "Khouribga", "Nador", "Taza", "Settat", "Berrechid",
  "Essaouira", "Ouarzazate", "Laâyoune", "Dakhla",
] as const;

export type SimpleProductSlug = "bonnet-solo" | "scrunchies-solo" | "pillowcase-solo" | "heatless-curler-solo";

type SimpleProduct = {
  id: Extract<ProductId, "bonnet-solo" | "scrunchies-solo" | "pillowcase-solo" | "heatless-curler-solo">;
  eyebrow: string;
  sentence: string;
  benefits: readonly string[];
  imageByColor: Record<ProductColorId, string> | null;
  imageAlt: string;
  size?: string;
};

const sameColorImages = (src: string): Record<ProductColorId, string> => ({
  champagne: src,
  ivory: src,
  black: src,
  rose: src,
});

export const simpleProducts: Record<SimpleProductSlug, SimpleProduct> = {
  "bonnet-solo": {
    id: "bonnet-solo",
    eyebrow: "L'essentiel de nuit",
    sentence: "Un bonnet satiné au toucher soyeux pour envelopper vos cheveux pendant la nuit.",
    benefits: ["Finition satinée", "Forme enveloppante", "Quatre coloris"],
    imageByColor: sameColorImages("/images/melssy-bonnet.jpg"),
    imageAlt: "Bonnet satiné MELSSY couleur champagne",
  },
  "scrunchies-solo": {
    id: "scrunchies-solo",
    eyebrow: "L'attache satinée",
    sentence: "Des chouchous satinés pour attacher les cheveux avec douceur.",
    benefits: ["Toucher soyeux", "Finition satinée", "Quatre coloris"],
    imageByColor: sameColorImages("/images/melssy-chouchous.jpg"),
    imageAlt: "Chouchous satinés MELSSY couleur champagne",
  },
  "pillowcase-solo": {
    id: "pillowcase-solo",
    eyebrow: "La douceur au coucher",
    sentence: "Une taie d'oreiller satinée, lisse et douce sur la peau.",
    benefits: ["Format 70 x 50 cm", "Surface satinée", "Quatre coloris"],
    imageByColor: sameColorImages("/images/melssy-pillowcase.png"),
    imageAlt: "Taie d'oreiller satinée MELSSY couleur champagne",
    size: "70 x 50 cm",
  },
  "heatless-curler-solo": {
    id: "heatless-curler-solo",
    eyebrow: "Le geste sans chaleur",
    sentence: "Un boucleur souple pour former les longueurs sans chaleur.",
    benefits: ["Sans chaleur", "Option unique", "Prêt pour le rituel du soir"],
    imageByColor: null,
    imageAlt: "Boucleur sans chaleur MELSSY couleur champagne",
  },
};

export const standaloneOrderIds = new Set<string>([
  "heatless-curler-solo",
  ...Object.values(simpleProducts)
    .filter((product) => product.imageByColor)
    .flatMap((product) => productColors.map((color) => `${product.id}-${color.id}`)),
]);