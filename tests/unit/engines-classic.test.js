// @ts-check
import { describe, expect, test } from "vitest";
import {
  CLASSIC_ENGINE_VERSION,
  anchoredModifierGeometry,
  classic,
  composeClassic,
  createClassicData,
  geomClassic,
  solidLineDiagnostic,
  solidLineFit,
} from "@icon-studio/engines/classic";

const style = {
  ink: "#141414",
  accent: "#FECC33",
  sw: 2,
  gap: 2,
  cap: "butt",
  join: "miter",
  pref: "B",
  colors: {
    main: { line: null, fill: null },
    mod: { line: null, fill: null },
    deco: { line: null, fill: null },
  },
  scale: { main: 84, mod: 160, deco: 100 },
  fx: { mode: "none" },
};

const item = {
  main: "face",
  mod: "parcel",
  slot: "BR",
  nx: 0,
  ny: 0,
  mx: 0,
  my: 0,
  pref: "B",
  vis: { main: true, mod: true, deco: true },
  deco: { type: "none" },
};

/**
 * Kotak sejajar sumbu pengubah di keluaran SVG, dibaca dari transform grup pengubah terakhir
 * (`rotate(a cx cy) translate(L T) scale(s)`), dalam satuan kanvas 48.
 * @param {string} svg
 * @param {{w: number, h: number}} md
 */
function modBoxOf(svg, md) {
  const t = svg.split('<g transform="').at(-1) || "";
  const m = /^(?:rotate\((-?[\d.]+) (-?[\d.]+) (-?[\d.]+)\) )?translate\((-?[\d.]+) (-?[\d.]+)\) scale\(([\d.]+)\)/.exec(t);
  if (!m) throw new Error("transform pengubah tidak ditemukan");
  const a = ((Number(m[1]) || 0) * Math.PI) / 180,
    L = Number(m[4]),
    T = Number(m[5]),
    s = Number(m[6]);
  const W = md.w * s,
    H = md.h * s,
    c = Math.abs(Math.cos(a)),
    n = Math.abs(Math.sin(a));
  const w = W * c + H * n,
    h = W * n + H * c;
  return { x: L + W / 2 - w / 2, y: T + H / 2 - h / 2, w, h };
}

/** @param {boolean} solidV145 */
function ctxOf(solidV145) {
  const data = createClassicData();
  let id = 0;
  return {
    style,
    ...data,
    customs: [],
    nextId: () => `t${++id}`,
    decoStarFill: false,
    solidV145,
    infoOf: () => ({
      U: { x: 8, y: 8, w: 32, h: 32 },
      parts: [
        {
          body: false,
          closed: false,
          bb: { x: 20, y: 20, w: 2, h: 2 },
          svg: '<path d="M20 20h2" stroke="INK"/>',
        },
      ],
    }),
  };
}

describe("@icon-studio/engines classic", () => {
  test("createClassicData memberi salinan baru dan bintang hanya bila diminta", () => {
    const a = createClassicData();
    const b = createClassicData({ starDecos: true });
    expect(Object.keys(a.DECOS)).toEqual(["speed", "spark", "base", "burst"]);
    expect(Object.keys(b.DECOS)).toEqual([
      "speed",
      "spark",
      "base",
      "burst",
      "star4",
      "star4x2",
    ]);
    a.MAINS["lu:test"] = {};
    expect(createClassicData().MAINS).not.toHaveProperty("lu:test");
  });

  test("versi mesin classic sama dengan konstanta 1.4.5", () => {
    expect(classic.version).toBe(CLASSIC_ENGINE_VERSION);
    expect(CLASSIC_ENGINE_VERSION).toBe("1.4.5");
  });

  test("geomClassic memakai kotak tambatan yang sama dengan anchoredModifierGeometry", () => {
    const ctx = ctxOf(false);
    const g = geomClassic(item, ctx);
    const anchored = anchoredModifierGeometry(
      item,
      ctx.MODS[item.mod],
      style.scale.mod / 100,
    );
    expect(g.modT).toBe(anchored.modT);
  });

  test("solidV145 mengecilkan pengubah garis yang besar pada Solid·garis", () => {
    const off = composeClassic(item, ctxOf(false), { idp: "x" });
    const on = composeClassic(item, ctxOf(true), { idp: "x" });
    expect(on).not.toBe(off);
    const scaleOf = (/** @type {string} */ svg) =>
      Number(
        /scale\(([\d.]+)\)"/.exec(
          svg.split('<g transform="translate').at(-1) || "",
        )?.[1],
      );
    expect(scaleOf(on)).toBeLessThan(scaleOf(off));
  });

  test("solidV145 tidak berpengaruh di mode lain", () => {
    const a = { ...item, pref: "A" };
    expect(composeClassic(a, ctxOf(true), { idp: "x" })).toBe(
      composeClassic(a, ctxOf(false), { idp: "x" }),
    );
  });

  test("solidLineDiagnostic melaporkan versi mesin", () => {
    expect(solidLineDiagnostic(item, ctxOf(true))).toEqual({
      engine: "1.4.5",
      complex: false,
      message: "",
    });
  });

  describe("Solid·garis 1.4.5 dengan rotasi per ikon", () => {
    const ANGLES = [30, 45, 90, -60, 135];
    const SLOTS = ["BR", "TL", "TR", "BL"];
    const md = createClassicData().MODS[item.mod];

    for (const nr of ANGLES)
      test(`pengubah diputar ${nr}° tetap di dalam slot dan maksimal 18 satuan`, () => {
        for (const slot of SLOTS) {
          const svg = composeClassic({ ...item, slot, nr }, ctxOf(true), { idp: "x" });
          const b = modBoxOf(svg, md);
          const tag = `${slot} ${nr}°`;
          expect(Math.max(b.w, b.h), tag).toBeLessThanOrEqual(18.01);
          expect(b.x, tag).toBeGreaterThanOrEqual(1.99);
          expect(b.y, tag).toBeGreaterThanOrEqual(1.99);
          expect(b.x + b.w, tag).toBeLessThanOrEqual(46.01);
          expect(b.y + b.h, tag).toBeLessThanOrEqual(46.01);
          /* sudut kotak terputar menempel di tepi slot, seperti kotak tanpa rotasi */
          if (slot[1] === "R") expect(b.x + b.w, tag).toBeCloseTo(46, 1);
          else expect(b.x, tag).toBeCloseTo(2, 1);
          if (slot[0] === "B") expect(b.y + b.h, tag).toBeCloseTo(46, 1);
          else expect(b.y, tag).toBeCloseTo(2, 1);
        }
      });

    test("rotasi 90° menukar sisi kotak yang sama dengan tanpa rotasi", () => {
      const flat = modBoxOf(composeClassic(item, ctxOf(true), { idp: "x" }), md);
      const turned = modBoxOf(composeClassic({ ...item, nr: 90 }, ctxOf(true), { idp: "x" }), md);
      expect(turned.w).toBeCloseTo(flat.h, 2);
      expect(turned.h).toBeCloseTo(flat.w, 2);
    });

    test("tanpa nr atau nr 0 keluaran sama persis dengan mesin 1.4.5", () => {
      const base = composeClassic(item, ctxOf(true), { idp: "x" });
      expect(composeClassic({ ...item, nr: 0 }, ctxOf(true), { idp: "x" })).toBe(base);
      expect(base).toContain('<g transform="translate(28 31.6) scale(0.9)"');
    });

    test("di luar Solid·garis pengubah yang diputar tetap ditambatkan seperti Composer", () => {
      const a = { ...item, pref: "A", nr: 45 };
      expect(composeClassic(a, ctxOf(true), { idp: "x" })).toBe(composeClassic(a, ctxOf(false), { idp: "x" }));
    });

    test("overlap badan memakai kotak objek utama setelah rotasi mr", () => {
      const ctx = {
        ...ctxOf(true),
        infoOf: () => ({ U: { x: 24, y: 24, w: 20, h: 20 }, parts: [] }),
      };
      const P = ctx.PREFS.B;
      const flat = solidLineFit(item, geomClassic(item, ctx), P, ctx);
      const turned = solidLineFit({ ...item, mr: 180 }, geomClassic({ ...item, mr: 180 }, ctx), P, ctx);
      expect(flat.overlap).toBeGreaterThan(0.35);
      expect(flat.gap).toBe(1.1);
      /* badan diputar 180° ke kiri atas, menjauh dari pengubah di kanan bawah */
      expect(turned.overlap).toBe(0);
      expect(turned.gap).toBe(1.7);
    });
  });
});
