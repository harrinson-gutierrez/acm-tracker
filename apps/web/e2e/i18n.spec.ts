import { test, expect } from "@playwright/test";

test("defaults to Spanish and switches to English", async ({ page }) => {
  await page.goto("/settings");
  await page.evaluate(() => localStorage.removeItem("acm.lang"));
  await page.reload();

  await expect(page.getByText("Miembros & tarifas").first()).toBeVisible();

  await page.getByText("Preferencias").click();
  await expect(page.getByText("Idioma")).toBeVisible();

  await page.getByTestId("lang-en").click();

  await expect(page.getByText("Language")).toBeVisible();
  await expect(page.getByText("Members & rates").first()).toBeVisible();

  await expect.poll(() => page.evaluate(() => localStorage.getItem("acm.lang"))).toBe("en");
  await page.reload();
  await expect(page.getByText("Members & rates").first()).toBeVisible();
});

test("language preference is stored in localStorage", async ({ page }) => {
  await page.goto("/settings");
  await page.evaluate(() => localStorage.removeItem("acm.lang"));
  await page.reload();

  await page.getByText("Preferencias").click();
  await page.getByTestId("lang-en").click();

  await expect.poll(() => page.evaluate(() => localStorage.getItem("acm.lang"))).toBe("en");
});
