// @ts-check
/**
 * Golden render Icon Studio: renderer Icon Studio (`apps/icon-studio/src/state/render.js`) harus
 * menghasilkan SVG yang identik dengan Icon Composer 1.5.1 dan Template Icon Builder 1.6.0
 * untuk item dan gaya yang sama (Fase 2b langkah 1, ADR-017).
 */
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  captureTemplateIconBuilderZip,
  openHtml,
  root,
} from "./golden-utils.js";

const STUDIO = "dist/icon-studio/index.html";
const readJson = async (file) =>
  JSON.parse(await readFile(path.join(root, file), "utf8"));
const basic = await readJson("tests/fixtures/sets/basic.json");
const mixed = await readJson("tests/fixtures/sets/mixed.json");
const golden = (...parts) =>
  readFile(path.join(root, "tests/golden", ...parts), "utf8");

/** Bagian `<!-- id -->` dari golden panel Bentuk Icon Composer. */
function section(html, id) {
  const start = html.indexOf(`<!-- ${id} -->\n`) + `<!-- ${id} -->\n`.length;
  const end = html.indexOf("\n<!-- ", start);
  return html.slice(start, end === -1 ? undefined : end).replace(/\n$/, "");
}

for (const family of basic.iconComposer.families) {
  test(`@golden Icon Studio set Composer ${family}`, async ({ page }) => {
    await openHtml(page, STUDIO);
    const actual = await page.evaluate((family) => {
      const { document: D, renderer: r } = window.__iconStudio;
      /* urutan IC 1.5.1 tanpa simpanan: normStyle, applyFamily("accent") saat boot, lalu klik keluarga */
      const style = D.normSetStyle();
      D.applyFamily(style, "accent");
      D.applyFamily(style, family);
      const items = D.PRESET.map((p) => D.normItem(p, r.lib));
      const host = document.createElement("div");
      host.innerHTML = r
        .renderSetItem(items[0], style, { size: "100%", idp: "artmask" })
        .replace(
          'width="100%" height="100%"',
          'width="100%" height="100%" style="position:absolute;inset:0;width:100%;height:100%"',
        );
      return host.firstElementChild.outerHTML;
    }, family);
    expect(`${actual}\n`).toBe(
      await golden("icon-composer", family, "basic.svg"),
    );
  });
}

for (const mode of basic.templateIconBuilder.styles) {
  const family = mode === "X" ? "accent" : "classic";
  test(`@golden Icon Studio dokumen Builder ${family}`, async ({ page }) => {
    await openHtml(page, STUDIO);
    const actual = await page.evaluate(async (mode) => {
      const S = window.__iconStudio,
        D = S.document,
        r = S.renderer;
      const imp = D.importManifest(
        JSON.stringify(S.SAMPLE_MANIFEST, null, 2),
        r.lib,
      );
      if (imp.needTb) await r.loadTabler();
      if (imp.needHg) await r.loadHugeicons();
      imp.items.forEach(r.ensureManifestItem);
      const host = document.createElement("div");
      host.innerHTML = r.renderManifestItem(imp.items[0], mode, imp.style, {
        size: "100%",
        idp: "bd",
      });
      return host.firstElementChild.outerHTML;
    }, mode);
    expect(`${actual}\n`).toBe(
      await golden("template-icon-builder", family, "basic.svg"),
    );
  });
}

for (const family of mixed.iconComposer.families) {
  test(`@golden Icon Studio set Composer ${family} lintas pustaka`, async ({
    page,
  }) => {
    await openHtml(page, STUDIO);
    const expected = await golden("icon-composer", family, "mixed.html");
    const result = await page.evaluate(
      async ({ family, saved, mainBin }) => {
        const { document: D, renderer: r } = window.__iconStudio;
        await r.loadTabler();
        await r.loadHugeicons();
        const style = D.normSetStyle(saved.style);
        for (const t of saved.luUsed) {
          const [kind, key] = t.split("|");
          r.lib.ensure(key, kind);
        }
        const items = saved.set.map((p) => D.normItem(p, r.lib));
        D.applyFamily(style, family);
        const toHtml = (svg) => {
          const host = document.createElement("div");
          host.innerHTML = svg;
          return host.firstElementChild.outerHTML;
        };
        const artActual = toHtml(
          r
            .renderSetItem(items[0], style, { size: "100%", idp: "artmask" })
            .replace(
              'width="100%" height="100%"',
              'width="100%" height="100%" style="position:absolute;inset:0;width:100%;height:100%"',
            ),
        );
        /* tile objek utama di panel Bentuk: compose dengan pref C (renderBins IC) */
        const bin = document.createElement("div");
        bin.innerHTML = mainBin;
        const tiles = [...bin.querySelectorAll("[data-main]")].map((tile) => {
          const k = tile.getAttribute("data-main");
          const svg = r.renderSetItem(
            {
              ...D.blankItem(),
              main: k,
              mod: "none",
              mx: 0,
              my: 0,
              ms: 92,
              pref: "C",
            },
            style,
            { idp: "bm" + k.replace(/\W/g, "") },
          );
          return {
            k,
            expected: tile.querySelector("svg").outerHTML,
            actual: toHtml(svg),
          };
        });
        return { artActual, tiles };
      },
      {
        family,
        saved: mixed.iconComposer.storage["icon-composer-aksen-v1"],
        mainBin: section(expected, "mainBin"),
      },
    );
    expect(result.artActual).toBe(section(expected, "art"));
    expect(result.tiles.length).toBeGreaterThan(20);
    expect(result.tiles.map((t) => t.k)).toEqual(
      expect.arrayContaining(["tb:mail", "hg:rocket-01", "lu:coffee"]),
    );
    for (const tile of result.tiles)
      expect(tile.actual, tile.k).toBe(tile.expected);
  });
}

test("@golden Icon Studio SVG ekspor Builder lintas pustaka", async ({
  browser,
}) => {
  const legacy = await browser.newPage();
  const studio = await browser.newPage();
  try {
    await openHtml(legacy, "legacy/template-icon-builder-aksen-v1.6.0.html");
    const { zipManifest, zipStyles } = mixed.templateIconBuilder;
    const zip = await captureTemplateIconBuilderZip(
      legacy,
      zipManifest,
      zipStyles,
    );
    const svgFiles = Object.entries(zip).filter(
      ([name, body]) => name.endsWith(".svg") && body != null,
    );
    expect(svgFiles.length).toBeGreaterThan(5);
    /* urutan dan indeks ikon (idp "k" + mode + i) dibaca dari metadata-internal.csv legacy */
    const rows = zip["metadata-internal.csv"]
      .replace(/^\uFEFF/, "")
      .trim()
      .split("\r\n")
      .slice(1)
      .map((line) =>
        line.split('","').map((cell) => cell.replace(/^"|"$/g, "")),
      );
    const order = [...new Set(rows.map((row) => row[1]))];
    const files = rows.map(([file, id, dir]) => ({
      file,
      id,
      dir,
      i: order.indexOf(id),
    }));

    await openHtml(studio, STUDIO);
    const actual = await studio.evaluate(
      async ({ manifest, files }) => {
        const S = window.__iconStudio,
          D = S.document,
          r = S.renderer;
        const imp = D.importManifest(JSON.stringify(manifest), r.lib);
        if (imp.needTb) await r.loadTabler();
        if (imp.needHg) await r.loadHugeicons();
        imp.items.forEach(r.ensureManifestItem);
        const MODE = { aksen: "X", "garis-solid": "A", "solid-garis": "B" };
        const out = {};
        for (const f of files) {
          const it = imp.items.find((x) => x.id === f.id);
          const mode = MODE[f.dir];
          const svg =
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
            S.dedupeAttrs(
              r.renderManifestItem(it, mode, imp.style, {
                size: 480,
                idp: "k" + mode + f.i,
              }),
            );
          out[f.file] = S.directFillSvgFile(svg);
        }
        return out;
      },
      { manifest: zipManifest, files },
    );
    expect(Object.keys(actual).sort()).toEqual(
      svgFiles.map(([name]) => name).sort(),
    );
    for (const [name, body] of svgFiles) expect(actual[name], name).toBe(body);
  } finally {
    await legacy.close();
    await studio.close();
  }
});
