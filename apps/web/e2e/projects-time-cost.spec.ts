import { test, expect } from "@playwright/test";

test("create project, add task, log time via modal, see real cost", async ({ page }) => {
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

  // open the time-entry modal from the task row
  await page.getByRole("button", { name: "Agregar tiempo" }).first().click();
  await expect(page.getByRole("dialog", { name: "Registrar tiempo" })).toBeVisible();
  await page.getByLabel("Minutos").fill("60");
  await page.getByRole("button", { name: "Guardar" }).click();

  // 60 min at owner rate $45/h = $45 ; appears in the task cost cell
  await expect(page.getByText("$45", { exact: false }).first()).toBeVisible({ timeout: 8000 });
});

test("register time from cabina dock modal", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "+ registrar tiempo" }).click();
  await expect(page.getByRole("dialog", { name: "Registrar tiempo" })).toBeVisible();
  // a project + task should be preselectable (Helios seeded)
  await expect(page.getByLabel("Proyecto", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("dialog", { name: "Registrar tiempo" })).toHaveCount(0);
});
