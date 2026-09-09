import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
  tone?: "paper" | "ink";
};

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  className,
  align = "left",
  tone = "paper",
}: SectionHeadingProps) {
  return (
    <div
      data-reveal-stagger
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p data-reveal-item className="text-eyebrow">
        {index}. {eyebrow}
      </p>
      <h2
        data-reveal-item
        className={cn(
          "mt-3 font-serif text-[1.7rem] leading-[1.12] tracking-[-0.03em] md:mt-4 md:text-[2.4rem] lg:text-[2.85rem]",
          tone === "ink" ? "text-paper" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          data-reveal-item
          className={cn(
            "mt-3 max-w-xl text-[0.95rem] leading-relaxed md:mt-4 md:text-[1.05rem] md:leading-[1.65]",
            tone === "ink" ? "text-paper/70" : "text-ink-soft",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
