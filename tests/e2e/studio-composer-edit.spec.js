// @ts-check
/**
 * Alur Composer · Edit di Icon Studio (Fase 2b langkah 4).
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openPanel } from "./studio-panels.js";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;

/** @param {import("@playwright/test").Page} page */
async function openEdit(page) {
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
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.click('[data-action="load-preset"]');
  await page.locator(".ic-page__card[data-open]").nth(2).dblclick();
  await expect(page).toHaveURL(/#\/composer\/edit\//);
}

const xy = async (page) => [
  await page.locator('[data-name="edit-x"] input').inputValue(),
  await page.locator('[data-name="edit-y"] input').inputValue(),
];

test.describe("Icon Studio · Composer · Edit", () => {
  test("artboard 520 px, kotak seleksi, dan filmstrip tampil", async ({
    page,
  }) => {
    await openEdit(page);
    const board = await page.locator(".ic-artboard").boundingBox();
    expect([board?.width, board?.height]).toEqual([520, 520]);
    await expect(page.locator(".ic-selbox .ic-selbox__h")).toHaveCount(8);
    await expect(page.locator(".ic-filmstrip__item")).toHaveCount(14);
    const film = await page.locator(".ic-filmstrip").boundingBox();
    expect(film?.height).toBe(84);
  });

  test("klik lapisan di artboard memilihnya, seret memindah, panah menggeser", async ({
    page,
  }) => {
    await openEdit(page);
    const hit = await page.locator('[data-hit="mod"]').boundingBox();
    await page.mouse.click(hit.x + hit.width / 2, hit.y + hit.height / 2);
    await expect(
      page.locator('[data-action="layer-select"][data-layer="mod"]'),
    ).toHaveAttribute("aria-selected", "true");
    expect(await xy(page)).toEqual(["0", "0"]);
    const box = await page.locator('[data-hit="mod"]').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + 43.33,
      box.y + box.height / 2 - 32.5,
      { steps: 6 },
    );
    await expect(page.locator('[data-role="tooltip"]')).toBeVisible();
    await page.mouse.up();
    expect(await xy(page)).toEqual(["4", "-3"]);
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Shift+ArrowDown");
    expect(await xy(page)).toEqual(["3.5", "-1"]);
    await page.reload();
    await openPanel(page, "edit-layers");
    await page
      .locator('[data-action="layer-select"][data-layer="mod"]')
      .click();
    expect(await xy(page)).toEqual(["3.5", "-1"]);
  });

  test("posisi pengubah lewat pemilih jangkar, Delete melepas pengubah", async ({
    page,
  }) => {
    await openEdit(page);
    await openPanel(page, "edit-layers");
    await page
      .locator('[data-action="layer-select"][data-layer="mod"]')
      .click();
    await page
      .locator('[data-name="edit-slot"] button[aria-label="Posisi TR"]')
      .click();
    await expect(
      page.locator(
        '[data-action="layer-select"][data-layer="mod"] .ic-row__sub',
      ),
    ).toContainText("TR");
    await page.locator(".ic-artboard").click({ position: { x: 5, y: 5 } });
    await page.keyboard.press("Delete");
    await expect(
      page.locator(
        '[data-action="layer-select"][data-layer="mod"] .ic-row__sub',
      ),
    ).toHaveText("tidak ada");
  });

  test("mata menyembunyikan lapisan dan warna lapisan berlaku untuk set", async ({
    page,
  }) => {
    await openEdit(page);
    await openPanel(page, "edit-layers");
    await page.locator('[data-action="edit-eye"][data-layer="mod"]').click();
    await expect(
      page.locator('[data-action="edit-eye"][data-layer="mod"]'),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator('[data-hit="mod"]')).toHaveCount(0);
    await page
      .locator('[data-action="layer-select"][data-layer="main"]')
      .click();
    await openPanel(page, "edit-layers");
    await page
      .locator('[data-name="edit-line"] button[data-value="#1A73E8"]')
      .click();
    await expect(
      page.locator(".ic-artboard__art g[stroke='#1A73E8']").first(),
    ).toBeVisible();
    await page.locator('[data-action="edit-color-reset"]').click();
    await expect(
      page.locator(".ic-artboard__art g[stroke='#1A73E8']"),
    ).toHaveCount(0);
  });

  test("dekorasi: pilih jenis dan rotasi", async ({ page }) => {
    await openEdit(page);
    await openPanel(page, "edit-layers");
    await page
      .locator('[data-action="layer-select"][data-layer="deco"]')
      .click();
    await openPanel(page, "edit-layers");
    await page.locator('[data-action="edit-deco"][data-type="star4"]').click();
    await expect(
      page.locator(
        '[data-action="layer-select"][data-layer="deco"] .ic-row__sub',
      ),
    ).toContainText("star4");
    await page.locator('[data-name="edit-rot"] button[data-step="1"]').click();
    await expect(page.locator('[data-name="edit-rot"] input')).toHaveValue("1");
  });

  test("gaya Aksen: peran bagian dan isi bidang", async ({ page }) => {
    await openEdit(page);
    await openPanel(page, "composer-style");
    await page
      .locator('[data-name="engine"] button[data-value="accent"]')
      .click();
    await openPanel(page, "edit-layers");
    await page
      .locator('[data-action="layer-select"][data-layer="main"]')
      .click();
    await openPanel(page, "edit-layers");
    const part = page.locator(
      '[data-name="edit-part:0"] button[data-value="acc"]',
    );
    await part.click();
    await expect(
      page.locator('[data-name="edit-part:0"] button[data-value="acc"]'),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-action="edit-parts-auto"]')).toBeEnabled();
    await page.locator('[data-action="edit-parts-auto"]').click();
    await expect(
      page.locator('[data-action="edit-parts-auto"]'),
    ).toBeDisabled();
  });

  test("filmstrip berpindah ikon dan rute mengikuti", async ({ page }) => {
    await openEdit(page);
    const before = page.url();
    await page.locator(".ic-filmstrip__item").nth(5).click();
    await expect(page.locator(".ic-filmstrip__item").nth(5)).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(page.url()).not.toBe(before);
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/#\/composer$/);
    await expect(
      page.locator(".ic-page__card[data-select]").nth(5),
    ).toHaveAttribute("aria-selected", "true");
  });

  test.describe("panel kontekstual, ubah ukuran, dan putar", () => {
    /* Lapisan | Transform | Pustaka sepanel; Halaman | Variasi | Riwayat di panel lain */
    const tab = (page, v) =>
      page.locator(
        `[data-panel="${v === "riwayat" ? "edit-pages" : "edit-layers"}"] [role="tab"][data-value="${v}"]`,
      );
    const expanded = (page, id) =>
      page.locator(
        `[data-panel="${id}"] > .ic-panel__head > .ic-panel__collapse`,
      );
    const scaleIn = (page) =>
      page.locator('[data-panel="edit-layers"] [data-name="edit-scale"] input');
    const rotIn = (page) => page.locator('[data-name="edit-rot"] input');
    /** Pusat elemen di layar. */
    const mid = async (loc) => {
      const b = await loc.boundingBox();
      return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    };
    /**
     * Seret dari `a` ke `b` (opsional dengan Shift ditahan).
     * @param {import("@playwright/test").Page} page
     */
    async function dragTo(page, a, b, shift = false) {
      await page.mouse.move(a.x, a.y);
      if (shift) await page.keyboard.down("Shift");
      await page.mouse.down();
      await page.mouse.move(b.x, b.y, { steps: 8 });
      await page.mouse.up();
      if (shift) await page.keyboard.up("Shift");
    }
    /** Pusat objek utama di layar (pusat kotak seleksi tanpa rotasi). */
    const mainCenter = (page) => mid(page.locator(".ic-selbox"));

    test("memilih lapisan membuka tab Transform, opsi bisa dimatikan", async ({
      page,
    }) => {
      await openEdit(page);
      /* dari daftar Lapisan: tab Transform di panel yang sama terbuka */
      await expect(tab(page, "lapisan")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await page
        .locator('[data-action="layer-select"][data-layer="deco"]')
        .click();
      await expect(tab(page, "transform")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(
        page.locator('[data-action="edit-deco"]').first(),
      ).toBeVisible();
      /* dari panel lain (Riwayat): klik di artboard membuka panel Lapisan di tab Transform */
      await tab(page, "riwayat").click();
      await expect(expanded(page, "edit-layers")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      const hit = await mid(page.locator('[data-hit="mod"]'));
      await page.mouse.click(hit.x, hit.y);
      await expect(expanded(page, "edit-layers")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await expect(tab(page, "transform")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(
        page.locator('[data-name="edit-mstyle"], [data-name="edit-x"]').first(),
      ).toBeVisible();
      /* opsi dimatikan: tab Lapisan tetap terpilih setelah memilih lapisan */
      await page.locator('[data-name="edit-autopanel"]').uncheck();
      await tab(page, "lapisan").click();
      await page
        .locator('[data-action="layer-select"][data-layer="main"]')
        .click();
      await expect(tab(page, "lapisan")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(
        page.locator('[data-action="layer-select"][data-layer="main"]'),
      ).toHaveAttribute("aria-selected", "true");
    });

    test("pegangan sudut mengubah skala set, Shift kelipatan 5%, Esc membatalkan", async ({
      page,
    }) => {
      await openEdit(page);
      await expect(scaleIn(page)).toHaveValue("84");
      const se = page.locator('.ic-selbox__h[data-at="se"]');
      expect(await se.evaluate((el) => getComputedStyle(el).cursor)).toBe(
        "nwse-resize",
      );
      const c = await mainCenter(page),
        a = await mid(se);
      /* 0,8 × jarak ke pusat: 84 × 0,8 = 67 */
      await dragTo(page, a, {
        x: c.x + (a.x - c.x) * 0.8,
        y: c.y + (a.y - c.y) * 0.8,
      });
      await expect(scaleIn(page)).toHaveValue("67");
      await expect(
        page.locator('[data-name="edit-scale"] input').first(),
      ).toHaveValue("67");
      const a2 = await mid(se);
      await dragTo(
        page,
        a2,
        { x: c.x + (a2.x - c.x) * 1.12, y: c.y + (a2.y - c.y) * 1.12 },
        true,
      );
      await expect(scaleIn(page)).toHaveValue("75");
      /* Esc saat menyeret mengembalikan skala */
      const a3 = await mid(se);
      await page.mouse.move(a3.x, a3.y);
      await page.mouse.down();
      await page.mouse.move(
        c.x + (a3.x - c.x) * 0.7,
        c.y + (a3.y - c.y) * 0.7,
        { steps: 5 },
      );
      await page.keyboard.press("Escape");
      await page.mouse.up();
      await expect(page).toHaveURL(/#\/composer\/edit\//);
      await expect(scaleIn(page)).toHaveValue("75");
      await tab(page, "riwayat").click();
      await expect(page.locator('[data-panel="edit-pages"]')).toContainText(
        "Skala objek utama 75% · semua ikon",
      );
    });

    test("zona di luar sudut memutar ikon ini, Shift kelipatan 15°", async ({
      page,
    }) => {
      await openEdit(page);
      const rot = page.locator('.ic-selbox__rot[data-at="ne"]');
      expect(await rot.evaluate((el) => getComputedStyle(el).cursor)).toContain(
        "url(",
      );
      const c = await mainCenter(page),
        a = await mid(rot);
      /* putar 90° searah jarum jam: (dx, dy) → (-dy, dx) */
      await dragTo(page, a, { x: c.x - (a.y - c.y), y: c.y + (a.x - c.x) });
      await expect
        .poll(async () => Math.abs(Number(await rotIn(page).inputValue()) - 90))
        .toBeLessThanOrEqual(1);
      await expect(page.locator(".ic-selbox")).toHaveAttribute(
        "style",
        /--ic-selbox-r: (89|90|91)deg/,
      );
      await expect(page.locator('[data-hit="main"]')).toHaveAttribute(
        "transform",
        /rotate\(/,
      );
      /* Shift: kelipatan 15° (sekitar 20° → 15° atau 30°) */
      const b = await mid(rot);
      const t = (20 * Math.PI) / 180;
      const dx = b.x - c.x,
        dy = b.y - c.y;
      await dragTo(
        page,
        b,
        {
          x: c.x + dx * Math.cos(t) - dy * Math.sin(t),
          y: c.y + dx * Math.sin(t) + dy * Math.cos(t),
        },
        true,
      );
      expect(Number(await rotIn(page).inputValue()) % 15).toBe(0);
      /* hanya ikon ini yang berputar */
      const others = await page.evaluate(() => {
        const S = /** @type {any} */ (window).__iconStudio;
        const st = S.store.loadState();
        const doc = st.documents.find(
          (/** @type {any} */ d) => d.id === st.activeId,
        );
        return doc.items.filter((/** @type {any} */ x) => x.mr).length;
      });
      expect(others).toBe(1);
      await page.keyboard.press("BracketRight");
      expect(Number(await rotIn(page).inputValue()) % 15).toBe(0);
      await tab(page, "riwayat").click();
      await expect(page.locator('[data-panel="edit-pages"]')).toContainText(
        "Putar objek utama",
      );
    });

    test("pegangan tetap akurat saat kanvas di-zoom 200%", async ({ page }) => {
      await openEdit(page);
      await page.locator('[data-action="zoom-in"]').click();
      await page.locator('[data-action="zoom-in"]').click();
      await expect(page.locator(".studio-zoombtn--label")).toHaveText("200%");
      const se = page.locator('.ic-selbox__h[data-at="se"]');
      /* ukuran pegangan di layar tetap 9 px */
      expect(Math.round((await se.boundingBox()).width)).toBe(9);
      const c = await mainCenter(page),
        a = await mid(se);
      await dragTo(page, a, {
        x: c.x + (a.x - c.x) * 0.8,
        y: c.y + (a.y - c.y) * 0.8,
      });
      await expect(scaleIn(page)).toHaveValue("67");
      const rot = page.locator('.ic-selbox__rot[data-at="se"]');
      const b = await mid(rot);
      await dragTo(
        page,
        b,
        { x: c.x - (b.y - c.y), y: c.y + (b.x - c.x) },
        true,
      );
      await expect(rotIn(page)).toHaveValue("90");
    });
  });
});
