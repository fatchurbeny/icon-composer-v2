// @ts-check
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");

const GOLDEN_ORIGIN = "http://golden.test/";

/** Berkas vendor offline. Urutan penting: pola yang lebih spesifik lebih dulu. */
const VENDOR_ROUTES = [
  ["jszip", "jszip.min.js", "application/javascript"],
  ["lucide.min.js", "lucide.min.js", "application/javascript"],
  ["lucide-static@1.52.0/tags.json", "lucide-tags.json", "application/json"],
  [
    "tabler-nodes-outline.json",
    "tabler-nodes-outline.json",
    "application/json",
  ],
  ["@tabler/icons@3.49.0/icons.json", "tabler-icons.json", "application/json"],
  ["core-free-icons", "hugeicons.mjs", "application/javascript"],
];

/**
 * @param {import("@playwright/test").Page} page
 * @param {string} [html] isi halaman yang dilayani di GOLDEN_ORIGIN
 */
export async function installOfflineRoutes(page, html) {
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (html && url === GOLDEN_ORIGIN) {
      return route.fulfill({ body: html, contentType: "text/html" });
    }
    const hit = VENDOR_ROUTES.find(([pattern]) => url.includes(pattern));
    if (hit) {
      return route.fulfill({
        path: path.join(root, "tests/fixtures/vendor", hit[1]),
        contentType: hit[2],
        headers: { "access-control-allow-origin": "*" },
      });
    }
    return route.abort();
  });
}

/**
 * Membuka file HTML dengan Math.random berbenih.
 * Kalau `storage` diberikan, halaman dibuka di origin uji supaya localStorage bisa diisi lebih dulu.
 * @param {import("@playwright/test").Page} page
 * @param {string} file
 * @param {{storage?: Record<string, unknown>}} [options]
 */
export async function openHtml(page, file, options = {}) {
  const html = await readFile(path.join(root, file), "utf8");
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  if (options.storage) {
    await installOfflineRoutes(page, html);
    await page.addInitScript((storage) => {
      let state = 0x1a2b3c4d;
      Math.random = () => {
        state = (1664525 * state + 1013904223) >>> 0;
        return state / 0x100000000;
      };
      for (const [key, value] of Object.entries(storage)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }, options.storage);
    await page.goto(GOLDEN_ORIGIN, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");
  } else {
    await installOfflineRoutes(page);
    await page.evaluate(() => {
      let state = 0x1a2b3c4d;
      Math.random = () => {
        state = (1664525 * state + 1013904223) >>> 0;
        return state / 0x100000000;
      };
    });
    await page.setContent(html, { waitUntil: "domcontentloaded" });
  }
  await page.waitForTimeout(100);
  if (errors.length) throw new Error(errors.join("\n"));
}

/**
 * Menangkap seluruh panel Bentuk Icon Composer (objek utama + pengubah) dan artboard.
 * @param {import("@playwright/test").Page} page
 * @param {string} family
 */
export async function captureIconComposerBins(page, family) {
  await page.locator(`[data-family="${family}"]`).click();
  return page.evaluate(() =>
    ["art", "mainBin", "modBin"]
      .map((id) => `<!-- ${id} -->\n${document.getElementById(id).innerHTML}`)
      .join("\n"),
  );
}

/** @param {import("@playwright/test").Page} page */
export async function captureIconComposer(page, family) {
  await page.locator(`[data-family="${family}"]`).click();
  return page.locator("#art svg").evaluate((svg) => svg.outerHTML);
}

/** @param {import("@playwright/test").Page} page */
export async function captureTemplateIconBuilder(page, style) {
  if (await page.locator("#loadSample").isVisible()) {
    await page.locator("#loadSample").click();
  }
  await page.locator('[data-view="review"]').click();
  await page.locator(`[data-pv="${style}"]`).click();
  return page.locator("#bArt svg").evaluate((svg) => svg.outerHTML);
}

/**
 * @param {import("@playwright/test").Page} page
 * @param {object} manifest
 * @param {string[]} [styles] mode ekspor yang dicentang (X, A, B)
 */
export async function captureTemplateIconBuilderZip(
  page,
  manifest,
  styles = ["A"],
) {
  await page.locator("#src").fill(JSON.stringify(manifest));
  await page.locator("#doImport").click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(100);
  await page.locator('[data-view="export"]').click();
  await page.evaluate(() => {
    window.__goldenBlob = null;
    URL.createObjectURL = (blob) => {
      window.__goldenBlob = blob;
      return "blob:golden";
    };
    HTMLAnchorElement.prototype.click = () => {};
  });
  for (const mode of ["X", "A", "B"]) {
    await page.locator(`#ex${mode}`).setChecked(styles.includes(mode));
  }
  await page.locator("#exGo").click();
  await page.waitForFunction(() => window.__goldenBlob instanceof Blob, null, {
    timeout: 30_000,
  });
  return page.evaluate(async () => {
    const zip = await window.JSZip.loadAsync(window.__goldenBlob);
    const result = {};
    for (const name of Object.keys(zip.files).sort()) {
      const entry = zip.files[name];
      if (entry.dir) {
        result[name] = null;
        continue;
      }
      let content = await entry.async("string");
      if (name.endsWith("manifest-final.json")) {
        content = content.replace(
          /"exported_at"\s*:\s*"[^"]*"/,
          '"exported_at":"<dinormalisasi>"',
        );
      }
      result[name] = content;
    }
    return result;
  });
}

export { root };
