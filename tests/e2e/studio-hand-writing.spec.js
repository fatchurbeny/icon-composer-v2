// @ts-check
/**
 * Gaya Hand-writing di Icon Studio (Fase 4): kartu gaya dengan pratinjau mesin, Composer · Set dan Edit
 * (posisi dan skala pengubah, mode blob, acak ulang goresan), objek bawaan ditandai, dan Kombinasi yang
 * hanya memakai objek serta pengubah pustaka.
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openPanel, openTransform } from "./studio-panels.js";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;

/** @param {import("@playwright/test").Page} page */
async function open(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("file:")) return route.continue();
    if (url.includes("lucide.min.js")) return route.fulfill({ path: resolve("tests/fixtures/vendor/lucide.min.js") });
    return route.abort();
  });
  await page.goto(`${APP}#/composer`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

const hwCard = (/** @type {import("@playwright/test").Page} */ page) => page.locator('.ic-engine[data-value="hand-writing"]');
/** @param {import("@playwright/test").Page} page */
const savedDoc = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("icon-studio-v1") || "{}").documents[0]);

test.describe("Icon Studio · gaya Hand-writing", () => {
  test("kartu Hand-writing memakai pratinjau mesin; objek bawaan ditandai; kembali ke Klasik", async ({ page }) => {
    await open(page);
    await page.click('[data-action="load-preset"]');
    await openPanel(page, "composer-style");
    await expect(hwCard(page)).toBeEnabled();
    await expect(hwCard(page).locator(".ic-engine__pv svg[viewBox='0 0 48 48'] > g path").first()).toBeVisible();
    await expect(hwCard(page).locator(".ic-engine__pv svg")).not.toContainText("dasharray");
    await hwCard(page).click();
    await expect(hwCard(page)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".ic-topbar__info").first()).toContainText("Hand-writing 2.0.0");
    await expect(page.locator('.ic-page .ic-flag[data-level="err"]', { hasText: "bawaan" }).first()).toBeVisible();
    await expect(page.locator('[data-panel="composer-rep"]')).toContainText("Objek bawaan tidak didukung gaya Hand-writing");
    await page.locator('.ic-engine[data-value="classic"]').click();
    await expect(page.locator('.ic-page .ic-flag[data-level="err"]', { hasText: "bawaan" })).toHaveCount(0);
  });

  test("Set dan Edit: parameter gaya set, pengubah pustaka di anchor, blob, acak ulang goresan", async ({ page }) => {
    await open(page);
    await openPanel(page, "composer-style");
    await hwCard(page).click();
    /* ikon baru bergaya hand-writing langsung memakai objek pustaka */
    await page.click('[aria-label="Tambah ikon baru"]');
    const card = page.locator(".ic-page__card[data-select]").first();
    await expect(page.locator(".ic-page__label").first()).toHaveText("pizza");
    await expect(card.locator("svg path").first()).toBeVisible();
    const html = await card.locator("svg").innerHTML();
    expect(html).not.toMatch(/stroke-dasharray|pathLength/);
    /* parameter gaya berlaku untuk seluruh set */
    await openPanel(page, "composer-style");
    await page.locator('[data-name="style:hand-writing.gap"] input[aria-label$="angka"]').fill("0");
    await page.locator('[data-name="style:hand-writing.gap"] input[aria-label$="angka"]').press("Enter");
    await expect.poll(async () => (await savedDoc(page)).style.engine["hand-writing"].gap).toBe(0);
    /* pengubah dari pustaka */
    await page.locator('[data-panel="composer-pages"] [role="tab"][data-value="lapisan"]').click();
    await page.locator('[data-panel="composer-pages"] [data-action="layer-select"][data-layer="mod"]').click();
    await page.locator('[data-panel="composer-pages"] [role="tab"][data-value="pustaka"]').click();
    await page.locator('[data-name="lib-query"] input').fill("plus");
    await page.locator('[data-action="lib-pick"][data-key="lu:plus"]').click();
    await expect(card.locator("svg mask")).toHaveCount(1);
    await card.dblclick();
    await expect(page).toHaveURL(/#\/composer\/edit\//);
    await openPanel(page, "edit-layers");
    await page.locator('[data-action="layer-select"][data-layer="mod"]').click();
    await openTransform(page);
    /* geser bebas tidak ada: posisi lewat anchor */
    await expect(page.locator('[data-name="edit-x"]')).toHaveCount(0);
    await page.locator('[data-panel="edit-layers"] [data-name="edit-slot"] button[data-value="TL"]').click();
    await expect.poll(async () => (await savedDoc(page)).items[0].slot).toBe("TL");
    await expect(page.locator(".ic-artboard__art")).toContainText("");
    expect(await page.locator(".ic-artboard__art").innerHTML()).toContain("translate(5.5 5.5) scale(0.5)");
    /* skala pengubah per ikon */
    await page.locator('[data-panel="edit-layers"] [data-name="edit-hw:ms"] input').fill("0.6");
    await page.locator('[data-panel="edit-layers"] [data-name="edit-hw:ms"] input').press("Enter");
    await expect.poll(async () => (await savedDoc(page)).items[0].engine["hand-writing"].ms).toBe(0.6);
    /* blob dan seed di lapisan objek utama */
    await page.locator('[data-panel="edit-layers"] [role="tab"][data-value="lapisan"]').click();
    await page.locator('[data-action="layer-select"][data-layer="main"]').click();
    await openTransform(page);
    await page.locator('[data-name="edit-hw:blob"] button[data-value="none"]').click();
    await expect.poll(async () => (await savedDoc(page)).items[0].engine["hand-writing"].blob).toBe("none");
    const seed0 = (await savedDoc(page)).items[0].engine["hand-writing"].seed;
    await page.locator('[data-panel="edit-layers"] [data-action="edit-hw-reroll"]').click();
    await expect.poll(async () => (await savedDoc(page)).items[0].engine["hand-writing"].seed).not.toBe(seed0);
    /* dekorasi tidak tersedia */
    await page.locator('[data-panel="edit-layers"] [role="tab"][data-value="lapisan"]').click();
    await expect(page.locator('[data-action="layer-select"][data-layer="deco"]')).toContainText("Dekorasi tidak tersedia pada gaya ini");
  });

  test("Kombinasi hand-writing memakai objek dan pengubah pustaka", async ({ page }) => {
    await open(page);
    await page.locator('.ic-persona[href="#/kombinasi"]').click();
    await expect(page.locator(".ic-cell")).toHaveCount(12);
    await page.locator('[data-name="k-family"] .ic-select__trigger').click();
    await page.locator('[data-name="k-family"] [role="option"][data-value="hand-writing"]').click();
    await expect(page.locator(".ic-cell")).toHaveCount(0);
    await expect(page.locator('[data-panel="kombinasi-pool"]')).toContainText("3 objek bawaan dilewati");
    await expect(page.locator('[data-panel="kombinasi-pool"]')).toContainText("4 pengubah bawaan dilewati");
    await page.locator('[data-name="lib-target"] button[data-value="main"]').click();
    for (const name of ["house", "mail"]) {
      await page.locator('[data-name="lib-query"] input').fill(name);
      await page.locator(`[data-action="lib-pick"][data-key="lu:${name}"]`).click();
    }
    await page.locator('[data-name="lib-target"] button[data-value="mod"]').click();
    /* lu:sparkle: tidak ada ikon pustaka house-sparkle atau mail-sparkle, jadi kedua sel aktif */
    await page.locator('[data-name="lib-query"] input').fill("sparkle");
    await page.locator('[data-action="lib-pick"][data-key="lu:sparkle"]').click();
    await expect(page.locator(".ic-cell")).toHaveCount(2);
    await page.locator('[data-action="add-combos"]').click();
    const doc = await savedDoc(page);
    expect(doc.style.family).toBe("hand-writing");
    expect(doc.items.map((/** @type {any} */ it) => [it.main, it.mod, it.slot])).toEqual([
      ["lu:house", "lu:sparkle", "BR"],
      ["lu:mail", "lu:sparkle", "BR"],
    ]);
  });
});
