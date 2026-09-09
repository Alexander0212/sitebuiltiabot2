"use client";

import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type RangeSliderProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  hint?: string;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
};

export function RangeSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  hint,
  minLabel,
  maxLabel,
  onChange,
}: RangeSliderProps) {
  const span = max - min;
  const progress = span <= 0 ? 0 : Math.min(100, Math.max(0, ((value - min) / span) * 100));

  return (
    <div className="grid gap-2">
      <div className="flex items-end justify-between gap-4">
        <label htmlFor={id} className="text-[0.75rem] tracking-[0.14em] text-muted-foreground uppercase">
          {label}
        </label>
        <p className="text-right">
          <span className="block font-serif text-[1.45rem] leading-none tracking-tight text-foreground md:text-[1.85rem]">
            {display}
          </span>
          {hint ? (
            <span className="mt-1 hidden text-[0.75rem] tracking-[0.08em] text-muted-foreground sm:block">
              {hint}
            </span>
          ) : null}
        </p>
      </div>

      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={display}
          autoComplete="off"
          onChange={(event) => onChange(Number(event.target.value))}
          className="budget-range"
          style={{ "--budget-progress": `${progress}%` } as CSSProperties}
        />
        <div className="mt-2 flex justify-between text-[0.75rem] text-muted-foreground">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    </div>
  );
}

type SegmentedControlProps<T extends string | number> = {
  legend: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string | number>({
  legend,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-[0.75rem] tracking-[0.14em] text-muted-foreground uppercase">
        {legend}
      </legend>
      <div
        className={cn(
          "grid gap-2",
          options.length <= 2 ? "grid-cols-2" : "grid-cols-4",
        )}
      >
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <button
              key={String(option.value)}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "min-h-11 rounded-none border px-2 text-sm transition-[background-color,border-color,color,transform] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 focus-visible:ring-offset-2 active:scale-[0.99] md:min-h-12",
                selected
                  ? "border-foreground bg-foreground text-paper"
                  : "border-warm bg-transparent text-ink-soft hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
