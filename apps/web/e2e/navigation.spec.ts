import { test, expect } from "@playwright/test";

const SECTIONS = [
  { label: "Proyectos", path: "/projects" },
  { label: "Tiempo", path: "/tracker" },
  { label: "Costos & IA", path: "/costs" },
  { label: "Reportes", path: "/reports" },
  { label: "Documentos", path: "/documents" },
  { label: "Servidor MCP", path: "/mcp" },
  { label: "Notificaciones", path: "/notifications" },
  { label: "Settings", path: "/settings" },
];

test("sidebar navigates to every section by click", async ({ page }) => {
  await page.goto("/");
  for (const s of SECTIONS) {
    await page.getByRole("link", { name: s.label }).first().click();
    await expect(page).toHaveURL(new RegExp(s.path.replace("/", "\\/")));
  }
  await page.getByRole("link", { name: "Cabina" }).first().click();
  await expect(page).toHaveURL(/\/$/);
});

test("command palette opens with Ctrl+K and navigates", async ({ page }) => {
  await page.goto("/");
  await page.locator("body").click();
  await page.keyboard.press("Control+KeyK");
  await expect(page.getByRole("button", { name: "Ir a Servidor MCP" })).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: "Ir a Servidor MCP" }).click();
  await expect(page).toHaveURL(/\/mcp/);
});
