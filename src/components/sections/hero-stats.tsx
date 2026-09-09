"use client";

import { useEffect, useRef } from "react";

import { heroStats } from "@/data/hero";
import { gsap, registerGsapPlugins } from "@/lib/gsap";
import { INTRO_EVENT } from "@/lib/intro";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type HeroStatsProps = {
  className?: string;
};

export function HeroStats({ className }: HeroStatsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    registerGsapPlugins();

    const root = rootRef.current;
    if (!root) {
      return;
    }

    const counters = root.querySelectorAll<HTMLElement>("[data-count-to]");

    const revealFinal = () => {
      counters.forEach((node) => {
        const to = Number(node.dataset.countTo);
        const suffix = node.dataset.countSuffix ?? "";
        node.textContent = `${to}${suffix}`;
      });
    };

    if (prefersReducedMotion()) {
      revealFinal();
      return;
    }

    const run = () => {
      if (startedRef.current) {
        return;
      }
      startedRef.current = true;

      counters.forEach((node, index) => {
        const to = Number(node.dataset.countTo);
        const suffix = node.dataset.countSuffix ?? "";
        const state = { value: 0 };
        node.textContent = `0${suffix}`;

        gsap.to(state, {
          value: to,
          duration: 1.65,
          delay: index * 0.12,
          ease: "power2.out",
          onUpdate: () => {
            node.textContent = `${Math.round(state.value)}${suffix}`;
          },
        });
      });
    };

    window.addEventListener(INTRO_EVENT.stats, run);
    const fallback = window.setTimeout(run, 6500);

    return () => {
      window.removeEventListener(INTRO_EVENT.stats, run);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn(
        "grid grid-cols-3 gap-3 border-t px-0 py-4 lg:pt-6 lg:pb-0",
        className,
      )}
    >
      {heroStats.map((item) => (
        <article key={item.label} className="min-w-0">
          <p
            className="font-serif text-[1.45rem] leading-none tracking-tight md:text-3xl lg:text-[2.35rem]"
            aria-label={`${item.value}${item.suffix} ${item.label}`}
          >
            <span
              data-count-to={item.value}
              data-count-suffix={item.suffix}
              aria-hidden
            >
              0{item.suffix}
            </span>
          </p>
          <p className="mt-1.5 text-[0.68rem] leading-snug text-muted-foreground md:text-sm">
            {item.label}
          </p>
        </article>
      ))}
    </div>
  );
}
