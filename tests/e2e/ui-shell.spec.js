// @ts-check
/**
 * Kerangka Icon Studio (DESIGN-HANDOFF bagian 9): ukuran tepat per persona, routing, tab dokumen,
 * keyboard, dan kemiripan piksel dengan kerangka contoh `docs/design/ui-kit.html`.
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;
const KIT = pathToFileURL(resolve("docs/design/ui-kit.html")).href;

/** Uji offline: hanya file lokal, CDN dan font diblokir supaya hasil stabil. */
async function offline(page) {
  await page.route("**/*", (route) =>
    route.request().url().startsWith("file:")
      ? route.continue()
      : route.abort(),
  );
}

/** @param {import("@playwright/test").Page} page @param {string} hash */
async function open(page, hash) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await offline(page);
  await page.goto(`${APP}${hash}`);
  await page.evaluate(() => document.fonts.ready);
}

const sizesOf = (page) =>
  page.evaluate(() => {
    const rect = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.getBoundingClientRect() : null;
    };
    return {
      topbar: rect(".ic-topbar")?.height,
      context: rect(".ic-context")?.height,
      doctabs: rect(".ic-doctabs")?.height,
      panelhead: rect(".ic-panel__head")?.height,
      status: rect(".ic-statusbar")?.height,
      toolrail: rect(".ic-toolrail")?.width ?? null,
      studioLeft: rect(".ic-studio--left")?.width ?? null,
      studio: rect(".ic-studio:not(.ic-studio--left)")?.width,
    };
  });

test.describe("Icon Studio UI shell", () => {
  for (const persona of ["composer", "builder", "tinjau"]) {
    test(`ukuran kerangka ${persona} sesuai handoff`, async ({ page }) => {
      await open(page, `#/${persona}`);
      await expect(
        page.locator(`.ic-app[data-persona="${persona}"]`),
      ).toBeVisible();
      expect(await sizesOf(page)).toEqual({
        topbar: 56,
        context: 42,
        doctabs: 30,
        panelhead: 34,
        status: 28,
        toolrail: 56,
        studioLeft: null,
        studio: 330,
      });
    });
  }

  test("ukuran kerangka kombinasi memakai studio kiri", async ({ page }) => {
    await open(page, "#/kombinasi");
    await expect(page.locator(".ic-shell--left-studio")).toBeVisible();
    expect(await sizesOf(page)).toEqual({
      topbar: 56,
      context: 42,
      doctabs: 30,
      panelhead: 34,
      status: 28,
      toolrail: null,
      studioLeft: 300,
      studio: 330,
    });
  });

  test("routing persona mengubah halaman aktif", async ({ page }) => {
    await open(page, "#/kombinasi");
    await expect(
      page.locator('.ic-app[data-persona="kombinasi"]'),
    ).toBeVisible();
    await expect(page.locator('.ic-persona[aria-current="page"]')).toHaveText(
      "Kombinasi",
    );
    await page.locator('.ic-persona[href="#/tinjau"]').click();
    await expect(page.locator('.ic-app[data-persona="tinjau"]')).toBeVisible();
  });

  test("set kosong dan manifest belum diimpor menampilkan keadaan khusus", async ({
    page,
  }) => {
    await open(page, "#/composer");
    await expect(page.locator(".ic-page--new")).toHaveCount(1);
    await expect(page.locator(".ic-page:not(.ic-page--new)")).toHaveCount(0);
    await expect(
      page.getByText("Belum ada ikon.", { exact: true }),
    ).toBeVisible();
    await page.locator('.ic-persona[href="#/builder"]').click();
    await expect(
      page.getByText("Belum ada manifest", { exact: true }).first(),
    ).toBeVisible();
    await expect(page.locator('.ic-step[aria-current="step"]')).toContainText(
      "Impor",
    );
  });

  test("tab dokumen berpindah persona sesuai jenis dokumen dan seleksi bertahan", async ({
    page,
  }) => {
    await open(page, "#/builder");
    await page.locator('[data-action="import-sample"]').click();
    await expect(page.locator(".ic-doctab")).toHaveCount(2);
    await expect(page.locator('.ic-step[aria-current="step"]')).toContainText(
      "Periksa",
    );
    await page.locator(".ic-doctab", { hasText: ".icset" }).click();
    await expect(page).toHaveURL(/#\/composer$/);
    await page.locator('[data-action="load-preset"]').click();
    await page.locator(".ic-page__card[data-select]").nth(3).click();
    await page.locator(".ic-doctab", { hasText: ".manifest" }).click();
    await expect(page).toHaveURL(/#\/builder$/);
    await page.locator('.ic-persona[href="#/composer"]').click();
    await expect(
      page.locator('.ic-page__card[aria-selected="true"]'),
    ).toHaveCount(1);
    await expect(
      page.locator(".ic-page__card[data-select]").nth(3),
    ).toHaveAttribute("aria-selected", "true");
  });

  test("klik dua kali membuka mode edit dan Esc kembali ke ikhtisar", async ({
    page,
  }) => {
    await open(page, "#/composer");
    await page.locator('[data-action="load-preset"]').click();
    await page.locator(".ic-page__card[data-open]").nth(2).dblclick();
    await expect(page).toHaveURL(/#\/composer\/edit\//);
    await expect(page.locator('[aria-label="Mode satu ikon"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/#\/composer$/);
  });

  test("keyboard: panah berpindah tab panel dan dropdown bisa dipakai tanpa tetikus", async ({
    page,
  }) => {
    await open(page, "#/composer");
    const firstTab = page
      .locator('[data-panel="composer-pages"] [role="tab"]')
      .first();
    await firstTab.focus();
    await page.keyboard.press("ArrowRight");
    const lapisan = page.locator(
      '[data-panel="composer-pages"] [role="tab"][data-value="lapisan"]',
    );
    await expect(lapisan).toHaveAttribute("aria-selected", "true");
    await expect(lapisan).toBeFocused();
    await expect(page.locator("#composer-pages-lapisan")).toBeVisible();

    const trigger = page.locator('[data-name="view-sort"] .ic-select__trigger');
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveText("Nama A–Z");
    await trigger.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("semua kontrol bisa difokus dengan Tab dan punya nama yang terbaca", async ({
    page,
  }) => {
    for (const persona of ["composer", "builder", "tinjau", "kombinasi"]) {
      await open(page, `#/${persona}`);
      const unnamed = await page.evaluate(() =>
        [
          ...document.querySelectorAll(
            "#app button, #app a[href], #app input, #app textarea",
          ),
        ]
          .filter((el) => !el.closest("[hidden]"))
          .filter((el) => {
            const label =
              el.getAttribute("aria-label") ||
              el.textContent.trim() ||
              el.closest("label")?.textContent.trim() ||
              el.getAttribute("aria-labelledby");
            return !label;
          })
          .map((el) => el.outerHTML.slice(0, 120)),
      );
      expect(unnamed, persona).toEqual([]);
      /* Tab dari awal dokumen mencapai kontrol bilah atas */
      await page.locator("body").focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(
        () => document.activeElement?.className || "",
      );
      expect(focused, persona).toMatch(/ic-persona|ic-iconbtn|ic-btn|ic-tool/);
    }
  });

  test("bilah atas dan tool rail mirip piksel dengan kerangka contoh ui-kit (< 2%)", async ({
    page,
    browser,
  }) => {
    await open(page, "#/composer");
    await page.locator('[data-action="load-preset"]').click();
    await page.mouse.move(700, 600);
    const app = await page.screenshot();

    const kitPage = await browser.newPage({
      viewport: { width: 1600, height: 1000 },
    });
    await offline(kitPage);
    await kitPage.goto(KIT);
    await kitPage.evaluate(() => document.fonts.ready);
    const frame = kitPage.locator(".kit-frame .ic-shell");
    await frame.scrollIntoViewIfNeeded();
    await kitPage.mouse.move(0, 0);
    const kit = await frame.screenshot();
    await kitPage.close();

    /* wilayah kerangka yang isinya sama: bilah atas kiri (logo, persona, menu, mode tampilan) dan tool rail.
       Wilayah lain berisi data contoh kit (sticker, 5 mesin) yang memang berbeda. */
    const regions = [
      { x: 1, y: 1, w: 618, h: 54 },
      { x: 1, y: 98, w: 54, h: 900 - 98 - 29 },
    ];
    const diff = await page.evaluate(
      async ({ a, b, regions }) => {
        const load = async (b64) => {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          const g = c.getContext("2d");
          g.drawImage(img, 0, 0);
          return g;
        };
        const [ga, gb] = await Promise.all([load(a), load(b)]);
        let total = 0,
          different = 0;
        /* anti-alias: piksel dianggap sama bila cocok dengan salah satu tetangga 3 × 3 di gambar kit,
           karena posisi frame kit bisa bergeser subpiksel saat halaman kit bertambah panjang */
        for (const r of regions) {
          const da = ga.getImageData(r.x, r.y, r.w, r.h).data,
            db = gb.getImageData(r.x - 1, r.y - 1, r.w + 2, r.h + 2).data;
          const W = r.w + 2;
          for (let y = 0; y < r.h; y++)
            for (let x = 0; x < r.w; x++) {
              total++;
              const i = (y * r.w + x) * 4;
              let best = 255;
              for (let dy = 0; dy <= 2 && best > 24; dy++)
                for (let dx = 0; dx <= 2; dx++) {
                  const j = ((y + dy) * W + (x + dx)) * 4;
                  const d = Math.max(
                    Math.abs(da[i] - db[j]),
                    Math.abs(da[i + 1] - db[j + 1]),
                    Math.abs(da[i + 2] - db[j + 2]),
                  );
                  if (d < best) best = d;
                }
              if (best > 24) different++;
            }
        }
        return different / total;
      },
      { a: app.toString("base64"), b: kit.toString("base64"), regions },
    );
    expect(diff).toBeLessThan(0.02);
  });
});
