"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { PropertyGalleryItem } from "@/types/property";

type PropertyGalleryProps = {
  items: PropertyGalleryItem[];
};

export function PropertyGallery({ items }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];

  if (!current) {
    return null;
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden bg-warm md:aspect-[16/10]">
        <Image
          src={current.src}
          alt={current.alt}
          fill
          priority
          sizes="(min-width: 1024px) 70vw, 100vw"
          quality={90}
          className="hero-photo object-cover"
        />
        <span className="absolute bottom-4 left-4 bg-paper/92 px-3 py-1.5 text-[0.72rem] tracking-[0.16em] text-ink uppercase">
          {current.caption}
        </span>
      </div>
      <ul className="mt-2 grid grid-cols-4 gap-2 md:grid-cols-7">
        {items.map((item, index) => (
          <li key={`${item.src}-${item.caption}`}>
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${item.caption}: ${item.alt}`}
              aria-pressed={index === active}
              className={cn(
                "relative aspect-[4/3] w-full overflow-hidden bg-warm outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                index === active
                  ? "ring-1 ring-foreground"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={item.src}
                alt=""
                fill
                sizes="12vw"
                quality={85}
                className="object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
