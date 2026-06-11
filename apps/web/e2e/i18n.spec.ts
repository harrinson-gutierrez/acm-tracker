import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem("acm.lang"));
});

test("defaults to Spanish and switches to English", async ({ page }) => {
  await page.goto("/settings");

  await expect(page.getByText("Miembros & tarifas").first()).toBeVisible();

  await page.getByText("Preferencias").click();
  await page.getByTestId("lang-en").click();

  await expect(page.getByText("Members & rates").first()).toBeVisible();

  await page.reload();
  await expect(page.getByText("Members & rates").first()).toBeVisible();
});

test("language preference is stored in localStorage", async ({ page }) => {
  await page.goto("/settings");
  await page.getByText("Preferencias").click();
  await page.getByTestId("lang-en").click();

  const stored = await page.evaluate(() => localStorage.getItem("acm.lang"));
  expect(stored).toBe("en");
});
