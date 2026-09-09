"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";

import { gsap, registerGsapPlugins } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const HERO_VIDEO_SRC = "/videos/hero-penthouse.mp4";
const HERO_VIDEO_WEBM_SRC = "/videos/hero-penthouse.webm";
const HERO_POSTER_SRC = "/images/hero.webp";
const HERO_VIDEO_LABEL =
  "Пентхаус: порожня кімната наповнюється світлом і меблями";

type HeroMediaProps = {
  className?: string;
};

export function HeroMedia({ className }: HeroMediaProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    registerGsapPlugins();

    const frame = frameRef.current;
    const inner = innerRef.current;
    const video = videoRef.current;
    if (!frame || !inner) {
      return;
    }

    if (prefersReducedMotion()) {
      video?.pause();
      return;
    }

    void video?.play().catch(() => {
      /* autoplay may be blocked; poster remains */
    });

    const context = gsap.context(() => {
      gsap.fromTo(
        inner,
        { scale: 1.06, yPercent: 0 },
        {
          scale: 1.18,
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            start: "top top",
            end: "bottom top",
            scrub: 1.15,
          },
        },
      );
    }, frame);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={frameRef}
      className={cn("relative overflow-hidden bg-warm", className)}
    >
      <div
        ref={innerRef}
        data-intro-media-inner
        className="absolute inset-[-8%] will-change-transform"
      >
        <Image
          src={HERO_POSTER_SRC}
          alt="Інтер'єр пентхаусу NOVA ESTATE в Києві"
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 60vw"
          quality={90}
          className="object-cover object-center"
        />
        <video
          ref={videoRef}
          data-intro-video
          className="absolute inset-0 h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={HERO_POSTER_SRC}
          aria-label={HERO_VIDEO_LABEL}
        >
          <source src={HERO_VIDEO_WEBM_SRC} type="video/webm" />
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgb(245_243_239/0.1)_0%,transparent_22%,transparent_100%)] lg:block"
      />
    </div>
  );
}
