// @ts-check
import { describe, expect, test } from "vitest";
import {
  dupMap,
  exportList,
  packOf,
  pathOf,
  sheetGrid,
  validateManifest,
} from "../../apps/icon-studio/src/state/builder-ops.js";

const vocab = /** @type {any} */ ({
  exists: (/** @type {string} */ k) => k !== "lu:salah",
  suggest: () => "lu:benar",
  collisions: () => [],
  libName: (/** @type {string} */ k) => k,
});

describe("Icon Studio builder-ops", () => {
  test("packOf menerima string atau {en, id}", () => {
    expect(packOf({ pack: "Tema" })).toEqual({ en: "Tema", id: "Tema" });
    expect(packOf({ pack: { id: "Uji" } })).toEqual({ en: "Uji", id: "Uji" });
    expect(packOf(null)).toEqual({ en: "", id: "" });
  });

  test("validateManifest memberi akhiran untuk id dobel dan saran untuk nama tak dikenal", () => {
    const doc = {
      manifest: { format: "lain" },
      items: [
        { uid: "a", id: "ikon", idRaw: "ikon", main: "face", mod: "none" },
        { uid: "b", id: "ikon", idRaw: "ikon", main: "lu:salah", mod: "none" },
      ],
    };
    const issues = validateManifest(doc, vocab);
    expect(doc.items[1].id).toBe("ikon-2");
    expect(issues.map((i) => i[0])).toEqual(["warn", "warn", "warn", "err"]);
    expect(issues.at(-1)?.[2]).toEqual({
      uid: "b",
      kind: "main",
      to: "lu:benar",
    });
  });

  test("dupMap, pathOf, sheetGrid", () => {
    const items = [
      { main: "a", mod: "b", on: true },
      { main: "a", mod: "b", on: true },
      { main: "a", mod: "b", on: false },
    ];
    expect(dupMap(items)).toEqual({ "a|b": 2 });
    expect(pathOf({ id: "x", role: "extra" }, "X", true)).toBe(
      "aksen/ekstra/x-aksen.svg",
    );
    expect(pathOf({ id: "x", role: "slot" }, "A", false)).toBe(
      "garis-solid/x-garis-solid.svg",
    );
    expect([
      sheetGrid(5),
      sheetGrid(30),
      sheetGrid(200),
      sheetGrid(5, "3"),
    ]).toEqual([4, 8, 14, 3]);
  });

  test("exportList: slot dulu lalu ekstra, sesuai centang peran", () => {
    const doc = {
      items: [
        { id: "e", role: "extra", on: true, main: "face", mod: "check" },
        { id: "s", role: "slot", on: true, main: "doc", mod: "plus" },
        { id: "o", role: "slot", on: false, main: "cart", mod: "plus" },
      ],
    };
    const deps = {
      vocab,
      renderer: {
        LIB_RE: /^(lu|tb|hg|cu):/,
        data: { MAINS: {} },
        solidLineDiagnostic: () => null,
      },
      style: {},
    };
    expect(
      exportList(doc, { slot: true, extra: true, skipBad: false }, deps).map(
        (i) => i.id,
      ),
    ).toEqual(["s", "e"]);
    expect(
      exportList(doc, { slot: false, extra: true, skipBad: false }, deps).map(
        (i) => i.id,
      ),
    ).toEqual(["e"]);
  });
});
