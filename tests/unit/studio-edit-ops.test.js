// @ts-check
import { describe, expect, test } from "vitest";
import { createClassicData } from "@icon-studio/engines/classic";
import {
  normItem,
  normSetStyle,
} from "../../apps/icon-studio/src/state/document.js";
import {
  anchoredModifierGeometry,
  geomClassic,
} from "@icon-studio/engines/classic";
import {
  layerPaints,
  anchorFrac,
  anchorRange,
  anchorXY,
  scaleForSize,
  setAnchorXY,
  sizeRange,
  angleFromDrag,
  getRot,
  getXY,
  layerBoxes,
  rotCenter,
  scaleFromDrag,
  scalePivot,
  setRot,
  resetLayer,
  setDeco,
  setPartRole,
  setSlot,
  setXY,
} from "../../apps/icon-studio/src/state/edit-ops.js";

const data = createClassicData({ starDecos: true });
const lib = { ...data, LIB_RE: /^(lu|tb|hg|cu):/, ensure: () => true };
const item = (o = {}) =>
  normItem({ main: "face", mod: "bubble", slot: "BL", ...o }, lib, {
    uid: () => "x",
  });

describe("Icon Studio edit-ops", () => {
  test("setXY membulatkan ke 0,5 dengan snap dan membatasi rentang lapisan", () => {
    const it = item();
    setXY(it, "mod", 3.3, -20);
    expect(getXY(it, "mod")).toEqual([3.5, -12]);
    setXY(it, "mod", 3.33, 1.01, { snap: false });
    expect(getXY(it, "mod")).toEqual([3.35, 1]);
    setXY(it, "deco", -5, 60);
    expect(getXY(it, "deco")).toEqual([0, 48]);
  });

  test("layerBoxes sesuai rumus IC dan kosong untuk lapisan tersembunyi", () => {
    const style = normSetStyle();
    const it = item({ mx: 0, my: 0 });
    const b = layerBoxes(it, style, data);
    expect(b.main).toEqual({
      x: 24 - 20 * 0.84,
      y: 24 - 20 * 0.84,
      w: 40 * 0.84,
      h: 40 * 0.84,
    });
    expect(b.mod.w).toBeGreaterThan(0);
    expect(b.deco.w).toBe(0);
    it.vis.mod = false;
    expect(layerBoxes(it, style, data).mod).toEqual({ x: 0, y: 0, w: 0, h: 0 });
  });

  test("setSlot, setDeco, resetLayer mengikuti handler IC", () => {
    const it = item({ nx: 2, ny: 2 });
    setSlot(it, "TR", data.SHIFT);
    expect(it).toMatchObject({
      slot: "TR",
      nx: 0,
      ny: 0,
      mx: data.SHIFT.TR[0],
      my: data.SHIFT.TR[1],
    });
    setSlot(it, "XX", data.SHIFT);
    expect(it.slot).toBe("TR");
    setDeco(it, "spark", data.DECOS);
    expect(it.deco).toMatchObject({
      type: "spark",
      x: data.DECOS.spark.home[0],
      y: data.DECOS.spark.home[1],
    });
    it.deco.x = 1;
    resetLayer(it, "deco", data);
    expect(it.deco.x).toBe(data.DECOS.spark.home[0]);
    it.mx = 9;
    resetLayer(it, "main", data);
    expect([it.mx, it.my]).toEqual(data.SHIFT.TR);
  });

  test("setPartRole menolak isi untuk bagian terbuka", () => {
    const it = item();
    const info = { parts: [{ closed: true }, { closed: false }] };
    setPartRole(it, info, ["ink", "ink"], 0, "fillA");
    expect(it.parts).toEqual({ 0: "fillA", 1: "ink" });
    setPartRole(it, info, ["fillA", "ink"], 1, "fill");
    expect(it.parts).toEqual({ 0: "fillA", 1: "ink" });
    setPartRole(it, info, ["fillA", "ink"], 1, "acc");
    expect(it.parts[1]).toBe("acc");
  });

  test("setRot membungkus sudut, Shift ke 15°, dan menghapus field saat 0", () => {
    const it = item();
    setRot(it, "main", 30.4);
    expect(it.mr).toBe(30);
    setRot(it, "main", 200);
    expect(getRot(it, "main")).toBe(-160);
    setRot(it, "mod", 22, { snap: true });
    expect(it.nr).toBe(15);
    setRot(it, "mod", 180);
    expect(it.nr).toBe(180);
    setRot(it, "main", 0);
    expect("mr" in it).toBe(false);
    setRot(it, "deco", -7);
    expect(it.deco.r).toBe(-7);
    resetLayer(it, "mod", data);
    expect("nr" in it).toBe(false);
  });

  test("normItem hanya menyimpan rotasi yang tidak 0 dan membatasi rentangnya", () => {
    expect("mr" in item({ mr: 0 })).toBe(false);
    expect(item({ mr: 400, nr: "x" })).toMatchObject({ mr: 180 });
    expect("nr" in item({ nr: "x" })).toBe(false);
  });

  test("scaleFromDrag memakai perbandingan jarak ke titik tetap, Shift 5%, dan rentang set", () => {
    const c = { x: 24, y: 24 };
    expect(
      scaleFromDrag("main", 84, c, { x: 34, y: 24 }, { x: 36, y: 24 }),
    ).toBe(100);
    expect(
      scaleFromDrag("main", 80, c, { x: 34, y: 24 }, { x: 33, y: 24 }),
    ).toBe(72);
    expect(
      scaleFromDrag(
        "mod",
        100,
        c,
        { x: 34, y: 24 },
        { x: 35.2, y: 24 },
        { snap: true },
      ),
    ).toBe(110);
    expect(
      scaleFromDrag("mod", 100, c, { x: 34, y: 24 }, { x: 24.5, y: 24 }),
    ).toBe(50);
    expect(scaleFromDrag("deco", 100, c, c, { x: 30, y: 30 })).toBe(100);
  });

  test("angleFromDrag menambah selisih arah kursor terhadap pusat", () => {
    const c = { x: 24, y: 24 };
    expect(
      angleFromDrag(10, c, { x: 34, y: 24 }, { x: 24, y: 34 }),
    ).toBeCloseTo(100);
  });

  test("pusat putar dan titik tetap skala mengikuti transform mesin", () => {
    const style = normSetStyle();
    const it = item({ mx: 2, my: -1, slot: "BL", nx: 1, ny: 0 });
    const b = layerBoxes(it, style, data);
    expect(rotCenter(it, "main", b.main)).toEqual({ x: 26, y: 23 });
    expect(scalePivot(it, "mod", b.mod)).toEqual({ x: 3, y: 46 });
    /* titik tetap pengubah memang tidak bergeser saat skala set berubah */
    const g1 = anchoredModifierGeometry(it, data.MODS.bubble, 1),
      g2 = anchoredModifierGeometry(it, data.MODS.bubble, 1.4);
    expect([g1.L, g1.T + g1.H]).toEqual([g2.L, g2.T + g2.H]);
    it.nr = 90;
    const p = scalePivot(it, "mod", b.mod),
      c = rotCenter(it, "mod", b.mod);
    expect(Math.hypot(p.x - c.x, p.y - c.y)).toBeCloseTo(
      Math.hypot(b.mod.w, b.mod.h) / 2,
    );
  });

  test("rotasi ditulis ke transform mesin hanya bila tidak 0", () => {
    const style = normSetStyle();
    const ctx = /** @type {any} */ ({
      style,
      MODS: data.MODS,
      PREFS: data.PREFS,
    });
    const it = item({ mx: 0, my: 0 });
    expect(geomClassic(it, ctx).mainT).toBe(
      "translate(24 24) scale(0.84) translate(-24 -24)",
    );
    it.mr = 30;
    expect(geomClassic(it, ctx).mainT).toBe(
      "translate(24 24) rotate(30) scale(0.84) translate(-24 -24)",
    );
    const g0 = geomClassic(it, ctx);
    expect(g0.modT.startsWith("translate(")).toBe(true);
    it.nr = -45;
    expect(geomClassic(it, ctx).modT).toMatch(
      /^rotate\(-45 [\d.]+ [\d.]+\) translate\(/,
    );
  });
});

describe("Icon Studio edit-ops · Transform gaya Affinity", () => {
  test("anchorFrac dan anchorXY membaca 9 titik kotak", () => {
    expect(anchorFrac("TL")).toEqual([0, 0]);
    expect(anchorFrac("C")).toEqual([0.5, 0.5]);
    expect(anchorFrac("MR")).toEqual([1, 0.5]);
    expect(anchorFrac("BC")).toEqual([0.5, 1]);
    expect(anchorFrac("zz")).toEqual([0, 0]);
    const box = { x: 4, y: 6, w: 10, h: 20 };
    expect(anchorXY(box, "TL")).toEqual([4, 6]);
    expect(anchorXY(box, "BR")).toEqual([14, 26]);
    expect(anchorXY(box, "C")).toEqual([9, 16]);
  });

  test("setAnchorXY menaruh titik acuan di koordinat baru lewat setXY", () => {
    const style = normSetStyle();
    for (const layer of /** @type {const} */ (["main", "mod", "deco"])) {
      const it = item({ deco: { type: "star4", x: 9, y: 9 } });
      for (const anchor of ["TL", "C", "BR"]) {
        const box = layerBoxes(it, style, lib)[layer];
        const [ax, ay] = anchorXY(box, anchor);
        setAnchorXY(it, layer, box, anchor, ax + 2, ay - 1);
        const after = anchorXY(layerBoxes(it, style, lib)[layer], anchor);
        expect(after[0]).toBeCloseTo(ax + 2);
        expect(after[1]).toBeCloseTo(ay - 1);
      }
    }
  });

  test("setAnchorXY tetap memakai rentang dan snap setXY", () => {
    const style = normSetStyle();
    const it = item();
    const box = layerBoxes(it, style, lib).main;
    setAnchorXY(it, "main", box, "BR", 999, anchorXY(box, "BR")[1] + 0.3);
    expect(getXY(it, "main")[0]).toBe(12);
    expect(Math.abs(getXY(it, "main")[1] % 0.5)).toBe(0);
    const r = anchorRange(it, "main", layerBoxes(it, style, lib).main, "BR");
    expect(r.x[1]).toBeCloseTo(anchorXY(layerBoxes(it, style, lib).main, "BR")[0]);
    expect(r.x[1] - r.x[0]).toBe(24);
  });

  test("scaleForSize menerjemahkan W/H ke skala set yang seragam", () => {
    const style = normSetStyle();
    const it = item();
    const s0 = style.scale.main;
    const w0 = layerBoxes(it, style, lib).main.w;
    const v = scaleForSize("main", s0, w0, w0 * 0.8);
    expect(v).toBe(Math.round(s0 * 0.8));
    style.scale.main = v;
    const b = layerBoxes(it, style, lib).main;
    expect(b.w).toBeCloseTo(w0 * (v / s0));
    expect(b.h).toBeCloseTo(b.w);
    expect(scaleForSize("main", s0, w0, 999)).toBe(100);
    expect(scaleForSize("deco", 100, 9, 1)).toBe(50);
    expect(scaleForSize("mod", 100, 0, 10)).toBe(100);
    expect(sizeRange("mod", 100, 10)).toEqual([5, 15]);
  });
});

describe("Icon Studio edit-ops · peran warna lapisan", () => {
  const kinds = (/** @type {any[]} */ ps) => ps.map((p) => `${p.label}:${p.slot}`);
  const libOf = (o = {}) => ({ PREFS: data.PREFS, DECOS: data.DECOS, ...o });
  test("classic mengikuti PREFS mode A, B, C", () => {
    const style = normSetStyle();
    style.family = "classic";
    const it = item({ deco: { type: "star4", x: 9, y: 9 } });
    const cases = { A: ["Garis:line", "Isi:fill"], B: ["Isi:fill", "Garis:line"], C: ["Garis:line", "Garis:line"] };
    for (const [mode, [main, mod]] of Object.entries(cases)) {
      style.pref = mode;
      expect(kinds(layerPaints(it, "main", style, libOf()))).toEqual([main]);
      expect(kinds(layerPaints(it, "mod", style, libOf()))).toEqual([mod]);
    }
    expect(kinds(layerPaints(it, "deco", style, libOf()))).toEqual(["Isi:fill"]);
    it.pref = "B";
    style.pref = "A";
    expect(kinds(layerPaints(it, "main", style, libOf()))).toEqual(["Isi:fill"]);
    style.colors.main = { line: "#123456", fill: null };
    it.pref = "set";
    expect(layerPaints(it, "main", style, libOf())[0].color).toBe("#123456");
    expect(kinds(layerPaints({ ...it, deco: { ...it.deco, type: "spark" } }, "deco", style, libOf()))).toEqual(["Garis:line"]);
  });

  test("accent: tinta dan aksen objek utama, pengubah memakai warna aksen", () => {
    const style = normSetStyle();
    style.family = "accent";
    const it = item();
    expect(kinds(layerPaints(it, "main", style, libOf({ roles: ["ink", "ink"] })))).toEqual(["Garis:line"]);
    expect(kinds(layerPaints(it, "main", style, libOf({ roles: ["ink", "acc"] })))).toEqual(["Garis:line", "Isi:fill"]);
    expect(kinds(layerPaints(it, "main", style, libOf({ roles: ["fillA"] })))).toEqual(["Isi:fill"]);
    expect(kinds(layerPaints({ ...it, under: "full" }, "main", style, libOf({ roles: ["ink"], bodies: true })))).toEqual(["Garis:line", "Isi:fill"]);
    expect(kinds(layerPaints(it, "mod", style, libOf()))).toEqual(["Garis:fill"]);
    expect(kinds(layerPaints({ ...it, mstyle: "fill" }, "mod", style, libOf()))).toEqual(["Isi:fill"]);
  });

  test("offset: objek utama tinta dan aksen, dekorasi tinta, pengubah tanpa swatch", () => {
    const style = normSetStyle();
    style.family = "offset";
    style.engine = { offset: { mode: "solid", acc: "#ffcc00", ink: "#111111" } };
    const it = item();
    const main = layerPaints(it, "main", style, libOf());
    expect(kinds(main)).toEqual(["Garis:line", "Isi:fill"]);
    expect(main.map((p) => p.color)).toEqual(["#111111", "#FFCC00"]);
    expect(kinds(layerPaints(it, "deco", style, libOf()))).toEqual(["Garis:line"]);
    expect(layerPaints(it, "mod", style, libOf())).toEqual([]);
  });
});
