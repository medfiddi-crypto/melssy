"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type UgcCard = {
  poster: string;
  alt: string;
  name: string;
  quote: string;
  videoSrc?: string;
};

type UgcCarouselProps = {
  cards: readonly UgcCard[];
  onOrder: () => void;
  ctaLabel: string;
};

export function UgcCarousel({ cards, onOrder, ctaLabel }: UgcCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [unmutedCard, setUnmutedCard] = useState<number | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLElement;
          const index = Number(card.dataset.index);
          const video = videoRefs.current[index];
          if (!video) return;
          if (entry.isIntersecting) {
            video.play().catch(() => undefined);
          } else {
            video.pause();
          }
        });
      },
      { root: viewport, threshold: 0.7 },
    );
    const cardsInViewport = Array.from(viewport.querySelectorAll<HTMLElement>("[data-index]"));
    cardsInViewport.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const changeSound = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    const shouldUnmute = unmutedCard !== index;
    videoRefs.current.forEach((item) => {
      if (item) item.muted = true;
    });
    video.muted = !shouldUnmute;
    setUnmutedCard(shouldUnmute ? index : null);
    video.play().catch(() => undefined);
  };

  const move = (direction: number) =>
    viewportRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });

  return (
    <div className="mt-8">
      <div
        ref={viewportRef}
        aria-label="Vidéos clientes"
        className="flex snap-x gap-4 overflow-x-auto pb-3 pr-[22%] [scrollbar-width:none]"
      >
        {cards.map((card, index) => (
          <article
            key={card.poster}
            data-index={index}
            className="w-[72vw] shrink-0 snap-start sm:w-56 lg:w-64"
          >
            <div className="relative aspect-[9/16] overflow-hidden bg-[#e8e1d6]">
              {card.videoSrc ? (
                <video
                  ref={(element) => {
                    videoRefs.current[index] = element;
                  }}
                  poster={card.poster}
                  preload="none"
                  muted
                  playsInline
                  loop
                  className="h-full w-full object-cover"
                >
                  <source src={card.videoSrc} type="video/mp4" />
                </video>
              ) : (
                <Image src={card.poster} alt={card.alt} fill sizes="(max-width: 640px) 72vw, 256px" className="object-cover" />
              )}
              <button
                type="button"
                onClick={() => changeSound(index)}
                aria-label={unmutedCard === index ? `Couper le son de ${card.name}` : `Activer le son de ${card.name}`}
                className="absolute inset-0 grid place-items-center"
              >
                <span aria-hidden className="h-0 w-0 border-y-8 border-l-12 border-y-transparent border-l-white drop-shadow" />
              </button>
            </div>
            <p className="mt-4 text-sm font-medium">{card.name}</p>
            <p className="mt-1 text-sm leading-6 text-black/70">{card.quote}</p>
          </article>
        ))}
      </div>
      <div className="mt-4 hidden justify-end gap-2 md:flex">
        <button aria-label="Précédent" onClick={() => move(-1)} className="border border-[var(--line)] px-4 py-2">←</button>
        <button aria-label="Suivant" onClick={() => move(1)} className="border border-[var(--line)] px-4 py-2">→</button>
      </div>
      <button type="button" onClick={onOrder} className="mt-8 bg-[var(--green)] px-6 py-4 text-white">
        {ctaLabel}
      </button>
    </div>
  );
}
