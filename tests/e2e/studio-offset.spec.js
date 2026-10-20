// @ts-check
/**
 * Gaya Offset di Icon Studio (Fase 3): kartu gaya dengan pratinjau mesin, Composer · Set dan Edit,
 * panel pengubah nonaktif, dekorasi offset per ikon, dan Kombinasi yang hanya memakai daftar objek.
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openPanel } from "./studio-panels.js";

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
}

/**
 * Pilih ikon pustaka lewat pencarian lalu tambahkan sebagai ikon baru.
 * @param {import("@playwright/test").Page} page
 * @param {string} name
 */
async function addLibraryIcon(page, name) {
  /* tambah dulu: blur kolom cari merender ulang dan bisa menelan klik berikutnya */
  await page.click('[aria-label="Tambah ikon baru"]');
  await page
    .locator('[data-panel="composer-pages"] [role="tab"][data-value="pustaka"]')
    .click();
  await page.locator('[data-name="lib-query"] input').fill(name);
  await page.locator(`[data-action="lib-pick"][data-key="lu:${name}"]`).click();
}

const offsetCard = (/** @type {import("@playwright/test").Page} */ page) =>
  page.locator('.ic-engine[data-value="offset"]');

test.describe("Icon Studio · gaya Offset", () => {
  test("kartu Offset memakai pratinjau mesin dan bisa dipilih; objek bawaan ditandai", async ({
    page,
  }) => {
    await open(page);
    await page.click('[data-action="load-preset"]');
    await openPanel(page, "composer-style");
    await expect(offsetCard(page)).toBeEnabled();
    await expect(
      offsetCard(page).locator(
        ".ic-engine__pv svg[viewBox='0 0 48 48'] g[stroke]",
      ),
    ).toHaveCount(1);
    await expect(
      page.locator('.ic-engine[data-value="hand-writing"]'),
    ).toBeDisabled();
    await offsetCard(page).click();
    await expect(offsetCard(page)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".ic-topbar__info").first()).toContainText(
      "Offset 1.1.0",
    );
    /* set contoh memakai objek bawaan: tidak didukung offset (flag dobel lebih diutamakan) */
    const n = await page.locator(".ic-page__card[data-select]").count();
    await expect(
      page.locator('.ic-page .ic-flag[data-level="err"]'),
    ).toHaveCount(n);
    await expect(
      page
        .locator('.ic-page .ic-flag[data-level="err"]', { hasText: "bawaan" })
        .first(),
    ).toBeVisible();
    await expect(page.locator('[data-panel="composer-rep"]')).toContainText(
      "Objek bawaan tidak didukung gaya Offset",
    );
    await expect(page.locator('[data-panel="composer-rep"]')).toContainText(
      "Pengubah tidak tersedia pada style ini",
    );
    /* kembali ke Klasik memulihkan patokan classic */
    await page.locator('.ic-engine[data-value="classic"]').click();
    await expect(
      page.locator('.ic-page .ic-flag[data-level="err"]', {
        hasText: "bawaan",
      }),
    ).toHaveCount(0);
  });

  test("Set dan Edit: panel pengubah nonaktif, dekorasi offset per ikon, parameter gaya set", async ({
    page,
  }) => {
    await open(page);
    await openPanel(page, "composer-style");
    await offsetCard(page).click();
    await addLibraryIcon(page, "house");
    await addLibraryIcon(page, "mail");
    await expect(page.locator(".ic-page__label").first()).toHaveText("house");
    const card = page.locator(".ic-page__card[data-select]").first();
    await expect(card.locator("svg path")).toHaveCount(5); // isi rumah, garis rumah, pintu, kilat, tanah
    /* parameter gaya berlaku untuk seluruh set */
    await openPanel(page, "composer-style");
    await page
      .locator('[data-name="style:offset.mode"] button[data-value="white"]')
      .click();
    await expect(card.locator('svg g[fill="#FFFFFF"]')).toHaveCount(1);
    await card.dblclick();
    await expect(page).toHaveURL(/#\/composer\/edit\//);
    await openPanel(page, "edit-layers");
    await page
      .locator('[data-action="layer-select"][data-layer="mod"]')
      .click();
    await expect(page.locator('[data-panel="edit-transform"]')).toContainText(
      "Pengubah tidak tersedia pada style ini",
    );
    await expect(page.locator(".ic-context")).toContainText(
      "Pengubah tidak tersedia pada style ini",
    );
    await expect(page.locator('[data-name="edit-x"]')).toHaveCount(0);
    await page
      .locator('[data-action="layer-select"][data-layer="deco"]')
      .click();
    await openPanel(page, "edit-transform");
    const art = page.locator(".ic-artboard__art");
    const before = await art.locator("path").count();
    await page.locator('[data-name="edit-odeco:cloud"]').check();
    await expect(art.locator("path")).toHaveCount(before + 1);
    await page
      .locator('[data-name="edit-odeco:tickPos"] button[data-value="TL"]')
      .click();
    await expect(
      page.locator('[data-action="layer-select"][data-layer="deco"]'),
    ).toContainText("kilat TL");
    /* tersimpan per ikon di item.engine.offset.deco */
    const deco = await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("icon-studio-v1") || "{}").documents[0]
          .items[0].engine.offset.deco,
    );
    expect(deco).toEqual({
      tick: true,
      tickPos: "TL",
      ground: true,
      cloud: true,
      grass: false,
    });
  });

  test("Kombinasi offset hanya memakai daftar objek", async ({ page }) => {
    await open(page);
    await page.locator('.ic-persona[href="#/kombinasi"]').click();
    await expect(page.locator(".ic-cell")).toHaveCount(12);
    await page.locator('[data-name="k-family"] .ic-select__trigger').click();
    await page
      .locator('[data-name="k-family"] [role="option"][data-value="offset"]')
      .click();
    await expect(page.locator(".ic-topbar__info").last()).toContainText(
      "0 objek, tanpa pengubah",
    );
    await expect(page.locator(".ic-context")).toContainText(
      "Pengubah tidak tersedia pada style ini",
    );
    await expect(page.locator('[data-panel="kombinasi-pool"]')).toContainText(
      "Kombinasi memakai daftar objek saja",
    );
    /* objek bawaan di pool tidak didukung offset: dilewati dengan keterangan */
    await expect(page.locator(".ic-cell")).toHaveCount(0);
    await expect(page.locator('[data-panel="kombinasi-pool"]')).toContainText(
      "3 objek bawaan dilewati",
    );
    await page
      .locator('[data-name="lib-target"] button[data-value="main"]')
      .click();
    for (const name of ["house", "mail"]) {
      await page.locator('[data-name="lib-query"] input').fill(name);
      await page
        .locator(`[data-action="lib-pick"][data-key="lu:${name}"]`)
        .click();
    }
    await expect(page.locator(".ic-cell")).toHaveCount(2);
    await expect(page.locator('.ic-matrix [data-action="k-col"]')).toHaveCount(
      1,
    );
    await expect(page.locator(".ic-cell svg g[stroke]")).toHaveCount(2);
    await page.locator('[data-action="add-combos"]').click();
    const items = await page.evaluate(() =>
      JSON.parse(
        localStorage.getItem("icon-studio-v1") || "{}",
      ).documents[0].items.map((/** @type {any} */ it) => [it.main, it.mod]),
    );
    expect(items).toEqual([
      ["lu:house", "none"],
      ["lu:mail", "none"],
    ]);
  });
});
