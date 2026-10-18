// @ts-check
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");

/** @param {import("@playwright/test").Page} page */
export async function installOfflineRoutes(page) {
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.includes("jszip")) {
      return route.fulfill({
        path: path.join(root, "tests/fixtures/vendor/jszip.min.js"),
        contentType: "application/javascript",
      });
    }
    if (url.includes("lucide.min.js")) {
      return route.fulfill({
        path: path.join(root, "tests/fixtures/vendor/lucide.min.js"),
        contentType: "application/javascript",
      });
    }
    return route.abort();
  });
}

/**
 * @param {import("@playwright/test").Page} page
 * @param {string} file
 */
export async function openHtml(page, file) {
  await installOfflineRoutes(page);
  await page.evaluate(() => {
    let state = 0x1a2b3c4d;
    Math.random = () => {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 0x100000000;
    };
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(await readFile(path.join(root, file), "utf8"), {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(100);
  if (errors.length) throw new Error(errors.join("\n"));
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
 */
export async function captureTemplateIconBuilderZip(page, manifest) {
  await page.locator("#src").fill(JSON.stringify(manifest));
  await page.locator("#doImport").click();
  await page.locator('[data-view="export"]').click();
  await page.evaluate(() => {
    window.__goldenBlob = null;
    URL.createObjectURL = (blob) => {
      window.__goldenBlob = blob;
      return "blob:golden";
    };
    HTMLAnchorElement.prototype.click = () => {};
  });
  await page.locator("#exX").uncheck();
  await page.locator("#exA").check();
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
