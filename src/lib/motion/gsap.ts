import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(ScrollTrigger, useGSAP);
export { gsap, ScrollTrigger, useGSAP };

// All distances are CSS pixels; keep large surfaces on transform/opacity only.
export const motion = {
  hero: {
    duration: 1,
    y: 24,
    scale: 0.97,
    stagger: 0.1,
    floatY: 5,
    floatDuration: 3.6,
  },
  reveal: { duration: 0.75, y: 24, stagger: 0.09, start: "top 85%" },
  light: { sweep: 32, duration: 1.8, drift: 8, driftDuration: 8 },
  feature: { productY: 28, lightY: -20, scrub: 1 },
  hover: { y: -4, scale: 1.03, duration: 0.28 },
} as const;
export const conditions = {
  desktop: "(min-width: 768px)",
  mobile: "(max-width: 767px)",
  reduce: "(prefers-reduced-motion: reduce)",
};

// A failed setup must restore CSS-visible content, including partially created tweens.
export function safelyAnimate(setup: () => void) {
  const context = gsap.context(() => {});
  try {
    context.add(setup);
  } catch (error) {
    context.revert();
    console.warn("Motion unavailable; using static content.", error);
  }
  return () => context.revert();
}

// Coordinates already-created animations; listeners never create untracked tweens.
export function visiblePlayback(
  element: Element,
  animations: gsap.core.Animation[],
  ready = () => true,
) {
  let visible = false;
  const sync = () =>
    animations.forEach((animation) =>
      animation.paused(!visible || document.hidden || !ready()),
    );
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  observer.observe(element);
  document.addEventListener("visibilitychange", sync);
  sync();
  return {
    sync,
    dispose: () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      animations.forEach((a) => a.pause());
    },
  };
}
