import { test, expect } from "@playwright/test";

test("create, toggle and delete a notification rule", async ({ page }) => {
  const event = `Evento E2E ${Date.now()}`;
  await page.goto("/notifications");

  await page.getByLabel("Evento").fill(event);
  await page.getByLabel("Condición").fill("condición e2e");
  await page.getByRole("button", { name: "+ Regla" }).click();

  await expect(page.getByText(event)).toBeVisible();

  // toggle off then verify it still exists (toggle is functional, not destructive)
  await page.getByRole("button", { name: `Activar regla ${event}` }).click();
  await expect(page.getByText(event)).toBeVisible();

  await page.getByRole("button", { name: `Borrar regla ${event}` }).click();
  await expect(page.getByText(event)).toHaveCount(0);
});
