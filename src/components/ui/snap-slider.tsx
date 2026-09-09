"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, type ReactNode } from "react";

import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type SnapSliderProps = {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
  revealStagger?: boolean;
};

export function SnapSlider({
  children,
  ariaLabel,
  className,
  revealStagger = false,
}: SnapSliderProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: -1 | 1) {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const slide = scroller.querySelector<HTMLElement>("[data-slide]");
    const amount = slide
      ? slide.getBoundingClientRect().width + 16
      : scroller.clientWidth * 0.86;

    scroller.scrollBy({
      left: amount * direction,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  return (
    <div
      className={cn("relative min-w-0", className)}
      {...(revealStagger ? { "data-reveal-stagger": true } : {})}
    >
      <div
        ref={scrollerRef}
        className="snap-slider"
        aria-label={ariaLabel}
      >
        {children}
      </div>
      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          className="inline-flex size-11 items-center justify-center border border-warm text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
          aria-label="Попередній слайд"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          className="inline-flex size-11 items-center justify-center border border-warm text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
          aria-label="Наступний слайд"
        >
          <ChevronRight className="size-5" />
        </button>
        <p className="ml-2 text-[0.75rem] tracking-[0.12em] text-muted-foreground uppercase">
          Гортайте
        </p>
      </div>
    </div>
  );
}
