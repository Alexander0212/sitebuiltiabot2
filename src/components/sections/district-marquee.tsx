import { districts } from "@/lib/site";

export function DistrictMarquee() {
  const line = [...districts, ...districts, ...districts];

  return (
    <div
      data-reveal="fade"
      className="overflow-hidden border-y border-warm bg-background py-3"
      aria-hidden
    >
      <div className="district-marquee">
        <p className="flex shrink-0 gap-10 pr-10 whitespace-nowrap text-[0.72rem] font-medium tracking-[0.22em] text-ink-soft uppercase">
          {line.map((district, index) => (
            <span key={`${district}-${index}`} className="flex items-center gap-10">
              {district}
              <span className="text-bronze">·</span>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
