"use client";

import { useLayoutEffect } from "react";

import { gsap, registerGsapPlugins } from "@/lib/gsap";
import {
  INTRO,
  INTRO_EVENT,
  dispatchIntroEvent,
  waitForHeroVideo,
  waitForVideoBeat,
} from "@/lib/intro";
import { prefersReducedMotion } from "@/lib/motion";

export function IntroMotion() {
  useLayoutEffect(() => {
    registerGsapPlugins();

    if (prefersReducedMotion()) {
      gsap.set(
        [
          "[data-intro]",
          "[data-intro-item]",
          "[data-hero-item]",
          "[data-hero-line]",
          "[data-intro-media-inner]",
        ],
        { clearProps: "all" },
      );
      dispatchIntroEvent(INTRO_EVENT.stats);
      dispatchIntroEvent(INTRO_EVENT.done);
      return;
    }

    let cancelled = false;

    const header = document.querySelector<HTMLElement>("[data-intro='header']");
    const logo = document.querySelectorAll("[data-intro-item='logo']");
    const nav = document.querySelectorAll("[data-intro-item='nav']");
    const actions = document.querySelectorAll("[data-intro-item='actions']");
    const menu = document.querySelectorAll("[data-intro-item='menu']");
    const media = document.querySelectorAll("[data-intro='media']");
    const mediaInner = document.querySelectorAll("[data-intro-media-inner]");
    const eyebrow = document.querySelectorAll("[data-hero-item='eyebrow']");
    const lines = document.querySelectorAll("[data-hero-line]");
    const copy = document.querySelectorAll("[data-hero-item='copy']");
    const cta = document.querySelectorAll("[data-hero-item='cta']");
    const caption = document.querySelectorAll("[data-hero-item='caption']");
    const stats = document.querySelectorAll("[data-intro='stats']");

    const context = gsap.context(() => {
      gsap.set(header, { yPercent: -110, opacity: 0 });
      gsap.set([logo, nav, actions, menu], { opacity: 0, y: -18 });
      gsap.set(media, { opacity: 0, y: 48, scale: 0.94 });
      gsap.set(mediaInner, { scale: 1.22, opacity: 0.35 });
      gsap.set(eyebrow, { opacity: 0, x: -40 });
      gsap.set(lines, { yPercent: 115, opacity: 0 });
      gsap.set(copy, { opacity: 0, y: 28 });
      gsap.set(cta, { opacity: 0, y: 24 });
      gsap.set(caption, { opacity: 0, y: 16 });
      gsap.set(stats, { opacity: 0, y: 32 });
    });

    const hardFallback = window.setTimeout(() => {
      if (cancelled) {
        return;
      }
      gsap.set(
        [
          header,
          logo,
          nav,
          actions,
          menu,
          media,
          mediaInner,
          eyebrow,
          lines,
          copy,
          cta,
          caption,
          stats,
        ],
        { clearProps: "all" },
      );
      dispatchIntroEvent(INTRO_EVENT.stats);
      dispatchIntroEvent(INTRO_EVENT.done);
    }, INTRO.hardFallbackMs);

    void (async () => {
      const video = await waitForHeroVideo(INTRO.videoReadyTimeoutMs);
      if (cancelled) {
        return;
      }

      void video?.play().catch(() => undefined);

      gsap
        .timeline({ defaults: { ease: INTRO.easeSoft } })
        .to(media, { opacity: 1, y: 0, scale: 1, duration: 1.35 }, 0)
        .to(mediaInner, { opacity: 1, scale: 1.06, duration: 1.9 }, 0.05);

      await waitForVideoBeat(video, 2.35, INTRO.holdAfterVideoMs);
      if (cancelled) {
        return;
      }

      window.clearTimeout(hardFallback);

      gsap
        .timeline({
          defaults: { ease: INTRO.ease },
          onComplete: () => dispatchIntroEvent(INTRO_EVENT.done),
        })
        .to(header, { yPercent: 0, opacity: 1, duration: 0.9 }, 0)
        .to(logo, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
        .to(nav, { opacity: 1, y: 0, duration: 0.65, stagger: 0.05 }, 0.2)
        .to(actions, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 }, 0.24)
        .to(menu, { opacity: 1, y: 0, duration: 0.55 }, 0.22)
        .to(eyebrow, { opacity: 1, x: 0, duration: 0.75 }, 0.3)
        .to(
          lines,
          { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.12 },
          0.4,
        )
        .to(copy, { opacity: 1, y: 0, duration: 0.85 }, 0.75)
        .to(cta, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.9)
        .to(caption, { opacity: 1, y: 0, duration: 0.65 }, 1.08)
        .to(
          stats,
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            onStart: () => dispatchIntroEvent(INTRO_EVENT.stats),
          },
          1.18,
        )
        .to(
          mediaInner,
          { scale: 1.02, duration: 1.5, ease: INTRO.easeSoft },
          0.45,
        );
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(hardFallback);
      context.revert();
    };
  }, []);

  return null;
}
