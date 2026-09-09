"use client";

import { useEffect, useMemo, useState } from "react";

import { BudgetResultPanel } from "@/components/budget/budget-result";
import {
  RangeSlider,
  SegmentedControl,
} from "@/components/budget/range-slider";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { matchProperties } from "@/data/properties";
import {
  BUDGET_LIMITS,
  calculateBudget,
  DEFAULT_BUDGET_INPUTS,
  type BudgetGoal,
  type FamilySize,
} from "@/lib/budget";
import { saveBudgetBridge } from "@/lib/budget-bridge";
import { formatUsdSymbol, formatYears } from "@/lib/format";

const familyOptions = [
  { value: 1 as const, label: "1" },
  { value: 2 as const, label: "2" },
  { value: 3 as const, label: "3" },
  { value: 4 as const, label: "4+" },
];

const goalOptions = [
  { value: "live" as const, label: "Життя" },
  { value: "invest" as const, label: "Інвестиція" },
];

export function BudgetCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState(
    DEFAULT_BUDGET_INPUTS.monthlyIncome,
  );
  const [downPayment, setDownPayment] = useState(
    DEFAULT_BUDGET_INPUTS.downPayment,
  );
  const [termYears, setTermYears] = useState(DEFAULT_BUDGET_INPUTS.termYears);
  const [familySize, setFamilySize] = useState<FamilySize>(
    DEFAULT_BUDGET_INPUTS.familySize,
  );
  const [goal, setGoal] = useState<BudgetGoal>(DEFAULT_BUDGET_INPUTS.goal);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const result = useMemo(
    () =>
      calculateBudget({
        monthlyIncome,
        downPayment,
        termYears,
        familySize,
        goal,
      }),
    [monthlyIncome, downPayment, termYears, familySize, goal],
  );

  const matches = useMemo(
    () => matchProperties(result.maximumPropertyBudget),
    [result.maximumPropertyBudget],
  );

  useEffect(() => {
    saveBudgetBridge({
      maximumPropertyBudget: result.maximumPropertyBudget,
      goal,
    });
  }, [result.maximumPropertyBudget, goal]);

  return (
    <Section
      id="budget"
      tone="canvas"
      className="overflow-x-clip max-md:min-h-[100svh] max-md:py-6"
    >
      <Container className="min-w-0">
        <SectionHeading
          index="01"
          eyebrow="Бюджет"
          title="Спочатку цифра, не квартира."
          description="Дохід і мета: ви бачите комфортну цифру та 2-3 адреси з добірки."
        />

        <div className="mt-5 grid gap-4 lg:mt-8 lg:grid-cols-12 lg:items-start lg:gap-0">
          <div
            data-reveal="left"
            className="flex min-w-0 flex-col gap-5 bg-background px-4 py-5 md:gap-7 md:px-8 md:py-8 lg:col-span-7 lg:px-10"
          >
            <RangeSlider
              id="monthly-income"
              label="Щомісячний дохід"
              hint="після податків, USD"
              value={monthlyIncome}
              min={BUDGET_LIMITS.income.min}
              max={BUDGET_LIMITS.income.max}
              step={BUDGET_LIMITS.income.step}
              display={formatUsdSymbol(monthlyIncome)}
              minLabel={formatUsdSymbol(BUDGET_LIMITS.income.min)}
              maxLabel={formatUsdSymbol(BUDGET_LIMITS.income.max)}
              onChange={setMonthlyIncome}
            />
            <SegmentedControl
              legend="Мета"
              value={goal}
              options={goalOptions}
              onChange={setGoal}
            />

            <button
              type="button"
              className="self-start text-left text-[0.78rem] tracking-[0.12em] text-ink-soft uppercase underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((open) => !open)}
            >
              {detailsOpen
                ? "Сховати внесок і термін"
                : "Уточнити внесок і термін"}
            </button>

            {detailsOpen ? (
              <div className="flex flex-col gap-5 border-t border-warm pt-5 md:gap-7">
                <RangeSlider
                  id="down-payment"
                  label="Початковий внесок"
                  value={downPayment}
                  min={BUDGET_LIMITS.downPayment.min}
                  max={BUDGET_LIMITS.downPayment.max}
                  step={BUDGET_LIMITS.downPayment.step}
                  display={formatUsdSymbol(downPayment)}
                  minLabel={formatUsdSymbol(BUDGET_LIMITS.downPayment.min)}
                  maxLabel={formatUsdSymbol(BUDGET_LIMITS.downPayment.max)}
                  onChange={setDownPayment}
                />
                <RangeSlider
                  id="term-years"
                  label="Термін"
                  value={termYears}
                  min={BUDGET_LIMITS.termYears.min}
                  max={BUDGET_LIMITS.termYears.max}
                  step={BUDGET_LIMITS.termYears.step}
                  display={formatYears(termYears)}
                  minLabel={formatYears(BUDGET_LIMITS.termYears.min)}
                  maxLabel={formatYears(BUDGET_LIMITS.termYears.max)}
                  onChange={setTermYears}
                />
                <SegmentedControl
                  legend="Сім'я"
                  value={familySize}
                  options={familyOptions}
                  onChange={setFamilySize}
                />
              </div>
            ) : null}
          </div>

          <div data-reveal="right" className="lg:col-span-5">
            <BudgetResultPanel result={result} matches={matches} compact />
          </div>
        </div>
      </Container>
    </Section>
  );
}
