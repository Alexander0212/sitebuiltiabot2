export const MOTION = {
  duration: 1.05,
  durationSlow: 1.35,
  stagger: 0.09,
  ease: "power3.out",
  easeSoft: "power2.out",
  y: 36,
  yStrong: 56,
  headerOffset: -72,
  lenisDuration: 1.28,
} as const;

export function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
