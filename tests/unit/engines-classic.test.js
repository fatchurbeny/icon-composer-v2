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
});
