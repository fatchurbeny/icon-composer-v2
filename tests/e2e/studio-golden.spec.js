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
  captureIconComposerZip,
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
      async ({ family, saved, mainBin, modBin }) => {
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
        /* tile pengubah di panel Bentuk (modPreview IC 1.5.1): aksen lewat mesin, classic dari data MODS */
        const r3 = (v) => Math.round(v * 1000) / 1000;
        const modPreview = (k) => {
          if (style.family === "accent")
            return r.modPreviewAccent(k, items[0].mstyle, style);
          const md = r.data.MODS[k],
            sc = Math.min(30 / md.w, 30 / md.h),
            W = md.w * sc,
            H = md.h * sc;
          return `<svg viewBox="0 0 48 48" fill="none" stroke="${style.ink}" stroke-width="${style.sw}" stroke-linecap="${style.cap}" stroke-linejoin="${style.join}"><g transform="translate(${r3(24 - W / 2)} ${r3(24 - H / 2)}) scale(${r3(sc)})"><g fill="${style.accent}" stroke="none">${md.sil}</g><g stroke-width="${r3((style.sw * (md.badge ? 0.75 : 1)) / (sc * (md.kd || 1)))}">${md.det.replace(/INK/g, style.ink)}</g></g></svg>`;
        };
        const modHost = document.createElement("div");
        modHost.innerHTML = modBin;
        const mods = [...modHost.querySelectorAll("[data-mod]")].map(
          (tile) => {
            const k = tile.getAttribute("data-mod");
            return {
              k,
              expected: tile.querySelector("svg").outerHTML,
              actual: toHtml(modPreview(k)),
            };
          },
        );
        return { artActual, tiles, mods };
      },
      {
        family,
        saved: mixed.iconComposer.storage["icon-composer-aksen-v1"],
        mainBin: section(expected, "mainBin"),
        modBin: section(expected, "modBin"),
      },
    );
    expect(result.artActual).toBe(section(expected, "art"));
    expect(result.tiles.length).toBeGreaterThan(20);
    expect(result.tiles.map((t) => t.k)).toEqual(
      expect.arrayContaining(["tb:mail", "hg:rocket-01", "lu:coffee"]),
    );
    for (const tile of result.tiles)
      expect(tile.actual, tile.k).toBe(tile.expected);
    expect(result.mods.length).toBeGreaterThan(10);
    expect(result.mods.map((t) => t.k)).toEqual(
      expect.arrayContaining(["check", "tb:bulb", "hg:home-01"]),
    );
    for (const tile of result.mods)
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

/**
 * Normalisasi yang sama untuk ZIP legacy dan Icon Studio: waktu ekspor dan id mask Resource Page
 * (`rp` + uid acak TIB) tidak memengaruhi isi.
 * @param {Record<string, string | null>} files
 */
function normalizeZip(files) {
  const out = {};
  for (const [name, body] of Object.entries(files)) {
    if (body == null) continue;
    let text = body.replace(
      /"exported_at"\s*:\s*"[^"]*"/,
      '"exported_at":"<dinormalisasi>"',
    );
    if (name === "resource-page.html")
      text = text.replace(/rpi\d+-[a-z0-9]+/g, "rpUID");
    out[name] = text;
  }
  return out;
}

for (const [label, fixture, styles] of [
  ["basic", basic, ["A"]],
  ["lintas pustaka", mixed, mixed.templateIconBuilder.zipStyles],
]) {
  test(`@golden Icon Studio ZIP Builder ${label} identik dengan TIB 1.6.0`, async ({
    browser,
  }) => {
    const legacy = await browser.newPage();
    const studio = await browser.newPage();
    try {
      await openHtml(legacy, "legacy/template-icon-builder-aksen-v1.6.0.html");
      const expected = normalizeZip(
        await captureTemplateIconBuilderZip(
          legacy,
          fixture.templateIconBuilder.zipManifest,
          styles,
        ),
      );
      await openHtml(studio, STUDIO);
      const files = await studio.evaluate(
        async ({ manifest, styles }) => {
          const S = window.__iconStudio,
            D = S.document,
            r = S.renderer,
            B = S.builder;
          const imp = D.importManifest(JSON.stringify(manifest), r.lib);
          if (imp.needTb) await r.loadTabler();
          if (imp.needHg) await r.loadHugeicons();
          imp.items.forEach(r.ensureManifestItem);
          const doc = D.createManifestDocument(imp);
          const vocab = B.createVocabulary(r);
          doc.issues = B.validateManifest(doc, vocab);
          const opts = {
            ...B.defaultExportOptions(doc),
            modes: {
              X: styles.includes("X"),
              A: styles.includes("A"),
              B: styles.includes("B"),
            },
          };
          const res = await B.buildExportFiles(doc, opts, {
            renderer: r,
            vocab,
            brand: "",
          });
          return res.files;
        },
        { manifest: fixture.templateIconBuilder.zipManifest, styles },
      );
      const actual = normalizeZip(files);
      expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
      for (const name of Object.keys(expected))
        expect(actual[name], name).toBe(expected[name]);
    } finally {
      await legacy.close();
      await studio.close();
    }
  });
}

test("@golden Icon Studio ZIP Composer lintas pustaka sama dengan IC 1.5.1: svg-asli/ identik, SVG Canva = direct fill (ADR-011)", async ({
  browser,
}) => {
  const legacy = await browser.newPage();
  const studio = await browser.newPage();
  try {
    await openHtml(legacy, "legacy/icon-composer-aksen-v1.5.1.html", {
      storage: mixed.iconComposer.storage,
    });
    const legacyZip = await captureIconComposerZip(legacy);
    const [header, ...rest] = legacyZip["metadata.csv"].split("\r\n");
    legacyZip["metadata.csv"] = [
      "\uFEFF" +
        header
          .replace(/^\uFEFF/, "")
          .split(",")
          .map((c) => `"${c}"`)
          .join(","),
      ...rest,
    ].join("\r\n");
    const legacyFiles = Object.fromEntries(
      Object.entries(legacyZip).filter(([, v]) => v != null),
    );
    await openHtml(studio, STUDIO);
    const { actual, canva } = await studio.evaluate(
      async ({ saved, legacyFiles }) => {
        const S = window.__iconStudio,
          D = S.document,
          r = S.renderer,
          R = S.review;
        await r.loadTabler();
        await r.loadHugeicons();
        const doc = D.createSetDocument({ name: "set-ikon", style: saved.style });
        doc.items = saved.set.map((p) => D.normItem(p, r.lib));
        R.ensureReviewFields(doc);
        doc.review.asli = true;
        /* SVG Canva yang diharapkan: direct fill dari SVG asli IC 1.5.1 (null bila tidak bisa dikonversi) */
        /** @type {Record<string, string | null>} */
        const canva = {};
        for (const [name, svg] of Object.entries(legacyFiles))
          if (name.endsWith(".svg"))
            try {
              canva[name] = S.directFillSvgFile(`<?xml version="1.0" encoding="UTF-8"?>\n${svg}`);
            } catch {
              canva[name] = null;
            }
        return { actual: await R.buildSetZipFiles(doc, R.includedOf(doc), r), canva };
      },
      { saved: mixed.iconComposer.storage["icon-composer-aksen-v1"], legacyFiles },
    );
    /** @type {Record<string, string>} */
    const expected = {};
    for (const [name, value] of Object.entries(legacyFiles)) {
      if (!name.endsWith(".svg")) continue;
      expected[`svg-asli/${name}`] = value;
      if (canva[name] != null) expected[name] = /** @type {string} */ (canva[name]);
    }
    const failed = Object.keys(canva).filter((n) => canva[n] == null);
    for (const [name, value] of Object.entries(legacyFiles))
      if (!name.endsWith(".svg"))
        expected[name] =
          name === "metadata.csv"
            ? value
                .split("\r\n")
                .filter((line) => !failed.some((f) => line.startsWith(`"${f}"`)))
                .join("\r\n")
            : value;
    expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
    for (const name of Object.keys(expected))
      expect(actual[name], name).toBe(expected[name]);
  } finally {
    await legacy.close();
    await studio.close();
  }
});
