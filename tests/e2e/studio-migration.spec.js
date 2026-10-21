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
