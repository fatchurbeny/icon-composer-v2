// @ts-check
/**
 * Kriteria terima Fase 5 (docs/MIGRATION-PLAN.md, docs/engines/sticker.md): golden visual sticker terhadap
 * legacy sticker-composer < 1,5% piksel, dan selisih versi pustaka dicatat.
 *
 * Dua pengukuran:
 * 1. Paritas mesin: bentuk ikon yang sama dengan Icon Studio (outline Lucide 1.52.0 / Tabler 3.49.0 dan
 *    bentuk isi dari fill-shapes.json) disuntikkan ke data `D` legacy, lalu `compose` legacy asli dipanggil.
 *    Ikon tanpa bentuk isi diberi lingkaran (`plate`), aturan baru di docs/engines/sticker.md. Batas < 1,5%,
 *    untuk mode `mask` (ekspor) dan `white` (urutan legacy).
 * 2. Selisih versi pustaka: legacy dengan datanya sendiri (Lucide 0.460.0, Tabler 3.31.0) dibanding Icon Studio.
 *    Hanya dicatat sebagai anotasi, karena bentuk ikonnya memang berubah antarversi.
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openHtml } from "./golden-utils.js";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;
const VENDOR = resolve("tests/fixtures/vendor");
const H = { "access-control-allow-origin": "*" };

/** Satuan kanonik 48 → satuan legacy 64. */
const L = 64 / 48;

/**
 * Kasus uji: objek, pengubah, slot, posisi (satuan 48, kelipatan 0,75), warna, skala, isi, dan dekorasi.
 * Set contoh legacy (presetSet) ditambah variasi isi plate/none, geser, dan objek tanpa bentuk isi.
 */
const CASES = [
  ["lu:luggage", "tb:circle-check", "TR", "#E5484D", "#6BD88A", 1.8, "auto", 7],
  ["lu:map", "tb:map-pin", "TR", "#6BD88A", "#E5484D", 1.8, "auto", 12],
  ["tb:camera", "tb:heart", "TR", "#5AA9F8", "#E5484D", 1.8, "auto", 21],
  ["lu:tent-tree", "tb:flame", "BR", "#5AA9F8", "#F09A3E", 1.8, "auto", 33],
  ["lu:sailboat", "tb:sun", "TR", "#F09A3E", "#F9D84A", 1.9, "auto", 44],
  ["tb:caravan", "tb:star", "TL", "#6BD88A", "#F9D84A", 1.8, "auto", 5],
  ["lu:mountain-snow", "tb:compass", "BL", "#5AA9F8", "#F09A3E", 1.7, "auto", 18],
  ["lu:cable-car", null, "TR", "#E5484D", "#F9D84A", 1.8, "auto", 29],
  ["tb:bus", "tb:clock", "BL", "#F9D84A", "#5AA9F8", 1.8, "auto", 50],
  ["tb:umbrella", "tb:sun", "TR", "#E5484D", "#F9D84A", 2.1, "auto", 9],
  ["lu:house", "lu:plus", "BR", "#B58BEA", "#FFFFFF", 1.6, "plate", 3],
  ["lu:heart", "tb:heart", "TL", "#FFFFFF", "#E5484D", 2.3, "none", 60],
  ["lu:mail", "tb:circle-check", "BR", "#C08A6B", "#4A9A78", 1.2, "auto", 1],
  ["lu:minus", "tb:star", "TR", "#4A9A78", "#F9D84A", 1.8, "auto", 40],
];
/** Gaya set: bawaan, tiga mode, dan nilai ekstrem slider. */
const STYLES = [
  { mode: "sticker", sw: 2.4, halo: 3.25, off: 1, spk: 3, rays: true, curl: true, ink: "#17171B" },
  { mode: "fill", sw: 2.4, halo: 3.25, off: 1, spk: 3, rays: true, curl: true, ink: "#2B3A67" },
  { mode: "line", sw: 3.6, halo: 0, off: 0, spk: 6, rays: false, curl: true, ink: "#5A2E1F" },
  { mode: "sticker", sw: 1.4, halo: 5, off: 2.5, spk: 0, rays: true, curl: false, ink: "#17171B" },
];

/** @param {number} i */
function caseOf(i) {
  const [main, mod, slot, c1, c2, s, fill, seed] = /** @type {any[]} */ (CASES[i]);
  /* geser bergantian supaya transform posisi ikut teruji */
  const mx = [0, 0.75, -1.5, 0][i % 4],
    my = [0.75, 0, 1.5, -0.75][i % 4],
    nx = [0, -0.75, 0, 1.5][i % 4],
    ny = [0, 0.75, -0.75, 0][i % 4];
  const deco = { seed, s: [1, 0.9, 1.1, 1][i % 4], x: [0, 1, 0, -2][i % 4], y: [0, 0, -1, 1][i % 4] };
  const modS = [0.9, 0.8, 1.1, 1][i % 4];
  return {
    canonical: {
      id: `p${i}`,
      main,
      mod: mod || "none",
      slot,
      mx,
      my,
      nx,
      ny,
      engine: { sticker: { main: { c: c1, s, fill }, mod: { c: c2, s: modS }, deco } },
    },
    legacy: {
      main: { k: main, c: c1, s, x: mx * L, y: my * L, fill },
      mod: { k: mod, c: c2, s: modS, slot, x: nx * L, y: ny * L },
      deco: { on: true, ...deco },
      vis: { main: true, mod: true },
    },
  };
}
const ALL = CASES.map((_, i) => caseOf(i));

test("@golden sticker < 1,5% piksel dari legacy sticker-composer (selisih versi pustaka dicatat)", async ({
  browser,
}) => {
  test.setTimeout(240_000);
  const page = await browser.newPage();
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("file:")) return route.continue();
    if (url.includes("lucide.min.js"))
      return route.fulfill({ path: `${VENDOR}/lucide.min.js`, contentType: "application/javascript" });
    if (url.includes("tabler-nodes-outline"))
      return route.fulfill({ path: `${VENDOR}/tabler-nodes-outline.json`, contentType: "application/json", headers: H });
    return route.abort();
  });
  await page.goto(`${APP}#/composer`);
  const keys = [...new Set(ALL.flatMap((c) => [c.legacy.main.k, c.legacy.mod.k]).filter(Boolean))];
  /* bentuk yang dipakai Icon Studio: outline versi terkunci dan bentuk isi (plate bila tidak ada) */
  const shapes = await page.evaluate(async (keys) => {
    const S = /** @type {any} */ (window).__iconStudio;
    await S.renderer.loadTabler();
    await S.renderer.loadStickerFills();
    /** @type {Record<string, {o: string, f: string}>} */
    const out = {};
    for (const k of keys) out[k] = S.renderer.stickerShapes(k);
    return out;
  }, keys);
  for (const k of keys) expect(shapes[k], k).toBeTruthy();

  /* legacy: compose() asli, sekali dengan data bawaannya, sekali dengan bentuk Icon Studio */
  const legacyPage = await browser.newPage();
  await openHtml(legacyPage, "legacy/style/sticker-composer.html");
  const legacy = await legacyPage.evaluate(
    ({ cases, styles, shapes }) => {
      const w = /** @type {any} */ (window);
      const D = (0, eval)("D");
      const setStyle = (/** @type {any} */ s) => (0, eval)(`style = ${JSON.stringify(s)}`);
      /** @type {Record<string, string>} */
      const own = {},
        injected = {};
      styles.forEach((/** @type {any} */ s, /** @type {number} */ si) => {
        setStyle(s);
        cases.forEach((/** @type {any} */ c, /** @type {number} */ ci) => {
          own[`${ci}|${si}`] = w.compose(c.legacy, { size: 256 });
        });
      });
      const PLATE = `<circle cx="12" cy="12" r="10.5"/>`;
      for (const [key, sh] of Object.entries(shapes)) {
        const src = key.slice(0, 2),
          name = key.slice(3);
        D[src][name] = /** @type {any} */ (sh).o;
        D[src + "f"][name] = /** @type {any} */ (sh).f || PLATE;
      }
      styles.forEach((/** @type {any} */ s, /** @type {number} */ si) => {
        setStyle(s);
        cases.forEach((/** @type {any} */ c, /** @type {number} */ ci) => {
          injected[`${ci}|${si}`] = w.compose(c.legacy, { size: 256 });
        });
      });
      return { own, injected };
    },
    { cases: ALL, styles: STYLES, shapes },
  );
  await legacyPage.close();

  const results = await page.evaluate(
    async ({ cases, styles, legacy }) => {
      const S = /** @type {any} */ (window).__iconStudio;
      const N = 256;
      const raster = (/** @type {string} */ svg) =>
        new Promise((done, fail) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement("canvas");
            c.width = c.height = N;
            const g = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
            g.fillStyle = "#ffffff";
            g.fillRect(0, 0, N, N);
            g.drawImage(img, 0, 0, N, N);
            done(g.getImageData(0, 0, N, N).data);
          };
          img.onerror = () => fail(new Error("SVG tidak bisa dirender"));
          img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
        });
      const sized = (/** @type {string} */ svg) =>
        svg.replace(/<svg [^>]*?>/, (tag) =>
          tag.replace(/ width="[^"]*"| height="[^"]*"/g, "").replace("<svg ", `<svg width="${N}" height="${N}" `),
        );
      const compare = (/** @type {Uint8ClampedArray} */ a, /** @type {Uint8ClampedArray} */ b) => {
        let diff = 0,
          ink = 0;
        for (let i = 0; i < a.length; i += 4) {
          const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]));
          if (d > 48) diff++;
          if (Math.min(a[i], a[i + 1], a[i + 2], b[i], b[i + 1], b[i + 2]) < 250) ink++;
        }
        return { diff: diff / (a.length / 4), inked: ink / (a.length / 4) };
      };
      const out = [];
      for (let si = 0; si < styles.length; si++)
        for (let ci = 0; ci < cases.length; ci++) {
          const style = { family: "sticker", engine: { sticker: styles[si] } };
          const injected = /** @type {Uint8ClampedArray} */ (await raster(sized(legacy.injected[`${ci}|${si}`])));
          const own = /** @type {Uint8ClampedArray} */ (await raster(sized(legacy.own[`${ci}|${si}`])));
          for (const mode of ["mask", "white"]) {
            const ours = S.renderer.renderSetItem(cases[ci].canonical, style, { idp: `p${ci}${si}`, mode });
            const a = /** @type {Uint8ClampedArray} */ (await raster(sized(ours)));
            const engine = compare(a, injected);
            out.push({
              key: `${cases[ci].canonical.main}+${cases[ci].canonical.mod} gaya ${si} ${mode}`,
              mode,
              diff: engine.diff,
              inked: engine.inked,
              version: mode === "white" ? compare(a, own).diff : null,
            });
          }
        }
      return out;
    },
    { cases: ALL, styles: STYLES, legacy },
  );
  await page.close();
  for (const r of results) {
    expect(r.inked, r.key).toBeGreaterThan(0.02);
    expect(r.diff, `${r.key}: selisih piksel terhadap legacy`).toBeLessThan(0.015);
  }
  const pct = (/** @type {number} */ v) => `${(v * 100).toFixed(3)}%`;
  test.info().annotations.push({
    type: "selisih mesin",
    description: ["mask", "white"]
      .map((m) => `${m}: maks ${pct(Math.max(...results.filter((r) => r.mode === m).map((r) => r.diff)))}`)
      .join(", "),
  });
  const version = results.filter((r) => r.version != null && r.key.endsWith("gaya 0 white"));
  test.info().annotations.push({
    type: "selisih versi pustaka (gaya bawaan)",
    description: version.map((r) => `${r.key.replace(" gaya 0 white", "")} ${pct(/** @type {number} */ (r.version))}`).join(", "),
  });
});
