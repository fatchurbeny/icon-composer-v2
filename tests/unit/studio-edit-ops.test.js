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
