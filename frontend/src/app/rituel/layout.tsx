import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Le coffret Beauty Night Ritual · MELSSY",
  description: "Coffret satin demi-soie : 2 taies, 1 bonnet, 2 chouchous et un boucleur sans chaleur offert. Paiement à la livraison partout au Maroc.",
  openGraph: {
    title: "Le coffret Beauty Night Ritual · MELSSY",
    description: "Coffret satin demi-soie : 2 taies, 1 bonnet, 2 chouchous et un boucleur sans chaleur offert. Paiement à la livraison partout au Maroc.",
    type: "website",
    url: "https://melssy.beauty/rituel",
    locale: "fr_MA",
    siteName: "MELSSY",
    images: [
      {
        url: "https://melssy.beauty/images/og-image-rituel.webp",
        width: 1200,
        height: 630,
        alt: "Coffret MELSSY",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RituelLayout({ children }: { children: ReactNode }) {
  return children;
}
