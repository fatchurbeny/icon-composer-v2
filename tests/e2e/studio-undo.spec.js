// @ts-check
/**
 * Urungkan dan ulangi di Icon Studio: maks 10 langkah per dokumen, hanya di memori, semua persona.
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openPanel } from "./studio-panels.js";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;
const VENDOR = resolve("tests/fixtures/vendor");

/** @param {import("@playwright/test").Page} page @param {string} hash */
async function open(page, hash = "#/composer") {
  await page.setViewportSize({ width: 1440, height: 900 });
  /* pustaka vendor dari fixture, seperti studio-builder.spec.js */
  const files = [
    ["jszip", "jszip.min.js"],
    ["lucide.min.js", "lucide.min.js"],
    ["tabler-nodes-outline", "tabler-nodes-outline.json"],
    ["core-free-icons", "hugeicons.mjs"],
    ["lucide-static@1.52.0/tags.json", "lucide-tags.json"],
    ["@tabler/icons@3.49.0/icons.json", "tabler-icons.json"],
  ];
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("file:")) return route.continue();
    const hit = files.find(([part]) => url.includes(part));
    if (hit)
      return route.fulfill({
        path: `${VENDOR}/${hit[1]}`,
        headers: { "access-control-allow-origin": "*" },
      });
    return route.abort();
  });
  await page.goto(`${APP}${hash}`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

/** @param {import("@playwright/test").Page} page */
async function openEdit(page) {
  await open(page);
  await page.click('[data-action="load-preset"]');
  await page.locator(".ic-page__card[data-open]").nth(2).dblclick();
  await expect(page).toHaveURL(/#\/composer\/edit\//);
}

const undoBtn = (page) => page.locator('.ic-topbar [data-action="undo"]');
const redoBtn = (page) => page.locator('.ic-topbar [data-action="redo"]');
const toast = (page) => page.locator(".ic-toast");
const engine = (page, id) => page.locator(`.ic-engine[data-value="${id}"]`);

/** @param {import("@playwright/test").Locator} loc */
const mid = async (loc) => {
  const b = await loc.boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
};

/**
 * @param {import("@playwright/test").Page} page
 * @param {{x: number, y: number}} a
 * @param {{x: number, y: number}} b
 */
async function dragTo(page, a, b) {
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 8 });
  await page.mouse.up();
}

const xy = async (page) => [
  await page.locator('[data-name="edit-x"] input').inputValue(),
  await page.locator('[data-name="edit-y"] input').inputValue(),
];

test.describe("Icon Studio · urungkan dan ulangi", () => {
  test("tombol nonaktif saat belum ada langkah", async ({ page }) => {
    for (const hash of ["#/composer", "#/builder", "#/tinjau", "#/kombinasi"]) {
      await open(page, hash);
      await expect(undoBtn(page)).toBeDisabled();
      await expect(redoBtn(page)).toBeDisabled();
      await expect(redoBtn(page)).toHaveAttribute("aria-label", "Ulangi");
    }
  });

  test("Composer: ganti gaya lalu urungkan dan ulangi", async ({ page }) => {
    await open(page);
    await page.click('[data-action="load-preset"]');
    await expect(undoBtn(page)).toBeDisabled();
    await openPanel(page, "composer-style");
    await engine(page, "accent").click();
    await expect(engine(page, "accent")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(undoBtn(page)).toBeEnabled();
    await undoBtn(page).click();
    await expect(engine(page, "classic")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(toast(page)).toHaveText("Diurungkan: Gaya Aksen");
    await expect(undoBtn(page)).toBeDisabled();
    await expect(redoBtn(page)).toBeEnabled();
    await redoBtn(page).click();
    await expect(engine(page, "accent")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(toast(page)).toHaveText("Diulang: Gaya Aksen");
    /* pintasan keyboard */
    await page.keyboard.press("ControlOrMeta+z");
    await expect(engine(page, "classic")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.keyboard.press("ControlOrMeta+Shift+z");
    await expect(engine(page, "accent")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.keyboard.press("ControlOrMeta+z");
    await page.keyboard.press("Control+y");
    await expect(engine(page, "accent")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    /* Riwayat sesi mencatat urungkan dan ulangi */
    await page
      .locator('[data-panel="composer-rep"] [role="tab"][data-value="riwayat"]')
      .click();
    await expect(page.locator('[data-panel="composer-rep"]')).toContainText(
      "Urungkan: Gaya Aksen",
    );
    await expect(page.locator('[data-panel="composer-rep"]')).toContainText(
      "Ulangi: Gaya Aksen",
    );
  });

  test("⌘Z di isian teks tidak mengurungkan dokumen", async ({ page }) => {
    await open(page);
    await page.click('[data-action="load-preset"]');
    await openPanel(page, "composer-style");
    await engine(page, "accent").click();
    await expect(engine(page, "accent")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const cols = page.locator('[data-name="view-cols"] input');
    await cols.focus();
    await page.keyboard.press("ControlOrMeta+z");
    await expect(engine(page, "accent")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(undoBtn(page)).toBeEnabled();
  });

  test("11 perubahan hanya bisa diurungkan 10 kali", async ({ page }) => {
    await open(page);
    await page.click('[data-action="load-preset"]');
    await openPanel(page, "composer-style");
    for (let i = 0; i < 11; i++)
      await engine(page, i % 2 ? "classic" : "accent").click();
    await expect(engine(page, "accent")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    let n = 0;
    while (await undoBtn(page).isEnabled()) {
      await undoBtn(page).click();
      n++;
      if (n > 20) break;
    }
    expect(n).toBe(10);
    /* langkah pertama (ke Aksen) sudah terdorong keluar: tersisa Aksen */
    await expect(engine(page, "accent")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("Edit: seret lapisan menjadi satu langkah per seret", async ({
    page,
  }) => {
    await openEdit(page);
    await page.mouse.click(
      ...Object.values(await mid(page.locator('[data-hit="mod"]'))),
    );
    const start = await xy(page);
    await expect(undoBtn(page)).toBeDisabled();
    const a = await mid(page.locator('[data-hit="mod"]'));
    await dragTo(page, a, { x: a.x + 43.33, y: a.y - 32.5 });
    const first = await xy(page);
    expect(first).not.toEqual(start);
    const b = await mid(page.locator('[data-hit="mod"]'));
    await dragTo(page, b, { x: b.x - 21.67, y: b.y + 21.67 });
    const second = await xy(page);
    expect(second).not.toEqual(first);
    await page.keyboard.press("ControlOrMeta+z");
    await expect.poll(() => xy(page)).toEqual(first);
    await expect(toast(page)).toHaveText("Diurungkan: Geser pengubah");
    await page.keyboard.press("ControlOrMeta+z");
    await expect.poll(() => xy(page)).toEqual(start);
    await expect(undoBtn(page)).toBeDisabled();
    await page.keyboard.press("ControlOrMeta+Shift+z");
    await expect.poll(() => xy(page)).toEqual(first);
    await expect(page).toHaveURL(/#\/composer\/edit\//);
  });

  test("Edit: seret ukuran dan putar bisa diurungkan", async ({ page }) => {
    await openEdit(page);
    const scaleIn = page.locator(
      '.ic-context [data-name="edit-scale"] input',
    );
    const rotIn = page.locator('[data-name="edit-rot"] input');
    await expect(scaleIn).toHaveValue("84");
    const c = await mid(page.locator(".ic-selbox"));
    const se = await mid(page.locator('.ic-selbox__h[data-at="se"]'));
    await dragTo(page, se, {
      x: c.x + (se.x - c.x) * 0.8,
      y: c.y + (se.y - c.y) * 0.8,
    });
    await expect(scaleIn).toHaveValue("67");
    const rot = await mid(page.locator('.ic-selbox__rot[data-at="ne"]'));
    await dragTo(page, rot, { x: c.x - (rot.y - c.y), y: c.y + (rot.x - c.x) });
    await expect
      .poll(async () => Math.abs(Number(await rotIn.inputValue()) - 90))
      .toBeLessThanOrEqual(1);
    await undoBtn(page).click();
    await expect(rotIn).toHaveValue("0");
    await expect(scaleIn).toHaveValue("67");
    await undoBtn(page).click();
    await expect(scaleIn).toHaveValue("84");
    await expect(undoBtn(page)).toBeDisabled();
  });

  test("Edit: urungkan ikon baru kembali ke ikhtisar", async ({ page }) => {
    await open(page);
    await page.click('[data-action="load-preset"]');
    const n = await page.locator(".ic-page__card[data-open]").count();
    await page.locator('[data-action="new-icon"]').first().click();
    await expect(page.locator(".ic-page__card[data-open]")).toHaveCount(n + 1);
    await page.locator(".ic-page__card[data-open]").nth(n).dblclick();
    await expect(page).toHaveURL(/#\/composer\/edit\//);
    await page.keyboard.press("ControlOrMeta+z");
    await expect(page).toHaveURL(/#\/composer$/);
    await expect(page.locator(".ic-page__card[data-open]")).toHaveCount(n);
    await expect(
      page.locator('.ic-page__card[data-select][aria-selected="true"]'),
    ).toHaveCount(1);
  });

  test("Builder: centang opsi ekspor lalu urungkan", async ({ page }) => {
    await open(page, "#/builder");
    await page.locator('[data-action="import-sample"]').click();
    await expect(undoBtn(page)).toBeDisabled();
    await page.locator('.ic-topbar [data-action="export"]').click();
    await openPanel(page, "builder-export");
    const split = page.locator('input[data-name="b-ex:split"]');
    const before = await split.isChecked();
    await split.click();
    await expect(split).toBeChecked({ checked: !before });
    await undoBtn(page).click();
    await expect(page.locator('input[data-name="b-ex:split"]')).toBeChecked({
      checked: before,
    });
    await expect(toast(page)).toContainText("Diurungkan: Pisahkan folder");
    /* tampilan (langkah Ekspor) tidak ikut diurungkan */
    await expect(page.locator('.ic-step[aria-current="step"]')).toContainText(
      "Ekspor",
    );
  });
});
