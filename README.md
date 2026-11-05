# iDance brand website

React 19 + TypeScript + Vite, React Router, CSS Modules, GSAP/ScrollTrigger, Sanity and consent-gated GA4. English preview content. No checkout or customer accounts.

## Local development

Requires Node 22.12+ (developed on Node 24).

```sh
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173. Demo mode works without accounts. `npm run build`, `npm run typecheck`, `npm run lint`. `npm run preview` serves the production bundle. The lockfile records exact installed versions.

## Content modes

`VITE_CONTENT_SOURCE=demo` loads local illustrative content in `src/data/demo.ts`. Product concepts are explicitly labelled; news is sample editorial material. Lifestyle photographs are temporary Unsplash images and do not depict verified iDance products. No official product specifications are invented.

`VITE_CONTENT_SOURCE=sanity` uses the published-only, token-free client in `src/lib/sanity/client.ts`. Queries are centralized in `queries.ts`, API date defaults to `2026-01-01`. Missing configuration, unpublished required settings or query failures show an error and Retry, never a silent demo fallback. ContentProvider owns loading/error state. The first version fetches the complete public catalogue; add pagination/server search before scaling to a large catalogue.

Images use the Sanity URL builder, width 1440 and automatic format. Rich text uses Portable Text, not raw HTML. Studio images require alt text and support hotspot. Keep features and specifications source-backed.

## Sanity setup

1. Create a project in your Sanity account and a **public** dataset (for example `production`). No account or remote data has been created by this implementation.
2. Copy `studio/.env.example` to `studio/.env`, set `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET`.
3. In project API settings, add `http://localhost:5173` and your production site URL to CORS origins. Add `http://localhost:3333` for Studio; permit credentials only for trusted Studio origins when needed for editor authentication.
4. Install and start Studio:

```sh
cd studio
npm install
npm run dev
```

Or run `npm run studio` from the root after installing Studio dependencies. Studio explicitly refuses to start without a project ID.

5. Create and publish one `siteSettings`, one `homePage` and one `aboutPage` document. These are singleton-by-editor-convention: do not create multiple copies. Add categories first, then products referencing categories; use cases reference categories and featured home content references products/videos. Add news posts with Portable Text body. Studio validates required titles, slugs, image alt and URL fields.
6. Configure home headline, description, section headings and CTA; select featured products/videos. The first selected featured product supplies the featured story and fallback hero image. Optionally upload a separate hero cutout. Navigation paths must be internal paths beginning `/`.
7. Set root `.env` values: `VITE_CONTENT_SOURCE=sanity`, `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`, `VITE_SANITY_API_VERSION`, `VITE_SITE_URL`. Restart Vite or rebuild.
8. To deploy Studio, explicitly run `npm run deploy` inside `studio` after choosing your project and reviewing content. This is **not** run automatically. `npm run build` validates the Studio build with configured environment.

Never put secret tokens in `VITE_*`; these values are public. Private datasets and draft preview require a secure server-side implementation. Contact form contents must not be written to the public dataset. No seed script runs or writes remote content.

## Analytics and privacy

`src/lib/analytics/index.ts` provides typed events. Set `VITE_GA4_MEASUREMENT_ID=G-...` in a production build. Missing ID is a no-op. Development does not load GA. Consent accepts/rejects have equally prominent buttons; no GA script loads until accepted. Choice is stored locally if storage is available. Footer reopens settings. Withdrawal sets `ga-disable-*`, updates consent to denied and gates subsequent events (it cannot undo previously transmitted events).

SPA strategy: configure `send_page_view:false`; page metadata updates before manual `page_view`. Deduplicate consecutive pathname views, including StrictMode. Query and hash changes do not create page views. Analytics receives origin + pathname only, never product search queries, contact form values or URL query parameters. Returning from another route counts as a new page view. Referrer is sanitized to the site origin.

In GA4 Enhanced Measurement **disable history-based page changes** to prevent duplicate page views. Disable automatic file downloads and video engagement if retaining our manual `file_download` and `video_open`. Disable site-search measurement to avoid query collection. Review other automatic collection for your market and final privacy policy. `generate_lead` is typed but deliberately never called by the demo form; invoke only after an actual backend confirms success.

Tracked actions: collection/detail views, product selections, category filters, hero CTAs, configured video opens, enquiry clicks, manual downloads. Product data uses item_id, item_name, item_category. No name/email/telephone/message is sent.

### Verify actual collection

1. Build and run `npm run preview` with a real measurement ID in `.env`.
2. Clear the `idance-analytics` storage key. In Network, confirm no `googletagmanager.com` or GA collect request before accepting or after rejecting.
3. Accept and open GA4 Realtime. Navigate between different routes. There should be one page_view per actual pathname change; filter/query/hash changes should not add page views.
4. For DebugView use Google Tag Assistant on the preview deployment, enable debug for that test browser, and check the typed events. Do not ship debug flags globally.
5. Inspect payloads for query/form data, verify manual download/video events are not duplicated, then reject via footer and confirm later interactions create no events.

Real GA receipt cannot be verified without a valid measurement ID/property. Privacy page is explicitly pending and is not legal policy. Obtain approved policies and market-appropriate consent review before launch.

## Interaction and accessibility

Native `<dialog>` supplies focus containment; Escape/backdrop/close dismiss and effect cleanup returns focus to trigger and stops iframe playback. Players load only after interaction. Only YouTube watch/short URLs and numeric Vimeo URLs are accepted; missing/unsupported URL gets an honest unavailable state. No auto-playing homepage media.

Product tabs support arrows/Home/End; search and filters use native controls. Images have dimensions, descriptive alt and a local fallback. Hero loads eagerly, other images lazily. GSAP uses matchMedia cleanup and respects reduced motion; no scroll hijack. Light animations use opacity/transform, with lower mobile intensity.

## Visual adjustment

- `src/components/effects/LightAtmosphere.tsx` and `.module.css`: spotlight, horizon, halo, refraction, reflection; configurable variant/intensity/color/position/animated/className. `position` controls radial placement; geometric spotlight/horizon retain intentional stage anchors.
- `src/sections/home/Home.module.css`: hero product proportion, elliptical light edges, editorial compositions and mobile rearrangement.
- `src/styles/global.css`: colour/spacing/type tokens, shared cards, navigation, dialogs and page layouts.
- `src/sections/home/Home.tsx`: homepage composition and GSAP reveal lifecycle.

## Deployment and SEO

Set VITE_SITE_URL to the canonical HTTPS domain at build time. Each page updates title, description, canonical and Open Graph tags. Real CMS products emit Product structured data using only available name, description, category and images; demo products do not emit product schema. No invented prices, stock, ratings or offers.

**Vite SPA metadata is client-side**. It is not equivalent to SSR and many social crawlers will only see index.html. Add prerendering/SSR for product/article routes and server-generated OG previews, plus a real sitemap/robots strategy before SEO-led launch. No architecture migration is performed here.

Netlify fallback is provided in `public/_redirects`; Vercel rewrite in `vercel.json`. Other hosts must route non-asset paths to index.html, otherwise direct-route refresh fails. Vite local server handles refresh during development. Check redirects and 404 HTTP status handling on the actual host.

## Verification

```sh
npm run typecheck
npm run lint
npm run build
npx playwright test
```

The browser suite launches Vite itself; Google Chrome must be installed (the config uses the local Chrome channel). Covers viewport overflow, tabs, URL filters, slug routing/refresh, search focus restore, video unavailable state, form honesty, consent and no-GA-before-choice. No production deployment, real CMS fetch or real analytics receipt is implied by local tests.

See `ASSETS.md` for replacement artwork and launch checklist.

### Verification record and analytics regression test

See `VERIFICATION.md` for checks actually run and unresolved dependency advisories. `npx playwright test --config playwright.analytics.config.ts` tests a production bundle with a fake ID and a stubbed Google script (no actual collection). Run `npm run build` afterwards to restore your normal configured bundle. This supplements, but does not replace, actual GA4 Realtime/DebugView validation.

## GSAP motion implementation

The coordinated animation system now uses GSAP + ScrollTrigger + `@gsap/react` with scoped `useGSAP`, responsive/reduced-motion matchMedia, visibility-gated repeat animations and lifecycle cleanup. See `MOTION.md` for section-by-section behavior, exact tuning files, CSS/GSAP ownership and motion regression tests. The old CSS light drift and duplicate product-image hover transform were removed.
