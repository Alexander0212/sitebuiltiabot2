import Image from "next/image";
import Link from "next/link";

import { getPropertyHref } from "@/data/properties";
import { formatUsdSymbol } from "@/lib/format";
import type { Property } from "@/types/property";

type PropertyMatchProps = {
  property: Property;
  tone?: "ink" | "paper";
};

export function PropertyMatch({
  property,
  tone = "ink",
}: PropertyMatchProps) {
  const ink = tone === "ink";

  return (
    <Link
      href={getPropertyHref(property.slug)}
      aria-label={`${property.headline}, ${formatUsdSymbol(property.priceUsd)}`}
      className={
        ink
          ? "group grid grid-cols-[4.25rem_minmax(0,1fr)] gap-3 outline-none focus-visible:ring-2 focus-visible:ring-bronze/60"
          : "group grid grid-cols-[4.25rem_minmax(0,1fr)] gap-3 outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
      }
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-warm">
        <Image
          src={property.image}
          alt=""
          fill
          sizes="68px"
          quality={85}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
      </div>
      <span className="min-w-0">
        <span
          className={
            ink
              ? "block font-serif text-[1.05rem] leading-snug text-paper"
              : "block font-serif text-[1.05rem] leading-snug text-foreground"
          }
        >
          {property.headline}
        </span>
        <span
          className={
            ink
              ? "mt-1 block text-[0.78rem] text-paper/65"
              : "mt-1 block text-[0.78rem] text-ink-soft"
          }
        >
          {formatUsdSymbol(property.priceUsd)}
          <span className="opacity-50"> · </span>
          {property.district}
        </span>
      </span>
    </Link>
  );
}
