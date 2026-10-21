// @ts-check
import { describe, expect, test } from "vitest";
import { createClassicData } from "@icon-studio/engines/classic";
import {
  normItem,
  normSetStyle,
} from "../../apps/icon-studio/src/state/document.js";
import {
  getXY,
  layerBoxes,
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
});
