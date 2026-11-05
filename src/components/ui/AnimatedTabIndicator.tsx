import { useRef } from "react";
import { gsap, useGSAP } from "../../lib/motion/gsap";
export function AnimatedTabIndicator({ active }: { active: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef<{ x: number; width: number } | null>(null);
  useGSAP(
    (_context, contextSafe) => {
      const mm = gsap.matchMedia(ref);
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const element = ref.current!;
        const parent = element.parentElement!;
        let disposed = false;
        let tween: gsap.core.Tween | undefined;
        const update = () => {
          if (disposed) return;
          const button = parent.querySelector<HTMLElement>(
            '[aria-selected="true"]',
          );
          if (!button) return;
          const next = { x: button.offsetLeft, width: button.offsetWidth };
          tween?.kill();
          try {
            tween = gsap.fromTo(
              element,
              {
                x: previous.current?.x ?? next.x,
                scaleX: previous.current?.width ?? next.width,
                opacity: 1,
              },
              {
                x: next.x,
                scaleX: next.width,
                duration: 0.28,
                ease: "power2.out",
                overwrite: true,
              },
            );
            previous.current = next;
            parent.dataset.tabMotion = "ready";
          } catch {
            tween?.revert();
            element.removeAttribute("style");
            delete parent.dataset.tabMotion;
          }
        };
        // Initial work belongs to matchMedia; only later observer calls enter contextSafe.
        update();
        const observer = new ResizeObserver(
          contextSafe!(() => {
            const button = parent.querySelector<HTMLElement>(
              '[aria-selected="true"]',
            );
            if (
              button &&
              (button.offsetLeft !== previous.current?.x ||
                button.offsetWidth !== previous.current?.width)
            )
              update();
          }),
        );
        observer.observe(parent);
        parent
          .querySelectorAll("button")
          .forEach((button) => observer.observe(button));
        return () => {
          disposed = true;
          observer.disconnect();
          tween?.revert();
          delete parent.dataset.tabMotion;
        };
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [active], revertOnUpdate: true },
  );
  return <span ref={ref} className="tab-indicator" aria-hidden="true" />;
}
