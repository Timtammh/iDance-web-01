# iDance motion system

GSAP + ScrollTrigger + @gsap/react are the single coordinated motion system. CSS remains responsible for static light geometry, colour/focus states and independent simple link/button transitions. No custom scrolling, pinning, per-frame React state or permanent will-change.

## Ownership and tuning

| Area | Implementation | Default |
|---|---|---|
| Hero entrance | `src/hooks/useHomeMotion.ts` | Glow at 0s; product at 0.1s, duration 1s, y 24px, scale .97; text blocks from .35s, .1s stagger, .65s each. Main entrance completes ~1.2s. |
| Hero floating | `src/lib/motion/gsap.ts` → `motion.hero` | 5px, 3.6s each direction, sine.inOut; desktop only, begins after entrance. |
| Section reveal | `motion.reveal`, `useHomeMotion.ts` | y 24px, .75s, power2.out, top 85%, once. Includes collection heading, use cases, featured, experience and news. |
| Product group reveal | `useProductReveal` in `useHomeMotion.ts` | Whole card wrappers, 20px, .6s, .09s stagger. Data switches immediately; old tab context reverts. |
| Refraction sweep | `motion.light` | 32px each side, 1.8s, once per section. No repeat sweep. |
| Scroll light depth | `useHomeMotion.ts` | Horizon/halo 8px each side, scrub 1; desktop only. |
| Featured depth | `motion.feature` | Product total travel 28px; background total travel 20px opposite direction, scrub 1. No pin. Text only has normal reveal. |
| Product hover/focus | `useProductHover.ts`, `motion.hover` | Card -4px, image scale 1.03, .28s. One reversible timeline; only hover-capable fine pointers. Keyboard always retains CSS focus outline. |
| Tab indicator | `AnimatedTabIndicator.tsx` | .28s transform/scaleX; CSS active border fallback. Resize observer is contextSafe and cleaned. |
| Navigation/buttons | `global.css` | Short underline scale; small existing button transform/background transition. These elements are not also transformed by GSAP. |

Most timings/distances are in `src/lib/motion/gsap.ts`; choreography offsets and reveal-specific values are in `src/hooks/useHomeMotion.ts`. Per-section colour/intensity remains explicit on `<Light>` in `src/sections/home/Home.tsx`. Light shape, static blur, masks/gradients and mobile attenuation are in `src/components/effects/LightAtmosphere.module.css`.

## Light layers

`LightAtmosphere.tsx` renders real decorative span layers for spotlight beam + ambient light, refraction streak, radial halo, horizon and floor reflection. Layers are aria-hidden and pointer-events:none. CSS draws the light; GSAP changes opacity/transform only. Home's scoped motion hook orchestrates these layers, so there is no competing component animation. The old CSS drift keyframes were removed.

Cyan/violet belongs to dark sections. Collection and featured sections use pearl/pale cyan with lower intensity. The original alternating dark/light layout is preserved.

## Lifecycle and accessibility

- All GSAP setup uses scoped `useGSAP` and `gsap.matchMedia`. Contexts and matchMedia revert on route unmount; tab groups revert on content changes.
- Hero product entrance wrapper, float wrapper and statically rotated image are separate. Featured image depth and section reveal likewise use separate elements. Card group reveal wrapper is separate from hover card/image. No CSS transitions compete for these transform/opacity properties.
- Product hover events play/reverse a pre-created context-owned timeline; events do not create tweens. Resize-triggered indicator animation uses contextSafe and an explicit disposed guard.
- IntersectionObserver + document visibility gate all repeating floats/light drifts. They pause offscreen or in an inactive tab, and resume without restarting.
- GSAP starts ordinary reveals at their trigger with immediateRender:false. Static CSS is visible by default. Failed setup reverts partially created animations. Hero focus completes the entry immediately; buttons never become disabled or pointer-blocked.
- Image load/error capture, document.fonts.ready and a debounced container ResizeObserver refresh ScrollTrigger after genuine layout changes. ContentProvider mounts Home after async content resolves. No render-by-render refresh. All observers/listeners/timers are cleaned.
- Mobile (<768px): no repeating float/light drift and no scroll scrub/parallax; simple reveals and one-off refraction remain. Light CSS attenuates intensity to 65% below 700px.
- Reduced motion: no hero entrance, reveal, sweep, drift, scrub or animated tab indicator. Static content and active tab border appear directly. CSS transitions/animations are disabled by the existing global rule.

## Verification

`npx playwright test --workers=1` includes the previous functional/a11y suite and five dedicated tests in `tests/motion.spec.ts`:

- Desktop/mobile/reduced-motion, breakpoint changes and rapid scroll-to-bottom/back.
- Three Home/About return trips: zero ScrollTriggers/repeating tweens on About, no count growth after returning.
- Repeated product-tab changes do not accumulate triggers.
- Continuous animations pause offscreen; simulated document visibilitychange pauses/resumes all repeats.
- Delayed async content follows the same provider path as CMS and creates triggers after mount. Failed images do not block copy or CTA.
- Injected error after the Hero timeline is created verifies partial-initialization rollback and usable CTA.
- Card hover was measured at -4px / scale 1.03; tab indicator was sampled between its old and new positions while new data appeared immediately.
- Normal flow has no page exceptions or console warnings. The injected failure intentionally logs one diagnostic warning per StrictMode setup.

This is local Chrome validation, not proof of performance on every phone. Live Sanity content and real device performance still need production credentials/content and hardware testing.

### Sanity-mode integration test

`npx playwright test --config playwright.cms.config.ts` starts a separate local server on port 5174 with `VITE_CONTENT_SOURCE=sanity`. All Sanity requests are intercepted; no account or remote dataset is accessed. A GROQ-shaped fixture exercises the actual Sanity client, error/retry UI, image URL builder and async provider. Product-grid trigger start positions are checked against actual DOM geometry at 375/768/1440px after resize (within 2px). Natural image width, route cleanup and CMS product rendering are checked too.

The CMS test uses an isolated output folder and does not change `.env` or the normal production build configuration.
