"use client";

import { useMemo, useState } from "react";

import { AnimatedNumber } from "@/components/budget/animated-number";
import { RangeSlider } from "@/components/budget/range-slider";
import { LivingPanel } from "@/components/investment/living-panel";
import { ModeToggle, type GoalMode } from "@/components/investment/mode-toggle";
import { YieldResult } from "@/components/investment/yield-result";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { formatPercent, formatUsdSymbol } from "@/lib/format";
import {
  calculateInvestment,
  DEFAULT_INVESTMENT_INPUTS,
  INVESTMENT_LIMITS,
} from "@/lib/investment";

export function InvestmentCalculator() {
  const [mode, setMode] = useState<GoalMode>("live");
  const [propertyPrice, setPropertyPrice] = useState(
    DEFAULT_INVESTMENT_INPUTS.propertyPrice,
  );
  const [monthlyRent, setMonthlyRent] = useState(
    DEFAULT_INVESTMENT_INPUTS.monthlyRent,
  );
  const [monthlyExpenses, setMonthlyExpenses] = useState(
    DEFAULT_INVESTMENT_INPUTS.monthlyExpenses,
  );

  const result = useMemo(
    () =>
      calculateInvestment({
        propertyPrice,
        monthlyRent,
        monthlyExpenses,
      }),
    [propertyPrice, monthlyRent, monthlyExpenses],
  );

  return (
    <Section
      id="investments"
      tone="canvas"
      className="overflow-x-clip max-md:min-h-[100svh] max-md:py-6"
    >
      <Container className="min-w-0">
        <div>
          <SectionHeading
            index="04"
            eyebrow="Інвестиції"
            title="Житло і дохід рахуються по-різному."
            description="Оберіть задачу. Якщо це інвестиція, орієнтовна дохідність ще до перегляду."
          />
        </div>

        <div data-reveal className="mt-5 md:mt-6">
          <ModeToggle value={mode} onChange={setMode} />
        </div>

        {mode === "invest" ? (
          <div className="sticky top-14 z-20 mt-4 -mx-6 border-y border-warm bg-canvas/92 px-6 py-2.5 backdrop-blur-md lg:hidden">
            <p className="text-[0.75rem] tracking-[0.14em] text-muted-foreground uppercase">
              Орієнтовна дохідність
            </p>
            <p
              className="mt-1 font-serif text-[1.85rem] leading-none tracking-tight tabular-nums"
              aria-live="polite"
            >
              <AnimatedNumber
                value={result.estimatedYield}
                format={formatPercent}
              />
            </p>
          </div>
        ) : null}

        <div
          key={mode}
          data-reveal="scale"
          className="investment-mode-panel mt-5 min-w-0 md:mt-6"
        >
          {mode === "live" ? (
            <LivingPanel />
          ) : (
            <div className="grid min-w-0 gap-8 lg:grid-cols-12 lg:items-start lg:gap-0">
              <form
                className="flex min-w-0 flex-col gap-5 bg-background px-4 py-5 md:gap-7 md:px-8 md:py-8 lg:col-span-7 lg:px-10"
                aria-label="Інвестиційний калькулятор"
                autoComplete="off"
                onSubmit={(event) => event.preventDefault()}
              >
                <RangeSlider
                  id="invest-price"
                  label="Вартість об'єкта"
                  value={propertyPrice}
                  min={INVESTMENT_LIMITS.propertyPrice.min}
                  max={INVESTMENT_LIMITS.propertyPrice.max}
                  step={INVESTMENT_LIMITS.propertyPrice.step}
                  display={formatUsdSymbol(propertyPrice)}
                  minLabel={formatUsdSymbol(
                    INVESTMENT_LIMITS.propertyPrice.min,
                  )}
                  maxLabel={formatUsdSymbol(
                    INVESTMENT_LIMITS.propertyPrice.max,
                  )}
                  onChange={setPropertyPrice}
                />
                <RangeSlider
                  id="invest-rent"
                  label="Оренда на місяць"
                  value={monthlyRent}
                  min={INVESTMENT_LIMITS.monthlyRent.min}
                  max={INVESTMENT_LIMITS.monthlyRent.max}
                  step={INVESTMENT_LIMITS.monthlyRent.step}
                  display={formatUsdSymbol(monthlyRent)}
                  hint="на місяць"
                  minLabel={formatUsdSymbol(INVESTMENT_LIMITS.monthlyRent.min)}
                  maxLabel={formatUsdSymbol(INVESTMENT_LIMITS.monthlyRent.max)}
                  onChange={(value) => {
                    setMonthlyRent(value);
                    setMonthlyExpenses((current) => Math.min(current, value));
                  }}
                />
                <RangeSlider
                  id="invest-expenses"
                  label="Витрати на місяць"
                  hint="комунальні, управління, резерв"
                  value={Math.min(monthlyExpenses, monthlyRent)}
                  min={INVESTMENT_LIMITS.monthlyExpenses.min}
                  max={Math.min(
                    INVESTMENT_LIMITS.monthlyExpenses.max,
                    monthlyRent,
                  )}
                  step={INVESTMENT_LIMITS.monthlyExpenses.step}
                  display={formatUsdSymbol(
                    Math.min(monthlyExpenses, monthlyRent),
                  )}
                  minLabel={formatUsdSymbol(
                    INVESTMENT_LIMITS.monthlyExpenses.min,
                  )}
                  maxLabel={formatUsdSymbol(
                    Math.min(
                      INVESTMENT_LIMITS.monthlyExpenses.max,
                      monthlyRent,
                    ),
                  )}
                  onChange={setMonthlyExpenses}
                />
              </form>

              <div className="hidden min-w-0 lg:col-span-5 lg:block">
                <YieldResult result={result} />
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
