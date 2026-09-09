"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";

import { MOTION, prefersReducedMotion } from "@/lib/motion";

function getHashId(href: string) {
  if (href.startsWith("#") && href.length >= 2) {
    return href.slice(1);
  }

  if (href.startsWith("/#")) {
    return href.slice(2);
  }

  return null;
}

function getHashTarget(href: string) {
  const id = getHashId(href);
  if (!id) {
    return null;
  }

  if (href.startsWith("/#") && window.location.pathname !== "/") {
    return null;
  }

  try {
    return document.getElementById(decodeURIComponent(id));
  } catch {
    return null;
  }
}

export function AnchorScroll() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const link = (event.target as HTMLElement | null)?.closest("a");
      if (!link) {
        return;
      }

      const href = link.getAttribute("href");
      if (!href) {
        return;
      }

      const target = getHashTarget(href);
      if (!target) {
        return;
      }

      event.preventDefault();
      const reduced = prefersReducedMotion();

      if (lenis) {
        lenis.scrollTo(target, {
          offset: MOTION.headerOffset,
          duration: reduced ? 0 : MOTION.lenisDuration,
        });
      } else {
        target.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        });
      }

      const nextHash = href.startsWith("/#") ? href.slice(1) : href;
      if (window.location.hash !== nextHash) {
        window.history.pushState(null, "", href);
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [lenis]);

  useEffect(() => {
    if (!lenis || pathname !== "/") {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    function scrollToHash(immediate = true) {
      const id = window.location.hash;
      const target = id ? getHashTarget(id) : null;
      if (!target) {
        return false;
      }

      lenis!.resize();
      lenis!.scrollTo(target, {
        offset: MOTION.headerOffset,
        immediate,
        duration: prefersReducedMotion() ? 0 : MOTION.lenisDuration,
      });
      return true;
    }

    function tryScroll() {
      if (cancelled || scrollToHash(true) || attempts++ > 24) {
        return;
      }

      window.requestAnimationFrame(tryScroll);
    }

    const frame = window.requestAnimationFrame(tryScroll);
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        scrollToHash(true);
      }
    }, 120);

    function onHashChange() {
      scrollToHash(false);
    }

    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [lenis, pathname]);

  return null;
}
