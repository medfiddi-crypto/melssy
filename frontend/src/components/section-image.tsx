import Image from "next/image";

type SectionImageProps = {
  src: string;
  alt: string;
  sizes: string;
};

export function SectionImage({ src, alt, sizes }: SectionImageProps) {
  return (
    <div className="section-image">
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
