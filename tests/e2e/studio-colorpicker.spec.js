// @ts-check
/**
 * Pemilih warna `.ic-colorpicker`: dari swatch, hex, urungkan, Preset saya, palet kurasi, harmoni,
 * keyboard, dan ekspor Canva tetap ≤ 5 warna.
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openPanel } from "./studio-panels.js";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;
const VENDOR = resolve("tests/fixtures/vendor");
const PICKER = ".ic-colorpicker";

/** @param {import("@playwright/test").Page} page @param {string} hash */
async function open(page, hash) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("file:")) return route.continue();
    if (url.includes("jszip")) return route.fulfill({ path: `${VENDOR}/jszip.min.js`, contentType: "application/javascript" });
    if (url.includes("lucide.min.js")) return route.fulfill({ path: `${VENDOR}/lucide.min.js`, contentType: "application/javascript" });
    const cors = { "access-control-allow-origin": "*" };
    if (url.includes("tabler-nodes-outline")) return route.fulfill({ path: `${VENDOR}/tabler-nodes-outline.json`, contentType: "application/json", headers: cors });
    if (url.includes("core-free-icons")) return route.fulfill({ path: `${VENDOR}/hugeicons.mjs`, contentType: "application/javascript", headers: cors });
    if (url.includes("lucide-static@1.52.0/tags.json")) return route.fulfill({ path: `${VENDOR}/lucide-tags.json`, contentType: "application/json", headers: cors });
    if (url.includes("@tabler/icons@3.49.0/icons.json")) return route.fulfill({ path: `${VENDOR}/tabler-icons.json`, contentType: "application/json", headers: cors });
    return route.abort();
  });
  await page.goto(`${APP}${hash}`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

/** Set contoh di Composer dengan tab Warna panel Gaya terbuka. @param {import("@playwright/test").Page} page */
async function openComposerColors(page) {
  await open(page, "#/composer");
  await page.click('[data-action="load-preset"]');
  await openPanel(page, "composer-style");
  await page.click('[data-panel="composer-style"] [role="tab"][data-value="warna"]');
}

/** @param {import("@playwright/test").Page} page @param {string} name */
const trigger = (page, name) => page.locator(`[data-ic="colorpicker"][data-name="${name}"]`);

/** Gaya dokumen aktif yang tersimpan di icon-studio-v1. @param {import("@playwright/test").Page} page */
const activeStyle = (page) =>
  page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("icon-studio-v1") || "{}");
    return s.documents.find((/** @type {any} */ d) => d.id === s.activeId).style;
  });

/** @param {import("@playwright/test").Page} page @param {string} hex tanpa # */
async function typeHex(page, hex) {
  const input = page.locator(`${PICKER} [data-cp="hex"]`);
  await input.fill(hex);
  await input.press("Enter");
}

test.describe("Icon Studio · pemilih warna", () => {
  test("Edit: buka dari swatch, ketik hex, warna lapisan berubah, ⌘Z mengembalikan", async ({ page }) => {
    await open(page, "#/composer");
    await page.click('[data-action="load-preset"]');
    await page.locator(".ic-page__card[data-open]").nth(2).dblclick();
    await expect(page).toHaveURL(/#\/composer\/edit\//);
    await page.locator('[data-action="layer-select"][data-layer="main"]').click();
    await openPanel(page, "edit-layers");
    await trigger(page, "edit-line").click();
    await expect(page.locator(PICKER)).toBeVisible();
    await expect(page.locator(`${PICKER} [data-cp="follow"]`)).toBeVisible();
    await typeHex(page, "2eb67d");
    await expect(page.locator(".ic-artboard__art g[stroke='#2EB67D']").first()).toBeVisible();
    await expect(trigger(page, "edit-line")).toHaveAttribute("data-value", "#2EB67D");
    await expect(trigger(page, "edit-line")).toHaveAttribute("aria-pressed", "true");
    /* Esc menutup pemilih tanpa keluar dari mode edit, fokus kembali ke pemicu */
    await page.keyboard.press("Escape");
    await expect(page.locator(PICKER)).toBeHidden();
    await expect(page).toHaveURL(/#\/composer\/edit\//);
    await expect(trigger(page, "edit-line")).toBeFocused();
    await page.keyboard.press("Control+z");
    await expect(page.locator(".ic-artboard__art g[stroke='#2EB67D']")).toHaveCount(0);
    await expect(trigger(page, "edit-line")).toHaveAttribute("data-value", "");
    /* "Ikuti warna set" mengembalikan lapisan ke warna set */
    await trigger(page, "edit-line").click();
    await typeHex(page, "E2552D");
    await expect(page.locator(".ic-artboard__art g[stroke='#E2552D']").first()).toBeVisible();
    await page.locator(`${PICKER} [data-cp="follow"]`).click();
    await expect(page.locator(".ic-artboard__art g[stroke='#E2552D']")).toHaveCount(0);
  });

  test("Preset saya: tambah, tetap ada setelah muat ulang, dan menggantikan swatch panel", async ({ page }) => {
    await openComposerColors(page);
    await trigger(page, "style:accent").click();
    await typeHex(page, "123456");
    await page.locator(`${PICKER} [data-action="cp-preset-add"]`).click();
    await expect(page.locator(`${PICKER} [aria-label="Preset saya"] [data-color="#123456"]`)).toBeVisible();
    await typeHex(page, "ABCDEF");
    await page.locator(`${PICKER} [data-action="cp-preset-add"]`).click();
    await expect(page.locator(`${PICKER} [aria-label="Preset saya"] [data-color]`)).toHaveCount(2);
    /* urutkan: preset terpilih (#ABCDEF) digeser ke kiri */
    await page.locator(`${PICKER} [data-action="cp-preset-move"][data-dir="-1"]`).click();
    await expect(page.locator(`${PICKER} [aria-label="Preset saya"] [data-color]`).first()).toHaveAttribute("data-color", "#ABCDEF");

    await page.reload();
    await openPanel(page, "composer-style");
    await page.click('[data-panel="composer-style"] [role="tab"][data-value="warna"]');
    await trigger(page, "style:accent").click();
    await expect(page.locator(`${PICKER} [aria-label="Preset saya"] [data-color]`)).toHaveCount(2);

    /* swatch panel memakai preset, lalu kembali ke bawaan */
    await page.locator(`${PICKER} [data-action="cp-source"][data-value="preset"]`).click();
    await expect(page.locator('.ic-swatches[data-name="style:accent"] button')).toHaveCount(2);
    await expect(page.locator('.ic-swatches[data-name="style:accent"] button[data-value="#123456"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await page.locator('.ic-swatches[data-name="style:accent"] button[data-value="#123456"]').click();
    await expect(trigger(page, "style:accent")).toHaveAttribute("data-value", "#123456");
    await trigger(page, "style:accent").click();
    await page.locator(`${PICKER} [data-action="cp-source"][data-value="bawaan"]`).click();
    await expect(page.locator('.ic-swatches[data-name="style:accent"] button[data-value="#F05A5A"]')).toBeVisible();
    /* hapus preset terpilih */
    await page.locator(`${PICKER} [aria-label="Preset saya"] [data-color="#123456"]`).click();
    await page.locator(`${PICKER} [data-action="cp-preset-remove"]`).click();
    await expect(page.locator(`${PICKER} [aria-label="Preset saya"] [data-color]`)).toHaveCount(1);
  });

  test("palet kurasi dan harmoni diterapkan ke set sebagai satu langkah urungkan", async ({ page }) => {
    await openComposerColors(page);
    await trigger(page, "style:accent").click();
    await page.locator(`${PICKER} [role="tab"][data-value="palet"]`).click();
    await page.locator(`${PICKER} [data-action="cp-palette"][data-id="laut-dalam"]`).click();
    await expect(trigger(page, "style:ink")).toHaveAttribute("data-value", "#14213D");
    await expect(trigger(page, "style:accent")).toHaveAttribute("data-value", "#1A73E8");
    await expect(page.locator(".ic-pagegrid [fill='#1A73E8']").first()).toBeAttached();
    expect((await activeStyle(page)).colors.main.fill).toBe("#5BA8FF");
    /* tab Palet tetap terbuka setelah render ulang */
    await expect(page.locator(`${PICKER} [role="tab"][data-value="palet"]`)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator('[data-panel="composer-style"]')).toContainText("warna di set");

    await page.locator(`${PICKER} [role="tab"][data-value="harmoni"]`).click();
    await typeHex(page, "FF0000");
    await expect(page.locator(".ic-pagegrid [fill='#FF0000']").first()).toBeAttached();
    await expect(page.locator(`${PICKER} [aria-label="Harmoni triadik"] [data-color]`)).toHaveCount(3);
    await expect(page.locator(`${PICKER} [aria-label="Harmoni komplementer"] [data-color="#00FFFF"]`)).toBeVisible();
    await page.locator(`${PICKER} [data-action="cp-harmony"][data-kind="complementary"]`).click();
    await expect.poll(async () => (await activeStyle(page)).colors.main.fill).toBe("#00FFFF");
    expect((await activeStyle(page)).accent).toBe("#FF0000");
    /* urungkan: harmoni satu langkah, lalu hex satu langkah */
    await page.keyboard.press("Escape");
    await page.keyboard.press("Control+z");
    await expect.poll(async () => (await activeStyle(page)).colors.main.fill).toBe("#5BA8FF");
    await page.keyboard.press("Control+z");
    await expect(trigger(page, "style:accent")).toHaveAttribute("data-value", "#1A73E8");
  });

  test("pemilih bisa dipakai dengan keyboard", async ({ page }) => {
    await openComposerColors(page);
    await trigger(page, "style:accent").focus();
    await page.keyboard.press("Enter");
    const hue = page.locator(`${PICKER} [data-cp="hue"]`);
    await expect(hue).toBeFocused();
    const start = Number(await hue.getAttribute("aria-valuenow"));
    await page.keyboard.press("Shift+ArrowRight");
    await expect(hue).toHaveAttribute("aria-valuenow", String((start + 10) % 360));
    await page.keyboard.press("Tab");
    const sv = page.locator(`${PICKER} [data-cp="sv"]`);
    await expect(sv).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    const committed = await trigger(page, "style:accent").getAttribute("data-value");
    expect(committed).not.toBe("#C3DC1E");
    await expect(page.locator(`${PICKER} [data-cp="hex"]`)).toHaveValue(String(committed).slice(1));
    await page.keyboard.press("Escape");
    await expect(page.locator(PICKER)).toBeHidden();
    await expect(trigger(page, "style:accent")).toBeFocused();
  });

  test("Builder: palet diterapkan, ekspor ZIP tetap direct fill dengan ≤ 5 warna", async ({ page }) => {
    await open(page, "#/builder");
    await page.locator('[data-action="import-sample"]').click();
    await openPanel(page, "builder-icon");
    await page.click('[data-panel="builder-icon"] [role="tab"][data-value="manifest"]');
    await trigger(page, "b-color:accent").click();
    await page.locator(`${PICKER} [role="tab"][data-value="palet"]`).click();
    await page.locator(`${PICKER} [data-action="cp-palette"][data-id="senja-hangat"]`).click();
    await expect(trigger(page, "b-color:ink")).toHaveAttribute("data-value", "#3B2A2A");
    await expect(trigger(page, "b-color:accent")).toHaveAttribute("data-value", "#E2552D");
    await page.keyboard.press("Escape");

    await page.locator('.ic-topbar [data-action="export"]').click();
    await page.evaluate(() => {
      const w = /** @type {any} */ (window);
      w.__zip = null;
      URL.createObjectURL = (blob) => {
        w.__zip = blob;
        return "blob:uji";
      };
      HTMLAnchorElement.prototype.click = () => {};
    });
    await openPanel(page, "builder-export");
    await page.locator('[data-action="b-export"]').click();
    await page.waitForFunction(() => /** @type {any} */ (window).__zip instanceof Blob, null, { timeout: 30000 });
    const checks = await page.evaluate(async () => {
      const w = /** @type {any} */ (window);
      const z = await w.JSZip.loadAsync(w.__zip);
      const names = Object.keys(z.files).filter((n) => n.endsWith(".svg"));
      const out = [];
      for (const name of names) {
        const svg = await z.files[name].async("string");
        let again = null;
        try {
          w.__iconStudio.directFillSvgFile(svg);
        } catch (e) {
          again = /** @type {Error} */ (e).message;
        }
        const fills = new Set([...svg.matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1].toUpperCase()));
        out.push({ name, again, colors: fills.size, stroke: /\sstroke(?:-|=)/.test(svg), accent: fills.has("#E2552D") });
      }
      return out;
    });
    expect(checks.length).toBeGreaterThan(10);
    for (const r of checks) {
      expect(r.again, r.name).toBeNull();
      expect(r.colors, r.name).toBeGreaterThan(0);
      expect(r.colors, r.name).toBeLessThanOrEqual(5);
      expect(r.stroke, r.name).toBe(false);
    }
    expect(checks.some((r) => r.accent)).toBe(true);
  });
});

/** Kotak elemen berada utuh di dalam viewport. @param {import("@playwright/test").Page} page @param {import("@playwright/test").Locator} loc */
async function expectInViewport(page, loc, what) {
  const box = await loc.boundingBox();
  const vp = page.viewportSize();
  expect(box, what).not.toBeNull();
  if (!box || !vp) return;
  expect(box.x, what).toBeGreaterThanOrEqual(0);
  expect(box.y, what).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width, what).toBeLessThanOrEqual(vp.width + 0.5);
  expect(box.y + box.height, what).toBeLessThanOrEqual(vp.height + 0.5);
}

for (const [width, height] of [
  [1440, 900],
  [1280, 720],
]) {
  test.describe(`pemilih warna di ${width}×${height}`, () => {
    /** Buka pemilih lalu pastikan popover, roda, dan kolom hex utuh di viewport. @param {import("@playwright/test").Page} page @param {string} name */
    async function checkPicker(page, name) {
      await trigger(page, name).click();
      const picker = page.locator(PICKER);
      await expect(picker).toBeVisible();
      await expectInViewport(page, picker, `popover ${name}`);
      await expectInViewport(page, picker.locator('[data-cp="wheel"]'), `roda ${name}`);
      await expectInViewport(page, picker.locator('[data-cp="hex"]'), `hex ${name}`);
      /* pindah ke tab Palet (paling panjang): popover tetap di dalam viewport */
      await picker.locator('[role="tab"][data-value="palet"]').click();
      await expectInViewport(page, picker, `popover ${name} tab Palet`);
      const last = picker.locator('[data-action="cp-palette"]').last();
      await last.scrollIntoViewIfNeeded();
      await expectInViewport(page, last, `palet terakhir ${name}`);
      await expectInViewport(page, picker.locator('[data-cp="wheel"]'), `roda ${name} setelah gulir`);
      await page.keyboard.press("Escape");
      await expect(picker).toBeHidden();
    }

    test("Composer Tinta dan Aksen; palet terakhir bisa dicapai dan diterapkan", async ({ page }) => {
      await openComposerColors(page);
      await page.setViewportSize({ width, height });
      await checkPicker(page, "style:ink");
      await checkPicker(page, "style:accent");
      await trigger(page, "style:accent").click();
      await page.locator(`${PICKER} [role="tab"][data-value="palet"]`).click();
      const retro = page.locator(`${PICKER} [data-action="cp-palette"][data-id="retro-pop"]`);
      await retro.scrollIntoViewIfNeeded();
      await retro.click();
      await expect(trigger(page, "style:accent")).toHaveAttribute("data-value", "#F05A5A");
      /* daftar tidak melompat ke atas setelah render ulang */
      await expectInViewport(page, retro, "Retro Pop setelah diterapkan");
    });

    test("Composer · Edit Garis dan Isian", async ({ page }) => {
      await open(page, "#/composer");
      await page.setViewportSize({ width, height });
      await page.click('[data-action="load-preset"]');
      await page.locator(".ic-page__card[data-open]").nth(2).dblclick();
      await page.locator('[data-action="layer-select"][data-layer="main"]').click();
      await openPanel(page, "edit-layers");
      await trigger(page, "edit-line").scrollIntoViewIfNeeded();
      await checkPicker(page, "edit-line");
      await trigger(page, "edit-fill").scrollIntoViewIfNeeded();
      await checkPicker(page, "edit-fill");
    });

    test("Builder Tinta dan Aksen pack", async ({ page }) => {
      await open(page, "#/builder");
      await page.setViewportSize({ width, height });
      await page.locator('[data-action="import-sample"]').click();
      await openPanel(page, "builder-icon");
      await page.click('[data-panel="builder-icon"] [role="tab"][data-value="manifest"]');
      await trigger(page, "b-color:ink").scrollIntoViewIfNeeded();
      await checkPicker(page, "b-color:ink");
      await trigger(page, "b-color:accent").scrollIntoViewIfNeeded();
      await checkPicker(page, "b-color:accent");
    });
  });
}
