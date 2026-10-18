// @ts-check
/**
 * Alur Builder di Icon Studio (Fase 2b langkah 5): impor, periksa, perbaiki, ekspor ZIP.
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;
const VENDOR = resolve("tests/fixtures/vendor");

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
        headers: { "access-control-allow-origin": "*" },
      });
    if (url.includes("core-free-icons"))
      return route.fulfill({
        path: `${VENDOR}/hugeicons.mjs`,
        contentType: "application/javascript",
        headers: { "access-control-allow-origin": "*" },
      });
    if (url.includes("lucide-static@1.52.0/tags.json"))
      return route.fulfill({
        path: `${VENDOR}/lucide-tags.json`,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
      });
    if (url.includes("@tabler/icons@3.49.0/icons.json"))
      return route.fulfill({
        path: `${VENDOR}/tabler-icons.json`,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
      });
    return route.abort();
  });
  await page.goto(`${APP}#/builder`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

test.describe("Icon Studio · Builder", () => {
  test("impor contoh: kartu per slide, filter, dan pratinjau gaya", async ({
    page,
  }) => {
    await open(page);
    await expect(page.locator(".ic-dropzone")).toBeVisible();
    await page.locator('[data-action="import-sample"]').click();
    await expect(page.locator('.ic-step[aria-current="step"]')).toContainText(
      "Periksa",
    );
    const cards = page.locator(".ic-iconcard[data-select]");
    const total = await cards.count();
    expect(total).toBeGreaterThan(20);
    await expect(page.locator(".ic-slidegroup").first()).toBeVisible();
    await page.locator('input[data-name="b-group"]').uncheck();
    await expect(page.locator(".ic-slidegroup")).toHaveCount(0);
    await expect(cards).toHaveCount(total);
    await page
      .locator('[data-name="b-filter"] button[data-value="extra"]')
      .click();
    const extra = await cards.count();
    expect(extra).toBeLessThan(total);
    await page
      .locator('[data-name="b-filter"] button[data-value="all"]')
      .click();
    const before = await cards
      .first()
      .locator("svg")
      .first()
      .getAttribute("stroke-width");
    const trigger = page.locator('[data-name="b-preview"] .ic-select__trigger');
    await trigger.click();
    await page
      .locator('[data-name="b-preview"] [role="option"][data-value="A"]')
      .click();
    await expect(cards.first().locator("svg").first()).not.toHaveAttribute(
      "stroke-width",
      before || "",
    );
  });

  test("nama tak dikenal diberi saran dan bisa diperbaiki", async ({
    page,
  }) => {
    await open(page);
    const manifest = {
      format: "tib-manifest",
      version: 2,
      deck: { title: "Uji", slides: 1 },
      pack: { en: "Test", id: "Uji" },
      style: { family: "classic", mode: "A" },
      icons: [
        {
          id: "satu",
          name: { en: "One", id: "Satu" },
          main: "lu:umbrela",
          mod: "check",
          anchor: "BR",
          slides: [1],
        },
      ],
    };
    await page
      .locator('[data-name="manifest-text"]')
      .fill(JSON.stringify(manifest));
    await page.locator('[data-action="import-text"]').click();
    await expect(page.locator(".ic-iconcard .ic-flag")).toHaveText("masalah");
    await page.click(
      '[data-panel="builder-icon"] [role="tab"][data-value="manifest"]',
    );
    const fix = page.locator('[data-action="b-fix"]');
    await expect(fix).toContainText("lu:umbrella");
    await fix.click();
    await expect(page.locator(".ic-iconcard .ic-flag")).toHaveCount(0);
  });

  test("ubah id dan keluarkan ikon dari pack", async ({ page }) => {
    await open(page);
    await page.locator('[data-action="import-sample"]').click();
    const id = page.locator('[data-name="b-id"] input');
    await id.fill("Ikon Baru Uji");
    await id.press("Enter");
    await expect(
      page.locator('.ic-iconcard[aria-selected="true"] .ic-iconcard__id'),
    ).toHaveText("ikon-baru-uji");
    await page.locator('input[data-name="b-on"]').uncheck();
    await expect(
      page.locator('.ic-iconcard[aria-selected="true"] .ic-flag'),
    ).toHaveText("keluar");
  });

  test("langkah Ekspor: lembar Resource Page dan unduh ZIP", async ({
    page,
  }) => {
    await open(page);
    await page.locator('[data-action="import-sample"]').click();
    await page.locator('.ic-topbar [data-action="export"]').click();
    await expect(page.locator('.ic-step[aria-current="step"]')).toContainText(
      "Ekspor",
    );
    const cells = page.locator(".ic-sheet__cell");
    const included = await page
      .locator('.ic-sheet__cell[aria-pressed="true"]')
      .count();
    expect(included).toBeGreaterThan(0);
    await cells.first().click();
    await expect(
      page.locator('.ic-sheet__cell[aria-pressed="true"]'),
    ).toHaveCount(included - 1);
    await page.evaluate(() => {
      window.__zip = null;
      URL.createObjectURL = (blob) => {
        window.__zip = blob;
        return "blob:uji";
      };
      HTMLAnchorElement.prototype.click = () => {};
    });
    await page.locator('[data-action="b-export"]').click();
    await page
      .waitForFunction(() => window.__zip instanceof Blob, null, {
        timeout: 15000,
      })
      .catch(async () => {
        throw new Error(
          "ZIP tidak terbuat: " +
            (await page.locator('[data-role="export-status"]').textContent()),
        );
      });
    const names = await page.evaluate(async () =>
      Object.keys((await window.JSZip.loadAsync(window.__zip)).files),
    );
    for (const f of [
      "metadata.csv",
      "metadata-internal.csv",
      "submission-profile.json",
      "resource-page.html",
      "manifest-final.json",
      "LICENSES.txt",
    ])
      expect(names).toContain(f);
    expect(
      names.some((n) => n.startsWith("aksen/slot-deck/") && n.endsWith(".svg")),
    ).toBe(true);
    await expect(page.locator('[data-role="export-status"]')).toContainText(
      "diekspor",
    );
  });
});
