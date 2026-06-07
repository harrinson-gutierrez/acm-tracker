import { test, expect } from "@playwright/test";

test("cabina shows burn rate gauge and team panel", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("BURN RATE · HOY")).toBeVisible();
  await expect(page.getByText("EQUIPO · COSTO REAL HOY")).toBeVisible();
  await expect(page.getByText("Harry G.")).toBeVisible();
});

test("cabina '+ registrar tiempo' navigates to projects", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "+ registrar tiempo" }).click();
  await expect(page).toHaveURL(/\/projects/);
});

test("costs shows model prices table", async ({ page }) => {
  await page.goto("/costs");
  await expect(page.getByText("IA · COSTO POR MODELO", { exact: false })).toBeVisible();
  await expect(page.getByText("COMPOSICIÓN DEL COSTO")).toBeVisible();
});

test("reports shows KPIs, per-person and CSV export", async ({ page }) => {
  await page.goto("/reports");
  await expect(page.getByText("Reportes · analítica")).toBeVisible();
  await expect(page.getByText("POR PERSONA · COSTO REAL")).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Exportar CSV" }).click(),
  ]);
  expect(download.suggestedFilename()).toContain(".csv");
});

test("tracker shows timeline and day objective", async ({ page }) => {
  await page.goto("/tracker");
  await expect(page.getByText("LÍNEA DE TIEMPO")).toBeVisible();
  await expect(page.getByText("OBJETIVO DEL DÍA")).toBeVisible();
});

test("mcp screen shows endpoint and contract", async ({ page }) => {
  await page.goto("/mcp");
  await expect(page.getByRole("heading", { name: "Servidor MCP" })).toBeVisible();
  await expect(page.getByText("ENDPOINT")).toBeVisible();
  await expect(page.getByText("REPORTES RECIBIDOS", { exact: true })).toBeVisible();
});

test("auth login navigates to cabina", async ({ page }) => {
  await page.goto("/auth");
  await expect(page.getByLabel("Email")).toHaveValue("owner@acm.local");
  await page.getByRole("button", { name: "Entrar →" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("BURN RATE · HOY")).toBeVisible();
});
