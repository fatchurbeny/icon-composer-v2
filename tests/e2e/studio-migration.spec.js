// @ts-check
/**
 * Migrasi localStorage IC 1.5.1 dan TIB 1.6.0 ke Icon Studio (Fase 2b langkah 8).
 */
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;
const mixed = JSON.parse(
  await readFile(resolve("tests/fixtures/sets/mixed.json"), "utf8"),
);
const offset = JSON.parse(
  await readFile(resolve("tests/fixtures/sets/offset-composer.json"), "utf8"),
);

const hw = JSON.parse(
  await readFile(resolve("tests/fixtures/sets/coret-composer.json"), "utf8"),
);

/** Hanya file lokal dan Lucide vendor; CDN lain diblokir. @param {import("@playwright/test").Page} page */
async function offline(page) {
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
}

test("data IC dan TIB lama muncul sebagai dokumen Icon Studio", async ({
  page,
}) => {
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
  await page.evaluate(
    ({ ic, tibManifest }) => {
      localStorage.clear();
      localStorage.setItem("icon-composer-aksen-v1", JSON.stringify(ic));
      localStorage.setItem(
        "icon-composer-meta-v1",
        JSON.stringify({ artist: "chital", packEn: "Travel" }),
      );
      const items = tibManifest.icons.map((o, i) => ({
        uid: `i${i}-x`,
        id: o.id,
        idRaw: o.id,
        name: o.name,
        main: o.main,
        mod: o.mod,
        slot: o.anchor,
        nx: 0,
        ny: 0,
        mx: 0,
        my: 0,
        slides: o.slides,
        role: o.role,
        keywords: o.keywords,
        on: true,
        vis: { main: true, mod: true, deco: true },
        deco: { type: "none" },
      }));
      localStorage.setItem(
        "template-icon-builder-aksen-v1",
        JSON.stringify({
          man: tibManifest,
          items,
          pv: "A",
          sheetCols: "auto",
          isSample: false,
          v151: true,
        }),
      );
    },
    {
      ic: mixed.iconComposer.storage["icon-composer-aksen-v1"],
      tibManifest: mixed.templateIconBuilder.zipManifest,
    },
  );
  await page.reload();
  await expect(page.locator(".ic-toast")).toContainText("Data lama diimpor");
  await expect(page.locator(".ic-doctab")).toHaveCount(2);
  await expect(page.locator(".ic-page:not(.ic-page--new)")).toHaveCount(3);
  await page.locator('.ic-persona[href="#/tinjau"]').click();
  await expect(
    page.locator('[data-name="t-artist"] button[data-value="chital"]'),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator('.ic-persona[href="#/builder"]').click();
  await expect(page.locator(".ic-iconcard[data-select]")).toHaveCount(
    mixed.templateIconBuilder.zipManifest.icons.length,
  );
  /* muat ulang: tidak dimigrasikan lagi */
  await page.reload();
  await expect(page.locator(".ic-doctab")).toHaveCount(2);
  await expect(page.locator(".ic-toast")).toBeHidden();
});

test("set offset-composer lama ditambahkan sekali ke Icon Studio yang sudah ada", async ({
  page,
}) => {
  await offline(page);
  await page.goto(`${APP}#/composer`);
  /* pengguna lama: icon-studio-v1 sudah tersimpan tanpa catatan migrasi 002 */
  await page.evaluate((legacy) => {
    localStorage.clear();
    localStorage.setItem(
      "icon-studio-v1",
      JSON.stringify({ schemaVersion: 1, documents: [], activeId: null }),
    );
    localStorage.setItem("offset-composer-v1", JSON.stringify(legacy));
  }, offset.storage["offset-composer-v1"]);
  await page.reload();
  await expect(page.locator(".ic-toast")).toContainText(
    "Data lama diimpor: set Offset Composer",
  );
  await expect(page.locator(".ic-page:not(.ic-page--new)")).toHaveCount(3);
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("icon-studio-v1") || "{}"),
  );
  expect(stored.migrations).toEqual(["002-from-offset", "003-from-hand-writing"]);
  expect(stored.documents.map((/** @type {any} */ d) => d.style.family)).toEqual(["offset"]);
  /* muat ulang: tidak dimigrasikan lagi, kunci lama tetap ada */
  await page.reload();
  await expect(page.locator(".ic-toast")).toBeHidden();
  const again = await page.evaluate(() => ({
    docs: JSON.parse(localStorage.getItem("icon-studio-v1") || "{}").documents.length,
    legacy: !!localStorage.getItem("offset-composer-v1"),
  }));
  expect(again).toEqual({ docs: 1, legacy: true });
});

test("gaya.json offset-composer yang ditempel di area impor menjadi set Composer", async ({
  page,
}) => {
  await offline(page);
  await page.goto(`${APP}#/builder`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page
    .locator('[data-name="manifest-text"]')
    .fill(JSON.stringify(offset.gayaJson));
  await page.locator('[data-action="import-text"]').click();
  await expect(page).toHaveURL(/#\/composer$/);
  await expect(page.locator(".ic-toast")).toContainText(
    "2 ikon offset-composer diimpor. Gaya diseragamkan mengikuti ikon pertama",
  );
  await expect(page.locator(".ic-page:not(.ic-page--new)")).toHaveCount(2);
});

test("set coret-composer lama menjadi set Hand-writing sekali, kunci lama tetap ada", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("file:")) return route.continue();
    if (url.includes("lucide.min.js")) return route.fulfill({ path: resolve("tests/fixtures/vendor/lucide.min.js") });
    if (url.includes("tabler-nodes-outline"))
      return route.fulfill({ path: resolve("tests/fixtures/vendor/tabler-nodes-outline.json"), contentType: "application/json", headers: { "access-control-allow-origin": "*" } });
    return route.abort();
  });
  await page.goto(`${APP}#/composer`);
  await page.evaluate((legacy) => {
    localStorage.clear();
    localStorage.setItem("coret-composer-v1", JSON.stringify(legacy));
  }, hw.storage["coret-composer-v1"]);
  await page.reload();
  await expect(page.locator(".ic-toast")).toContainText("Data lama diimpor: set Hand-writing");
  await expect(page.locator(".ic-page:not(.ic-page--new)")).toHaveCount(3);
  await expect(page.locator(".ic-topbar__info").first()).toContainText("Hand-writing 2.0.0");
  /* ikon Tabler ikut dirender setelah pustaka termuat; tanpa dasharray */
  await expect(page.locator('.ic-page__card[data-select] svg > g path').last()).toBeVisible();
  const cards = await page.locator(".ic-page__card[data-select] svg").evaluateAll((els) => els.map((e) => e.outerHTML));
  for (const svg of cards) expect(svg).not.toMatch(/stroke-dasharray|pathLength/);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("icon-studio-v1") || "{}"));
  expect(stored.migrations).toContain("003-from-hand-writing");
  expect(stored.documents.map((/** @type {any} */ d) => d.style.family)).toEqual(["hand-writing"]);
  await page.reload();
  await expect(page.locator(".ic-toast")).toBeHidden();
  const again = await page.evaluate(() => ({
    docs: JSON.parse(localStorage.getItem("icon-studio-v1") || "{}").documents.length,
    legacy: !!localStorage.getItem("coret-composer-v1"),
  }));
  expect(again).toEqual({ docs: 1, legacy: true });
});

test("gaya.json coret-composer (family coret) yang ditempel di area impor menjadi set Hand-writing", async ({
  page,
}) => {
  await offline(page);
  await page.goto(`${APP}#/builder`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('[data-name="manifest-text"]').fill(JSON.stringify(hw.gayaJson));
  await page.locator('[data-action="import-text"]').click();
  await expect(page).toHaveURL(/#\/composer$/);
  await expect(page.locator(".ic-toast")).toContainText("2 ikon hand-writing diimpor. 1 ikon dilewati: bukan ikon pustaka");
  await expect(page.locator(".ic-page:not(.ic-page--new)")).toHaveCount(2);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("icon-studio-v1") || "{}"));
  const doc = stored.documents.find((/** @type {any} */ d) => d.style.family === "hand-writing");
  expect(doc.style.engine["hand-writing"].acc).toBe("#F28B82");
  expect(JSON.stringify(stored)).not.toContain('"family":"coret"');
});
