"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";

import { AnchorScroll } from "@/components/motion/anchor-scroll";
import { IntroMotion } from "@/components/motion/intro-motion";
import { PageMotion } from "@/components/motion/page-motion";
import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";

type AppProvidersProps = {
  children: ReactNode;
};

function LenisScrollTrigger() {
  useLenis(() => {
    ScrollTrigger.update();
  });

  return null;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    registerGsapPlugins();
    gsap.ticker.lagSmoothing(0);

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <ReactLenis
      root
      options={{
        duration: reduced ? 0 : MOTION.lenisDuration,
        lerp: reduced ? 1 : 0.07,
        smoothWheel: !reduced,
      }}
    >
      <LenisScrollTrigger />
      <AnchorScroll />
      <IntroMotion />
      <PageMotion />
      {children}
    </ReactLenis>
  );
}
