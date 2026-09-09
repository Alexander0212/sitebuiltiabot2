"use client";

import Image from "next/image";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SnapSlider } from "@/components/ui/snap-slider";
import { testimonials } from "@/data/testimonials";

export function Testimonials() {
  return (
    <Section id="trust" className="overflow-x-clip max-md:min-h-[100svh] max-md:py-8">
      <Container className="min-w-0">
        <header data-reveal-stagger className="max-w-2xl">
          <p data-reveal-item className="text-eyebrow">
            05. Довіра
          </p>
          <h2
            data-reveal-item
            className="mt-3 font-serif text-[1.7rem] leading-[1.12] md:text-[2.4rem]"
          >
            Адресу обираєте ви.
            <span className="mt-1 block italic text-ink-soft">
              Ми прибираємо зайве навколо неї.
            </span>
          </h2>
        </header>

        <SnapSlider
          ariaLabel="Відгуки клієнтів"
          className="mt-6 md:mt-8"
          revealStagger
        >
          {testimonials.map((item) => (
            <blockquote
              key={item.id}
              data-slide
              data-reveal-item
              className="grid min-h-[58svh] overflow-hidden bg-background md:min-h-[26rem] md:grid-cols-2"
            >
              <div className="relative min-h-[12rem] overflow-hidden md:min-h-full">
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  sizes="(min-width: 768px) 23vw, 86vw"
                  quality={85}
                  data-parallax="8"
                  className="hero-photo object-cover will-change-transform"
                />
              </div>
              <div className="flex flex-col justify-end p-5 md:p-7">
                <p className="font-serif text-[1.25rem] leading-[1.35] text-foreground md:text-[1.4rem]">
                  {item.quote}
                </p>
                <cite className="mt-6 not-italic">
                  <span className="block text-sm font-medium">{item.name}</span>
                  <span className="mt-1 block text-[0.72rem] tracking-[0.12em] text-muted-foreground uppercase">
                    {item.goal}
                    <span className="text-warm"> · </span>
                    {item.district}
                  </span>
                </cite>
              </div>
            </blockquote>
          ))}
        </SnapSlider>
      </Container>
    </Section>
  );
}
