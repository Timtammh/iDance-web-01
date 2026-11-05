import { test, expect } from "@playwright/test";
import { demoContent } from "../../src/data/demo";

// GROQ-shaped fixture only. No request reaches a Sanity service.
const picture = {
  _type: "image",
  asset: {
    _type: "reference",
    _ref: "image-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-800x700-png",
  },
  alt: "Mock CMS product visual",
};
const fixture = {
  ...demoContent,
  demo: false,
  products: demoContent.products.map((p) => ({
    ...p,
    demo: false,
    name: `CMS ${p.name}`,
    images: [picture],
  })),
  news: demoContent.news.map((p) => ({ ...p, demo: false, cover: picture })),
  videos: demoContent.videos.map((v) => ({ ...v, thumbnail: picture })),
  useCases: demoContent.useCases.map((u) => ({ ...u, image: picture })),
  home: {
    ...demoContent.home,
    heroImage: picture,
    headline: "CMS Sound Comes to Life.",
  },
};

test("real Sanity adapter: delayed response, error/retry, image builder and motion lifecycle", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let queries = 0;
  const imageRequests: string[] = [];
  await page.route("**/*sanity.io/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/data/query/")) {
      queries++;
      await new Promise((resolve) => setTimeout(resolve, 350));
      if (queries <= 2) {
        // StrictMode starts/cancels one initial provider effect, so both initial fetches fail.
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              type: "queryParseError",
              description: "Mock CMS unavailable",
            },
          }),
        });
      } else {
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({ result: fixture }),
        });
      }
    } else if (url.includes("/images/")) {
      imageRequests.push(url);
      await new Promise((resolve) => setTimeout(resolve, 200));
      await route.fulfill({
        contentType: "image/svg+xml",
        path: "public/assets/speaker.svg",
      });
    } else {
      await route.abort();
    }
  });
  await page.goto("/");
  await expect(page.getByText("Setting the stage…")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "We couldn’t load the content." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Bring Your Sound to Life." }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "CMS Sound Comes to Life.",
  );
  await page.getByRole("button", { name: "Reject analytics" }).click();
  const state = () =>
    page.evaluate(async () => {
      const path = "/src/lib/motion/gsap.ts";
      const { ScrollTrigger } = await import(/* @vite-ignore */ path);
      return ScrollTrigger.getAll().map(
        (trigger: { start: number; end: number }) => ({
          start: trigger.start,
          end: trigger.end,
        }),
      );
    });
  await expect.poll(async () => (await state()).length).toBeGreaterThan(0);
  await expect(page.locator("[data-hero-product] img")).toHaveJSProperty(
    "complete",
    true,
  );
  await expect
    .poll(() =>
      page
        .locator("[data-hero-product] img")
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect.poll(() => imageRequests.length).toBeGreaterThan(0);
  expect(imageRequests.every((url) => url.includes("w=1440"))).toBe(true);
  expect(
    (await state()).every(
      (s) => Number.isFinite(s.start) && Number.isFinite(s.end),
    ),
  ).toBe(true);
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const path = "/src/lib/motion/gsap.ts";
          const { ScrollTrigger } = await import(/* @vite-ignore */ path);
          const trigger = ScrollTrigger.getAll().find(
            (entry: { trigger?: Element }) =>
              entry.trigger?.id === "home-products",
          );
          if (!trigger) return Infinity;
          const expected =
            trigger.trigger.getBoundingClientRect().top +
            scrollY -
            innerHeight * 0.85;
          return Math.abs(trigger.start - expected);
        }),
      )
      .toBeLessThan(2);
  }
  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect.poll(async () => (await state()).length).toBe(0);
  await page.getByRole("link", { name: "iDance home" }).click();
  await expect.poll(async () => (await state()).length).toBeGreaterThan(0);
  await page.getByRole("link", { name: "Products", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "CMS Pulse Party Speaker" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
