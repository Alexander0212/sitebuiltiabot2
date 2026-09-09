import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { SnapSlider } from "@/components/ui/snap-slider";
import { properties } from "@/data/properties";

export function PropertyGrid() {
  return (
    <Section id="objects" className="overflow-x-clip max-md:min-h-[100svh] max-md:py-8">
      <Container className="min-w-0">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading
            index="02"
            eyebrow="Об'єкти"
            title="Шість характерів Києва."
            description="Не вітрина на сотні лотів. Кожна адреса має свій ритм міста."
            className="max-w-xl"
          />
          <Button
            asChild
            variant="brandOutline"
            size="cta"
            className="hidden shrink-0 lg:inline-flex"
          >
            <Link href="/#contact">Записатись на підбір</Link>
          </Button>
        </div>

        <SnapSlider
          ariaLabel="Добірка об'єктів"
          className="mt-6 md:mt-8"
          revealStagger
        >
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </SnapSlider>

        <Button asChild variant="brandOutline" size="cta" className="mt-4 w-full lg:hidden" data-reveal>
          <Link href="/#contact">Записатись на підбір</Link>
        </Button>
      </Container>
    </Section>
  );
}
