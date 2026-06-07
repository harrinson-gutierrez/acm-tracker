import { test, expect } from "@playwright/test";

test("create project, add task, log time, see real cost", async ({ page }) => {
  const projectName = `E2E Proj ${Date.now()}`;

  await page.goto("/projects");
  await page.getByLabel("Nombre del proyecto").fill(projectName);
  await page.getByRole("button", { name: "+ Crear" }).click();

  const link = page.getByRole("link", { name: new RegExp(projectName) });
  await expect(link).toBeVisible();
  await link.click();

  await expect(page).toHaveURL(/\/projects\/.+/);
  await page.getByLabel("Título de la tarea").fill("Tarea E2E");
  await page.getByRole("button", { name: "+ Tarea" }).click();
  await expect(page.getByText("Tarea E2E")).toBeVisible();

  page.once("dialog", (d) => d.accept("60"));
  await page.getByRole("button", { name: "+ tiempo" }).first().click();

  // 60 min at owner rate $45/h = $45.00 ; appears in the cost cell
  await expect(page.getByText("$45", { exact: false })).toBeVisible({ timeout: 8000 });
});
