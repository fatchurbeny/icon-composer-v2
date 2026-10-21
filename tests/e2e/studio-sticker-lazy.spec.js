// @ts-check
/**
 * Data bentuk isi sticker dimuat malas (packages/icon-sources/fill-shapes.js, docs/engines/sticker.md):
 * membuka app tanpa Sticker tidak memuat data, memilih Sticker memuat lalu merender bentuk isi yang benar,
 * dan set Sticker tersimpan memuat data saat app dibuka. Ekspor ZIP Sticker yang menunggu data dicek di
 * export-canva.spec.js ("Ekspor Canva · sticker").
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openPanel } from "./studio-panels.js";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;

/* bentuk isi di dalam mask (fill hitam tanpa stroke) dari fill-shapes.json, dan plate pengganti bila data tidak ada */
const LUGGAGE_FILL = 'stroke="none"><circle cx="16" cy="20" r="2"/><circle cx="8" cy="20" r="2"/></g>';
const MAIL_FILL = 'stroke="none"><rect x="2" y="4" width="20" height="16" rx="2"/></g>';
const PLATE = 'stroke="none"><circle cx="12" cy="12" r="10.5"/></g>';
/** Markup DOM (`innerHTML`) menulis `<rect></rect>`; samakan dengan string mesin. @param {string} html */
const tidy = (html) => html.replace(/><\/(circle|rect|path|ellipse|line|polyline|polygon)>/g, "/>");

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

const fillState = (/** @type {import("@playwright/test").Page} */ page) =>
  page.evaluate(() => /** @type {any} */ (window).__iconStudio.renderer.fillShapesState());

/**
 * Simpan satu set berisi koper dan surat (pustaka Lucide) dengan gaya tertentu, lalu muat ulang app.
 * @param {import("@playwright/test").Page} page
 * @param {string} family
 */
async function storeSet(page, family) {
  await page.evaluate((family) => {
    const S = /** @type {any} */ (window).__iconStudio;
    const items = [
      { main: "lu:luggage", mod: "none", mx: 0, my: 0, name: "Koper" },
      { main: "lu:mail", mod: "none", mx: 0, my: 0, name: "Surat" },
    ].map((o, i) => S.document.normItem(o, S.renderer.lib, { uid: () => `z${i}` }));
    const doc = S.document.createSetDocument({ id: "set-lazy", name: "Uji malas", style: { family }, items }, () => "x");
    S.store.saveState({ schemaVersion: 1, documents: [doc], activeId: doc.id });
  }, family);
  await page.reload();
}

test.describe("Icon Studio · data bentuk isi sticker dimuat malas", () => {
  test("membuka app dan memakai gaya lain tidak memuat data; kartu Sticker tetap punya pratinjau", async ({ page }) => {
    await open(page);
    await page.click('[data-action="load-preset"]');
    await openPanel(page, "composer-style");
    /* pratinjau kartu Sticker memakai seed (lu:luggage), bukan data penuh */
    const pv = page.locator('.ic-engine[data-value="sticker"] .ic-engine__pv svg');
    await expect(pv).toBeAttached();
    expect(tidy(await pv.evaluate((el) => el.outerHTML))).toContain(LUGGAGE_FILL);
    await page.locator('.ic-engine[data-value="offset"]').click();
    await page.goto(`${APP}#/kombinasi`);
    await expect(page.locator('.ic-persona[href="#/kombinasi"]')).toHaveAttribute("aria-current", /.+/);
    await page.goto(`${APP}#/tinjau`);
    await expect(page.locator('.ic-persona[href="#/tinjau"]')).toHaveAttribute("aria-current", /.+/);
    await page.goto(`${APP}#/builder`);
    await expect(page.locator('.ic-persona[href="#/builder"]')).toHaveAttribute("aria-current", /.+/);
    await page.goto(`${APP}#/composer`);
    await expect(page.locator('.ic-persona[href="#/composer"]')).toHaveAttribute("aria-current", /.+/);
    expect(await fillState(page)).toBe("idle");
  });

  test("memilih kartu Sticker memuat data lalu merender bentuk isi yang benar", async ({ page }) => {
    await open(page);
    await storeSet(page, "classic");
    await expect(page.locator(".ic-page__card[data-select]")).toHaveCount(2);
    expect(await fillState(page)).toBe("idle");
    await openPanel(page, "composer-style");
    const t0 = Date.now();
    await page.locator('.ic-engine[data-value="sticker"]').click();
    await expect.poll(() => fillState(page)).toBe("ready");
    const ms = Date.now() - t0;
    test.info().annotations.push({ type: "muat-sticker", description: `${ms} ms dari klik sampai data siap` });
    const cards = page.locator(".ic-page__card[data-select]");
    await expect(cards.locator('svg[data-loading="fill-shapes"]')).toHaveCount(0);
    const html = await cards.evaluateAll((els) => els.map((el) => el.innerHTML).join("\n")).then(tidy);
    expect(html).toContain(LUGGAGE_FILL);
    expect(html).toContain(MAIL_FILL);
    expect(html).not.toContain(PLATE);
  });

  test("set Sticker tersimpan memuat data saat app dibuka dan tidak menyisakan placeholder", async ({ page }) => {
    await open(page);
    await storeSet(page, "sticker");
    await expect.poll(() => fillState(page)).toBe("ready");
    const cards = page.locator(".ic-page__card[data-select]");
    await expect(cards).toHaveCount(2);
    await expect(cards.locator('svg[data-loading="fill-shapes"]')).toHaveCount(0);
    const html = await cards.evaluateAll((els) => els.map((el) => el.innerHTML).join("\n")).then(tidy);
    expect(html).toContain(MAIL_FILL);
    expect(html).not.toContain(PLATE);
  });

  test("render sebelum data termuat memberi placeholder lalu memicu muat; ekspor ZIP menunggu data", async ({ page }) => {
    await open(page);
    const res = await page.evaluate(async () => {
      const S = /** @type {any} */ (window).__iconStudio;
      const it = S.document.normItem({ main: "lu:mail", mod: "none", mx: 0, my: 0 }, S.renderer.lib, { uid: () => "m" });
      const style = { family: "sticker" };
      const before = S.renderer.renderSetItem(it, style, { idp: "a" });
      const flagsBefore = S.renderer.flagsOf(it, style);
      const stateAfterRender = S.renderer.fillShapesState();
      const doc = S.review.ensureReviewFields(S.document.createSetDocument({ id: "z", name: "Z", style, items: [it] }, () => "x"));
      doc.review.asli = true;
      const { files } = await S.review.buildSetZip(doc, [it], S.renderer);
      const asli = Object.entries(files).filter(([k]) => k.startsWith(S.review.ORIGINAL_DIR)).map(([, v]) => v);
      return { before, flagsBefore, stateAfterRender, state: S.renderer.fillShapesState(), files: Object.values(files).join("\n"), asli };
    });
    expect(res.before).toContain('data-loading="fill-shapes"');
    expect(res.flagsBefore).toEqual([]);
    expect(res.stateAfterRender).not.toBe("idle");
    expect(res.state).toBe("ready");
    expect(res.files).not.toContain("data-loading");
    expect(res.asli).toHaveLength(1);
    expect(res.asli[0]).toContain(MAIL_FILL);
  });
});
