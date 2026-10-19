// @ts-check
/**
 * Mesin offset (Fase 3): kontrak, normalisasi kanvas 120 → 48, deteksi bidang tertutup, dekorasi di dalam viewBox.
 * Paritas piksel terhadap legacy dicek di tests/e2e/offset-parity.spec.js.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, test } from "vitest";
import { get } from "@icon-studio/engines";
import {
  DECO_SETS,
  OFFSET_DEFAULTS,
  analyzeOffset,
  boxesOffset,
  isClosedPart,
  offset,
  offsetDeco,
  offsetParams,
  splitParts,
} from "@icon-studio/engines/offset";
import { partBox, samplePath } from "../../packages/engines/offset/geometry.js";

const vendor = path.resolve(import.meta.dirname, "../fixtures/vendor");

/** Node Lucide 1.52.0 dari fixture UMD (tanpa DOM). */
const LUCIDE = (() => {
  const box = /** @type {any} */ ({});
  box.window = box;
  box.self = box;
  box.globalThis = box;
  vm.runInNewContext(
    readFileSync(path.join(vendor, "lucide.min.js"), "utf8"),
    box,
  );
  /** @type {Map<string, any[]>} */
  const map = new Map();
  for (const [k, v] of Object.entries(box.lucide.icons)) {
    const n = Array.isArray(v) && v[0] === "svg" ? v[2] : v;
    const kb = k
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
      .replace(/([a-zA-Z])([0-9])/g, "$1-$2")
      .toLowerCase();
    if (!map.has(kb)) map.set(kb, n);
  }
  return map;
})();

const nodeOf = (/** @type {string} */ key) => LUCIDE.get(key.slice(3)) || null;
const ctx = { nodeOf };
const style = (/** @type {any} */ o = {}) => ({
  family: "offset",
  engine: { offset: { ...OFFSET_DEFAULTS, ...o } },
});
const item = (
  /** @type {string} */ main,
  /** @type {any} */ deco = {},
  extra = {},
) => ({
  main,
  mod: "none",
  engine: {
    offset: {
      deco: { tick: false, ground: false, cloud: false, grass: false, ...deco },
    },
  },
  ...extra,
});
const render = (
  /** @type {any} */ it,
  /** @type {any} */ s = style(),
  /** @type {any} */ opt = {},
) => offset.compose(offset.adapt(it, s), s, { idp: "t", ctx, ...opt });
const colorsOf = (/** @type {string} */ svg) =>
  new Set(
    [
      ...svg
        .replace(/<mask[\s\S]*?<\/mask>/g, "")
        .matchAll(/(?:fill|stroke)="(#[0-9A-Fa-f]{6})"/g),
    ].map((m) => m[1].toUpperCase()),
  );

describe("geometri murni", () => {
  test("samplePath membaca perintah relatif, busur, dan kurva", () => {
    const s = samplePath("M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12");
    expect(s.start).toEqual([6, 20]);
    expect(s.end?.map((v) => Math.round(v * 1000) / 1000)).toEqual([18, 6]);
    const circle = partBox([
      "path",
      { d: "M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16" },
    ]);
    expect(circle.x).toBeCloseTo(4, 1);
    expect(circle.w).toBeCloseTo(16, 1);
    const curve = partBox(["path", { d: "M0 0C0 -6 8 -6 9 -2" }]);
    expect(curve.y).toBeCloseTo(-4.787, 2);
  });

  test("flag busur yang ditulis rapat (a1 1 0 011 1)", () => {
    const s = samplePath("M0 0a1 1 0 011 1");
    expect(s.end).toEqual([1, 1]);
  });

  test("bidang tertutup: bentuk dasar, Z, dan titik ujung berimpit", () => {
    expect(isClosedPart(["circle", { cx: 12, cy: 12, r: 4 }])).toBe(true);
    expect(isClosedPart(["path", { d: "M2 2h10v10z" }])).toBe(true);
    expect(isClosedPart(["path", { d: "M2 2h10v10L2 2" }])).toBe(true);
    expect(isClosedPart(["path", { d: "M2 2h10v10" }])).toBe(false);
    expect(isClosedPart(["path", { d: "M0 0h24v24H0z" }])).toBe(false);
  });

  test("splitParts memecah sub-path M dan membuang kotak latar", () => {
    const parts = splitParts([
      ["path", { d: "M0 0h24v24H0z" }],
      ["path", { d: "M2 2h4M8 8h4" }],
      ["path", { d: "M2 2h4m4 4h4" }],
    ]);
    expect(parts.map((p) => p[1].d)).toEqual([
      "M2 2h4",
      "M8 8h4",
      "M2 2h4m4 4h4",
    ]);
  });

  test("body = bagian tertutup dengan kotak terbesar", () => {
    const A = analyzeOffset(/** @type {any} */ (nodeOf("lu:luggage")));
    expect(A.closed.length).toBeGreaterThan(0);
    expect(A.body).toBeTruthy();
    const area = (/** @type {any} */ p) => {
      const b = partBox(p);
      return b.w * b.h;
    };
    for (const p of A.closed)
      expect(area(A.body)).toBeGreaterThanOrEqual(area(p));
  });
});

describe("mesin offset", () => {
  test("terdaftar di registry dengan supports sesuai docs/engines/offset.md", () => {
    const e = get("offset");
    expect(e.version).toBe("1.1.0");
    expect(e.canvas).toBe(120);
    expect(e.supports).toEqual({
      mod: false,
      deco: true,
      builtinMains: false,
      perItemColor: false,
      maxColors: 3,
    });
  });

  test("normStyle mengisi bawaan dan membatasi nilai", () => {
    const s = offset.normStyle({
      family: "offset",
      engine: {
        offset: { mode: "aneh", dx: 99, dy: "x", sw: 0.1, acc: "#abcdef" },
      },
    });
    expect(s.engine.offset).toEqual({
      mode: "solid",
      acc: "#ABCDEF",
      ink: "#1A1A1A",
      dx: 8,
      dy: 4,
      sw: 1.5,
      size: 100.8,
    });
    expect(offsetParams({})).toEqual({ ...OFFSET_DEFAULTS });
  });

  test("kanvas dinormalisasi ke 48 dan objek 84%", () => {
    const svg = render(item("lu:house"));
    expect(svg).toContain('viewBox="0 0 48 48"');
    expect(svg).toContain("translate(3.84 3.84) scale(1.68)");
    /* geser isi 4 × 1,4 × 0,4 = 2,24 */
    expect(svg).toContain("translate(6.08 6.08) scale(1.68)");
    /* tebal garis dalam satuan ikon sama dengan legacy: 2,6 / 3 */
    expect(svg).toContain('stroke-width="0.867"');
  });

  test("deterministik dan id mask memakai idp", () => {
    const it = item("lu:house", { tick: true, ground: true });
    expect(render(it)).toBe(render(it));
    const s = style({ mode: "white" });
    const a = render(it, s, { idp: "aa" });
    expect(a).toContain('id="aawb"');
    expect(a).not.toContain('id="twb"');
  });

  test("mode solid, white, line memakai maksimal 3 warna langsung", () => {
    for (const mode of ["solid", "white", "line"]) {
      const svg = render(
        item("lu:house", {
          tick: true,
          ground: true,
          cloud: true,
          grass: true,
        }),
        style({ mode }),
      );
      const colors = colorsOf(svg);
      expect(colors.size).toBeLessThanOrEqual(3);
      expect(svg).not.toMatch(
        /stroke-dasharray|pathLength|<style|<use|<clipPath|var\(--/,
      );
    }
  });

  test("mask dipasang di pembungkus tanpa transform", () => {
    const svg = render(item("lu:house"), style({ mode: "white" }));
    expect(svg).toMatch(/<g mask="url\(#twb\)"><g transform=/);
    expect(svg).not.toMatch(/<g transform="[^"]*"[^>]* mask=/);
  });

  test("dekorasi yang menyentuh objek diberi knockout selebar gap classic", () => {
    const it = item("lu:house", { tick: true });
    const near = style({ dx: 8, dy: -8 });
    const svg = render(it, near);
    expect(svg).toContain('id="tko"');
    expect(svg).toContain('stroke-width="5.456"');
    expect(svg).toMatch(/<g mask="url\(#tko\)">/);
    const white = render(it, near, { mode: "white" });
    expect(white).not.toContain("<mask");
    expect(white).toContain('stroke="#FFFFFF" stroke-width="5.456"');
    expect(render(it)).not.toContain('id="tko"');
  });

  test("mode white tanpa mask memakai body putih seperti legacy", () => {
    const svg = render(item("lu:house"), style({ mode: "white" }), {
      mode: "white",
    });
    expect(svg).not.toContain("<mask");
    expect(svg).toContain('fill="#FFFFFF"');
  });

  test("opt.deco false dan vis.deco false merender tanpa dekorasi", () => {
    const it = item("lu:house", { tick: true, ground: true });
    const full = render(it);
    const core = render(it, style(), { deco: false });
    expect(full.match(/<path d="M/g)?.length).toBeGreaterThan(
      core.match(/<path d="M/g)?.length || 0,
    );
    expect(render({ ...it, vis: { main: true, mod: true, deco: false } })).toBe(
      core,
    );
  });

  test("pengubah diabaikan: item dengan dan tanpa pengubah dirender sama", () => {
    const a = item("lu:house");
    expect(render({ ...a, mod: "lu:plus", slot: "BR" })).toBe(render(a));
  });

  test("objek bawaan: SVG kosong 48×48 dan flag err", () => {
    const it = { main: "face", mod: "bubble" };
    expect(render(it)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"></svg>',
    );
    expect(offset.flags(it, style(), ctx)).toContainEqual([
      "err",
      "Objek bawaan tidak didukung gaya Offset",
    ]);
    expect(offset.flags(it, style(), ctx)).toContainEqual([
      "info",
      "Pengubah tidak tersedia pada style ini",
    ]);
  });

  test("flag tanpa bidang tertutup", () => {
    expect(offset.flags(item("lu:minus"), style(), ctx)).toContainEqual([
      "warn",
      "Tanpa bidang tertutup: isi warna offset tidak muncul",
    ]);
    expect(offset.flags(item("lu:house"), style(), ctx)).toEqual([]);
    expect(offset.flags(item("lu:heart"), style(), ctx)).toEqual([]);
  });

  test("signature memakai concept dan menulis - untuk pengubah dan slot", () => {
    expect(
      offset.signature({ main: "lu:wallet", mod: "lu:plus", slot: "BR" }),
    ).toBe("offset|wallet|-|-");
    expect(offset.signature({ main: "tb:wallet", mod: "lu:check" })).toBe(
      "offset|wallet|-|-",
    );
  });

  test("sumbu variasi: tickPos diblokir tanpa kilat, decoSet sesuai dokumen", () => {
    const ax = offset.axes(item("lu:house", { tick: false }), style());
    expect(ax.map((a) => a.id)).toEqual(["tickPos", "decoSet"]);
    expect(ax[0].blockedBy?.(item("lu:house", { tick: false }), "TL")).toBe(
      true,
    );
    expect(ax[0].blockedBy?.(item("lu:house", { tick: true }), "TL")).toBe(
      false,
    );
    expect(ax[1].values).toEqual(DECO_SETS);
  });

  test("dekorasi bawaan item mengikuti legacy (kilat kanan atas + tanah)", () => {
    expect(offsetDeco({})).toEqual({
      tick: true,
      tickPos: "TR",
      ground: true,
      cloud: false,
      grass: false,
    });
  });

  test("semua kombinasi dekorasi berada di dalam viewBox 0–48", () => {
    const keys = [
      "lu:house",
      "lu:luggage",
      "lu:house",
      "lu:shopping-cart",
      "lu:square",
      "lu:circle",
      "lu:mail",
      "lu:heart",
      "lu:star",
      "lu:calendar",
    ];
    for (const key of keys)
      for (const set of DECO_SETS)
        for (const tickPos of ["TR", "TL"])
          for (const [dx, dy] of [
            [4, 4],
            [-8, 8],
            [8, -8],
          ]) {
            const deco = Object.fromEntries(
              ["tick", "ground", "cloud", "grass"].map((k) => [
                k,
                set.split("+").includes(k),
              ]),
            );
            const b = boxesOffset(
              item(key, { ...deco, tickPos }),
              style({ dx, dy }),
              ctx,
            );
            for (const box of [b.main, b.deco]) {
              expect(box.x).toBeGreaterThanOrEqual(0);
              expect(box.y).toBeGreaterThanOrEqual(0);
              expect(box.x + box.w).toBeLessThanOrEqual(48);
              expect(box.y + box.h).toBeLessThanOrEqual(48);
            }
          }
  });
});
