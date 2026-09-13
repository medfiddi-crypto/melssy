"use client";

import { useRef } from "react";

type CarouselProps = {
  children: React.ReactNode;
  label: string;
};

export function Carousel({ children, label }: CarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const move = (direction: number) =>
    viewportRef.current?.scrollBy({
      left: direction * 280,
      behavior: "smooth",
    });

  return (
    <div className="relative">
      <div
        ref={viewportRef}
        aria-label={label}
        className="flex snap-x gap-4 overflow-x-auto pb-3 pr-[22%] [scrollbar-width:none]"
      >
        {children}
      </div>
      <div className="mt-4 hidden justify-end gap-2 md:flex">
        <button
          aria-label="Précédent"
          onClick={() => move(-1)}
          className="border border-[var(--line)] px-4"
        >
          ←
        </button>
        <button
          aria-label="Suivant"
          onClick={() => move(1)}
          className="border border-[var(--line)] px-4"
        >
          →
        </button>
      </div>
    </div>
  );
}
