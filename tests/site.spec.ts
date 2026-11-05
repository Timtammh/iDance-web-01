import { test, expect } from "@playwright/test";
test("responsive pages, functional catalogue, dialogs and honest form", async ({
  page,
}) => {
  const errors: string[] = [];
  const ga: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (/google-analytics|googletagmanager/.test(r.url())) ga.push(r.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reject analytics" }),
  ).toBeVisible();
  expect(ga).toHaveLength(0);
  await page.getByRole("button", { name: "Reject analytics" }).click();
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 80));
      }
      scrollTo(0, 0);
    });
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
  }
  await page.getByRole("tab", { name: "New releases" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Little Sound Makers");
  await expect(page.getByRole("tabpanel")).not.toContainText(
    "Pulse Party Speaker",
  );
  await page
    .getByRole("button", { name: "Search products", exact: true })
    .click();
  await page.getByRole("searchbox").fill("zzzzz");
  await expect(
    page.getByText("No products found. Try another name."),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Search products", exact: true }),
  ).toBeFocused();
  await page.goto("/products?category=karaoke");
  await expect(page.getByText("1 products")).toBeVisible();
  await page.getByRole("searchbox").fill("zzz");
  await expect(page.getByText("No sound found. Yet.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByText("4 products")).toBeVisible();
  await page.goto("/products/pulse-party-speaker");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Pulse Party Speaker", exact: true }),
  ).toBeVisible();
  await page.goto("/products/missing");
  await expect(page.getByText("Let’s find your way back.")).toBeVisible();
  await page.goto("/tv");
  await page
    .getByRole("button", { name: /Meet your next party starter/ })
    .click();
  await expect(page.getByText("The film is on its way.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: /Meet your next party starter/ }),
  ).toBeFocused();
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Preview");
  await page.getByLabel("Email address").fill("preview@example.com");
  await page.getByLabel("Subject").fill("Test");
  await page.getByLabel("Your message").fill("Testing the demo");
  await page.getByRole("button", { name: "Check enquiry" }).click();
  await expect(page.getByRole("status")).toContainText("Nothing has been sent");
  await page.goto("/news/make-room-for-music");
  await expect(
    page.getByText("Sample story — not an official brand announcement."),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(ga).toHaveLength(0);
});
