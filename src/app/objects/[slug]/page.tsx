import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { FloorPlan } from "@/components/property/floor-plan";
import { PropertyGallery } from "@/components/property/property-gallery";
import { Button } from "@/components/ui/button";
import {
  getPropertyBySlug,
  getPropertyHref,
  getRelatedProperties,
  properties,
} from "@/data/properties";
import { processLine } from "@/data/process";
import { formatArea, formatBedrooms, formatUsdSymbol } from "@/lib/format";
import { site } from "@/lib/site";

type ObjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: ObjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    return { title: "Об'єкт не знайдено" };
  }

  const title = `${property.headline}. ${property.title}`;

  return {
    title: property.headline,
    description: property.why,
    alternates: {
      canonical: getPropertyHref(property.slug),
    },
    openGraph: {
      title,
      description: property.why,
      url: `${site.url}${getPropertyHref(property.slug)}`,
      images: [
        {
          url: property.image,
          alt: property.imageAlt,
        },
      ],
    },
  };
}

export default async function ObjectPage({ params }: ObjectPageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const related = getRelatedProperties(property.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": property.kind === "house" ? "House" : "Apartment",
    name: property.headline,
    description: property.why,
    url: `${site.url}${getPropertyHref(property.slug)}`,
    image: `${site.url}${property.image}`,
    numberOfRooms: property.bedrooms + 1,
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.areaM2,
      unitCode: "MTK",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city,
      addressRegion: property.district,
      addressCountry: "UA",
    },
    offers: {
      "@type": "Offer",
      price: property.priceUsd,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <article className="pb-10 md:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="pt-8 md:pt-12">
        <nav className="text-[0.78rem] tracking-[0.08em] text-ink-soft">
          <Link href="/" className="hover:text-foreground">
            Головна
          </Link>
          <span className="mx-2 text-warm">/</span>
          <Link href="/objects" className="hover:text-foreground">
            Об'єкти
          </Link>
          <span className="mx-2 text-warm">/</span>
          <span className="text-foreground">{property.headline}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:mt-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-7">
            <PropertyGallery items={property.gallery} />
          </div>

          <div className="lg:sticky lg:top-24 lg:col-span-5">
            <p className="text-eyebrow text-bronze-ink">{property.badge}</p>
            <h1 className="mt-3 font-serif text-[2rem] leading-[1.12] tracking-[-0.03em] md:text-[2.6rem]">
              {property.headline}
            </h1>
            <p className="mt-2 text-sm tracking-[0.08em] text-ink-soft uppercase">
              {property.title}
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              {property.district}, {property.city}
            </p>
            <p className="mt-5 font-serif text-[2.4rem] leading-none tracking-tight">
              {formatUsdSymbol(property.priceUsd)}
            </p>
            <p className="mt-3 text-sm text-ink-soft">
              {formatBedrooms(property.bedrooms)}
              <span className="text-warm"> · </span>
              {formatArea(property.areaM2)}
              <span className="text-warm"> · </span>
              {property.kind === "house" ? property.floor : `поверх ${property.floor}`}
            </p>

            <p className="mt-6 text-[1.05rem] leading-relaxed">{property.forWhom}</p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
              {property.why}
            </p>

            <Button asChild variant="brand" size="cta" className="mt-7 w-full sm:w-auto">
              <Link href="/#contact">Записати перегляд</Link>
            </Button>
            <p className="mt-3 text-sm text-muted-foreground">{processLine}</p>
          </div>
        </div>

        <div className="mt-12 grid gap-10 border-t border-warm pt-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <p className="text-eyebrow">Чому ця адреса</p>
            <p className="mt-4 max-w-2xl font-serif text-[1.45rem] leading-snug md:text-[1.7rem]">
              {property.story}
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <dt className="text-[0.72rem] tracking-[0.14em] text-ink-soft uppercase">
                  Район
                </dt>
                <dd className="mt-1 font-serif text-xl">{property.district}</dd>
              </div>
              <div>
                <dt className="text-[0.72rem] tracking-[0.14em] text-ink-soft uppercase">
                  {property.kind === "house" ? "Рівні" : "Поверх"}
                </dt>
                <dd className="mt-1 font-serif text-xl">{property.floor}</dd>
              </div>
              <div>
                <dt className="text-[0.72rem] tracking-[0.14em] text-ink-soft uppercase">
                  Рік
                </dt>
                <dd className="mt-1 font-serif text-xl">{property.year}</dd>
              </div>
              <div>
                <dt className="text-[0.72rem] tracking-[0.14em] text-ink-soft uppercase">
                  Площа
                </dt>
                <dd className="mt-1 font-serif text-xl">
                  {formatArea(property.areaM2)}
                </dd>
              </div>
            </dl>
          </div>
          <div className="lg:col-span-5">
            <p className="text-eyebrow">План</p>
            <FloorPlan plan={property.plan} className="mt-4" />
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-12 border-t border-warm pt-10">
            <p className="text-eyebrow">Ще з добірки</p>
            <h2 className="mt-3 font-serif text-[1.7rem]">Інші адреси поруч за бюджетом</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={getPropertyHref(item.slug)}
                    aria-label={`${item.headline}, ${item.title}`}
                    className="group grid grid-cols-[7rem_minmax(0,1fr)] overflow-hidden bg-canvas outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 md:grid-cols-[9rem_minmax(0,1fr)]"
                  >
                    <div className="relative min-h-[6.5rem]">
                      <Image
                        src={item.image}
                        alt={item.imageAlt}
                        fill
                        sizes="144px"
                        quality={90}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="flex flex-col justify-center px-4 py-3">
                      <p className="font-serif text-[1.2rem] leading-snug">
                        {item.headline}
                      </p>
                      <p className="mt-1 text-[0.72rem] tracking-[0.1em] text-ink-soft uppercase">
                        {item.title}
                      </p>
                      <p className="mt-2 font-serif text-xl">
                        {formatUsdSymbol(item.priceUsd)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </article>
  );
}
