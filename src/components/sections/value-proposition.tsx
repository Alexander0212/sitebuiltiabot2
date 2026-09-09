"use client";

import Image from "next/image";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { SnapSlider } from "@/components/ui/snap-slider";
import { approachPoints } from "@/data/approach";

export function ValueProposition() {
  return (
    <Section id="approach" className="overflow-x-clip max-md:min-h-[100svh] max-md:py-8">
      <Container className="min-w-0">
        <SectionHeading
          index="03"
          eyebrow="Підхід"
          title="Спочатку розуміємо. Потім показуємо."
          description="Три рішення до перегляду: цифра, район, горизонт у п'ять років."
        />

        <SnapSlider
          ariaLabel="Три кроки підходу"
          className="mt-6 md:mt-8"
          revealStagger
        >
          {approachPoints.map((point) => (
            <article
              key={point.index}
              data-slide
              data-reveal-item
              className="relative min-h-[58svh] overflow-hidden bg-ink md:min-h-[28rem]"
            >
              <Image
                src={point.image}
                alt={point.imageAlt}
                fill
                sizes="(min-width: 768px) 46vw, 86vw"
                quality={85}
                data-parallax="9"
                className="hero-photo object-cover will-change-transform"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,rgb(17_17_17/0.28)_0%,rgb(17_17_17/0.78)_100%)]"
              />
              <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-7">
                <p className="font-serif text-5xl leading-none text-paper/35">
                  {point.index}
                </p>
                <p className="text-eyebrow mt-4 text-bronze">{point.label}</p>
                <h3 className="mt-2 font-serif text-[1.45rem] leading-snug text-paper md:text-[1.75rem]">
                  {point.title}
                </h3>
              </div>
            </article>
          ))}
        </SnapSlider>
      </Container>
    </Section>
  );
}
