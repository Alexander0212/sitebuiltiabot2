"use client";

import { useRef, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

export type GoalMode = "live" | "invest";

const options = [
  { value: "live" as const, label: "Для життя" },
  { value: "invest" as const, label: "Для інвестицій" },
];

type ModeToggleProps = {
  value: GoalMode;
  onChange: (value: GoalMode) => void;
};

export function ModeToggle({ value, onChange }: ModeToggleProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  function move(next: GoalMode) {
    onChange(next);
    requestAnimationFrame(() => {
      const button = rootRef.current?.querySelector<HTMLButtonElement>(
        `[data-mode="${next}"]`,
      );
      button?.focus();
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();
      const current = event.currentTarget.dataset.mode as GoalMode | undefined;
      move(current === "live" ? "invest" : "live");
    }

    if (event.key === "Home") {
      event.preventDefault();
      move("live");
    }

    if (event.key === "End") {
      event.preventDefault();
      move("invest");
    }
  }

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      aria-label="Режим підбору"
      className="grid max-w-lg grid-cols-2 border border-warm"
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            data-mode={option.value}
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={onKeyDown}
            className={cn(
              "min-h-12 px-3 text-[0.75rem] tracking-[0.12em] uppercase transition-[background-color,color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 focus-visible:ring-inset active:opacity-80 sm:min-h-[3.25rem] sm:text-[0.78rem] sm:tracking-[0.14em]",
              selected
                ? "bg-foreground text-paper"
                : "bg-transparent text-ink-soft hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
