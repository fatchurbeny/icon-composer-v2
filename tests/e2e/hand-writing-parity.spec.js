// @ts-check
/**
 * Kriteria terima Fase 4 (docs/MIGRATION-PLAN.md, docs/engines/hand-writing.md bagian "WAJIB: memanggang dash"):
 * render mesin hand-writing 2.0.0 (dash dipanggang jadi geometri) berbeda < 1% piksel dari `compose` legacy
 * coret-composer 1.0.0 (dengan `stroke-dasharray`) pada fixture 32 ikon.
 *
 * Kedua sisi memakai node ikon yang sama (versi pustaka `sources.json`): node yang dibaca Icon Studio lewat
 * `renderer.nodeOf` disuntik ke `SRC` legacy, lalu `compose` legacy asli dipanggil. Dengan begitu yang dibandingkan
 * hanya mesin (dash browser vs dash dipanggang), bukan selisih versi pustaka.
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openHtml } from "./golden-utils.js";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;
const VENDOR = resolve("tests/fixtures/vendor");
const H = { "access-control-allow-origin": "*" };
/** Pustaka ikon offline (versi sources.json). */
const ROUTES = [
  ["lucide.min.js", "lucide.min.js", "application/javascript"],
  ["tabler-nodes-outline", "tabler-nodes-outline.json", "application/json"],
  ["@tabler/icons@3.49.0/icons.json", "tabler-icons.json", "application/json"],
  ["core-free-icons", "hugeicons.mjs", "application/javascript"],
];

/** 32 ikon: Lucide, Tabler, Hugeicons; bentuk tertutup, banyak sub-path, lingkaran, garis terbuka; dengan dan tanpa pengubah. */
export const HW_FIXTURE = [
  ["lu:pizza", "none", "BR"],
  ["lu:wallet", "lu:plus", "BR"],
  ["lu:piggy-bank", "lu:sparkle", "BR"],
  ["lu:alarm-clock", "none", "BR"],
  ["lu:house", "lu:check", "TR"],
  ["lu:mail", "none", "BR"],
  ["lu:heart", "lu:plus", "TL"],
  ["lu:luggage", "none", "BR"],
  ["lu:calendar", "lu:clock", "BR"],
  ["lu:shopping-cart", "none", "BR"],
  ["lu:star", "lu:sparkle", "TR"],
  ["lu:camera", "none", "BR"],
  ["lu:lock", "lu:key", "BL"],
  ["lu:map-pin", "none", "BR"],
  ["lu:message-circle", "lu:heart", "BR"],
  ["lu:package", "none", "BR"],
  ["lu:truck", "lu:check", "TR"],
  ["lu:user", "lu:plus", "BR"],
  ["lu:coffee", "none", "BR"],
  ["lu:circle", "none", "BR"],
  ["tb:home", "none", "BR"],
  ["tb:mail", "lu:plus", "BR"],
  ["tb:heart", "none", "BR"],
  ["tb:coffee", "lu:check", "TL"],
  ["tb:backpack", "none", "BR"],
  ["tb:camera", "lu:sparkle", "MR"],
  ["hg:home-01", "none", "BR"],
  ["hg:favourite", "lu:plus", "BR"],
  ["hg:mail-01", "none", "BR"],
  ["hg:coffee-02", "lu:check", "TR"],
  ["hg:user", "none", "BR"],
  ["hg:camera-01", "lu:heart", "BR"],
];

test("@golden hand-writing 2.0.0 < 1% piksel dari legacy coret-composer 1.0.0 (32 ikon)", async ({ browser }) => {
  test.setTimeout(180_000);
  const page = await browser.newPage();
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("file:")) return route.continue();
    const hit = ROUTES.find(([p]) => url.includes(p));
    return hit ? route.fulfill({ path: `${VENDOR}/${hit[1]}`, contentType: hit[2], headers: H }) : route.abort();
  });
  await page.goto(`${APP}#/composer`);
  const keys = [...new Set(HW_FIXTURE.flatMap(([m, d]) => [m, d]).filter((k) => k !== "none"))];
  const nodes = await page.evaluate(async (keys) => {
    const S = /** @type {any} */ (window).__iconStudio;
    await S.renderer.loadTabler();
    await S.renderer.loadHugeicons();
    return Object.fromEntries(keys.map((/** @type {string} */ k) => [k, S.renderer.nodeOf(k)]));
  }, keys);
  for (const k of keys) expect(nodes[k], k).toBeTruthy();

  const cases = HW_FIXTURE.map(([main, mod, slot], i) => ({ main, mod, slot, ms: 0.5 + (i % 3) * 0.06, blob: ["auto", "auto", "circle", "none"][i % 4], seed: 1000 + i * 37 }));

  /* legacy: compose() asli coret-composer 1.0.0 dengan node yang sama */
  const legacyPage = await browser.newPage();
  await openHtml(legacyPage, "legacy/style/coret-composer-v1.0.0.html");
  const legacy = await legacyPage.evaluate(
    ({ cases, nodes }) => {
      const SRC = (0, eval)("SRC"),
        clean = (0, eval)("clean"),
        compose = (0, eval)("compose");
      for (const [key, node] of Object.entries(nodes)) {
        const [s, n] = key.split(":");
        SRC[s] = SRC[s] || {};
        SRC[s][n] = clean(node);
      }
      const S = { acc: "#FDBF57", ink: "#2B1D2E", sw: 2.3, puff: 2, off: 1.25, gap: 9, rot: 5, ko: 1.25 };
      return cases.map((/** @type {any} */ c) => compose({ main: c.main, mod: c.mod === "none" ? null : c.mod, anchor: c.slot, ms: c.ms, blob: c.blob, seed: c.seed }, S, 240));
    },
    { cases, nodes },
  );
  await legacyPage.close();

  const results = await page.evaluate(
    async ({ cases, legacy }) => {
      const S = /** @type {any} */ (window).__iconStudio;
      const raster = (/** @type {string} */ svg) =>
        new Promise((done, fail) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement("canvas");
            c.width = c.height = 240;
            const g = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
            g.fillStyle = "#ffffff";
            g.fillRect(0, 0, 240, 240);
            g.drawImage(img, 0, 0, 240, 240);
            done(g.getImageData(0, 0, 240, 240).data);
          };
          img.onerror = () => fail(new Error("SVG tidak bisa dirender"));
          img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
        });
      const style = { family: "hand-writing", engine: { "hand-writing": {} } };
      const out = [];
      for (const [i, c] of cases.entries()) {
        const it = { main: c.main, mod: c.mod, slot: c.slot, engine: { "hand-writing": { ms: c.ms, blob: c.blob, seed: c.seed } } };
        const ours = S.renderer.renderSetItem(it, style, { idp: `p${i}`, size: 240 });
        const a = /** @type {Uint8ClampedArray} */ (await raster(ours)),
          b = /** @type {Uint8ClampedArray} */ (await raster(legacy[i]));
        let diff = 0,
          ink = 0;
        for (let j = 0; j < a.length; j += 4) {
          const d = Math.max(Math.abs(a[j] - b[j]), Math.abs(a[j + 1] - b[j + 1]), Math.abs(a[j + 2] - b[j + 2]));
          if (d > 48) diff++;
          if (Math.min(a[j], a[j + 1], a[j + 2], b[j], b[j + 1], b[j + 2]) < 250) ink++;
        }
        out.push({
          key: `${c.main} + ${c.mod}`,
          dashed: /stroke-dasharray/.test(legacy[i]),
          baked: !/stroke-dasharray|pathLength/.test(ours),
          diff: diff / (a.length / 4),
          inked: ink / (a.length / 4),
        });
      }
      return out;
    },
    { cases, legacy },
  );
  await page.close();
  expect(results).toHaveLength(32);
  expect(results.filter((r) => r.dashed).length).toBeGreaterThan(24);
  for (const r of results) {
    expect(r.baked, r.key).toBe(true);
    expect(r.inked, r.key).toBeGreaterThan(0.01);
    expect(r.diff, `${r.key}: selisih piksel terhadap legacy`).toBeLessThan(0.01);
  }
  test.info().annotations.push({
    type: "selisih",
    description: `maks ${(Math.max(...results.map((r) => r.diff)) * 100).toFixed(3)}% kanvas; ${results.map((r) => `${r.key} ${(r.diff * 100).toFixed(3)}%`).join(", ")}`,
  });
});
