import { test, expect } from "@playwright/test";

test("project detail tabs switch sections", async ({ page }) => {
  // open the first project
  await page.goto("/projects");
  await page.locator("a[href^='/projects/']").first().click();
  await expect(page).toHaveURL(/\/projects\/.+/);

  // Resumen shows the cost panel
  await expect(page.getByText("Costo real · acumulado")).toBeVisible();

  // Tareas tab hides the cost panel, shows tasks
  await page.getByRole("button", { name: "Tareas", exact: true }).click();
  await expect(page.getByText("Costo real · acumulado")).toHaveCount(0);
  await expect(page.getByText("Tareas · tiempo + costo", { exact: false })).toBeVisible();

  // Documentos tab stays on the project and shows its scoped documents
  await page.getByRole("button", { name: "Documentos", exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/.+/);
  await expect(page.getByText("Documentos ·", { exact: false })).toBeVisible();

  // Tiempo tab shows the chronological timeline, not the tasks table
  await page.getByRole("button", { name: "Tiempo", exact: true }).click();
  await expect(page.getByText("Tiempo · cronología de registros")).toBeVisible();
  await expect(page.getByText("Tareas · tiempo + costo", { exact: false })).toHaveCount(0);

  // Equipo tab shows the project team panel
  await page.getByRole("button", { name: "Equipo", exact: true }).click();
  await expect(page.getByText("Equipo · tiempo registrado", { exact: false })).toBeVisible();
});

test("documents sidebar filters by phase", async ({ page }) => {
  const title = `Doc Kickoff ${Date.now()}`;
  await page.goto("/documents");

  // select Kickoff phase, then create a doc -> it gets that phase
  await page.getByRole("button", { name: "Kickoff" }).click();
  await page.getByLabel("Título").fill(title);
  await page.getByRole("button", { name: "+ Nuevo" }).click();
  await expect(page.getByText(title)).toBeVisible();

  // switch to a different phase -> the kickoff doc is filtered out
  await page.getByRole("button", { name: "Ventas" }).click();
  await expect(page.getByText(title)).toHaveCount(0);

  // back to Kickoff -> visible again
  await page.getByRole("button", { name: "Kickoff" }).click();
  await expect(page.getByText(title)).toBeVisible();

  // cleanup
  await page.getByRole("button", { name: `Borrar ${title}` }).click();
});

test("settings sidebar navigates to MCP and Notifications", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: "MCP & tokens" }).click();
  await expect(page).toHaveURL(/\/mcp/);

  await page.goto("/settings");
  await page.getByRole("button", { name: "Notificaciones" }).click();
  await expect(page).toHaveURL(/\/notifications/);
});
