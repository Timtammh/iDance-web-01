# Assets and launch checklist

## Local demo artwork

`public/assets/speaker.svg`, `karaoke.svg`, `pad.svg`: original SVG concept illustrations made for this prototype; **not official products or product photography**. No iDance logo is applied to these concepts. `fallback.svg`: missing-image fallback. Text wordmark is a temporary brand label, not a recreated official logo.

## Temporary editorial photography

Unsplash image URLs are listed in `src/data/demo.ts`. They are generic music, family, friends and studio scenes, not evidence of iDance product use or customer testimonials. Replace with approved/licensed brand assets; verify rights/releases for your exact commercial use. Remote delivery requires internet and fails gracefully to a local image. Google Fonts serves DM Sans with Arial fallback; self-host licensed font files for launch if external requests should be eliminated.

## Required final assets

| Asset | Recommended delivery |
|---|---|
| Official wordmark | SVG, dark + light variants; preserve clear space |
| Hero product cutout | Transparent WebP/PNG, 1600–2200 px tall, 6:7 or square |
| Product galleries | 1200+ px square, neutral/transparent background, several views |
| Use-case lifestyle | 1600×1000, readable subject composition with lower text area |
| Featured story product | 1400 px square transparent cutout |
| Video thumbnails | 1600×900, 16:9, approved YouTube/Vimeo URL |
| News cover | 1600×1000 with meaningful alt |
| Social sharing cover | 1200×630, final brand composition |
| Manuals | Approved PDF linked to matching model |

## Before public launch

- Replace all demo names, descriptions, images, stories and sample dates with approved content.
- Add official brand story, feature sources, product specifications and related products.
- Publish settings/home/about + categories/products/use cases/videos/news in Sanity.
- Add verified social links/contact details; none are invented.
- Connect a secure form backend with spam controls, delivery/error handling, retention and approved policy; only then emit confirmed generate_lead.
- Configure real Sanity IDs/CORS, GA4 ID and production site URL.
- Validate actual CMS loading, production GA4 consent/events and deployed route refresh.
- Final privacy/cookie policies, legal/company information, accessibility review, content rights, SEO prerender/SSR + OG images, sitemap and production performance review.
