import type { RefObject } from "react";
import { gsap, useGSAP, motion, safelyAnimate } from "../lib/motion/gsap";
export function useProductHover(root: RefObject<HTMLAnchorElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia(root);
      mm.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const card = root.current!;
          let dispose = () => {};
          const revert = safelyAnimate(() => {
            const timeline = gsap
              .timeline({
                paused: true,
                defaults: {
                  duration: motion.hover.duration,
                  ease: "power2.out",
                },
              })
              .to(card, { y: motion.hover.y }, 0)
              .to(
                card.querySelector(".product-image img"),
                { scale: motion.hover.scale },
                0,
              );
            // No new animations in events: the context owns this single reversible timeline.
            const enter = () => timeline.play();
            const leave = () => {
              if (!card.matches(":focus-visible")) timeline.reverse();
            };
            const blur = () => {
              if (!card.matches(":hover")) timeline.reverse();
            };
            card.addEventListener("pointerenter", enter);
            card.addEventListener("pointerleave", leave);
            card.addEventListener("focus", enter);
            card.addEventListener("blur", blur);
            dispose = () => {
              card.removeEventListener("pointerenter", enter);
              card.removeEventListener("pointerleave", leave);
              card.removeEventListener("focus", enter);
              card.removeEventListener("blur", blur);
            };
          });
          return () => {
            dispose();
            revert();
          };
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );
}
