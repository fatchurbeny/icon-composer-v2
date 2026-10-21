// @ts-check
/**
 * Kriteria terima Fase 3 (docs/MIGRATION-PLAN.md, docs/engines/offset.md bagian "Normalisasi kanvas"):
 * objek offset berbeda < 1% piksel dari legacy offset-composer 1.0.1 setelah objek legacy diskalakan ke 84%.
 * Dekorasi dikecualikan dari perbandingan piksel (diuji terpisah lewat kotak di tests/unit/engines-offset.test.js
 * dan tests/e2e/export-canva.spec.js).
 *
 * Hugeicons: legacy hanya memuat Lucide dan Tabler (`nodeOf` legacy), tetapi `compose` legacy tidak bergantung
 * pada sumber setelah node didapat. Node Hugeicons yang sama dengan yang dipakai Icon Studio (sudah lewat
 * `hgAttrs`) disuntikkan ke peta `TB` legacy, lalu `compose` legacy asli dipanggil. Alasannya dicatat di
 * docs/engines/offset.md bagian "Normalisasi kanvas".
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openHtml } from "./golden-utils.js";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;
const VENDOR = resolve("tests/fixtures/vendor");
const H = { "access-control-allow-origin": "*" };

/** Ikon Lucide dan Tabler: body tunggal, banyak bidang, bidang lewat titik ujung, sub-path M, dan tanpa bidang. */
const KEYS = [
  "lu:house",
  "lu:mail",
  "lu:heart",
  "lu:luggage",
  "lu:wallet",
  "lu:calendar",
  "lu:shopping-cart",
  "lu:star",
  "lu:camera",
  "lu:lock",
  "lu:map-pin",
  "lu:message-circle",
  "lu:package",
  "lu:truck",
  "lu:user",
  "lu:minus",
  "tb:home",
  "tb:mail",
  "tb:heart",
  "tb:coffee",
];
/**
 * Ikon Hugeicons: body tunggal, body lingkaran dan elips, banyak bidang, garis terbuka tanpa bidang,
 * dan bagian berisi (`fill`) yang dibuang `partStr`.
 */
const HG_KEYS = [
  "hg:home-01",
  "hg:favourite",
  "hg:mail-01",
  "hg:shopping-cart-01",
  "hg:camera-01",
  "hg:calendar-03",
  "hg:coffee-01",
  "hg:user",
  "hg:bubble-chat",
  "hg:delivery-truck-01",
  "hg:rocket",
  "hg:music",
];
const ALL_KEYS = [...KEYS, ...HG_KEYS];
/** Kunci Hugeicons di peta `TB` legacy, supaya `nodeOf` legacy menemukannya. */
const legacyKey = (/** @type {string} */ key) =>
  key.startsWith("hg:") ? `tb:hg~${key.slice(3)}` : key;
const MODES = ["solid", "white", "line"];

/* objek legacy: ox = 24, oy = ox - 6, sisi 72. Objek baru: 9,6 di kanvas 120, sisi 100,8 (84%). */
const LEGACY_SCALE = 72 / 100.8;
const LEGACY_VIEWBOX = [
  24 - 9.6 * LEGACY_SCALE,
  18 - 9.6 * LEGACY_SCALE,
  120 * LEGACY_SCALE,
  120 * LEGACY_SCALE,
].join(" ");

test("@golden objek offset < 1% piksel dari legacy setelah diskalakan ke 84%", async ({
  browser,
}) => {
  test.setTimeout(180_000);
  /* Icon Studio: renderer app (mesin offset + pustaka), tanpa dekorasi */
  const page = await browser.newPage();
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("file:")) return route.continue();
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
    return route.abort();
  });
  await page.goto(`${APP}#/composer`);
  /* node Hugeicons persis seperti yang dibaca mesin offset (ctx.nodeOf) */
  const hgNodes = await page.evaluate(async (keys) => {
    const S = /** @type {any} */ (window).__iconStudio;
    await S.renderer.loadTabler();
    await S.renderer.loadHugeicons();
    return Object.fromEntries(
      keys.map((/** @type {string} */ k) => [k, S.renderer.nodeOf(k)]),
    );
  }, HG_KEYS);
  for (const key of HG_KEYS) expect(hgNodes[key], key).toBeTruthy();

  /* legacy: compose() asli di offset-composer 1.0.1, dekorasi dimatikan */
  const legacyPage = await browser.newPage();
  await openHtml(legacyPage, "legacy/style/offset-composer-v1.0.1.html");
  const legacy = await legacyPage.evaluate(
    async ({ keys, modes, hgNodes, legacyKeys }) => {
      const w = /** @type {any} */ (window);
      /* DEF dan TB dideklarasikan const/let di skrip legacy, jadi dibaca lewat eval global */
      const DEF = (0, eval)("DEF");
      await w.loadTabler();
      const TB = (0, eval)("TB");
      for (const [key, node] of Object.entries(hgNodes))
        TB.set(legacyKeys[key].slice(3), node);
      /** @type {Record<string, string>} */
      const out = {};
      for (const key of keys)
        for (const mode of modes)
          out[`${key}|${mode}`] = w.compose({
            ...DEF,
            key: legacyKeys[key],
            mode,
            dTick: false,
            dGround: false,
            dCloud: false,
            dGrass: false,
          });
      return out;
    },
    {
      keys: ALL_KEYS,
      modes: MODES,
      hgNodes,
      legacyKeys: Object.fromEntries(ALL_KEYS.map((k) => [k, legacyKey(k)])),
    },
  );
  await legacyPage.close();

  const results = await page.evaluate(
    async ({ keys, modes, legacy, viewBox }) => {
      const S = /** @type {any} */ (window).__iconStudio;
      const raster = (/** @type {string} */ svg) =>
        new Promise((done, fail) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement("canvas");
            c.width = c.height = 240;
            const g = /** @type {CanvasRenderingContext2D} */ (
              c.getContext("2d")
            );
            g.fillStyle = "#ffffff";
            g.fillRect(0, 0, 240, 240);
            g.drawImage(img, 0, 0, 240, 240);
            done(g.getImageData(0, 0, 240, 240).data);
          };
          img.onerror = () => fail(new Error("SVG tidak bisa dirender"));
          img.src =
            "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
        });
      const sized = (/** @type {string} */ svg) =>
        svg.replace(/<svg [^>]*?>/, (tag) =>
          tag
            .replace(/ width="[^"]*"| height="[^"]*"/g, "")
            .replace("<svg ", '<svg width="240" height="240" '),
        );
      const out = [];
      for (const key of keys)
        for (const mode of modes) {
          const it = S.document.normItem(
            { main: key, mod: "none", mx: 0, my: 0 },
            S.renderer.lib,
            {},
          );
          const ours = S.renderer.renderSetItem(
            it,
            { family: "offset", engine: { offset: { mode } } },
            { idp: "p", deco: false },
          );
          const old = legacy[`${key}|${mode}`].replace(
            'viewBox="0 0 120 120"',
            `viewBox="${viewBox}"`,
          );
          const a = /** @type {Uint8ClampedArray} */ (
              await raster(sized(ours))
            ),
            b = /** @type {Uint8ClampedArray} */ (await raster(sized(old)));
          let diff = 0,
            ink = 0;
          for (let i = 0; i < a.length; i += 4) {
            const d = Math.max(
              Math.abs(a[i] - b[i]),
              Math.abs(a[i + 1] - b[i + 1]),
              Math.abs(a[i + 2] - b[i + 2]),
            );
            if (d > 48) diff++;
            if (
              Math.min(a[i], a[i + 1], a[i + 2], b[i], b[i + 1], b[i + 2]) < 250
            )
              ink++;
          }
          out.push({
            key,
            mode,
            main: it.main,
            empty:
              !/<path|<circle|<rect|<ellipse|<polygon|<line|<polyline/.test(
                ours,
              ),
            diff: diff / (a.length / 4),
            diffInk: ink ? diff / ink : 0,
            inked: ink / (a.length / 4),
          });
        }
      return out;
    },
    { keys: ALL_KEYS, modes: MODES, legacy, viewBox: LEGACY_VIEWBOX },
  );
  await page.close();
  for (const r of results) {
    const label = `${r.key} ${r.mode}`;
    expect(r.main, label).toBe(r.key);
    expect(r.empty, label).toBe(false);
    /* pastikan raster berisi gambar, bukan dua kanvas kosong yang kebetulan sama */
    expect(r.inked, label).toBeGreaterThan(0.005);
    expect(r.diff, `${label}: selisih piksel terhadap legacy`).toBeLessThan(
      0.01,
    );
  }
  test.info().annotations.push({
    type: "selisih",
    description: `maks ${(Math.max(...results.map((r) => r.diff)) * 100).toFixed(3)}% dari kanvas, maks ${(Math.max(...results.map((r) => r.diffInk)) * 100).toFixed(2)}% dari piksel bergambar, min ${(Math.min(...results.map((r) => r.inked)) * 100).toFixed(1)}% kanvas bergambar`,
  });
  test.info().annotations.push({
    type: "selisih Hugeicons",
    description: results
      .filter((r) => r.key.startsWith("hg:"))
      .map((r) => `${r.key} ${r.mode} ${(r.diff * 100).toFixed(3)}%`)
      .join(", "),
  });
});
