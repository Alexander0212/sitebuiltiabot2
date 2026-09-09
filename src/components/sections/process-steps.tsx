import { cn } from "@/lib/utils";
import { processSteps } from "@/data/process";

type ProcessStepsProps = {
  className?: string;
  tone?: "paper" | "ink";
};

export function ProcessSteps({
  className,
  tone = "paper",
}: ProcessStepsProps) {
  const ink = tone === "ink";

  return (
    <ol
      data-reveal-stagger
      className={cn(
        "grid gap-4 sm:grid-cols-3 sm:gap-6",
        className,
      )}
    >
      {processSteps.map((step) => (
        <li key={step.index} data-reveal-item className="min-w-0">
          <p
            className={cn(
              "text-[0.72rem] tracking-[0.16em] uppercase",
              ink ? "text-bronze" : "text-bronze-ink",
            )}
          >
            {step.index}
          </p>
          <p
            className={cn(
              "mt-2 font-serif text-[1.2rem] leading-snug",
              ink ? "text-paper" : "text-foreground",
            )}
          >
            {step.title}
          </p>
          <p
            className={cn(
              "mt-1.5 text-[0.88rem] leading-relaxed",
              ink ? "text-paper/70" : "text-ink-soft",
            )}
          >
            {step.text}
          </p>
        </li>
      ))}
    </ol>
  );
}
