"use client";

import { useLenis } from "lenis/react";

import { AnimatedNumber } from "@/components/budget/animated-number";
import { PropertyMatch } from "@/components/property/property-match";
import { Button } from "@/components/ui/button";
import { formatUsdMonthly, formatUsdSymbol } from "@/lib/format";
import { MOTION, prefersReducedMotion } from "@/lib/motion";
import type { BudgetResult } from "@/lib/budget";
import type { Property } from "@/types/property";

type BudgetResultPanelProps = {
  result: BudgetResult;
  matches: Property[];
  compact?: boolean;
};

export function BudgetResultPanel({
  result,
  matches,
  compact = false,
}: BudgetResultPanelProps) {
  const lenis = useLenis();

  function showMatches() {
    const target = document.getElementById("objects");
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
    <div
      className={
        compact
          ? "flex flex-col bg-ink px-5 py-5 text-paper lg:sticky lg:top-24 lg:px-8 lg:py-8"
          : "flex h-full flex-col bg-ink px-7 py-8 text-paper md:px-10 md:py-10 lg:sticky lg:top-24"
      }
    >
      <p className="text-eyebrow text-bronze">Ваш комфортний бюджет</p>
      <p
        className="mt-3 min-h-[3.2rem] font-serif text-[clamp(2.2rem,7vw,3.6rem)] leading-[0.95] tracking-[-0.04em] lg:mt-5 lg:min-h-[4.5rem]"
        aria-live="polite"
      >
        <AnimatedNumber
          value={result.maximumPropertyBudget}
          format={formatUsdSymbol}
        />
      </p>

      <div className="mt-5 border-t border-paper/12 pt-5 lg:mt-8 lg:pt-8">
        <p className="text-[0.75rem] tracking-[0.16em] text-paper/60 uppercase">
          Орієнтовний платіж
        </p>
        <p className="mt-3 min-h-8 font-serif text-3xl leading-none md:text-[2.15rem]">
          <AnimatedNumber
            value={result.estimatedMonthlyPayment}
            format={formatUsdMonthly}
          />
        </p>
      </div>

      <div className="mt-5 border-t border-paper/12 pt-5 lg:mt-8 lg:pt-8">
        <p className="text-[0.75rem] tracking-[0.16em] text-paper/60 uppercase">
          З добірки під цю цифру
        </p>
        <p className="mt-2 text-sm tracking-[0.04em] text-paper/70">
          {result.propertyTypeRecommendation}
          <span className="text-paper/45"> · {result.recommendedArea}</span>
        </p>
        <ul className="mt-4 grid gap-3">
          {matches.map((property) => (
            <li key={property.id}>
              <PropertyMatch property={property} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 lg:mt-auto">
        <Button
          type="button"
          variant="brand"
          size="cta"
          onClick={showMatches}
          className="w-full bg-paper text-ink hover:bg-paper/90"
        >
          Дивитись усю добірку
        </Button>
        <p className="mt-4 hidden max-w-sm text-[0.75rem] leading-relaxed text-paper/60 lg:block">
          Розрахунок орієнтовний. Адреси з шести об&apos;єктів, які зараз на
          сайті.
        </p>
      </div>
    </div>
  );
}
