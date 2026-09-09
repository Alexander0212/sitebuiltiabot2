import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

import { cn } from "@/lib/utils";

type SectionProps = {
  children: ReactNode;
  className?: string;
  tone?: "paper" | "canvas" | "ink";
  ref?: Ref<HTMLElement>;
} & Omit<ComponentPropsWithoutRef<"section">, "children" | "className">;

const toneClasses = {
  paper: "bg-background text-foreground",
  canvas: "bg-canvas text-foreground",
  ink: "bg-ink text-paper",
} as const;

export function Section({
  children,
  className,
  tone = "paper",
  ref,
  ...props
}: SectionProps) {
  return (
    <section
      ref={ref}
      className={cn(
        "scroll-mt-20 py-10 md:py-16 lg:py-20",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
