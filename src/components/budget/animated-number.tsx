"use client";

import { useLayoutEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

type AnimatedNumberProps = {
  value: number;
  format: (value: number) => string;
  className?: string;
};

export function AnimatedNumber({
  value,
  format,
  className,
}: AnimatedNumberProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const safeValue = Number.isFinite(value) ? value : 0;
  const currentRef = useRef(safeValue);
  const formatRef = useRef(format);

  useLayoutEffect(() => {
    formatRef.current = format;
  }, [format]);

  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) {
      return;
    }

    const reduced = prefersReducedMotion();
    if (reduced) {
      node.textContent = formatRef.current(safeValue);
      currentRef.current = safeValue;
      return;
    }

    const state = { n: currentRef.current };
    const tween = gsap.to(state, {
      n: safeValue,
      duration: 0.68,
      ease: "power2.out",
      overwrite: "auto",
      onUpdate: () => {
        node.textContent = formatRef.current(state.n);
      },
      onComplete: () => {
        currentRef.current = safeValue;
        node.textContent = formatRef.current(safeValue);
      },
    });

    return () => {
      tween.kill();
      currentRef.current = state.n;
    };
  }, [safeValue]);

  return (
    <span ref={nodeRef} className={className}>
      {format(safeValue)}
    </span>
  );
}
