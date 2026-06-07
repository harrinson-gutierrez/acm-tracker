import { test, expect } from "@playwright/test";

test("create and delete a document", async ({ page }) => {
  const title = `Doc E2E ${Date.now()}`;
  await page.goto("/documents");

  await page.getByLabel("Título").fill(title);
  await page.getByRole("button", { name: "+ Nuevo" }).click();

  await expect(page.getByText(title)).toBeVisible();

  await page.getByRole("button", { name: `Borrar ${title}` }).click();
  await expect(page.getByText(title)).toHaveCount(0);
});
