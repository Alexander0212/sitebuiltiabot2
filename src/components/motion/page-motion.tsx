"use client";

import { useLayoutEffect } from "react";

import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/gsap";
import { INTRO_EVENT } from "@/lib/intro";
import { MOTION, prefersReducedMotion } from "@/lib/motion";

function revealFrom(element: HTMLElement) {
  const kind = element.dataset.reveal || "up";

  if (kind === "left") {
    return { x: -48, y: 18, opacity: 0 };
  }
  if (kind === "right") {
    return { x: 48, y: 18, opacity: 0 };
  }
  if (kind === "scale") {
    return { y: 28, scale: 0.94, opacity: 0 };
  }
  if (kind === "fade") {
    return { opacity: 0 };
  }
  return { y: MOTION.y, opacity: 0 };
}

function setupPageMotion() {
  const reveals = gsap.utils
    .toArray<HTMLElement>("[data-reveal]")
    .filter((el) => !el.closest("[data-motion-own]"));

  reveals.forEach((element) => {
    const from = revealFrom(element);
    gsap.fromTo(element, from, {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      duration: MOTION.duration,
      ease: MOTION.ease,
      immediateRender: true,
      scrollTrigger: {
        trigger: element,
        start: "top 88%",
        once: true,
      },
    });
  });

  gsap.utils
    .toArray<HTMLElement>("[data-reveal-stagger]")
    .filter((el) => !el.closest("[data-motion-own]"))
    .forEach((group) => {
      const items = group.querySelectorAll<HTMLElement>("[data-reveal-item]");
      if (!items.length) {
        return;
      }

      gsap.fromTo(
        items,
        { y: MOTION.yStrong, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: MOTION.duration,
          ease: MOTION.ease,
          stagger: MOTION.stagger,
          immediateRender: true,
          scrollTrigger: {
            trigger: group,
            start: "top 84%",
            once: true,
          },
        },
      );
    });

  gsap.utils
    .toArray<HTMLElement>("[data-reveal-media]")
    .filter((el) => !el.closest("[data-motion-own]"))
    .forEach((frame) => {
      const media =
        frame.querySelector<HTMLElement>("[data-parallax], img, video") ??
        (frame.firstElementChild as HTMLElement | null);

      gsap.fromTo(
        frame,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: MOTION.durationSlow,
          ease: MOTION.ease,
          immediateRender: true,
          scrollTrigger: {
            trigger: frame,
            start: "top 90%",
            once: true,
          },
        },
      );

      if (!media) {
        return;
      }

      gsap.fromTo(
        media,
        { scale: 1.18 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.1,
          },
        },
      );
    });

  gsap.utils
    .toArray<HTMLElement>("[data-parallax]")
    .filter(
      (el) =>
        !el.closest("[data-motion-own]") && !el.closest("[data-reveal-media]"),
    )
    .forEach((element) => {
      const amount = Number(element.dataset.parallax || 8);
      gsap.fromTo(
        element,
        { yPercent: -amount * 0.35, scale: 1.12 },
        {
          yPercent: amount * 0.55,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: element.parentElement ?? element,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.15,
          },
        },
      );
    });
}

export function PageMotion() {
  useLayoutEffect(() => {
    registerGsapPlugins();

    if (prefersReducedMotion()) {
      gsap.set(
        [
          "[data-reveal]",
          "[data-reveal-item]",
          "[data-reveal-media]",
          "[data-parallax]",
        ],
        { clearProps: "all" },
      );
      return;
    }

    const context = gsap.context(() => {
      setupPageMotion();
    });

    const refresh = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener(INTRO_EVENT.done, refresh);
    requestAnimationFrame(refresh);
    const lateRefresh = window.setTimeout(refresh, 1200);

    return () => {
      window.removeEventListener(INTRO_EVENT.done, refresh);
      window.clearTimeout(lateRefresh);
      context.revert();
    };
  }, []);

  return null;
}
