export const INTRO = {
  /** Wait for video readiness before starting the hold. */
  videoReadyTimeoutMs: 1800,
  /** Let the empty-room beat play before UI assembles. */
  holdAfterVideoMs: 2000,
  /** Absolute fallback so UI never stays hidden. */
  hardFallbackMs: 6200,
  ease: "power3.out",
  easeSoft: "power2.out",
} as const;

export const INTRO_EVENT = {
  stats: "nova:intro-stats",
  done: "nova:intro-done",
} as const;

export function dispatchIntroEvent(name: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(name));
}

export function waitForHeroVideo(timeoutMs: number) {
  return new Promise<HTMLVideoElement | null>((resolve) => {
    if (typeof document === "undefined") {
      resolve(null);
      return;
    }

    const video = document.querySelector<HTMLVideoElement>(
      "[data-intro-video]",
    );

    if (!video) {
      resolve(null);
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(video);
    };

    if (video.readyState >= 2) {
      finish();
      return;
    }

    video.addEventListener("loadeddata", finish, { once: true });
    video.addEventListener("canplay", finish, { once: true });
    window.setTimeout(finish, timeoutMs);
  });
}

export function waitForVideoBeat(
  video: HTMLVideoElement | null,
  beatSeconds: number,
  fallbackMs: number,
) {
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve();
    };

    const fallback = window.setTimeout(finish, fallbackMs);

    if (!video) {
      return;
    }

    const onTime = () => {
      if (video.currentTime >= beatSeconds) {
        window.clearTimeout(fallback);
        video.removeEventListener("timeupdate", onTime);
        finish();
      }
    };

    video.addEventListener("timeupdate", onTime);
    onTime();
  });
}
