import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { SnapSlider } from "@/components/ui/snap-slider";
import { getFeaturedProperties, properties } from "@/data/properties";

export function PropertyGrid() {
  const featured = getFeaturedProperties(6);

  return (
    <Section id="objects" className="overflow-x-clip max-md:min-h-[100svh] max-md:py-8">
      <Container className="min-w-0">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading
            index="02"
            eyebrow="Об'єкти"
            title="Шість характерів на старті."
            description={`З ${properties.length} адрес у добірці — короткий зріз. Повний каталог із фільтрами відкривається окремо.`}
            className="max-w-xl"
          />
          <Button
            asChild
            variant="brandOutline"
            size="cta"
            className="hidden shrink-0 lg:inline-flex"
          >
            <Link href="/objects">Усі {properties.length} об'єктів</Link>
          </Button>
        </div>

        <SnapSlider
          ariaLabel="Добірка об'єктів"
          className="mt-6 md:mt-8"
          revealStagger
        >
          {featured.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </SnapSlider>

        <div className="mt-4 flex flex-col gap-3 lg:hidden" data-reveal>
          <Button asChild variant="brand" size="cta" className="w-full">
            <Link href="/objects">Усі {properties.length} об'єктів</Link>
          </Button>
          <Button asChild variant="brandOutline" size="cta" className="w-full">
            <Link href="/#contact">Записатись на підбір</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
