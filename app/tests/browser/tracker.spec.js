import { test, expect } from "@playwright/test";

test("dashboard filters, search, keyboard shortcut and every local certificate", async ({ page, request }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Learning, tracked." })).toBeVisible();
  const cards = page.locator(".activity-card");
  const allCount = await cards.count();
  expect(allCount).toBeGreaterThan(0);
  await page.getByRole("button", { name: /^Courses \d/ }).click();
  await expect(page.locator(".activity-card .type-label")).toHaveText(Array(await cards.count()).fill("Course"));
  await page.getByRole("button", { name: /^Show October filter/ }).click();
  await expect(page.locator(".month-label > span")).toHaveText(["October"]);
  const search = page.getByRole("searchbox", { name: "Search activities" });
  await search.fill("Cloud.ru");
  await expect(page.getByRole("heading", { name: "ML in production", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fundamentals of ML Systems and Data Processing", exact: true })).toBeVisible();
  await search.fill("no-matching-activity-xyz");
  await expect(page.getByText("No matching activities found.")).toBeVisible();
  await search.fill("");
  await page.getByRole("button", { name: /^Clear October filter/ }).click();
  await page.getByRole("button", { name: /^All \d/ }).click();
  await expect(cards).toHaveCount(allCount);
  await search.blur();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+k" : "Control+k");
  await expect(search).toBeFocused();

  const certificates = page.locator('a[href^="/"][href*="/certificates/"]');
  expect(await certificates.count()).toBeGreaterThan(0);
  for (const link of await certificates.all()) {
    const url = await link.getAttribute("href");
    expect(url).toMatch(/\/certificates\/\d{4}\/.*\.pdf$/);
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
  }
  expect(errors).toEqual([]);
});

test("mobile timeline fits the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Learning, tracked." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole("searchbox").fill("Cloud.ru");
  await expect(page.locator(".activity-card").first()).toBeVisible();
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});
