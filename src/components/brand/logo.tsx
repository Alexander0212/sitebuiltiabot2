import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  inverted?: boolean;
  compact?: boolean;
};

export function LogoMark({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn(
        "size-9 shrink-0",
        inverted ? "text-paper" : "text-foreground",
        className,
      )}
      aria-hidden
    >
      <rect
        x="1.2"
        y="1.2"
        width="37.6"
        height="37.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M13 29V11h2.15L27 26.15V11h2v18h-2.15L15 12.85V29H13Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Logo({
  className,
  inverted = false,
  compact = false,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-3 tracking-tight transition-opacity duration-300 hover:opacity-70 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 focus-visible:ring-offset-4 active:opacity-60",
        inverted
          ? "focus-visible:ring-offset-ink"
          : "focus-visible:ring-offset-background",
        className,
      )}
      aria-label="NOVA ESTATE, на головну"
    >
      <LogoMark inverted={inverted} />
      <span className="flex flex-col justify-center leading-none">
        <span
          className={cn(
            "font-serif text-[1.35rem] italic",
            inverted ? "text-paper" : "text-foreground",
          )}
        >
          NOVA
        </span>
        {compact ? null : (
          <span
            className={cn(
              "mt-1 text-[0.62rem] font-medium tracking-[0.28em] uppercase",
              inverted ? "text-paper/70" : "text-ink-soft",
            )}
          >
            Estate
          </span>
        )}
      </span>
    </Link>
  );
}
