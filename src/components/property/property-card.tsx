import Image from "next/image";
import Link from "next/link";

import { getPropertyHref } from "@/data/properties";
import { formatArea, formatBedrooms, formatUsdSymbol } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Property } from "@/types/property";

type PropertyCardProps = {
  property: Property;
  layout?: "slide" | "grid";
};

export function PropertyCard({
  property,
  layout = "slide",
}: PropertyCardProps) {
  const isGrid = layout === "grid";

  return (
    <article
      className={cn("property-card min-w-0", isGrid && "h-full")}
      data-slide={isGrid ? undefined : true}
      data-reveal-item={isGrid ? undefined : true}
    >
      <Link
        href={getPropertyHref(property.slug)}
        className="group property-card-link block h-full min-w-0 outline-none"
        aria-label={`${property.headline}, ${property.title}. Відкрити об'єкт`}
      >
        <div
          className={cn(
            "relative overflow-hidden bg-warm",
            isGrid
              ? "aspect-[4/5] min-h-[22rem] md:min-h-[24rem]"
              : "h-[52svh] md:h-[28rem] lg:h-[32rem]",
          )}
        >
          <Image
            src={property.image}
            alt={property.imageAlt}
            fill
            sizes={
              isGrid
                ? "(min-width: 1280px) 30vw, (min-width: 640px) 46vw, 92vw"
                : "(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 86vw"
            }
            quality={85}
            data-parallax={isGrid ? undefined : "10"}
            className="property-card-image hero-photo object-cover object-center will-change-transform"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgb(17_17_17/0.78)_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none property-card-veil absolute inset-0"
          />
          <span className="absolute top-4 left-4 z-10 bg-paper/92 px-3 py-1.5 text-[0.72rem] tracking-[0.16em] text-ink uppercase">
            {property.badge}
          </span>
          <p className="property-card-cta-overlay absolute top-4 right-4 z-10 text-[0.72rem] tracking-[0.16em] text-paper uppercase">
            Дивитись
          </p>
          <div className="absolute inset-x-0 bottom-0 z-10 p-5">
            <p className="text-[0.68rem] tracking-[0.14em] text-paper/65 uppercase">
              {property.kind === "house" ? "Будинок" : "Квартира"}
              <span className="text-paper/35"> · </span>
              {property.district}
            </p>
            <h3 className="mt-1 font-serif text-[1.35rem] leading-[1.12] text-paper md:text-[1.55rem]">
              {property.headline}
            </h3>
            <p className="mt-1 text-[0.72rem] tracking-[0.12em] text-paper/70 uppercase">
              {property.title}
            </p>
            <p className="mt-2 text-[0.78rem] text-paper/80">
              {formatBedrooms(property.bedrooms)}
              <span className="text-paper/40"> · </span>
              {formatArea(property.areaM2)}
            </p>
            <p className="mt-3 font-serif text-[1.7rem] leading-none tracking-tight text-paper md:text-[1.85rem]">
              {formatUsdSymbol(property.priceUsd)}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
