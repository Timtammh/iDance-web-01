import type { RefObject } from "react";
import {
  conditions,
  gsap,
  motion,
  safelyAnimate,
  ScrollTrigger,
  useGSAP,
  visiblePlayback,
} from "../lib/motion/gsap";
export function useHomeMotion(root: RefObject<HTMLDivElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia(root);
      mm.add(conditions, ({ conditions: media }) => {
        if (media?.reduce) return;
        const disposers: Array<() => void> = [];
        const revert = safelyAnimate(() => {
          const select = gsap.utils.selector(root);
          const hero = select("[data-hero]")[0] as HTMLElement;
          let entered = false;
          let playback: ReturnType<typeof visiblePlayback> | undefined;
          const entrance = gsap.timeline({
            defaults: { ease: "power2.out" },
            onComplete: () => {
              entered = true;
              playback?.sync();
            },
          });
          entrance
            .from(
              select("[data-hero] [data-light]"),
              { opacity: 0, duration: 1 },
              0,
            )
            .from(
              select("[data-hero-product]"),
              {
                opacity: 0,
                y: motion.hero.y,
                scale: motion.hero.scale,
                duration: motion.hero.duration,
              },
              0.1,
            )
            .from(
              select("[data-hero-copy]"),
              {
                opacity: 0,
                y: 54,
                duration: 1.95,
                stagger: motion.hero.stagger,
                clearProps: "opacity,transform",
              },
              0.35,
            );
          // Focus never has to wait for a visual entrance.
          const showOnFocus = () => entrance.progress(1);
          hero.addEventListener("focusin", showOnFocus);
          disposers.push(() =>
            hero.removeEventListener("focusin", showOnFocus),
          );
          if (media?.desktop) {
            const floating = gsap.to(select("[data-hero-float]"), {
              y: -motion.hero.floatY,
              duration: motion.hero.floatDuration,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              paused: true,
            });
            const glow = gsap.to(
              select("[data-hero] [data-light-animated] .light-layer"),
              {
                x: motion.light.drift,
                y: 3,
                duration: motion.light.driftDuration,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                paused: true,
              },
            );
            playback = visiblePlayback(hero, [floating, glow], () => entered);
            disposers.push(playback.dispose);
          }
          const cta = select("[data-brand-cta]")[0] as HTMLElement | undefined;
          if (cta) {
            const reveal = gsap.from(cta.querySelectorAll("[data-cta-reveal]"), {
              opacity: 0,
              y: 36,
              duration: 1.2,
              stagger: 0.16,
              ease: "power3.out",
              immediateRender: false,
              clearProps: "opacity,transform",
              scrollTrigger: {
                trigger: cta,
                start: "top 80%",
                once: true,
                fastScrollEnd: true,
              },
            });
            const finishReveal = () => {
              reveal.scrollTrigger?.kill(false);
              reveal.progress(1);
            };
            cta.addEventListener("focusin", finishReveal);
            disposers.push(() => cta.removeEventListener("focusin", finishReveal));

            cta.querySelectorAll<HTMLElement>("[data-cta-link]").forEach((link) => {
              const hover = gsap.to(link.querySelector("svg"), {
                x: 5,
                y: link.dataset.ctaLink === "contact" ? -5 : 0,
                duration: 0.3,
                ease: "power2.out",
                paused: true,
              });
              let pointed = false;
              let focused = false;
              const sync = () => pointed || focused ? hover.play() : hover.reverse();
              const enter = (event: PointerEvent) => {
                pointed = event.pointerType === "mouse";
                sync();
              };
              const leave = () => { pointed = false; sync(); };
              const focus = () => { focused = link.matches(":focus-visible"); sync(); };
              const blur = () => { focused = false; sync(); };
              link.addEventListener("pointerenter", enter);
              link.addEventListener("pointerleave", leave);
              link.addEventListener("focus", focus);
              link.addEventListener("blur", blur);
              disposers.push(() => {
                link.removeEventListener("pointerenter", enter);
                link.removeEventListener("pointerleave", leave);
                link.removeEventListener("focus", focus);
                link.removeEventListener("blur", blur);
              });
            });
          }
          select("[data-reveal]").forEach((element: HTMLElement) => {
            // Start at the trigger, not at page initialization: offscreen content remains readable on failure.
            gsap.from(element, {
              opacity: 0,
              y: motion.reveal.y,
              duration: motion.reveal.duration,
              ease: "power2.out",
              immediateRender: false,
              clearProps: "opacity,transform",
              scrollTrigger: {
                trigger: element,
                start: motion.reveal.start,
                once: true,
                fastScrollEnd: true,
              },
            });
          });
          select("section:not([data-hero]) [data-light]").forEach(
            (light: HTMLElement) => {
              const layer = light.querySelector(".light-layer");
              const section = light.closest("section")!;
              const type = light.dataset.light;
              if (type === "refraction")
                gsap.fromTo(
                  layer,
                  { x: -motion.light.sweep, opacity: 0.2 },
                  {
                    x: motion.light.sweep,
                    opacity: 1,
                    duration: motion.light.duration,
                    ease: "sine.inOut",
                    immediateRender: false,
                    scrollTrigger: {
                      trigger: section,
                      start: "top 85%",
                      once: true,
                    },
                  },
                );
              if (media?.desktop && (type === "halo" || type === "horizon"))
                gsap.fromTo(
                  layer,
                  { y: 24 },
                  {
                    y: -24,
                    ease: "none",
                    scrollTrigger: {
                      trigger: section,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: 1,
                    },
                  },
                );
              if (media?.desktop && light.hasAttribute("data-light-animated")) {
                const drift = gsap.to(layer, {
                  x: 8,
                  y: 3,
                  duration: 8,
                  ease: "sine.inOut",
                  repeat: -1,
                  yoyo: true,
                  paused: true,
                });
                const controller = visiblePlayback(section, [drift]);
                disposers.push(controller.dispose);
              }
            },
          );
          if (media?.desktop) {
            const section = select("[data-featured]")[0];
            if (section) {
              gsap.fromTo(
                select("[data-feature-product]"),
                { y: motion.feature.productY / 2 },
                {
                  y: -motion.feature.productY / 2,
                  ease: "none",
                  scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: motion.feature.scrub,
                  },
                },
              );
              gsap.fromTo(
                select("[data-feature-depth]"),
                { y: -motion.feature.lightY / 2 },
                {
                  y: motion.feature.lightY / 2,
                  ease: "none",
                  scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: motion.feature.scrub,
                  },
                },
              );
            }
          }
        });
        return () => {
          disposers.forEach((dispose) => dispose());
          revert();
        };
      });
      // ContentProvider mounts after async CMS fetch. Refresh only for actual layout/assets changes.
      let disposed = false;
      let timer: ReturnType<typeof setTimeout>;
      const refresh = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (!disposed) ScrollTrigger.refresh();
        }, 120);
      };
      const container = root.current!;
      container.addEventListener("load", refresh, true);
      container.addEventListener("error", refresh, true);
      const resize = new ResizeObserver(refresh);
      resize.observe(container);
      void document.fonts.ready.then(() => {
        if (!disposed) refresh();
      });
      refresh();
      return () => {
        disposed = true;
        clearTimeout(timer);
        resize.disconnect();
        container.removeEventListener("load", refresh, true);
        container.removeEventListener("error", refresh, true);
        mm.revert();
      };
    },
    { scope: root },
  );
}

export function useProductReveal(
  root: RefObject<HTMLDivElement | null>,
  key: string,
) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia(root);
      mm.add(conditions, ({ conditions: media }) => {
        if (media?.reduce) return;
        return safelyAnimate(() => {
          const cards = root.current?.querySelectorAll("[data-card-reveal]");
          if (cards?.length)
            gsap.from(cards, {
              opacity: 0,
              y: 60,
              duration: 1.8,
              stagger: motion.reveal.stagger,
              ease: "power2.out",
              immediateRender: false,
              clearProps: "opacity,transform",
              scrollTrigger: {
                trigger: root.current,
                start: "top 85%",
                once: true,
                fastScrollEnd: true,
              },
            });
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [key], revertOnUpdate: true },
  );
}
