// @ts-check
/**
 * Mesin sticker (Fase 5): kontrak, normalisasi kanvas 64 → 48, slot 8 → 4, warna per item, ≤4 warna.
 * Paritas piksel terhadap legacy dicek di tests/e2e/sticker-parity.spec.js, direct fill di export-canva.spec.js.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { beforeAll, describe, expect, test } from "vitest";
import { get } from "@icon-studio/engines";
import {
  COLOR_PAIRS,
  SLOT_MAP,
  STICKER_DEFAULTS,
  boxesSticker,
  defaultColors,
  slot4,
  sticker,
  stickerItem,
  stickerParams,
} from "@icon-studio/engines/sticker";
import { concept } from "@icon-studio/icon-sources";
import { fillShapeOf, loadFillShapes } from "@icon-studio/icon-sources/fill-shapes";
import { svgColors } from "@icon-studio/export";

const vendor = path.resolve(import.meta.dirname, "../fixtures/vendor");

/** Node Lucide 1.52.0 dari fixture UMD (tanpa DOM). */
const LUCIDE = (() => {
  const box = /** @type {any} */ ({});
  box.window = box;
  box.self = box;
  box.globalThis = box;
  vm.runInNewContext(readFileSync(path.join(vendor, "lucide.min.js"), "utf8"), box);
  /** @type {Map<string, any[]>} */
  const map = new Map();
  for (const [k, v] of Object.entries(box.lucide.icons)) {
    const kb = k
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
      .replace(/([a-zA-Z])([0-9])/g, "$1-$2")
      .toLowerCase();
    if (!map.has(kb)) map.set(kb, v);
  }
  return map;
})();
const TABLER = JSON.parse(readFileSync(path.join(vendor, "tabler-nodes-outline.json"), "utf8"));

const nodeOf = (/** @type {string} */ key) =>
  key.startsWith("lu:") ? LUCIDE.get(key.slice(3)) || null : key.startsWith("tb:") ? TABLER[key.slice(3)] || null : null;
const ctx = { nodeOf, fillShapeOf };
/* bentuk isi dimuat malas (icon-sources/fill-shapes) */
beforeAll(() => loadFillShapes());
const style = (/** @type {any} */ o = {}) => ({ family: "sticker", engine: { sticker: { ...STICKER_DEFAULTS, ...o } } });
const item = (/** @type {any} */ o = {}) => ({ id: "a", main: "lu:luggage", mod: "tb:circle-check", slot: "TR", mx: 0, my: 0, nx: 0, ny: 0, ...o });

describe("mesin sticker: kontrak", () => {
  test("terdaftar di registry dengan supports sesuai docs/engines/sticker.md", () => {
    expect(get("sticker")).toBe(sticker);
    expect(sticker.canvas).toBe(64);
    expect(sticker.supports).toEqual({ mod: true, deco: true, builtinMains: false, perItemColor: true, maxColors: 5 });
  });

  test("normStyle mengisi style.engine.sticker tanpa menyentuh field classic", () => {
    const s = sticker.normStyle({ family: "classic", sw: 2, ink: "#111111", engine: { sticker: { sw: 9, mode: "x", spk: 2.6 } } });
    expect(s.family).toBe("sticker");
    expect(s.sw).toBe(2);
    expect(s.engine.sticker).toEqual({ ...STICKER_DEFAULTS, sw: 3.6, spk: 3 });
    expect(stickerParams({ ink: "#2b3a67" }).ink).toBe("#2B3A67");
  });

  test("deterministik dan id mask memakai idp", () => {
    const a = sticker.compose(item(), style(), { ctx, idp: "q1" });
    expect(sticker.compose(item(), style(), { ctx, idp: "q1" })).toBe(a);
    expect(a).toContain('id="q1m0"');
    expect(a).not.toMatch(/stroke-dasharray|pathLength|<style|<use|<clipPath/);
    expect(a).toContain('viewBox="0 0 48 48"');
  });

  test("objek bawaan tidak membuat crash: SVG kosong dan flag err", () => {
    const it = item({ main: "face", mod: "bubble" });
    expect(sticker.compose(it, style(), { ctx })).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"></svg>',
    );
    const f = sticker.flags(it, style(), ctx);
    expect(f).toContainEqual(["err", "Objek bawaan tidak didukung gaya Sticker"]);
    expect(f.some(([lvl]) => lvl === "warn")).toBe(true);
  });

  test("opt.deco false merender tanpa dekorasi", () => {
    const withDeco = sticker.compose(item(), style(), { ctx, mode: "white" });
    const noDeco = sticker.compose(item(), style(), { ctx, mode: "white", deco: false });
    expect(withDeco).toContain("<line ");
    expect(noDeco).not.toContain("<line ");
  });
});

describe("mesin sticker: slot, warna, posisi", () => {
  test("8 slot kanonik dipetakan ke 4 sudut", () => {
    expect(SLOT_MAP).toEqual({ TL: "TL", TC: "TR", TR: "TR", ML: "TL", MR: "TR", BL: "BL", BC: "BR", BR: "BR" });
    expect(slot4("zz")).toBe("TR");
    const a = sticker.adapt(item({ slot: "BC" }), style());
    expect(a.mod.slot).toBe("BR");
  });

  test("signature: slot dipetakan dulu, TC dan TR sama", () => {
    expect(sticker.signature(item({ slot: "TC" }))).toBe(sticker.signature(item({ slot: "TR" })));
    expect(sticker.signature(item({ mod: "none" }))).toBe("sticker|luggage|-|-");
    expect(sticker.signature(item({ mod: "lu:circle-check", slot: "MR" }))).toBe(`sticker|luggage|${concept("lu:circle-check", "mod")}|TR`);
  });

  test("warna per item dari engine.sticker, bawaan stabil per objek", () => {
    const it = item({ engine: { sticker: { main: { c: "#5aa9f8" }, mod: { c: "#E5484D" } } } });
    const svg = sticker.compose(it, style(), { ctx });
    expect(svg).toContain('fill="#5AA9F8"');
    expect(svg).toContain('fill="#E5484D"');
    const d = defaultColors("lu:luggage");
    expect(stickerItem(item()).main.c).toBe(d.main);
    expect(d.main).not.toBe(d.mod);
    expect(COLOR_PAIRS.every(([a, b]) => a !== b)).toBe(true);
  });

  test("posisi kanonik 48 dikonversi ke kanvas 64", () => {
    const a = sticker.adapt(item({ mx: 3, my: -1.5, nx: 0.75 }), style());
    expect(a.main.x).toBeCloseTo(4);
    expect(a.main.y).toBeCloseTo(-2);
    expect(a.mod.x).toBeCloseTo(1);
  });

  test("tanpa bentuk isi otomatis memakai lingkaran (plate)", () => {
    const svg = sticker.compose(item({ main: "lu:minus", mod: "none" }), style(), { ctx, mode: "white" });
    expect(svg).toContain('<circle cx="12" cy="12" r="10.5"/>');
    expect(sticker.flags(item({ main: "lu:minus", mod: "none" }), style(), ctx)).toContainEqual([
      "info",
      "Tanpa bentuk isi: isi memakai lingkaran",
    ]);
  });
});

describe("mesin sticker: batas warna Canva", () => {
  const KEYS = ["lu:luggage", "lu:house", "lu:mail", "tb:camera", "tb:heart", "lu:minus", "tb:bus", "lu:tent-tree"];
  for (const mode of ["sticker", "fill", "line"])
    test(`mode ${mode}: ≤4 warna per SVG`, () => {
      for (const main of KEYS) {
        const svg = sticker.compose(item({ main }), style({ mode }), { ctx });
        const colors = svgColors(svg);
        expect(colors.size, main).toBeLessThanOrEqual(4);
        expect(colors.size, main).toBeGreaterThanOrEqual(mode === "line" ? 2 : 3);
      }
    });

  test("isi objek sama dengan isi pengubah: 3 warna", () => {
    const it = item({ engine: { sticker: { main: { c: "#E5484D" }, mod: { c: "#E5484D" } } } });
    expect(svgColors(sticker.compose(it, style(), { ctx })).size).toBe(3);
  });
});

describe("mesin sticker: kotak dan sumbu", () => {
  test("kotak lapisan dalam satuan 48, bawaan di dalam viewBox", () => {
    const b = boxesSticker(item());
    expect(b.main.w).toBeCloseTo(2 * 11 * 1.8 * 0.75);
    expect(b.deco.x).toBeGreaterThanOrEqual(0);
    expect(b.deco.x + b.deco.w).toBeLessThanOrEqual(48);
    expect(b.mod.x + b.mod.w).toBeLessThanOrEqual(48);
    expect(boxesSticker(item({ mod: "none" })).mod.w).toBe(0);
  });

  test("sumbu sesuai spesifikasi; sinar dekat slot pengubah diblokir", () => {
    const ax = sticker.axes(item(), style());
    expect(ax.map((a) => a.id)).toEqual(["rayDiag", "curlSide", "sparkPattern", "colorPair"]);
    const ray = /** @type {any} */ (ax[0]);
    expect(ray.blockedBy(item({ slot: "TR" }), -45)).toBe(true);
    expect(ray.blockedBy(item({ slot: "TR" }), 135)).toBe(false);
    expect(ray.blockedBy(item({ mod: "none" }), -45)).toBe(false);
  });

  test("var rayDiag dan sparkPattern mengubah dekorasi secara deterministik", () => {
    const base = sticker.compose(item(), style(), { ctx, mode: "white" });
    const v = item({ engine: { sticker: { var: { rayDiag: 135, sparkPattern: "OSS" } } } });
    const a = sticker.compose(v, style(), { ctx, mode: "white" });
    expect(a).not.toBe(base);
    expect(sticker.compose(v, style(), { ctx, mode: "white" })).toBe(a);
  });
});
