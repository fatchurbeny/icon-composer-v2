// @ts-check
/**
 * Alur Composer · Set di Icon Studio (Fase 2b langkah 3).
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

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
    if (url.includes("tabler-nodes-outline"))
      return route.fulfill({
        path: resolve("tests/fixtures/vendor/tabler-nodes-outline.json"),
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
      });
    return route.abort();
  });
  await page.goto(`${APP}#/composer`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.click('[data-action="load-preset"]');
}

const pages = (page) => page.locator(".ic-page:not(.ic-page--new)");
const info = (page) => page.locator(".ic-topbar .ic-topbar__info.ic-mono");

test.describe("Icon Studio · Composer · Set", () => {
  test("tambah, duplikat (dobel), dan hapus ikon", async ({ page }) => {
    await open(page);
    const n = await pages(page).count();
    await expect(info(page)).toContainText(`${n} ikon`);
    await page.locator(".ic-page__card[data-select]").nth(1).click();
    await page.click('[aria-label="Duplikat"]');
    await expect(pages(page)).toHaveCount(n + 1);
    await expect(
      page.locator('.ic-page .ic-flag[data-level="err"]'),
    ).toHaveCount(2);
    await expect(
      page.locator('[data-panel="composer-rep"] .ic-stat').first(),
    ).toContainText("2");
    await page.click('[aria-label="Hapus ikon"]');
    await expect(pages(page)).toHaveCount(n);
    await expect(
      page.locator('.ic-page .ic-flag[data-level="err"]'),
    ).toHaveCount(0);
    await page.click('[aria-label="Tambah ikon baru"]');
    await expect(pages(page)).toHaveCount(n + 1);
    await expect(
      page.locator('.ic-page__card[aria-selected="true"]'),
    ).toHaveCount(1);
  });

  test("gaya: pindah ke Aksen, ubah tebal garis, mode warna", async ({
    page,
  }) => {
    await open(page);
    await page
      .locator('[data-name="engine"] button[data-value="accent"]')
      .click();
    await expect(page.locator(".ic-topbar__info").first()).toContainText(
      "Aksen",
    );
    await expect(
      page.locator('[data-name="style:sw"] .ic-field input'),
    ).toHaveValue("3.5");
    const sw = page.locator('[data-name="style:sw"] .ic-field input');
    await sw.fill("2.5");
    await sw.press("Enter");
    await expect(
      page.locator('[data-name="style:sw"] .ic-field input'),
    ).toHaveValue("2.5");
    await expect(
      page.locator(".ic-page__card[data-select] svg").first(),
    ).toHaveAttribute("stroke-width", "2.5");
    await page
      .locator('[data-name="engine"] button[data-value="classic"]')
      .click();
    await expect(
      page.locator('[data-name="style:sw"] .ic-field input'),
    ).toHaveValue("2");
    await page.click(
      '[data-panel="composer-style"] [role="tab"][data-value="warna"]',
    );
    await page
      .locator('[data-name="style:pref"] button[data-value="B"]')
      .click();
    await expect(
      page.locator('[data-name="style:pref"] button[data-value="B"]'),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.locator(
        '[data-panel="composer-style"] [role="tab"][data-value="warna"]',
      ),
    ).toHaveAttribute("aria-selected", "true");
  });

  test("urut nama dan jumlah kolom tidak mengubah urutan set", async ({
    page,
  }) => {
    await open(page);
    const first = await page.locator(".ic-page__label").first().textContent();
    const trigger = page.locator('[data-name="view-sort"] .ic-select__trigger');
    await trigger.click();
    await page
      .locator('[data-name="view-sort"] [role="option"][data-value="name"]')
      .click();
    const labels = await page
      .locator(".ic-page:not(.ic-page--new) .ic-page__label")
      .allTextContents();
    expect(labels).toEqual(
      [...labels].sort((a, b) => a.localeCompare(b, "id")),
    );
    await expect(
      page.locator('[data-panel="composer-pages"] .ic-row__name').first(),
    ).toHaveText(first || "");
    await page
      .locator('[data-name="view-cols"] button[data-step="-1"]')
      .click();
    await expect(page.locator('[data-name="view-cols"] input')).toHaveValue(
      "7",
    );
  });

  test("pustaka: cari kata Indonesia, filter Isi, klik mengganti objek utama", async ({
    page,
  }) => {
    await open(page);
    await page.locator(".ic-page__card[data-select]").first().click();
    await page.click(
      '[data-panel="composer-pages"] [role="tab"][data-value="pustaka"]',
    );
    await page.locator('[data-name="lib-query"] input').fill("kopi");
    await expect(
      page.locator('[data-action="lib-pick"][data-key="lu:coffee"]'),
    ).toBeVisible();
    await page
      .locator('[data-name="lib-shape"] button[data-value="fill"]')
      .click();
    for (const kind of await page
      .locator('[data-action="lib-pick"] .ic-tile__kind')
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-kind"))))
      expect(kind).toBe("fill");
    await page
      .locator('[data-name="lib-shape"] button[data-value="all"]')
      .click();
    await page
      .locator('[data-action="lib-pick"][data-key="lu:coffee"]')
      .click();
    await page.click(
      '[data-panel="composer-pages"] [role="tab"][data-value="halaman"]',
    );
    await expect(
      page.locator(
        '[data-panel="composer-pages"] .ic-row[aria-selected="true"] .ic-meta',
      ),
    ).toBeVisible();
    await page.click(
      '[data-panel="composer-pages"] [role="tab"][data-value="lapisan"]',
    );
    await expect(
      page.locator(
        '[data-action="layer-select"][data-layer="main"] .ic-row__sub',
      ),
    ).toHaveText("lu:coffee");
  });

  test("pustaka Tabler dimuat saat sumbernya dipilih", async ({ page }) => {
    await open(page);
    await page.click(
      '[data-panel="composer-pages"] [role="tab"][data-value="pustaka"]',
    );
    await page.locator('[data-name="lib-src"] button[data-value="tb"]').click();
    await expect(
      page.locator('[data-action="lib-pick"][data-key^="tb:"]').first(),
    ).toBeVisible();
  });

  test("pool: mematikan objek mengubah jumlah kombinasi", async ({ page }) => {
    await open(page);
    await page.click(
      '[data-panel="composer-pages"] [role="tab"][data-value="pool"]',
    );
    await expect(page.locator('[data-action="open-kombinasi"]')).toHaveText(
      "Buka matriks Kombinasi · 12",
    );
    await page.locator('[data-name="pool:main:face"] input').uncheck();
    await expect(page.locator('[data-action="open-kombinasi"]')).toHaveText(
      "Buka matriks Kombinasi · 8",
    );
    await page.locator('[data-action="open-kombinasi"]').click();
    await expect(page).toHaveURL(/#\/kombinasi$/);
  });

  test("Alt + panah mengubah urutan set dan perubahan bertahan setelah muat ulang", async ({
    page,
  }) => {
    await open(page);
    const before = await page.locator(".ic-page__label").allTextContents();
    await page.locator(".ic-page__card[data-select]").first().focus();
    await page.keyboard.press("Alt+ArrowRight");
    const after = await page.locator(".ic-page__label").allTextContents();
    expect(after.slice(0, 2)).toEqual([before[1], before[0]]);
    await page.reload();
    await expect(page.locator(".ic-page__label").first()).toHaveText(before[1]);
    await page.click(
      '[data-panel="composer-rep"] [role="tab"][data-value="riwayat"]',
    );
  });
});
