// @ts-check
/**
 * Alur Composer · Edit di Icon Studio (Fase 2b langkah 4).
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;

/** @param {import("@playwright/test").Page} page */
async function openEdit(page) {
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
  await page.locator(".ic-page__card[data-open]").nth(2).dblclick();
  await expect(page).toHaveURL(/#\/composer\/edit\//);
}

const xy = async (page) => [
  await page.locator('[data-name="edit-x"] input').inputValue(),
  await page.locator('[data-name="edit-y"] input').inputValue(),
];

test.describe("Icon Studio · Composer · Edit", () => {
  test("artboard 520 px, kotak seleksi, dan filmstrip tampil", async ({
    page,
  }) => {
    await openEdit(page);
    const board = await page.locator(".ic-artboard").boundingBox();
    expect([board?.width, board?.height]).toEqual([520, 520]);
    await expect(page.locator(".ic-selbox .ic-selbox__h")).toHaveCount(8);
    await expect(page.locator(".ic-filmstrip__item")).toHaveCount(14);
    const film = await page.locator(".ic-filmstrip").boundingBox();
    expect(film?.height).toBe(84);
  });

  test("klik lapisan di artboard memilihnya, seret memindah, panah menggeser", async ({
    page,
  }) => {
    await openEdit(page);
    const hit = await page.locator('[data-hit="mod"]').boundingBox();
    await page.mouse.click(hit.x + hit.width / 2, hit.y + hit.height / 2);
    await expect(
      page.locator('[data-action="layer-select"][data-layer="mod"]'),
    ).toHaveAttribute("aria-selected", "true");
    expect(await xy(page)).toEqual(["0", "0"]);
    const box = await page.locator('[data-hit="mod"]').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + 43.33,
      box.y + box.height / 2 - 32.5,
      { steps: 6 },
    );
    await expect(page.locator('[data-role="tooltip"]')).toBeVisible();
    await page.mouse.up();
    expect(await xy(page)).toEqual(["4", "-3"]);
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Shift+ArrowDown");
    expect(await xy(page)).toEqual(["3.5", "-1"]);
    await page.reload();
    await page
      .locator('[data-action="layer-select"][data-layer="mod"]')
      .click();
    expect(await xy(page)).toEqual(["3.5", "-1"]);
  });

  test("posisi pengubah lewat pemilih jangkar, Delete melepas pengubah", async ({
    page,
  }) => {
    await openEdit(page);
    await page
      .locator('[data-action="layer-select"][data-layer="mod"]')
      .click();
    await page
      .locator('[data-name="edit-slot"] button[aria-label="Posisi TR"]')
      .click();
    await expect(
      page.locator(
        '[data-action="layer-select"][data-layer="mod"] .ic-row__sub',
      ),
    ).toContainText("TR");
    await page.locator(".ic-artboard").click({ position: { x: 5, y: 5 } });
    await page.keyboard.press("Delete");
    await expect(
      page.locator(
        '[data-action="layer-select"][data-layer="mod"] .ic-row__sub',
      ),
    ).toHaveText("tidak ada");
  });

  test("mata menyembunyikan lapisan dan warna lapisan berlaku untuk set", async ({
    page,
  }) => {
    await openEdit(page);
    await page.locator('[data-action="edit-eye"][data-layer="mod"]').click();
    await expect(
      page.locator('[data-action="edit-eye"][data-layer="mod"]'),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator('[data-hit="mod"]')).toHaveCount(0);
    await page
      .locator('[data-action="layer-select"][data-layer="main"]')
      .click();
    await page
      .locator('[data-name="edit-line"] button[data-value="#1A73E8"]')
      .click();
    await expect(
      page.locator(".ic-artboard__art g[stroke='#1A73E8']").first(),
    ).toBeVisible();
    await page.locator('[data-action="edit-color-reset"]').click();
    await expect(
      page.locator(".ic-artboard__art g[stroke='#1A73E8']"),
    ).toHaveCount(0);
  });

  test("dekorasi: pilih jenis dan rotasi", async ({ page }) => {
    await openEdit(page);
    await page
      .locator('[data-action="layer-select"][data-layer="deco"]')
      .click();
    await page.locator('[data-action="edit-deco"][data-type="star4"]').click();
    await expect(
      page.locator(
        '[data-action="layer-select"][data-layer="deco"] .ic-row__sub',
      ),
    ).toContainText("star4");
    await page.locator('[data-name="edit-rot"] button[data-step="1"]').click();
    await expect(page.locator('[data-name="edit-rot"] input')).toHaveValue(
      "15",
    );
  });

  test("gaya Aksen: peran bagian dan isi bidang", async ({ page }) => {
    await openEdit(page);
    await page
      .locator('[data-name="engine"] button[data-value="accent"]')
      .click();
    await page
      .locator('[data-action="layer-select"][data-layer="main"]')
      .click();
    const part = page.locator(
      '[data-name="edit-part:0"] button[data-value="acc"]',
    );
    await part.click();
    await expect(
      page.locator('[data-name="edit-part:0"] button[data-value="acc"]'),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-action="edit-parts-auto"]')).toBeEnabled();
    await page.locator('[data-action="edit-parts-auto"]').click();
    await expect(
      page.locator('[data-action="edit-parts-auto"]'),
    ).toBeDisabled();
  });

  test("filmstrip berpindah ikon dan rute mengikuti", async ({ page }) => {
    await openEdit(page);
    const before = page.url();
    await page.locator(".ic-filmstrip__item").nth(5).click();
    await expect(page.locator(".ic-filmstrip__item").nth(5)).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(page.url()).not.toBe(before);
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/#\/composer$/);
    await expect(
      page.locator(".ic-page__card[data-select]").nth(5),
    ).toHaveAttribute("aria-selected", "true");
  });
});
