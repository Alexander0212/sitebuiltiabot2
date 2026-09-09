"use client";

import Link from "next/link";

import { HeroMedia } from "@/components/sections/hero-media";
import { HeroStats } from "@/components/sections/hero-stats";
import { Button } from "@/components/ui/button";
import { heroContent } from "@/data/hero";
import { processLine } from "@/data/process";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section
      data-motion-own
      className="relative grid grid-cols-1 overflow-x-clip bg-canvas lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(22rem,40vw)_minmax(0,1fr)]"
    >
      <div className="relative z-10 flex flex-col justify-between px-6 pt-20 pb-2 text-foreground lg:px-12 lg:py-12 xl:pl-[max(3rem,calc((100vw-1440px)/2+3rem))] xl:pr-10">
        <div>
          <p className="text-eyebrow" data-hero-item="eyebrow">
            {heroContent.eyebrow}
          </p>

          <h1 className="mt-4 max-w-[18ch] overflow-visible font-serif text-[clamp(2.35rem,9.2vw,3.1rem)] leading-[1.06] tracking-[-0.035em] lg:mt-6 lg:text-[clamp(2.9rem,3.8vw,4.4rem)]">
            {heroContent.title.map((line, index) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <span
                  data-hero-line
                  className={cn(
                    "block",
                    index === heroContent.title.length - 1 && "italic",
                  )}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p
            className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-soft lg:mt-5 lg:text-[1.02rem]"
            data-hero-item="copy"
          >
            {heroContent.subtitle}
          </p>

          <div
            className="mt-6 flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch"
            data-hero-item="cta"
          >
            <Button
              asChild
              variant="brand"
              size="cta"
              className="w-full shrink sm:w-auto sm:max-w-full"
            >
              <Link href={heroContent.primaryCta.href}>
                {heroContent.primaryCta.label}
              </Link>
            </Button>
            <Button
              asChild
              variant="brandOutline"
              size="cta"
              className="w-full shrink sm:w-auto sm:max-w-full"
            >
              <Link href={heroContent.secondaryCta.href}>
                {heroContent.secondaryCta.label}
              </Link>
            </Button>
          </div>

          <p
            className="mt-4 max-w-md text-[0.82rem] leading-relaxed text-ink-soft"
            data-hero-item="cta"
          >
            {processLine}
          </p>
        </div>

        <div data-intro="stats" className="mt-10 hidden lg:block">
          <HeroStats className="border-warm" />
        </div>
      </div>

      <div
        className="relative z-10 mt-8 px-6 lg:mt-0 lg:h-full lg:min-h-[28rem] lg:px-0"
        data-intro="media"
      >
        <HeroMedia className="aspect-video w-full border border-warm lg:absolute lg:inset-0 lg:aspect-auto lg:border-0 lg:border-l lg:border-warm" />
        <p
          className="mt-3 text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase lg:hidden"
          data-hero-item="caption"
        >
          Від порожньої зали до вашої адреси
        </p>
      </div>

      <div data-intro="stats" className="relative z-10 px-6 pt-8 pb-10 lg:hidden">
        <HeroStats className="border-warm" />
      </div>
    </section>
  );
}
