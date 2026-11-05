import { test, expect, type Page } from "@playwright/test";
async function motionState(page: Page) {
  return page.evaluate(async () => {
    const path = "/src/lib/motion/gsap.ts";
    const { gsap, ScrollTrigger } = await import(/* @vite-ignore */ path);
    const loops = gsap.globalTimeline
      .getChildren(true, true, true)
      .filter((a: { repeat: () => number }) => a.repeat() === -1);
    return {
      triggers: ScrollTrigger.getAll().length,
      scrubs: ScrollTrigger.getAll().filter(
        (s: { vars: { scrub?: unknown } }) => s.vars.scrub,
      ).length,
      loops: loops.length,
      playing: loops.filter((a: { paused: () => boolean }) => !a.paused())
        .length,
    };
  });
}
test("desktop lifecycle, quick scroll, tab visibility and no route leaks", async ({
  page,
}) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "warning") problems.push(m.text());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Reject analytics" }).click();
  await expect
    .poll(async () => (await motionState(page)).playing)
    .toBeGreaterThan(0);
  const baseline = await motionState(page);
  expect(baseline.scrubs).toBeGreaterThan(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(async () => (await motionState(page)).playing).toBe(0);
  await page.evaluate(() => {
    delete (document as unknown as { hidden?: boolean }).hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect
    .poll(async () => (await motionState(page)).playing)
    .toBeGreaterThan(0);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expect.poll(async () => (await motionState(page)).playing).toBe(0);
  await page.evaluate(() => scrollTo(0, 0));
  await expect
    .poll(async () => (await motionState(page)).playing)
    .toBeGreaterThan(0);
  for (let i = 0; i < 3; i++) {
    await page.getByRole("link", { name: "About", exact: true }).click();
    await expect.poll(async () => (await motionState(page)).triggers).toBe(0);
    expect((await motionState(page)).loops).toBe(0);
    await page.getByRole("link", { name: "iDance home" }).click();
    await expect
      .poll(async () => (await motionState(page)).playing)
      .toBeGreaterThan(0);
    expect((await motionState(page)).loops).toBe(baseline.loops);
    expect((await motionState(page)).triggers).toBeLessThanOrEqual(
      baseline.triggers,
    );
  }
  for (let i = 0; i < 4; i++) {
    await page
      .getByRole("tab", {
        name: i % 2 ? "Popular" : "New releases",
        exact: true,
      })
      .click();
  }
  expect((await motionState(page)).triggers).toBeLessThanOrEqual(
    baseline.triggers,
  );
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: "test-results/motion-desktop.png" });
  expect(problems).toEqual([]);
});
test("mobile and reduced motion remove continuous motion and scrub", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Reject analytics" }).click();
  expect((await motionState(page)).loops).toBe(0);
  expect((await motionState(page)).scrubs).toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(async () => (await motionState(page)).triggers).toBe(0);
  expect((await motionState(page)).loops).toBe(0);
  await expect(page.locator("[data-hero-copy]").first()).toHaveCSS(
    "opacity",
    "1",
  );
  await page.getByRole("tab", { name: "New releases" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Little Sound Makers");
  await page.screenshot({ path: "test-results/motion-mobile-reduced.png" });
  await page.setViewportSize({ width: 1440, height: 900 });
  expect((await motionState(page)).loops).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect
    .poll(async () => (await motionState(page)).scrubs)
    .toBeGreaterThan(0);
});
test("delayed content and unavailable images keep triggers and CTA usable", async ({
  page,
}) => {
  await page.route("**/src/data/demo.ts*", async (route) => {
    await new Promise((r) => setTimeout(r, 400));
    await route.continue();
  });
  await page.route("**/assets/*.svg", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect
    .poll(async () => (await motionState(page)).triggers)
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Reject analytics" }).click();
  await page.locator("[data-hero] .button").focus();
  await expect(page.locator("[data-hero-copy]").first()).toHaveCSS(
    "opacity",
    "1",
  );
  await page.locator("[data-hero] .button").click();
  await expect(page).toHaveURL(/\/products$/);
});
test("failed animation initialization restores readable static content", async ({
  page,
}) => {
  const warnings: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "warning") warnings.push(m.text());
  });
  await page.route("**/src/hooks/useHomeMotion.ts*", async (route) => {
    const response = await route.fetch();
    let source = await response.text();
    expect(source).toContain("const showOnFocus");
    source = source.replace(
      "const showOnFocus = () => entrance.progress(1);",
      'throw new Error("Injected animation setup failure");\nconst showOnFocus = () => entrance.progress(1);',
    );
    await route.fulfill({ response, body: source });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Reject analytics" }).click();
  expect(warnings.some((w) => w.includes("Motion unavailable"))).toBe(true);
  await expect(page.locator("[data-hero-copy]").first()).toHaveCSS(
    "opacity",
    "1",
  );
  await page.locator("[data-hero] .button").click();
  await expect(page).toHaveURL(/\/products$/);
});
