"use client";

import { AnimatedNumber } from "@/components/budget/animated-number";
import { formatPercent, formatUsdSymbol } from "@/lib/format";
import type { InvestmentResult } from "@/lib/investment";

type YieldResultProps = {
  result: InvestmentResult;
};

export function YieldResult({ result }: YieldResultProps) {
  const rent = Math.max(result.annualRent, 0);
  const expenseRatio =
    rent > 0 ? Math.min(1, Math.max(0, result.annualExpenses / rent)) : 0;

  return (
    <div className="flex h-full flex-col bg-ink px-5 py-5 text-paper md:px-8 md:py-7 lg:sticky lg:top-24">
      <p className="text-eyebrow text-bronze">Орієнтовна дохідність</p>
      <p
        className="mt-5 min-h-[4.5rem] font-serif text-[clamp(3.2rem,8vw,5.4rem)] leading-[0.92] tracking-[-0.04em] tabular-nums"
        aria-live="polite"
      >
        <AnimatedNumber value={result.estimatedYield} format={formatPercent} />
      </p>

      <div className="mt-10" aria-hidden>
        <div
          className="h-[3px] bg-paper/12 transition-[background] duration-700 ease-out"
          style={{
            background: `linear-gradient(to right, rgb(216 211 203 / 0.85) 0%, rgb(216 211 203 / 0.85) ${expenseRatio * 100}%, #a67c52 ${expenseRatio * 100}%, #a67c52 100%)`,
          }}
        />
        <div className="mt-3 flex justify-between text-[0.75rem] tracking-[0.08em] text-paper/60 uppercase">
          <span>Витрати</span>
          <span>Чистий дохід</span>
        </div>
      </div>

      <dl className="mt-10 grid gap-6 border-t border-paper/12 pt-8">
        <div>
          <dt className="text-[0.75rem] tracking-[0.16em] text-paper/60 uppercase">
            Річна оренда
          </dt>
          <dd className="mt-2 min-h-8 font-serif text-[1.65rem] leading-none tabular-nums md:text-[1.85rem]">
            <AnimatedNumber value={result.annualRent} format={formatUsdSymbol} />
          </dd>
        </div>
        <div>
          <dt className="text-[0.75rem] tracking-[0.16em] text-paper/60 uppercase">
            Річні витрати
          </dt>
          <dd className="mt-2 min-h-8 font-serif text-[1.65rem] leading-none tabular-nums md:text-[1.85rem]">
            <AnimatedNumber
              value={result.annualExpenses}
              format={formatUsdSymbol}
            />
          </dd>
        </div>
        <div className="min-h-[5.5rem]">
          <dt className="text-[0.75rem] tracking-[0.16em] text-paper/60 uppercase">
            Чистий річний дохід
          </dt>
          <dd className="mt-2 font-serif text-[1.85rem] leading-none tabular-nums md:text-3xl">
            <AnimatedNumber
              value={result.netAnnualIncome}
              format={formatUsdSymbol}
            />
            {result.expensesExceedRent ? (
              <span className="mt-2 block text-sm tracking-normal text-paper/60">
                Витрати перевищують оренду, тож дохідний сценарій не складається.
              </span>
            ) : null}
          </dd>
        </div>
      </dl>

      <p className="mt-10 max-w-sm text-[0.75rem] leading-relaxed text-paper/60 lg:mt-auto lg:pt-10">
        Розрахунок є орієнтовним та не гарантує фактичну дохідність.
      </p>
    </div>
  );
}
