// @ts-check
/**
 * Alur Tinjau di Icon Studio (Fase 2b langkah 6): lembar kontak, pemeriksaan, metadata, unduhan.
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openPanel } from "./studio-panels.js";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;
const VENDOR = resolve("tests/fixtures/vendor");
const H = { "access-control-allow-origin": "*" };

/** @param {import("@playwright/test").Page} page */
async function open(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("file:")) return route.continue();
    if (url.includes("jszip"))
      return route.fulfill({
        path: `${VENDOR}/jszip.min.js`,
        contentType: "application/javascript",
      });
    if (url.includes("lucide.min.js"))
      return route.fulfill({
        path: `${VENDOR}/lucide.min.js`,
        contentType: "application/javascript",
      });
    if (url.includes("tabler-nodes-outline"))
      return route.fulfill({
        path: `${VENDOR}/tabler-nodes-outline.json`,
        contentType: "application/json",
        headers: H,
      });
    if (url.includes("core-free-icons"))
      return route.fulfill({
        path: `${VENDOR}/hugeicons.mjs`,
        contentType: "application/javascript",
        headers: H,
      });
    if (url.includes("lucide-static@1.52.0/tags.json"))
      return route.fulfill({
        path: `${VENDOR}/lucide-tags.json`,
        contentType: "application/json",
        headers: H,
      });
    if (url.includes("@tabler/icons@3.49.0/icons.json"))
      return route.fulfill({
        path: `${VENDOR}/tabler-icons.json`,
        contentType: "application/json",
        headers: H,
      });
    return route.abort();
  });
  await page.goto(`${APP}#/composer`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.click('[data-action="load-preset"]');
  await page.locator('.ic-persona[href="#/tinjau"]').click();
  await expect(page.locator(".ic-sheet__cell").first()).toBeVisible();
}

/** @param {import("@playwright/test").Page} page */
async function interceptDownload(page) {
  await page.evaluate(() => {
    window.__dl = null;
    URL.createObjectURL = (blob) => {
      window.__dl = blob;
      return "blob:uji";
    };
    HTMLAnchorElement.prototype.click = () => {};
  });
}

test.describe("Icon Studio · Tinjau", () => {
  test("klik mengeluarkan ikon, klik lagi memasukkan, klik dua kali membuka Edit", async ({
    page,
  }) => {
    await open(page);
    const cells = page.locator(".ic-sheet__cell");
    const n = await cells.count();
    await expect(page.locator(".ic-statusbar")).toContainText(
      `${n} / ${n} diunduh`,
    );
    await cells.nth(3).click();
    await expect(cells.nth(3)).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".ic-statusbar")).toContainText(
      `${n - 1} / ${n} diunduh`,
    );
    await page.waitForTimeout(500);
    await cells.nth(3).click();
    await expect(cells.nth(3)).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(500);
    await cells.nth(5).dblclick();
    await expect(page).toHaveURL(/#\/composer\/edit\//);
    await page.locator('.ic-persona[href="#/tinjau"]').click();
    await expect(page.locator(".ic-sheet__cell").nth(5)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("latar, ukuran, nama file, dan Bandingkan direct fill", async ({
    page,
  }) => {
    await open(page);
    await page.locator('[data-name="t-bg"] button[data-value="dark"]').click();
    await expect(
      page.locator(".ic-alert", { hasText: "latar gelap" }),
    ).toBeVisible();
    await page.locator('[data-name="t-size"] button[data-value="32"]').click();
    const box = await page.locator(".ic-sheet__cell svg").first().boundingBox();
    expect(Math.round(box?.width || 0)).toBe(32);
    await page.locator('input[data-name="t-names"]').uncheck();
    await expect(page.locator(".ic-sheet__file").first()).toBeHidden();
    await page
      .locator('[data-name="t-compare"] button[data-value="direct"]')
      .click();
    await expect(
      page.locator('[data-name="t-compare"] button[data-value="direct"]'),
    ).toHaveAttribute("aria-pressed", "true");
    const stroked = await page
      .locator(".ic-sheet__cell svg")
      .evaluateAll((svgs) =>
        svgs.flatMap((svg) =>
          [...svg.querySelectorAll("[stroke]")]
            .filter((el) => el.getAttribute("stroke") !== "none")
            .map((el) => el.outerHTML.slice(0, 80)),
        ),
      );
    /* "ticket" bawaan IC memakai stroke-dasharray: dash dipanggang jadi geometri di jalur ekspor,
       jadi semua sel lolos direct fill tanpa stroke */
    expect(stroked).toEqual([]);
    await expect(
      page.locator(".ic-sheet__cell .ic-flag", {
        hasText: "gagal direct fill",
      }),
    ).toHaveCount(0);
    const ticket = page.locator(".ic-sheet__cell", {
      has: page.locator(".ic-sheet__file", { hasText: "tiket" }),
    });
    expect(await ticket.locator("svg path").count()).toBeGreaterThan(0);
    await expect(
      page.locator('[data-panel="tinjau-check"] .ic-row', {
        hasText: "direct fill",
      }),
    ).toContainText("siap");
  });

  test("metadata Canva mengubah contoh judul", async ({ page }) => {
    await open(page);
    await openPanel(page, "tinjau-meta");
    const field = page.locator('[data-name="t-pack-en"] input');
    await field.fill("Customer Service");
    await field.press("Enter");
    await expect(
      page.locator('[data-panel="tinjau-meta"] .ic-alert'),
    ).toContainText("Customer Service");
    await page
      .locator('[data-name="t-locale"] button[data-value="id"]')
      .click();
    await expect(
      page.locator('[data-panel="tinjau-meta"] .ic-alert'),
    ).toContainText("Ikon");
  });

  test("unduh ZIP Canva tanpa ikon yang dikeluarkan, lalu sprite", async ({
    page,
  }) => {
    await open(page);
    const cells = page.locator(".ic-sheet__cell");
    const n = await cells.count();
    const out =
      (await cells.nth(0).locator(".ic-sheet__file").textContent()) || "";
    await cells.nth(0).click();
    await interceptDownload(page);
    await openPanel(page, "tinjau-zip");
    await page.locator('[data-action="t-download"]').click();
    await page.waitForFunction(() => window.__dl instanceof Blob);
    const names = await page.evaluate(async () =>
      Object.keys((await window.JSZip.loadAsync(window.__dl)).files),
    );
    /* ADR-011: SVG Canva = direct fill, termasuk "ticket" bawaan yang garis putus-putusnya dipanggang */
    expect(names.filter((f) => f.endsWith(".svg"))).toHaveLength(n - 1);
    expect(names.some((f) => /tiket/.test(f))).toBe(true);
    expect(names).not.toContain(out);
    await expect(page.locator('[data-role="export-status"]')).not.toContainText("gagal");
    for (const f of [
      "LICENSES.txt",
      "gaya.json",
      "pratinjau.html",
      "metadata.csv",
    ])
      expect(names).toContain(f);
    await interceptDownload(page);
    await page.locator('[data-action="t-sprite"]').click();
    await page.waitForFunction(() => window.__dl instanceof Blob);
    const sprite = await page.evaluate(() => window.__dl.text());
    expect((sprite.match(/<symbol /g) || []).length).toBe(n - 1);
  });

  test("dokumen Builder ditinjau dan diunduh lewat ekspor Builder", async ({
    page,
  }) => {
    await open(page);
    await page.locator('.ic-persona[href="#/builder"]').click();
    await page.locator('[data-action="import-sample"]').click();
    await page.locator('.ic-persona[href="#/tinjau"]').click();
    await expect(
      page.locator(".ic-doctab[aria-selected='true']"),
    ).toContainText(".manifest · Lembar kontak");
    await interceptDownload(page);
    await openPanel(page, "tinjau-zip");
    await page.locator('[data-action="t-download"]').click();
    await page.waitForFunction(() => window.__dl instanceof Blob);
    const names = await page.evaluate(async () =>
      Object.keys((await window.JSZip.loadAsync(window.__dl)).files),
    );
    expect(names).toContain("manifest-final.json");
  });
});
