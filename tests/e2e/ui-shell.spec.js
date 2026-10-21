// @ts-check
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

test.describe("Icon Studio UI shell", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(pathToFileURL(resolve("dist/icon-studio/index.html")).href);
  });

  test("memakai ukuran kerangka dari handoff", async ({ page }) => {
    const sizes = await page.evaluate(() => {
      const rect = (selector) =>
        document.querySelector(selector).getBoundingClientRect();
      return {
        topbar: rect(".ic-topbar").height,
        context: rect(".ic-context").height,
        doctabs: rect(".ic-doctabs").height,
        panelhead: rect(".ic-panel__head").height,
        status: rect(".ic-statusbar").height,
        toolrail: rect(".ic-toolrail").width,
        studio: rect(".ic-studio").width,
      };
    });
    expect(sizes).toEqual({
      topbar: 56,
      context: 42,
      doctabs: 30,
      panelhead: 34,
      status: 28,
      toolrail: 56,
      studio: 330,
    });
  });

  test("routing persona mengubah halaman aktif", async ({ page }) => {
    await page.goto(
      `${pathToFileURL(resolve("dist/icon-studio/index.html")).href}#/kombinasi`,
    );
    await expect(
      page.locator('.ic-app[data-persona="kombinasi"]'),
    ).toBeVisible();
    await expect(
      page.locator('.ic-persona[aria-current="page"]'),
    ).toContainText("Kombinasi");
  });
});
