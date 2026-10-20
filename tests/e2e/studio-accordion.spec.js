// @ts-check
/**
 * Kolom studio sebagai akordeon: hanya satu panel terbuka per kolom, panel terbuka mengisi
 * sisa tinggi, panel tertutup tinggal kepalanya (34 px). Status bertahan setelah render ulang.
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
}

const STUDIO = ".ic-studio:not(.ic-studio--left)";
/** @param {import("@playwright/test").Page} page @param {string} id */
const collapseBtn = (page, id) =>
  page.locator(`[data-panel="${id}"] > .ic-panel__head > .ic-panel__collapse`);
/** panel terbuka di kolom studio kanan, menurut aria-expanded tombol lipat */
const openIds = (/** @type {import("@playwright/test").Page} */ page) =>
  page.evaluate(
    (sel) =>
      [...document.querySelectorAll(`${sel} > .ic-panel`)]
        .filter(
          (p) =>
            p
              .querySelector(":scope > .ic-panel__head > .ic-panel__collapse")
              ?.getAttribute("aria-expanded") === "true",
        )
        .map((p) => /** @type {HTMLElement} */ (p).dataset.panel),
    STUDIO,
  );

test.describe("Icon Studio · panel studio akordeon", () => {
  test("panel awal adalah panel utama; membuka satu panel menutup yang lain", async ({
    page,
  }) => {
    await open(page);
    await expect(page.locator(STUDIO)).toHaveAttribute("data-ic", "accordion");
    expect(await openIds(page)).toEqual(["composer-pages"]);

    await collapseBtn(page, "composer-style").click();
    expect(await openIds(page)).toEqual(["composer-style"]);
    await expect(page.locator("#composer-pages-body")).toBeHidden();
    await expect(page.locator("#composer-rep-body")).toBeHidden();
    /* panel tertutup tinggal kepala 34 px, panel terbuka mengisi sisa tinggi kolom */
    const studio = await page.locator(STUDIO).boundingBox();
    const heights = await page
      .locator(`${STUDIO} > .ic-panel`)
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
    expect(heights[1]).toBeLessThanOrEqual(35);
    expect(heights[2]).toBeLessThanOrEqual(35);
    expect(Math.round(heights.reduce((a, b) => a + b, 0))).toBe(
      Math.round(studio?.height || 0),
    );

    /* klik tab di kepala panel tertutup membuka panelnya */
    await page.click(
      '[data-panel="composer-rep"] [role="tab"][data-value="repetisi"]',
    );
    expect(await openIds(page)).toEqual(["composer-rep"]);
  });

  test("menutup panel terbuka membuka panel berikutnya, panel terakhir membuka sebelumnya", async ({
    page,
  }) => {
    await open(page);
    await collapseBtn(page, "composer-pages").click();
    expect(await openIds(page)).toEqual(["composer-rep"]);
    await collapseBtn(page, "composer-rep").click();
    expect(await openIds(page)).toEqual(["composer-pages"]);
  });

  test("keyboard: Enter pada tombol lipat membuka panel, aria-expanded benar, fokus tetap", async ({
    page,
  }) => {
    await open(page);
    await collapseBtn(page, "composer-style").focus();
    await page.keyboard.press("Enter");
    await expect(collapseBtn(page, "composer-style")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(collapseBtn(page, "composer-pages")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(collapseBtn(page, "composer-style")).toBeFocused();
  });

  test("tool rail Objek utama membuka tab Pustaka dan panelnya", async ({
    page,
  }) => {
    await open(page);
    await collapseBtn(page, "composer-style").click();
    expect(await openIds(page)).toEqual(["composer-style"]);
    await page.locator('.ic-toolrail .ic-tool[data-value="add-main"]').click();
    expect(await openIds(page)).toEqual(["composer-pages"]);
    await expect(
      page.locator(
        '[data-panel="composer-pages"] [role="tab"][data-value="pustaka"]',
      ),
    ).toHaveAttribute("aria-selected", "true");
    await expect(page.locator('[data-name="lib-query"] input')).toBeVisible();
  });

  test("status bertahan setelah render ulang dan pindah persona", async ({
    page,
  }) => {
    await open(page);
    await collapseBtn(page, "composer-rep").click();
    /* tambah ikon memicu render ulang penuh */
    await page.click('[aria-label="Tambah ikon baru"]');
    expect(await openIds(page)).toEqual(["composer-rep"]);
    /* persona lain punya panel awalnya sendiri */
    await page.locator('.ic-persona[href="#/tinjau"]').click();
    await expect(page.locator('[data-panel="tinjau-check"]')).toBeVisible();
    expect(await openIds(page)).toEqual(["tinjau-check"]);
    await collapseBtn(page, "tinjau-zip").click();
    await page.locator('.ic-persona[href="#/composer"]').click();
    await expect(page.locator('[data-panel="composer-rep"]')).toBeVisible();
    expect(await openIds(page)).toEqual(["composer-rep"]);
    await page.locator('.ic-persona[href="#/tinjau"]').click();
    await expect(page.locator('[data-panel="tinjau-zip"]')).toBeVisible();
    expect(await openIds(page)).toEqual(["tinjau-zip"]);
  });

  test("kolom kiri Kombinasi juga akordeon", async ({ page }) => {
    await open(page);
    await page.locator('.ic-persona[href="#/kombinasi"]').click();
    await expect(page.locator(".ic-studio--left")).toHaveAttribute(
      "data-ic",
      "accordion",
    );
    expect(await openIds(page)).toEqual(["kombinasi-pool"]);
    await collapseBtn(page, "kombinasi-result").click();
    expect(await openIds(page)).toEqual(["kombinasi-result"]);
    await expect(collapseBtn(page, "kombinasi-library")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
