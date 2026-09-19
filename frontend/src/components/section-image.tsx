import Image from "next/image";
import type { CSSProperties } from "react";

type SectionImageProps = {
  src: string;
  alt: string;
  sizes: string;
  ratio?: string;
};

export function SectionImage({ src, alt, sizes, ratio }: SectionImageProps) {
  return (
    <div
      className="section-image"
      style={ratio ? ({ "--section-image-ratio": ratio } as CSSProperties) : undefined}
    >
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
