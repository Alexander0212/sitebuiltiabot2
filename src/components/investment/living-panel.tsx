"use client";

import Image from "next/image";
import { useLenis } from "lenis/react";

import { Button } from "@/components/ui/button";
import { MOTION, prefersReducedMotion } from "@/lib/motion";

export function LivingPanel() {
  const lenis = useLenis();

  function goToBudget() {
    const target = document.getElementById("budget");
    if (!target) {
      return;
    }

    if (lenis) {
      lenis.scrollTo(target, {
        offset: MOTION.headerOffset,
        duration: prefersReducedMotion() ? 0 : MOTION.lenisDuration,
      });
      return;
    }

    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <div className="grid min-w-0 overflow-hidden bg-background lg:grid-cols-12">
      <div className="relative aspect-[16/10] overflow-hidden lg:col-span-5 lg:aspect-auto lg:min-h-[22rem]">
        <Image
          src="/images/living-salon.webp"
          alt="Вітальня з льном і денним світлом, сценарій для життя"
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          quality={85}
          data-parallax="8"
          className="hero-photo object-cover will-change-transform"
        />
      </div>
      <div className="px-5 py-6 md:px-8 md:py-8 lg:col-span-7 lg:px-10">
        <p className="text-eyebrow">Для життя</p>
        <p className="mt-3 font-serif text-[1.45rem] leading-[1.18] md:text-[1.85rem]">
          Якщо це дім, головне чи витримає бюджет спокійний тиждень у цьому
          районі.
        </p>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
          Дохідність тут ні до чого. Спочатку комфортна цифра, потім дві-три адреси.
        </p>
        <Button
          type="button"
          variant="brand"
          size="cta"
          onClick={goToBudget}
          className="mt-6 max-md:w-full"
        >
          Розрахувати бюджет
        </Button>
      </div>
    </div>
  );
}
