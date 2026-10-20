// @ts-check
/**
 * Gaya Sticker di Icon Studio (Fase 5): kartu gaya dengan pratinjau mesin, panel Gaya set, Composer · Edit
 * dengan warna isi per ikon dan 4 sudut pengubah, Kombinasi tanpa objek bawaan, dan impor sticker-composer.
 */
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openPanel, openTransform } from "./studio-panels.js";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;
const sticker = JSON.parse(await readFile(resolve("tests/fixtures/sets/sticker-composer.json"), "utf8"));

/** @param {import("@playwright/test").Page} page @param {string} [hash] */
async function open(page, hash = "#/composer") {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("file:")) return route.continue();
    if (url.includes("lucide.min.js")) return route.fulfill({ path: resolve("tests/fixtures/vendor/lucide.min.js") });
    return route.abort();
  });
  await page.goto(`${APP}${hash}`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

/**
 * Pilih ikon pustaka lewat pencarian untuk lapisan target di panel Pustaka Composer · Set.
 * @param {import("@playwright/test").Page} page
 * @param {string} name
 * @param {"main" | "mod"} [target]
 */
async function pickLibrary(page, name, target = "main") {
  await openPanel(page, "composer-pages");
  await page.locator('[data-panel="composer-pages"] [role="tab"][data-value="pustaka"]').click();
  await page.locator(`[data-name="lib-target"] button[data-value="${target}"]`).click();
  await page.locator('[data-name="lib-query"] input').fill(name);
  await page.locator(`[data-action="lib-pick"][data-key="lu:${name}"]`).click();
}

const stickerCard = (/** @type {import("@playwright/test").Page} */ page) => page.locator('.ic-engine[data-value="sticker"]');
const stored = (/** @type {import("@playwright/test").Page} */ page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("icon-studio-v1") || "{}"));

test.describe("Icon Studio · gaya Sticker", () => {
  test("kartu Sticker memakai pratinjau mesin; panel Gaya set; objek bawaan ditandai", async ({ page }) => {
    await open(page);
    await page.click('[data-action="load-preset"]');
    await openPanel(page, "composer-style");
    await expect(stickerCard(page)).toBeEnabled();
    /* pratinjau: halo putih + isi warna + tinta */
    await expect(stickerCard(page).locator('.ic-engine__pv svg[viewBox="0 0 48 48"] g[fill="#FFFFFF"]').first()).toBeAttached();
    await stickerCard(page).click();
    await expect(stickerCard(page)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".ic-topbar__info").first()).toContainText("Sticker 1.1.0");
    for (const name of ["style:sticker.mode", "style:sticker.sw", "style:sticker.halo", "style:sticker.off", "style:sticker.spk", "style:sticker.rays", "style:sticker.curl"])
      await expect(page.locator(`[data-name="${name}"]`).first()).toBeAttached();
    /* set contoh memakai objek bawaan: tidak didukung sticker */
    await expect(page.locator(".ic-page .ic-flag", { hasText: "bawaan" }).first()).toBeVisible();
    await expect(page.locator('[data-panel="composer-rep"]')).toContainText("Objek bawaan tidak didukung gaya Sticker");
    /* kembali ke Klasik memulihkan patokan classic */
    await page.locator('.ic-engine[data-value="classic"]').click();
    await expect(page.locator(".ic-page .ic-flag", { hasText: "bawaan" })).toHaveCount(0);
  });

  test("Set dan Edit: mode warna set, warna isi per ikon, 4 sudut pengubah", async ({ page }) => {
    await open(page);
    await openPanel(page, "composer-style");
    await stickerCard(page).click();
    await page.click('[aria-label="Tambah ikon baru"]');
    await pickLibrary(page, "mail");
    await pickLibrary(page, "plus", "mod");
    const card = page.locator(".ic-page__card[data-select]").first();
    await expect(card.locator('svg g[fill="#FFFFFF"]').first()).toBeAttached();
    /* mode Garis: tanpa isi warna dan tanpa halo objek */
    await openPanel(page, "composer-style");
    await page.locator('[data-name="style:sticker.mode"] button[data-value="line"]').click();
    expect((await stored(page)).documents[0].style.engine.sticker.mode).toBe("line");
    await page.locator('[data-name="style:sticker.mode"] button[data-value="sticker"]').click();

    await card.dblclick();
    await expect(page).toHaveURL(/#\/composer\/edit\//);
    await openPanel(page, "edit-layers");
    await page.locator('[data-action="layer-select"][data-layer="main"]').click();
    await openTransform(page);
    await page.locator('[data-name="st:main.c"] button[data-value="#B58BEA"]').click();
    await expect(page.locator(".ic-artboard__art g[fill='#B58BEA']").first()).toBeAttached();
    await page.locator('[data-name="st:main.fill"] button[data-value="plate"]').click();
    await expect(page.locator('.ic-artboard__art circle[r="10.5"]').first()).toBeAttached();

    await page.locator('[data-panel="edit-layers"] [role="tab"][data-value="lapisan"]').click();
    await page.locator('[data-action="layer-select"][data-layer="mod"]').click();
    await openTransform(page);
    const slots = page.locator('[data-panel="edit-layers"] [data-name="edit-slot"] button');
    await expect(slots).toHaveCount(9);
    await expect(page.locator('[data-panel="edit-layers"] [data-name="edit-slot"] button:disabled')).toHaveCount(5);
    await page.locator('[data-panel="edit-layers"] [data-name="edit-slot"] button[data-value="BL"]').click();
    await page.locator('[data-name="st:mod.c"] button[data-value="#6BD88A"]').click();
    const it = (await stored(page)).documents[0].items[0];
    expect(it).toMatchObject({ main: "lu:mail", mod: "lu:plus", slot: "BL", nx: 0, ny: 0 });
    expect(it.engine.sticker.main).toEqual({ c: "#B58BEA", s: 1.8, fill: "plate" });
    expect(it.engine.sticker.mod.c).toBe("#6BD88A");
    /* satu langkah urungkan per perubahan */
    await page.keyboard.press(process.platform === "darwin" ? "Meta+z" : "Control+z");
    await expect.poll(async () => (await stored(page)).documents[0].items[0].engine.sticker.mod?.c).not.toBe("#6BD88A");
  });

  test("Kombinasi sticker melewati objek dan pengubah bawaan", async ({ page }) => {
    await open(page);
    await page.locator('.ic-persona[href="#/kombinasi"]').click();
    await page.locator('[data-name="k-family"] .ic-select__trigger').click();
    await page.locator('[data-name="k-family"] [role="option"][data-value="sticker"]').click();
    await expect(page.locator(".ic-cell")).toHaveCount(0);
    await expect(page.locator('[data-panel="kombinasi-pool"]')).toContainText("objek atau pengubah bawaan dilewati");
    /* objek tanpa nama gabungan di Lucide (house-plus dan mail-plus sudah ada, jadi akan ditandai sama dengan pustaka) */
    for (const [target, name] of [["main", "anchor"], ["main", "cake"], ["mod", "plus"]]) {
      await page.locator(`[data-name="lib-target"] button[data-value="${target}"]`).click();
      await page.locator('[data-name="lib-query"] input').fill(name);
      await page.locator(`[data-action="lib-pick"][data-key="lu:${name}"]`).click();
    }
    await expect(page.locator(".ic-cell")).toHaveCount(2);
    await expect(page.locator('.ic-cell svg g[fill="#FFFFFF"]').first()).toBeAttached();
    await page.locator('[data-action="add-combos"]').click();
    const items = (await stored(page)).documents[0].items.map((/** @type {any} */ x) => [x.main, x.mod, ["TL", "TR", "BL", "BR"].includes(x.slot)]);
    expect(items).toEqual([
      ["lu:anchor", "lu:plus", true],
      ["lu:cake", "lu:plus", true],
    ]);
  });

  test("set sticker-composer lama dimigrasikan sekali; gaya.json bisa ditempel di area impor", async ({ page }) => {
    await open(page);
    await page.evaluate((legacy) => {
      localStorage.clear();
      localStorage.setItem("icon-studio-v1", JSON.stringify({ schemaVersion: 1, documents: [], activeId: null, migrations: ["002-from-offset"] }));
      localStorage.setItem("sticker-composer-v1", JSON.stringify(legacy));
    }, sticker.storage["sticker-composer-v1"]);
    await page.reload();
    await expect(page.locator(".ic-toast")).toContainText("Data lama diimpor: set Sticker Composer");
    await expect(page.locator(".ic-page:not(.ic-page--new)")).toHaveCount(3);
    const s = await stored(page);
    expect(s.migrations).toEqual(["002-from-offset", "004-from-sticker"]);
    expect(s.documents[0].style.family).toBe("sticker");
    await page.reload();
    await expect(page.locator(".ic-toast")).toBeHidden();

    await page.goto(`${APP}#/builder`);
    await page.locator('[data-name="manifest-text"]').fill(JSON.stringify(sticker.gayaJson));
    await page.locator('[data-action="import-text"]').click();
    await expect(page).toHaveURL(/#\/composer$/);
    await expect(page.locator(".ic-toast")).toContainText("1 ikon sticker-composer diimpor. 1 ikon tanpa objek Lucide atau Tabler dilewati");
  });
});
