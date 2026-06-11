import { describe, it, expect, beforeEach } from "vitest";
import i18n from "./index";

describe("i18n core", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to Spanish", () => {
    expect(i18n.language).toMatch(/^es/);
  });

  it("translates a known key in both languages", async () => {
    await i18n.changeLanguage("es");
    expect(i18n.t("common.save")).toBe("Guardar");
    await i18n.changeLanguage("en");
    expect(i18n.t("common.save")).toBe("Save");
  });

  it("falls back to es for unsupported language", async () => {
    await i18n.changeLanguage("fr");
    expect(i18n.t("common.save")).toBe("Guardar");
  });
});
