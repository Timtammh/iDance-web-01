# Local verification — 6 November 2026

## Passed

- Root `npm run build`, `npm run typecheck`, `npm run lint`.
- Studio `npm run typecheck` and local `sanity build` using non-production project ID `localtest`. This checks bundling only; no remote project was created/read/written.
- Playwright / local Google Chrome: 375, 768, 1024, 1440 px viewport checks with no horizontal overflow.
- Actual product tab changes, query-backed category/name filters, empty results and clear filters.
- Valid product slug, invalid slug not found, direct route refresh in Vite.
- Search no-results and Escape focus restoration; video unavailable dialog and focus restoration.
- Mobile navigation Tab focus loop, Escape and aria-expanded; keyboard product tabs.
- All rendered images loaded with non-zero natural dimensions in reduced-motion run (local fallback protects failed remote images).
- Contact required validation and explicit no-submission feedback; sample article labels.
- No uncaught page errors in the main interaction flow.
- No GA request before choice or after rejection in normal demo run.
- Separate production-bundle test with fake `G-LOCALTEST` ID and intercepted Google script: script loaded once only after accept, one initial page_view, one route page_view, no filter/query page_view, no private query in page_view payload, and no later events after consent withdrawal. **No real GA data was transmitted.** Normal production build restored without the fake test ID afterward.

## Not verified / remaining

- Real Sanity dataset content, project permissions and CORS (account/project ID not supplied).
- Real GA4 Realtime/DebugView receipt (measurement ID/property not supplied).
- Real video playback (URLs not supplied); absent-video handling is tested.
- Contact delivery (backend intentionally absent).
- Production host rewrites, HTTP status, performance on real mobile hardware, prerender/SSR and social previews.
- Final brand artwork/content rights, formal legal/privacy policy, production accessibility audit.

## Dependency audit

Compatible `npm audit fix` was attempted. Root reported 7 moderate findings in the development TypeScript ESLint/minimatch chain. Studio, after moving to the current stable release, reported 20 transitive findings (17 moderate, 3 high), including CLI tooling dependencies js-yaml, smol-toml and undici. These are unresolved; this is not a clean security audit. The package manager suggests disruptive downgrade/major changes for some entries. Do not deploy Studio publicly before reviewing and resolving applicable advisories. No broad forced dependency override was applied without compatibility evidence.

Commands for later recheck:

```sh
npm audit
npm --prefix studio audit
npx playwright test
npx playwright test --config playwright.analytics.config.ts
npm run build
```

The analytics test temporarily builds with a fake measurement ID; rebuild normally afterwards. Tests use the installed Google Chrome channel. Screenshots from the UI suite are in `test-results/home-{width}.png` (ignored by git).

## GSAP animation update

- Added @gsap/react 2.1.2 and replaced the old Home useEffect animation setup with scoped useGSAP/matchMedia.
- Build, lint and root typecheck passed after the implementation change.
- Existing functional and accessibility tests passed with the new card wrappers and animation behavior.
- Five dedicated motion tests passed: desktop lifecycle/rapid scrolling/route cleanup; mobile and reduced-motion; delayed provider content and failed product images; partial Hero initialization failure with static rollback; measured card hover and tab indicator interpolation.
- Normal desktop motion test: no page errors or console warnings, zero ScrollTriggers/repeating tweens after navigating to About, no count growth across three return trips or repeated tabs.
- Inactive-tab gating tested via simulated document.hidden + visibilitychange; offscreen gating tested via actual scrolling and IntersectionObserver.
- Live Sanity content was not queried. Delayed demo loading exercises the shared asynchronous ContentProvider mounting path; actual CMS asset changes still need validation with the real dataset.
- Local Chrome desktop frame sample during programmatic native scrolling: 119 measured frames, p95 17.6 ms, max 18.4 ms, zero frames over 50 ms. This is a local diagnostic, not a cross-device performance guarantee.
- Motion configuration and ownership are documented in MOTION.md.

### Additional Sanity adapter verification

The dedicated Sanity-mode browser suite passed with network interception. It covers actual client/query/image-builder execution, delayed response, error/retry with no silent demo fallback, valid generated image loading, and product-grid trigger geometry after 375/768/1440px resizing (within 2px). Route cleanup and CMS product rendering also passed. This uses fixtures, not a live remote Sanity dataset. Hero headline now retains a word separator across its visual line break for text reading/accessibility.
