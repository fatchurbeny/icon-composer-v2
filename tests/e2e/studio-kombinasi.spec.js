// @ts-check
/**
 * Alur Kombinasi di Icon Studio (Fase 2b langkah 7).
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;

/** @param {import("@playwright/test").Page} page */
async function open(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("file:")) return route.continue();
    if (url.includes("lucide.min.js"))
      return route.fulfill({
        path: resolve("tests/fixtures/vendor/lucide.min.js"),
      });
    return route.abort();
  });
  await page.goto(`${APP}#/composer`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.click('[data-action="load-preset"]');
  await page.locator('.ic-persona[href="#/kombinasi"]').click();
  await expect(page.locator(".ic-matrix")).toBeVisible();
}

const cells = (page, state) => page.locator(`.ic-cell[data-state="${state}"]`);
const addButton = (page) => page.locator('[data-action="k-add"]');

test.describe("Icon Studio · Kombinasi", () => {
  test("matriks dari pool, sel yang sudah ada tidak bisa dipilih", async ({
    page,
  }) => {
    await open(page);
    await expect(page.locator(".ic-cell")).toHaveCount(12);
    await expect(cells(page, "exists").first()).toBeDisabled();
    const on = await cells(page, "on").count();
    await expect(addButton(page)).toHaveText(`Tambahkan ${on} ke set`);
    await expect(page.locator(".ic-topbar .ic-actionbtn--persona")).toHaveText(
      `Tambahkan ${on} ke set`,
    );
  });

  test("klik sel, kepala kolom, Pilih semua, dan Lewati semua", async ({
    page,
  }) => {
    await open(page);
    const on = await cells(page, "on").count();
    await cells(page, "on").first().click();
    await expect(cells(page, "skipped")).toHaveCount(1);
    await expect(addButton(page)).toHaveText(`Tambahkan ${on - 1} ke set`);
    await page.locator('[data-action="k-none"]').click();
    await expect(cells(page, "on")).toHaveCount(0);
    await expect(addButton(page)).toBeDisabled();
    await page.locator('[data-action="k-all"]').click();
    await expect(cells(page, "on")).toHaveCount(on);
    await page.locator('[data-action="k-col"]').first().click();
    await expect(cells(page, "skipped").first()).toBeVisible();
  });

  test("pustaka menambah ke pool dan matriks bertambah", async ({ page }) => {
    await open(page);
    await page.locator('[data-name="lib-query"] input').fill("kopi");
    await page
      .locator('[data-action="lib-pick"][data-key="lu:coffee"]')
      .click();
    await expect(
      page.locator('[data-action="k-row"][data-key="lu:coffee"]'),
    ).toBeVisible();
    await expect(page.locator(".ic-cell")).toHaveCount(16);
    await expect(
      page.locator('[data-action="lib-pick"][data-key="lu:coffee"]'),
    ).toHaveAttribute("data-in-pool", "true");
    await page
      .locator('[data-action="k-pool-remove"][data-key="lu:coffee"]')
      .click();
    await expect(page.locator(".ic-cell")).toHaveCount(12);
  });

  test("tambahkan ke set, lalu sel menjadi sudah ada", async ({ page }) => {
    await open(page);
    const on = await cells(page, "on").count();
    await page.locator('[data-name="k-mode"] button[data-value="all"]').click();
    await expect(addButton(page)).toHaveText(`Tambahkan ${on * 3} ke set`);
    await page.locator('[data-name="k-mode"] button[data-value="set"]').click();
    await addButton(page).click();
    await expect(cells(page, "on")).toHaveCount(0);
    await page.locator('.ic-persona[href="#/composer"]').click();
    await expect(page.locator(".ic-page:not(.ic-page--new)")).toHaveCount(
      14 + on,
    );
  });
});
